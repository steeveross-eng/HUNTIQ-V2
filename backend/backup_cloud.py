"""
Cloud Backup Manager - MongoDB Atlas + Google Cloud Storage + ZIP Export
Automated backup system for HUNTIQ/BIONIC platform
With Daily Email Notifications via Resend
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
import os
import json
import hashlib
import shutil
import zipfile
import tempfile
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from io import BytesIO

# Resend for email notifications
try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False

router = APIRouter(prefix="/api/backup-cloud", tags=["backup-cloud"])

# MongoDB connections
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'bionic_db')

# Resend configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Atlas connection (will be configured via API)
ATLAS_URL = os.environ.get('MONGODB_ATLAS_URL', '')

# Local client
local_client = AsyncIOMotorClient(MONGO_URL)
local_db = local_client[DB_NAME]

# Collections for backup config
backup_config = local_db.backup_cloud_config
backup_logs = local_db.backup_logs

# ZIP backup directory
ZIP_BACKUP_DIR = "/app/backups"
os.makedirs(ZIP_BACKUP_DIR, exist_ok=True)

# Tracked paths for code backup
TRACKED_PATHS = {
    "frontend": "/app/frontend/src",
    "backend": "/app/backend"
}

TRACKED_EXTENSIONS = [".py", ".jsx", ".js", ".tsx", ".ts", ".css", ".json", ".md"]
EXCLUDED_PATTERNS = ["node_modules", "__pycache__", ".git", "test_", "*.pyc", ".env"]


# ==================== MODELS ====================

class AtlasConfig(BaseModel):
    connection_string: str
    database_name: Optional[str] = "huntiq_backup"
    enabled: bool = True


class GCSConfig(BaseModel):
    project_id: str
    bucket_name: str
    credentials_json: str  # JSON string of service account
    enabled: bool = True


class BackupSchedule(BaseModel):
    zip_interval_minutes: int = 1
    atlas_interval_minutes: int = 60
    gcs_interval_minutes: int = 60
    enabled: bool = True


class NotificationConfig(BaseModel):
    enabled: bool = True
    recipient_email: EmailStr
    send_daily_summary: bool = True
    send_on_failure: bool = True
    summary_hour: int = 8  # Hour of day to send summary (0-23)
    resend_api_key: Optional[str] = None  # API key entered via UI


class ResendApiKeyConfig(BaseModel):
    api_key: str


# ==================== RESEND API KEY MANAGEMENT ====================

async def get_resend_api_key():
    """Get Resend API key from DB or environment"""
    # First check DB
    config = await backup_config.find_one({"type": "resend_api"})
    if config and config.get("api_key"):
        return config["api_key"]
    # Fallback to environment
    return RESEND_API_KEY


@router.post("/resend/configure")
async def configure_resend_api(config: ResendApiKeyConfig):
    """Configure Resend API key via UI"""
    if not config.api_key or not config.api_key.startswith("re_"):
        raise HTTPException(status_code=400, detail="Clé API invalide. Elle doit commencer par 're_'")
    
    # Save to database
    await backup_config.update_one(
        {"type": "resend_api"},
        {"$set": {
            "type": "resend_api",
            "api_key": config.api_key,
            "configured_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Clé API Resend configurée avec succès"
    }


@router.get("/resend/status")
async def get_resend_status():
    """Check if Resend API is configured"""
    api_key = await get_resend_api_key()
    is_configured = bool(api_key) and api_key.startswith("re_")
    
    return {
        "configured": is_configured,
        "source": "database" if (await backup_config.find_one({"type": "resend_api"})) else "environment"
    }


# ==================== EMAIL NOTIFICATIONS ====================

async def send_backup_email(subject: str, html_content: str, recipient: str):
    """Send backup notification email via Resend"""
    if not RESEND_AVAILABLE:
        print("Resend library not installed - skipping email")
        return False
    
    # Get API key from DB or environment
    api_key = await get_resend_api_key()
    if not api_key:
        print("Resend API key not configured - skipping email")
        return False
    
    try:
        resend.api_key = api_key
        params = {
            "from": SENDER_EMAIL,
            "to": [recipient],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        
        # Log email sent
        await backup_logs.insert_one({
            "type": "email_notification",
            "timestamp": datetime.now(timezone.utc),
            "recipient": recipient,
            "subject": subject,
            "status": "success",
            "email_id": result.get("id")
        })
        
        return True
    except Exception as e:
        print(f"Email send error: {e}")
        await backup_logs.insert_one({
            "type": "email_notification",
            "timestamp": datetime.now(timezone.utc),
            "recipient": recipient,
            "subject": subject,
            "status": "error",
            "error": str(e)
        })
        return False


def generate_daily_summary_html(stats: dict, logs: list) -> str:
    """Generate HTML email for daily backup summary"""
    today = datetime.now(timezone.utc).strftime("%d %B %Y")
    
    # Count stats
    atlas_syncs = sum(1 for l in logs if l.get("type") == "atlas_sync" and l.get("status") == "success")
    gcs_uploads = sum(1 for l in logs if l.get("type") == "gcs_upload" and l.get("status") == "success")
    zip_updates = sum(1 for l in logs if l.get("type") == "zip_create" and l.get("status") == "success")
    failures = sum(1 for l in logs if l.get("status") == "error")
    
    # Status colors
    status_color = "#22c55e" if failures == 0 else "#ef4444"
    status_text = "✅ Tous les backups réussis" if failures == 0 else f"⚠️ {failures} échec(s) détecté(s)"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; padding: 30px; border: 1px solid #333;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #f5a623; margin: 0; font-size: 28px;">🦌 HUNTIQ Backup</h1>
                <p style="color: #888; margin-top: 5px;">Résumé quotidien - {today}</p>
            </div>
            
            <!-- Status Banner -->
            <div style="background-color: {status_color}20; border: 1px solid {status_color}; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 18px; color: {status_color};">{status_text}</p>
            </div>
            
            <!-- Stats Grid -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                <tr>
                    <td style="padding: 15px; background-color: #22c55e20; border-radius: 8px; text-align: center; width: 33%;">
                        <p style="margin: 0; font-size: 24px; color: #22c55e; font-weight: bold;">{zip_updates}</p>
                        <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">ZIP Updates</p>
                    </td>
                    <td style="width: 10px;"></td>
                    <td style="padding: 15px; background-color: #3b82f620; border-radius: 8px; text-align: center; width: 33%;">
                        <p style="margin: 0; font-size: 24px; color: #3b82f6; font-weight: bold;">{atlas_syncs}</p>
                        <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">Atlas Syncs</p>
                    </td>
                    <td style="width: 10px;"></td>
                    <td style="padding: 15px; background-color: #8b5cf620; border-radius: 8px; text-align: center; width: 33%;">
                        <p style="margin: 0; font-size: 24px; color: #8b5cf6; font-weight: bold;">{gcs_uploads}</p>
                        <p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">GCS Uploads</p>
                    </td>
                </tr>
            </table>
            
            <!-- Services Status -->
            <div style="background-color: #111; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="color: #f5a623; margin: 0 0 15px 0; font-size: 16px;">État des Services</h3>
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 8px 0; color: #fff;">MongoDB Atlas</td>
                        <td style="padding: 8px 0; text-align: right; color: {'#22c55e' if stats.get('atlas') else '#888'};">
                            {'🟢 Configuré' if stats.get('atlas') else '⚪ Non configuré'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #fff; border-top: 1px solid #333;">Google Cloud Storage</td>
                        <td style="padding: 8px 0; text-align: right; color: {'#22c55e' if stats.get('gcs') else '#888'}; border-top: 1px solid #333;">
                            {'🟢 Configuré' if stats.get('gcs') else '⚪ Non configuré'}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #fff; border-top: 1px solid #333;">Auto Backup</td>
                        <td style="padding: 8px 0; text-align: right; color: {'#22c55e' if stats.get('schedule', {}).get('running') else '#888'}; border-top: 1px solid #333;">
                            {'🟢 Actif' if stats.get('schedule', {}).get('running') else '⚪ Inactif'}
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- ZIP Info -->
            <div style="background-color: #8b5cf620; border: 1px solid #8b5cf6; border-radius: 8px; padding: 15px; margin-bottom: 25px;">
                <p style="margin: 0; color: #8b5cf6; font-weight: bold;">📦 Dernier Backup ZIP</p>
                <p style="margin: 10px 0 0 0; color: #fff;">
                    HUNTIQ_BACKUP.zip - {stats.get('zip', {}).get('size_bytes', 0) / 1024:.1f} KB
                </p>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #333;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                    HUNTIQ / Chasse Bionic™ - Système de backup automatisé
                </p>
                <p style="color: #666; font-size: 11px; margin: 5px 0 0 0;">
                    Pour modifier vos préférences: Admin > Backup > Notifications
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    return html


async def send_daily_summary():
    """Send daily backup summary email"""
    config = await backup_config.find_one({"type": "notification"})
    
    if not config or not config.get("enabled") or not config.get("send_daily_summary"):
        return
    
    # Get stats
    stats = await get_backup_stats_internal()
    
    # Get logs from last 24 hours
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    logs = await backup_logs.find(
        {"timestamp": {"$gte": yesterday}},
        {"_id": 0}
    ).to_list(length=1000)
    
    # Generate and send email
    html = generate_daily_summary_html(stats, logs)
    await send_backup_email(
        subject=f"🦌 HUNTIQ Backup - Résumé du {datetime.now().strftime('%d/%m/%Y')}",
        html_content=html,
        recipient=config["recipient_email"]
    )


async def get_backup_stats_internal():
    """Get backup stats for internal use"""
    atlas_config = await backup_config.find_one({"type": "atlas"}, {"_id": 0, "connection_string": 0})
    gcs_config = await backup_config.find_one({"type": "gcs"}, {"_id": 0, "credentials": 0})
    schedule_config = await backup_config.find_one({"type": "schedule"}, {"_id": 0})
    zip_config = await backup_config.find_one({"type": "zip_auto"}, {"_id": 0})
    
    return {
        "atlas": atlas_config,
        "gcs": gcs_config,
        "schedule": {**(schedule_config or {}), "running": auto_backup_running},
        "zip": zip_config
    }


# ==================== NOTIFICATION API ====================

@router.post("/notifications/configure")
async def configure_notifications(config: NotificationConfig):
    """Configure backup email notifications"""
    await backup_config.update_one(
        {"type": "notification"},
        {"$set": {
            "type": "notification",
            "enabled": config.enabled,
            "recipient_email": config.recipient_email,
            "send_daily_summary": config.send_daily_summary,
            "send_on_failure": config.send_on_failure,
            "summary_hour": config.summary_hour,
            "configured_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )
    
    return {
        "success": True,
        "message": "Notifications configurées",
        "recipient": config.recipient_email
    }


@router.get("/notifications/status")
async def get_notification_status():
    """Get notification configuration status"""
    config = await backup_config.find_one({"type": "notification"}, {"_id": 0})
    api_key = await get_resend_api_key()
    
    return {
        "configured": config is not None,
        "resend_available": RESEND_AVAILABLE and bool(api_key),
        "config": config
    }


@router.post("/notifications/test")
async def test_notification():
    """Send a test notification email"""
    config = await backup_config.find_one({"type": "notification"})
    
    if not config:
        raise HTTPException(status_code=400, detail="Notifications non configurées")
    
    api_key = await get_resend_api_key()
    if not RESEND_AVAILABLE or not api_key:
        raise HTTPException(status_code=400, detail="Resend non configuré. Entrez votre clé API dans l'onglet Notifications")
    
    # Send test email
    html = """
    <div style="font-family: Arial, sans-serif; background-color: #1a1a1a; color: #fff; padding: 30px; border-radius: 12px;">
        <h1 style="color: #f5a623;">🦌 Test de Notification HUNTIQ</h1>
        <p>Félicitations ! Votre configuration de notification fonctionne correctement.</p>
        <p style="color: #888;">Vous recevrez un résumé quotidien de vos backups à l'heure configurée.</p>
        <hr style="border-color: #333;">
        <p style="font-size: 12px; color: #666;">HUNTIQ / Chasse Bionic™</p>
    </div>
    """
    
    success = await send_backup_email(
        subject="🦌 HUNTIQ - Test de notification",
        html_content=html,
        recipient=config["recipient_email"]
    )
    
    if success:
        return {"success": True, "message": f"Email de test envoyé à {config['recipient_email']}"}
    else:
        raise HTTPException(status_code=500, detail="Échec de l'envoi de l'email")


@router.post("/notifications/send-summary")
async def trigger_daily_summary():
    """Manually trigger daily summary email"""
    config = await backup_config.find_one({"type": "notification"})
    
    if not config:
        raise HTTPException(status_code=400, detail="Notifications non configurées")
    
    await send_daily_summary()
    
    return {"success": True, "message": "Résumé envoyé"}


# ==================== MONGODB ATLAS ====================

@router.post("/atlas/configure")
async def configure_atlas(config: AtlasConfig):
    """Configure MongoDB Atlas connection for replication"""
    try:
        # Test connection
        test_client = AsyncIOMotorClient(config.connection_string, serverSelectionTimeoutMS=5000)
        await test_client.admin.command('ping')
        test_client.close()
        
        # Save config
        await backup_config.update_one(
            {"type": "atlas"},
            {"$set": {
                "type": "atlas",
                "connection_string": config.connection_string,
                "database_name": config.database_name,
                "enabled": config.enabled,
                "configured_at": datetime.now(timezone.utc),
                "status": "connected"
            }},
            upsert=True
        )
        
        return {
            "success": True,
            "message": "MongoDB Atlas configuré avec succès",
            "database": config.database_name
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Échec de connexion à MongoDB Atlas"
        }


@router.get("/atlas/status")
async def get_atlas_status():
    """Get MongoDB Atlas backup status"""
    config = await backup_config.find_one({"type": "atlas"}, {"_id": 0})
    
    if not config:
        return {
            "configured": False,
            "message": "MongoDB Atlas non configuré"
        }
    
    # Test current connection
    try:
        test_client = AsyncIOMotorClient(config["connection_string"], serverSelectionTimeoutMS=5000)
        await test_client.admin.command('ping')
        test_client.close()
        status = "connected"
    except:
        status = "disconnected"
    
    return {
        "configured": True,
        "enabled": config.get("enabled", False),
        "database": config.get("database_name"),
        "status": status,
        "last_backup": config.get("last_backup"),
        "configured_at": config.get("configured_at")
    }


@router.post("/atlas/sync")
async def sync_to_atlas():
    """Sync all local MongoDB data to Atlas"""
    config = await backup_config.find_one({"type": "atlas"})
    
    if not config or not config.get("enabled"):
        raise HTTPException(status_code=400, detail="Atlas non configuré ou désactivé")
    
    try:
        atlas_client = AsyncIOMotorClient(config["connection_string"])
        atlas_db = atlas_client[config["database_name"]]
        
        collections_synced = []
        total_docs = 0
        
        # Get all collections from local DB
        collection_names = await local_db.list_collection_names()
        
        for coll_name in collection_names:
            if coll_name.startswith("system."):
                continue
                
            local_coll = local_db[coll_name]
            atlas_coll = atlas_db[coll_name]
            
            # Get all documents
            docs = await local_coll.find({}).to_list(length=None)
            
            if docs:
                # Clear and replace (full sync)
                await atlas_coll.delete_many({})
                await atlas_coll.insert_many(docs)
                
                collections_synced.append({
                    "name": coll_name,
                    "documents": len(docs)
                })
                total_docs += len(docs)
        
        atlas_client.close()
        
        # Log backup
        await backup_logs.insert_one({
            "type": "atlas_sync",
            "timestamp": datetime.now(timezone.utc),
            "collections": len(collections_synced),
            "documents": total_docs,
            "status": "success"
        })
        
        # Update last backup time
        await backup_config.update_one(
            {"type": "atlas"},
            {"$set": {"last_backup": datetime.now(timezone.utc)}}
        )
        
        return {
            "success": True,
            "message": f"Synchronisation réussie vers Atlas",
            "collections_synced": collections_synced,
            "total_documents": total_docs
        }
        
    except Exception as e:
        await backup_logs.insert_one({
            "type": "atlas_sync",
            "timestamp": datetime.now(timezone.utc),
            "status": "error",
            "error": str(e)
        })
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GOOGLE CLOUD STORAGE ====================

@router.post("/gcs/configure")
async def configure_gcs(config: GCSConfig):
    """Configure Google Cloud Storage for backups"""
    try:
        # Validate JSON credentials
        creds = json.loads(config.credentials_json)
        
        # Save config (credentials encrypted in production)
        await backup_config.update_one(
            {"type": "gcs"},
            {"$set": {
                "type": "gcs",
                "project_id": config.project_id,
                "bucket_name": config.bucket_name,
                "credentials": config.credentials_json,
                "enabled": config.enabled,
                "configured_at": datetime.now(timezone.utc),
                "status": "configured"
            }},
            upsert=True
        )
        
        return {
            "success": True,
            "message": "Google Cloud Storage configuré",
            "bucket": config.bucket_name
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Format JSON invalide pour les credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gcs/status")
async def get_gcs_status():
    """Get GCS backup status"""
    config = await backup_config.find_one({"type": "gcs"}, {"_id": 0, "credentials": 0})
    
    if not config:
        return {
            "configured": False,
            "message": "Google Cloud Storage non configuré"
        }
    
    return {
        "configured": True,
        "enabled": config.get("enabled", False),
        "project_id": config.get("project_id"),
        "bucket_name": config.get("bucket_name"),
        "last_backup": config.get("last_backup"),
        "configured_at": config.get("configured_at")
    }


@router.post("/gcs/upload")
async def upload_to_gcs():
    """Upload backup to Google Cloud Storage"""
    config = await backup_config.find_one({"type": "gcs"})
    
    if not config or not config.get("enabled"):
        raise HTTPException(status_code=400, detail="GCS non configuré ou désactivé")
    
    try:
        from google.cloud import storage
        from google.oauth2 import service_account
        
        # Create credentials from stored JSON
        creds_dict = json.loads(config["credentials"])
        credentials = service_account.Credentials.from_service_account_info(creds_dict)
        
        # Create client
        client = storage.Client(credentials=credentials, project=config["project_id"])
        bucket = client.bucket(config["bucket_name"])
        
        # Create backup ZIP
        zip_path = await create_full_backup_zip()
        
        # Upload to GCS
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        blob_name = f"huntiq_backup_{timestamp}.zip"
        blob = bucket.blob(blob_name)
        
        blob.upload_from_filename(zip_path)
        
        # Cleanup temp file
        os.remove(zip_path)
        
        # Log backup
        await backup_logs.insert_one({
            "type": "gcs_upload",
            "timestamp": datetime.now(timezone.utc),
            "blob_name": blob_name,
            "status": "success"
        })
        
        # Update last backup
        await backup_config.update_one(
            {"type": "gcs"},
            {"$set": {"last_backup": datetime.now(timezone.utc)}}
        )
        
        return {
            "success": True,
            "message": "Backup uploadé vers GCS",
            "blob_name": blob_name,
            "bucket": config["bucket_name"]
        }
        
    except ImportError:
        raise HTTPException(status_code=500, detail="google-cloud-storage non installé. Exécutez: pip install google-cloud-storage")
    except Exception as e:
        await backup_logs.insert_one({
            "type": "gcs_upload",
            "timestamp": datetime.now(timezone.utc),
            "status": "error",
            "error": str(e)
        })
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ZIP BACKUP ====================

async def create_full_backup_zip() -> str:
    """Create a complete backup ZIP with code and prompts"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_filename = f"huntiq_backup_{timestamp}.zip"
    zip_path = os.path.join(tempfile.gettempdir(), zip_filename)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add code files
        for area, base_path in TRACKED_PATHS.items():
            if os.path.exists(base_path):
                for root, dirs, files in os.walk(base_path):
                    # Skip excluded directories
                    dirs[:] = [d for d in dirs if d not in ["node_modules", "__pycache__", ".git"]]
                    
                    for file in files:
                        ext = os.path.splitext(file)[1]
                        if ext in TRACKED_EXTENSIONS:
                            file_path = os.path.join(root, file)
                            arcname = os.path.relpath(file_path, "/app")
                            try:
                                zipf.write(file_path, arcname)
                            except:
                                pass
        
        # Add MongoDB data export
        try:
            collections = await local_db.list_collection_names()
            db_export = {}
            
            for coll_name in collections:
                if not coll_name.startswith("system."):
                    docs = await local_db[coll_name].find({}).to_list(length=None)
                    # Convert ObjectId to string
                    for doc in docs:
                        if "_id" in doc:
                            doc["_id"] = str(doc["_id"])
                    db_export[coll_name] = docs
            
            # Write DB export to ZIP
            db_json = json.dumps(db_export, default=str, indent=2)
            zipf.writestr("database/mongodb_export.json", db_json)
            
        except Exception as e:
            zipf.writestr("database/export_error.txt", str(e))
        
        # Add backup metadata
        metadata = {
            "created_at": datetime.now(timezone.utc).isoformat(),
            "platform": "HUNTIQ/BIONIC",
            "version": "1.0",
            "contents": {
                "code": list(TRACKED_PATHS.keys()),
                "database": "mongodb_export.json"
            }
        }
        zipf.writestr("backup_metadata.json", json.dumps(metadata, indent=2))
    
    return zip_path


@router.post("/zip/create")
async def create_backup_zip():
    """Create and return a backup ZIP file"""
    try:
        zip_path = await create_full_backup_zip()
        
        # Move to backup directory
        final_path = os.path.join(ZIP_BACKUP_DIR, os.path.basename(zip_path))
        shutil.move(zip_path, final_path)
        
        # Get file size
        file_size = os.path.getsize(final_path)
        
        # Log
        await backup_logs.insert_one({
            "type": "zip_create",
            "timestamp": datetime.now(timezone.utc),
            "filename": os.path.basename(final_path),
            "size_bytes": file_size,
            "status": "success"
        })
        
        return {
            "success": True,
            "filename": os.path.basename(final_path),
            "size_bytes": file_size,
            "download_url": f"/api/backup-cloud/zip/download/{os.path.basename(final_path)}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/zip/download/{filename}")
async def download_backup_zip(filename: str):
    """Download a backup ZIP file"""
    file_path = os.path.join(ZIP_BACKUP_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Fichier non trouvé")
    
    return FileResponse(
        file_path,
        media_type="application/zip",
        filename=filename
    )


@router.get("/zip/latest")
async def get_latest_zip():
    """Get the latest backup ZIP info"""
    main_zip = os.path.join(ZIP_BACKUP_DIR, "HUNTIQ_BACKUP.zip")
    
    if os.path.exists(main_zip):
        stat = os.stat(main_zip)
        return {
            "exists": True,
            "filename": "HUNTIQ_BACKUP.zip",
            "size_bytes": stat.st_size,
            "modified_at": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
            "download_url": "/api/backup-cloud/zip/download/HUNTIQ_BACKUP.zip"
        }
    
    return {"exists": False}


@router.post("/zip/update")
async def update_main_zip():
    """Update the main backup ZIP (overwrites existing)"""
    try:
        zip_path = await create_full_backup_zip()
        
        # Move to main backup file (overwrite)
        main_zip = os.path.join(ZIP_BACKUP_DIR, "HUNTIQ_BACKUP.zip")
        shutil.move(zip_path, main_zip)
        
        file_size = os.path.getsize(main_zip)
        
        # Update config with last update time
        await backup_config.update_one(
            {"type": "zip_auto"},
            {"$set": {
                "type": "zip_auto",
                "last_update": datetime.now(timezone.utc),
                "size_bytes": file_size
            }},
            upsert=True
        )
        
        return {
            "success": True,
            "filename": "HUNTIQ_BACKUP.zip",
            "size_bytes": file_size,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== AUTO BACKUP SCHEDULER ====================

# Global flag for background task
auto_backup_running = False
auto_backup_task = None
last_daily_summary_date = None

async def auto_backup_loop():
    """Background task for automatic backups"""
    global auto_backup_running, last_daily_summary_date
    
    while auto_backup_running:
        try:
            # Get schedule config
            config = await backup_config.find_one({"type": "schedule"})
            
            if config and config.get("enabled", False):
                zip_interval = config.get("zip_interval_minutes", 1)
                
                # Update main ZIP
                await update_main_zip()
                
                # Check if we need to send daily summary
                notif_config = await backup_config.find_one({"type": "notification"})
                if notif_config and notif_config.get("enabled") and notif_config.get("send_daily_summary"):
                    now = datetime.now(timezone.utc)
                    summary_hour = notif_config.get("summary_hour", 8)
                    
                    # Send summary once per day at the configured hour
                    if now.hour == summary_hour and last_daily_summary_date != now.date():
                        await send_daily_summary()
                        last_daily_summary_date = now.date()
                
                # Wait for interval
                await asyncio.sleep(zip_interval * 60)
            else:
                # If not enabled, check again in 30 seconds
                await asyncio.sleep(30)
                
        except Exception as e:
            print(f"Auto backup error: {e}")
            await asyncio.sleep(60)


@router.post("/schedule/start")
async def start_auto_backup(schedule: BackupSchedule):
    """Start automatic backup scheduler"""
    global auto_backup_running, auto_backup_task
    
    # Save schedule config
    await backup_config.update_one(
        {"type": "schedule"},
        {"$set": {
            "type": "schedule",
            "zip_interval_minutes": schedule.zip_interval_minutes,
            "atlas_interval_minutes": schedule.atlas_interval_minutes,
            "gcs_interval_minutes": schedule.gcs_interval_minutes,
            "enabled": schedule.enabled,
            "started_at": datetime.now(timezone.utc)
        }},
        upsert=True
    )
    
    if schedule.enabled and not auto_backup_running:
        auto_backup_running = True
        auto_backup_task = asyncio.create_task(auto_backup_loop())
    
    return {
        "success": True,
        "message": "Backup automatique démarré",
        "schedule": {
            "zip_interval": f"{schedule.zip_interval_minutes} minutes",
            "enabled": schedule.enabled
        }
    }


@router.post("/schedule/stop")
async def stop_auto_backup():
    """Stop automatic backup scheduler"""
    global auto_backup_running, auto_backup_task
    
    auto_backup_running = False
    
    if auto_backup_task:
        auto_backup_task.cancel()
        auto_backup_task = None
    
    await backup_config.update_one(
        {"type": "schedule"},
        {"$set": {"enabled": False, "stopped_at": datetime.now(timezone.utc)}}
    )
    
    return {
        "success": True,
        "message": "Backup automatique arrêté"
    }


@router.get("/schedule/status")
async def get_schedule_status():
    """Get auto backup schedule status"""
    config = await backup_config.find_one({"type": "schedule"}, {"_id": 0})
    zip_config = await backup_config.find_one({"type": "zip_auto"}, {"_id": 0})
    
    return {
        "running": auto_backup_running,
        "schedule": config,
        "last_zip_update": zip_config.get("last_update") if zip_config else None,
        "last_zip_size": zip_config.get("size_bytes") if zip_config else None
    }


# ==================== LOGS & STATS ====================

@router.get("/logs")
async def get_backup_logs(limit: int = 50, backup_type: Optional[str] = None):
    """Get backup operation logs"""
    query = {}
    if backup_type:
        query["type"] = backup_type
    
    logs = await backup_logs.find(
        query,
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(length=limit)
    
    return {
        "success": True,
        "logs": logs,
        "total": len(logs)
    }


@router.get("/stats")
async def get_backup_stats():
    """Get comprehensive backup statistics"""
    atlas_config = await backup_config.find_one({"type": "atlas"}, {"_id": 0, "connection_string": 0})
    gcs_config = await backup_config.find_one({"type": "gcs"}, {"_id": 0, "credentials": 0})
    schedule_config = await backup_config.find_one({"type": "schedule"}, {"_id": 0})
    zip_config = await backup_config.find_one({"type": "zip_auto"}, {"_id": 0})
    
    # Count logs by type
    log_counts = {}
    for log_type in ["atlas_sync", "gcs_upload", "zip_create"]:
        count = await backup_logs.count_documents({"type": log_type, "status": "success"})
        log_counts[log_type] = count
    
    # Get ZIP files info
    zip_files = []
    if os.path.exists(ZIP_BACKUP_DIR):
        for f in os.listdir(ZIP_BACKUP_DIR):
            if f.endswith(".zip"):
                path = os.path.join(ZIP_BACKUP_DIR, f)
                stat = os.stat(path)
                zip_files.append({
                    "filename": f,
                    "size_bytes": stat.st_size,
                    "modified_at": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat()
                })
    
    schedule_data = schedule_config if schedule_config else {}
    schedule_data["running"] = auto_backup_running
    
    return {
        "success": True,
        "atlas": atlas_config,
        "gcs": gcs_config,
        "schedule": schedule_data,
        "zip": {
            "last_update": zip_config.get("last_update") if zip_config else None,
            "size_bytes": zip_config.get("size_bytes") if zip_config else None,
            "files": zip_files
        },
        "log_counts": log_counts
    }


# ==================== SETUP GUIDES ====================

@router.get("/guides/mongodb-atlas")
async def get_atlas_guide():
    """Get MongoDB Atlas setup guide"""
    return {
        "title": "Configuration MongoDB Atlas",
        "steps": [
            {
                "step": 1,
                "title": "Créer un compte MongoDB Atlas",
                "description": "Allez sur https://www.mongodb.com/cloud/atlas et créez un compte gratuit",
                "url": "https://www.mongodb.com/cloud/atlas/register"
            },
            {
                "step": 2,
                "title": "Créer un Cluster",
                "description": "Cliquez sur 'Build a Cluster' et choisissez le tier gratuit M0 (512MB)",
                "details": [
                    "Choisissez AWS, Google Cloud ou Azure",
                    "Sélectionnez une région proche (ex: Canada pour Québec)",
                    "Nommez votre cluster (ex: huntiq-backup)"
                ]
            },
            {
                "step": 3,
                "title": "Configurer l'accès réseau",
                "description": "Dans 'Network Access', ajoutez votre IP ou 0.0.0.0/0 pour accès global",
                "warning": "0.0.0.0/0 permet l'accès de partout - utilisez avec un mot de passe fort"
            },
            {
                "step": 4,
                "title": "Créer un utilisateur",
                "description": "Dans 'Database Access', créez un utilisateur avec Read/Write",
                "details": [
                    "Username: huntiq_backup",
                    "Password: (générez un mot de passe fort)",
                    "Role: Atlas Admin ou Read/Write"
                ]
            },
            {
                "step": 5,
                "title": "Obtenir la Connection String",
                "description": "Cliquez 'Connect' > 'Connect your application' > 'Driver: Python'",
                "format": "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
            }
        ],
        "example_connection_string": "mongodb+srv://huntiq_backup:VotreMotDePasse@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority"
    }


@router.get("/guides/google-cloud-storage")
async def get_gcs_guide():
    """Get Google Cloud Storage setup guide"""
    return {
        "title": "Configuration Google Cloud Storage",
        "steps": [
            {
                "step": 1,
                "title": "Créer un compte Google Cloud",
                "description": "Allez sur https://console.cloud.google.com et connectez-vous avec votre compte Google",
                "url": "https://console.cloud.google.com",
                "note": "Google offre 300$ de crédits gratuits pour commencer"
            },
            {
                "step": 2,
                "title": "Créer un nouveau projet",
                "description": "Cliquez sur le sélecteur de projet en haut > 'New Project'",
                "details": [
                    "Nom du projet: huntiq-backup",
                    "Organisation: (laissez vide si personnel)",
                    "Cliquez 'Create'"
                ]
            },
            {
                "step": 3,
                "title": "Activer l'API Cloud Storage",
                "description": "Menu hamburger > APIs & Services > Enable APIs",
                "search": "Cloud Storage API",
                "action": "Cliquez 'Enable'"
            },
            {
                "step": 4,
                "title": "Créer un Bucket",
                "description": "Menu > Cloud Storage > Buckets > Create",
                "details": [
                    "Nom: huntiq-backup-[votre-id-unique]",
                    "Région: northamerica-northeast1 (Montréal)",
                    "Classe: Standard",
                    "Contrôle d'accès: Fine-grained"
                ]
            },
            {
                "step": 5,
                "title": "Créer un Service Account",
                "description": "Menu > IAM & Admin > Service Accounts > Create",
                "details": [
                    "Nom: huntiq-backup-service",
                    "ID: huntiq-backup-service",
                    "Rôle: Storage Admin"
                ]
            },
            {
                "step": 6,
                "title": "Générer la clé JSON",
                "description": "Cliquez sur le service account > Keys > Add Key > Create new key",
                "details": [
                    "Type: JSON",
                    "Téléchargez le fichier .json",
                    "IMPORTANT: Gardez ce fichier en sécurité!"
                ]
            }
        ],
        "credentials_format": {
            "type": "service_account",
            "project_id": "votre-project-id",
            "private_key_id": "...",
            "private_key": "-----BEGIN PRIVATE KEY-----...",
            "client_email": "huntiq-backup-service@project.iam.gserviceaccount.com",
            "client_id": "...",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        }
    }
