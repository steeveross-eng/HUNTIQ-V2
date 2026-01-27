"""
Cloud Backup Manager - MongoDB Atlas + Google Cloud Storage + ZIP Export
Automated backup system for HUNTIQ/BIONIC platform
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import os
import json
import hashlib
import shutil
import zipfile
import tempfile
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from io import BytesIO

router = APIRouter(prefix="/api/backup-cloud", tags=["backup-cloud"])

# MongoDB connections
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'bionic_db')

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

async def auto_backup_loop():
    """Background task for automatic backups"""
    global auto_backup_running
    
    while auto_backup_running:
        try:
            # Get schedule config
            config = await backup_config.find_one({"type": "schedule"})
            
            if config and config.get("enabled", False):
                zip_interval = config.get("zip_interval_minutes", 1)
                
                # Update main ZIP
                await update_main_zip()
                
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
    
    return {
        "success": True,
        "atlas": atlas_config,
        "gcs": gcs_config,
        "schedule": {
            **schedule_config if schedule_config else {},
            "running": auto_backup_running
        },
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
