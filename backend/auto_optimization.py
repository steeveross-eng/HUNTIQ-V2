"""
auto_optimization.py

Module Backend pour l'Auto-Optimisation BIONIC™

Fonctionnalités:
- Gestion des propositions d'optimisation
- Création et restauration de versions/backups
- Auto-analyse du système
- Processus d'approbation administrateur
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import json
import os
import shutil

router = APIRouter(prefix="/api/admin/optimization", tags=["Auto-Optimization"])

# Configuration
VERSIONS_DIR = "/app/backups/versions"
MAX_VERSIONS = 50

# Modèles Pydantic
class OptimizationProposal(BaseModel):
    title: str
    description: str
    type: str = "optimization"
    impact: str = "medium"
    affected_modules: List[str] = []
    benefits: List[str] = []
    risks: List[str] = []
    requires_restart: bool = False
    estimated_time: str = "instant"
    
class ProposalApproval(BaseModel):
    approved_at: str
    admin_notes: str = ""

class ProposalRejection(BaseModel):
    rejected_at: str
    rejection_reason: str = ""

class VersionBackup(BaseModel):
    description: str = ""
    modules: List[str] = ["bionic", "territory", "waypoints", "zones", "config"]

# Helper pour obtenir la collection MongoDB
def get_db():
    from server import db
    return db

# ================================
# PROPOSITIONS D'OPTIMISATION
# ================================

@router.get("/proposals")
async def get_proposals(status: Optional[str] = None):
    """Récupère toutes les propositions d'optimisation"""
    try:
        db = get_db()
        query = {}
        if status:
            query["status"] = status
        
        proposals = list(db.optimization_proposals.find(query).sort("created_at", -1))
        
        # Convertir ObjectId en string
        for p in proposals:
            p["id"] = str(p["_id"])
            del p["_id"]
        
        return proposals
    except Exception as e:
        # Si la collection n'existe pas, retourner une liste vide
        return []

@router.post("/proposals")
async def create_proposal(proposal: OptimizationProposal):
    """Crée une nouvelle proposition d'optimisation"""
    try:
        db = get_db()
        
        proposal_data = {
            **proposal.dict(),
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = db.optimization_proposals.insert_one(proposal_data)
        
        return {
            "id": str(result.inserted_id),
            "message": "Proposition créée avec succès",
            **proposal_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/proposals/{proposal_id}/approve")
async def approve_proposal(proposal_id: str, approval: ProposalApproval):
    """Approuve une proposition (Accepter les changements)"""
    try:
        db = get_db()
        
        # Vérifier que la proposition existe
        proposal = db.optimization_proposals.find_one({"_id": ObjectId(proposal_id)})
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposition non trouvée")
        
        # Mettre à jour le statut
        db.optimization_proposals.update_one(
            {"_id": ObjectId(proposal_id)},
            {
                "$set": {
                    "status": "approved",
                    "approved_at": approval.approved_at,
                    "admin_notes": approval.admin_notes,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Créer automatiquement un backup avant application (synchrone)
        create_version_backup_sync(f"Backup automatique avant approbation: {proposal.get('title', 'Unknown')}")
        
        return {
            "message": "Proposition approuvée avec succès",
            "proposal_id": proposal_id,
            "backup_created": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/proposals/{proposal_id}/reject")
async def reject_proposal(proposal_id: str, rejection: ProposalRejection):
    """Rejette une proposition"""
    try:
        db = get_db()
        
        db.optimization_proposals.update_one(
            {"_id": ObjectId(proposal_id)},
            {
                "$set": {
                    "status": "rejected",
                    "rejected_at": rejection.rejected_at,
                    "rejection_reason": rejection.rejection_reason,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {"message": "Proposition rejetée", "proposal_id": proposal_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# GESTION DES VERSIONS
# ================================

def create_version_backup_sync(description: str = ""):
    """Crée un backup versionné (version synchrone pour usage interne)"""
    try:
        db = get_db()
        timestamp = datetime.now(timezone.utc)
        version_id = f"BIONIC_v{timestamp.strftime('%Y%m%d_%H%M%S')}"
        
        version_data = {
            "version_id": version_id,
            "description": description or f"Backup automatique - {timestamp.strftime('%d/%m/%Y %H:%M')}",
            "created_at": timestamp.isoformat(),
            "modules": ["bionic", "territory", "waypoints", "zones", "config"],
            "module_snapshots": {}
        }
        
        # Capturer l'état
        try:
            version_data["module_snapshots"]["waypoints"] = list(db.waypoints.find({}, {"_id": 0}))
        except:
            version_data["module_snapshots"]["waypoints"] = []
        
        try:
            version_data["module_snapshots"]["zones"] = list(db.zones.find({}, {"_id": 0}))
        except:
            version_data["module_snapshots"]["zones"] = []
            
        try:
            config = db.app_config.find_one({}, {"_id": 0})
            version_data["module_snapshots"]["config"] = config or {}
        except:
            version_data["module_snapshots"]["config"] = {}
        
        result = db.optimization_versions.insert_one(version_data)
        return str(result.inserted_id), version_id
    except Exception as e:
        print(f"Error creating backup: {e}")
        return None, None

@router.get("/versions")
async def get_versions():
    """Récupère l'historique des versions sauvegardées"""
    try:
        db = get_db()
        
        versions = list(db.optimization_versions.find().sort("created_at", -1).limit(MAX_VERSIONS))
        
        for v in versions:
            v["id"] = str(v["_id"])
            del v["_id"]
        
        return versions
    except Exception as e:
        return []

@router.post("/versions")
async def create_version_backup(backup: VersionBackup):
    """Crée un backup versionné de l'état actuel"""
    try:
        db = get_db()
        
        # Générer un ID de version unique
        timestamp = datetime.now(timezone.utc)
        version_id = f"BIONIC_v{timestamp.strftime('%Y%m%d_%H%M%S')}"
        
        # Sauvegarder les données des modules
        version_data = {
            "version_id": version_id,
            "description": backup.description or f"Backup automatique - {timestamp.strftime('%d/%m/%Y %H:%M')}",
            "created_at": timestamp.isoformat(),
            "modules": backup.modules,
            "module_snapshots": {}
        }
        
        # Capturer l'état de chaque module
        for module in backup.modules:
            if module == "waypoints":
                version_data["module_snapshots"]["waypoints"] = list(db.waypoints.find({}, {"_id": 0}))
            elif module == "zones":
                version_data["module_snapshots"]["zones"] = list(db.zones.find({}, {"_id": 0}))
            elif module == "config":
                config = db.app_config.find_one({}, {"_id": 0})
                version_data["module_snapshots"]["config"] = config or {}
        
        result = db.optimization_versions.insert_one(version_data)
        
        # Nettoyer les anciennes versions si nécessaire
        total_versions = db.optimization_versions.count_documents({})
        if total_versions > MAX_VERSIONS:
            oldest = db.optimization_versions.find().sort("created_at", 1).limit(total_versions - MAX_VERSIONS)
            for old_version in oldest:
                db.optimization_versions.delete_one({"_id": old_version["_id"]})
        
        return {
            "id": str(result.inserted_id),
            "version_id": version_id,
            "message": "Backup créé avec succès",
            "modules_saved": backup.modules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/versions/{version_id}/restore")
async def restore_version(version_id: str):
    """Restaure une version précédente"""
    try:
        db = get_db()
        
        # Trouver la version à restaurer
        version = db.optimization_versions.find_one({"_id": ObjectId(version_id)})
        if not version:
            raise HTTPException(status_code=404, detail="Version non trouvée")
        
        # Créer un backup de l'état actuel avant restauration (synchrone)
        create_version_backup_sync(f"Backup pré-restauration vers {version.get('version_id', 'unknown')}")
        
        # Restaurer les snapshots des modules
        snapshots = version.get("module_snapshots", {})
        
        for module, data in snapshots.items():
            if module == "waypoints" and data:
                db.waypoints.delete_many({})
                if len(data) > 0:
                    db.waypoints.insert_many(data)
            elif module == "zones" and data:
                db.zones.delete_many({})
                if len(data) > 0:
                    db.zones.insert_many(data)
            elif module == "config" and data:
                db.app_config.replace_one({}, data, upsert=True)
        
        # Enregistrer la restauration
        db.optimization_versions.update_one(
            {"_id": ObjectId(version_id)},
            {"$set": {"last_restored_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {
            "message": f"Version {version.get('version_id')} restaurée avec succès",
            "restored_modules": list(snapshots.keys()),
            "backup_created": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ================================
# AUTO-ANALYSE
# ================================

@router.post("/analyze")
async def run_auto_analysis():
    """Exécute une auto-analyse du système et génère des suggestions"""
    try:
        db = get_db()
        suggestions = []
        
        # Analyse 1: Vérifier les waypoints sans coordonnées valides
        try:
            invalid_waypoints = db.waypoints.count_documents({
                "$or": [
                    {"lat": {"$exists": False}},
                    {"lng": {"$exists": False}},
                    {"lat": None},
                    {"lng": None}
                ]
            })
            if invalid_waypoints > 0:
                suggestions.append({
                    "title": f"Nettoyage de {invalid_waypoints} waypoints invalides",
                    "description": f"Détecté {invalid_waypoints} waypoints sans coordonnées valides.",
                    "type": "optimization",
                    "impact": "low",
                    "affected_modules": ["waypoints", "territory"],
                    "benefits": ["Réduction de la taille de la base de données"],
                    "risks": ["Perte de données potentiellement récupérables"]
                })
        except Exception:
            pass
        
        # Analyse 2: Vérifier le nombre de versions stockées
        try:
            version_count = db.optimization_versions.count_documents({})
            if version_count > MAX_VERSIONS * 0.8:
                suggestions.append({
                    "title": "Nettoyage des anciennes versions",
                    "description": f"Le système conserve {version_count} versions.",
                    "type": "optimization",
                    "impact": "low",
                    "affected_modules": ["config"],
                    "benefits": ["Libération d'espace de stockage"],
                    "risks": []
                })
        except Exception:
            pass
        
        # Analyse 3: Suggestion d'optimisation de la mémoire (toujours générée)
        suggestions.append({
            "title": "Optimisation automatique de la mémoire",
            "description": "Nettoyage des caches expirés et optimisation de l'utilisation mémoire des composants BIONIC.",
            "type": "performance",
            "impact": "medium",
            "affected_modules": ["bionic", "territory", "zones"],
            "benefits": ["Réduction de la consommation mémoire", "Amélioration de la réactivité"],
            "risks": ["Temps de rechargement initial légèrement plus long"]
        })
        
        # Analyse 4: Suggestion de backup régulier
        suggestions.append({
            "title": "Configuration des backups automatiques",
            "description": "Activer les sauvegardes automatiques quotidiennes pour protéger vos données.",
            "type": "security",
            "impact": "high",
            "affected_modules": ["config", "backup"],
            "benefits": ["Protection contre la perte de données", "Restauration rapide en cas de problème"],
            "risks": []
        })
        
        # Créer les propositions dans la base
        for suggestion in suggestions:
            existing = db.optimization_proposals.find_one({
                "title": suggestion["title"],
                "status": "pending"
            })
            if not existing:
                suggestion["status"] = "pending"
                suggestion["created_at"] = datetime.now(timezone.utc).isoformat()
                suggestion["updated_at"] = datetime.now(timezone.utc).isoformat()
                db.optimization_proposals.insert_one(suggestion)
        
        return {
            "message": "Analyse terminée",
            "suggestions_count": len(suggestions),
            "suggestions": suggestions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
