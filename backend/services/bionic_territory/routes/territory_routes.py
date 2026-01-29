"""
BIONIC Territory Service - Module Backend

Architecture: Microservice-Ready
- Routes isolées par domaine
- Modèles Pydantic typés
- Services découplés
- Prêt pour extraction vers microservice indépendant

Version: 1.1.0
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import logging
import httpx
import math
import random

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════
# ENUMS & TYPES
# ═══════════════════════════════════════════════════════════════

class BaseMapType(str, Enum):
    BIONIC = "bionic"
    SATELLITE = "satellite"
    TERRAIN = "terrain"

class WaypointType(str, Enum):
    AFFUT = "affut"
    SALINE = "saline"
    OBSERVATION = "observation"
    CAMERA = "camera"
    AUTRE = "autre"

class ZoneType(str, Enum):
    REFUGE = "refuge"
    ALIMENTATION = "alimentation"
    DEPLACEMENT = "deplacement"
    DORTOIR = "dortoir"
    RUT = "rut"

# ═══════════════════════════════════════════════════════════════
# MODELS - Request/Response
# ═══════════════════════════════════════════════════════════════

class Coordinates(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)

class WaypointCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    type: WaypointType = WaypointType.AUTRE
    coordinates: Coordinates
    notes: Optional[str] = None
    is_public: bool = False

class WaypointResponse(BaseModel):
    id: str
    name: str
    type: WaypointType
    coordinates: Coordinates
    notes: Optional[str]
    is_public: bool
    created_at: datetime
    user_id: str
    
    class Config:
        from_attributes = True

class ZoneAnalysisRequest(BaseModel):
    center: Coordinates
    radius_km: float = Field(default=2.0, ge=0.1, le=50)
    target_species: str = "orignal"
    include_weather: bool = True

class ZoneScore(BaseModel):
    zone_type: ZoneType
    score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    dominant_factors: List[str]
    recommendations: List[str]

class ZoneAnalysisResponse(BaseModel):
    center: Coordinates
    radius_km: float
    target_species: str
    timestamp: datetime
    global_score: float
    zones: List[ZoneScore]
    hotspots: List[Dict[str, Any]]
    weather_impact: Optional[Dict[str, Any]]

class PipelineStatusResponse(BaseModel):
    enabled: bool
    version: str
    layers_active: int
    last_updated: datetime
    coverage: str

class MapConfigResponse(BaseModel):
    base_maps: List[Dict[str, Any]]
    pipeline_layers: List[Dict[str, Any]]
    default_center: Coordinates
    default_zoom: int
    max_zoom: int
    min_zoom: int

# ═══════════════════════════════════════════════════════════════
# ROUTER
# ═══════════════════════════════════════════════════════════════

router = APIRouter(
    prefix="/bionic-territory",
    tags=["BIONIC Territory"],
    responses={404: {"description": "Not found"}}
)

# ─────────────────────────────────────────────────────────────
# ENDPOINTS - Configuration
# ─────────────────────────────────────────────────────────────

@router.get("/config", response_model=MapConfigResponse)
async def get_map_config():
    """
    Retourne la configuration de la carte BIONIC
    """
    return MapConfigResponse(
        base_maps=[
            {"id": "bionic", "name": "BIONIC™", "icon": "🎯", "description": "Terrain + Hydro + Score"},
            {"id": "satellite", "name": "Satellite", "icon": "🛰️", "description": "Imagery ESRI"},
            {"id": "terrain", "name": "Terrain", "icon": "🏔️", "description": "OpenTopoMap"}
        ],
        pipeline_layers=[
            {"id": "topography", "name": "Topographie", "icon": "⛰️", "zoom_range": "5-18"},
            {"id": "geology", "name": "Géologie", "icon": "🪨", "zoom_range": "5-18"},
            {"id": "hydrology", "name": "Hydrologie", "icon": "💧", "zoom_range": "5-18"},
            {"id": "ecoforestry", "name": "Écoforestier", "icon": "🌲", "zoom_range": "8-18"},
            {"id": "administrative", "name": "Administratif", "icon": "📍", "zoom_range": "5-18"},
            {"id": "roads", "name": "Routes", "icon": "🛤️", "zoom_range": "8-18"},
            {"id": "urban", "name": "Urbain", "icon": "🏘️", "zoom_range": "8-18"},
            {"id": "wildlife_score", "name": "Score Faunique", "icon": "🦌", "zoom_range": "10-18"}
        ],
        default_center=Coordinates(lat=46.8139, lng=-71.2080),
        default_zoom=12,
        max_zoom=18,
        min_zoom=5
    )

@router.get("/pipeline/status", response_model=PipelineStatusResponse)
async def get_pipeline_status():
    """
    Retourne le statut du pipeline BIONIC
    """
    return PipelineStatusResponse(
        enabled=True,
        version="1.0.0",
        layers_active=8,
        last_updated=datetime.utcnow(),
        coverage="Canada"
    )

# ─────────────────────────────────────────────────────────────
# ENDPOINTS - Analysis
# ─────────────────────────────────────────────────────────────

@router.post("/analyze", response_model=ZoneAnalysisResponse)
async def analyze_zone(request: ZoneAnalysisRequest):
    """
    Analyse une zone et retourne les scores BIONIC
    """
    logger.info(f"Analyzing zone at {request.center.lat}, {request.center.lng}")
    
    # Simulation de l'analyse (à remplacer par la vraie logique)
    zones = [
        ZoneScore(
            zone_type=ZoneType.REFUGE,
            score=85.0,
            confidence=0.92,
            dominant_factors=["Couvert dense", "Éloignement routes"],
            recommendations=["Zone idéale pour affût matinal"]
        ),
        ZoneScore(
            zone_type=ZoneType.ALIMENTATION,
            score=72.0,
            confidence=0.85,
            dominant_factors=["Proximité eau", "Végétation diversifiée"],
            recommendations=["Présence de salines potentielles"]
        ),
        ZoneScore(
            zone_type=ZoneType.DEPLACEMENT,
            score=68.0,
            confidence=0.78,
            dominant_factors=["Corridors naturels", "Topographie favorable"],
            recommendations=["Corridor principal NE-SO"]
        )
    ]
    
    hotspots = [
        {
            "id": "hs_001",
            "coordinates": {"lat": request.center.lat + 0.01, "lng": request.center.lng - 0.005},
            "score": 92,
            "type": "refuge",
            "priority": "high"
        },
        {
            "id": "hs_002", 
            "coordinates": {"lat": request.center.lat - 0.008, "lng": request.center.lng + 0.012},
            "score": 78,
            "type": "alimentation",
            "priority": "medium"
        }
    ]
    
    weather_impact = None
    if request.include_weather:
        weather_impact = {
            "temperature_impact": 0.85,
            "wind_impact": 0.72,
            "precipitation_impact": 1.0,
            "overall_factor": 0.86,
            "recommendation": "Conditions favorables pour l'activité du gibier"
        }
    
    global_score = sum(z.score for z in zones) / len(zones)
    
    return ZoneAnalysisResponse(
        center=request.center,
        radius_km=request.radius_km,
        target_species=request.target_species,
        timestamp=datetime.utcnow(),
        global_score=global_score,
        zones=zones,
        hotspots=hotspots,
        weather_impact=weather_impact
    )

# ─────────────────────────────────────────────────────────────
# ENDPOINTS - Waypoints (CRUD)
# ─────────────────────────────────────────────────────────────

@router.get("/waypoints", response_model=List[WaypointResponse])
async def list_waypoints(
    user_id: str = Query(..., description="ID de l'utilisateur"),
    type_filter: Optional[WaypointType] = None,
    limit: int = Query(default=100, le=500)
):
    """
    Liste les waypoints d'un utilisateur
    """
    # À implémenter avec MongoDB
    return []

@router.post("/waypoints", response_model=WaypointResponse)
async def create_waypoint(
    waypoint: WaypointCreate,
    user_id: str = Query(..., description="ID de l'utilisateur")
):
    """
    Crée un nouveau waypoint
    """
    # À implémenter avec MongoDB
    return WaypointResponse(
        id="wp_new",
        name=waypoint.name,
        type=waypoint.type,
        coordinates=waypoint.coordinates,
        notes=waypoint.notes,
        is_public=waypoint.is_public,
        created_at=datetime.utcnow(),
        user_id=user_id
    )

@router.delete("/waypoints/{waypoint_id}")
async def delete_waypoint(
    waypoint_id: str,
    user_id: str = Query(..., description="ID de l'utilisateur")
):
    """
    Supprime un waypoint
    """
    # À implémenter avec MongoDB
    return {"status": "deleted", "waypoint_id": waypoint_id}

# ─────────────────────────────────────────────────────────────
# WMS PROXY - Contournement des restrictions CORS/IP
# ─────────────────────────────────────────────────────────────

import httpx

# Configuration des sources WMS officielles du Québec
WMS_SOURCES = {
    "quebec_eco": {
        "url": "https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi",
        "description": "Carte écoforestière du Québec",
        "layers": {
            "peuplements": "CARTE_ECO_MAJ",
            "perturbations": "CARTE_ECO_PERTURB",
            "essences": "CARTE_ECO_ESSENCE"
        }
    },
    "quebec_lidar": {
        "url": "https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi",
        "description": "Données LiDAR dendrométriques",
        "layers": {
            "lidar_dendro": "lidar_dendro_dispo",
            "lidar_chm": "lidar_chm"
        }
    },
    "quebec_terrain": {
        "url": "https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi",
        "description": "Indices topographiques",
        "layers": {
            "twi": "TWI",
            "elevation": "MNT"
        }
    },
    "canada_nfi": {
        "url": "https://cwfis.cfs.nrcan.gc.ca/geoserver/public/wms",
        "description": "National Forest Inventory (Canada)",
        "layers": {
            "forest_cover": "nfi_forest_land_cover"
        }
    }
}

class WMSProxyRequest(BaseModel):
    source: str = Field(..., description="Source WMS (quebec_eco, quebec_lidar, etc.)")
    layer: str = Field(..., description="Nom de la couche")
    bbox: str = Field(..., description="Bounding box (minx,miny,maxx,maxy)")
    width: int = Field(default=256, ge=64, le=1024)
    height: int = Field(default=256, ge=64, le=1024)
    srs: str = Field(default="EPSG:4326")
    format: str = Field(default="image/png")

class WMSSourceInfo(BaseModel):
    source_id: str
    url: str
    description: str
    available_layers: Dict[str, str]
    status: str

@router.get("/wms/sources", response_model=List[WMSSourceInfo])
async def list_wms_sources():
    """
    Liste toutes les sources WMS disponibles via le proxy
    """
    sources = []
    for source_id, config in WMS_SOURCES.items():
        sources.append(WMSSourceInfo(
            source_id=source_id,
            url=config["url"],
            description=config["description"],
            available_layers=config["layers"],
            status="available"
        ))
    return sources

@router.get("/wms/tile")
async def proxy_wms_tile(
    source: str = Query(..., description="Source WMS"),
    layer: str = Query(..., description="Nom de la couche"),
    bbox: str = Query(..., description="Bounding box"),
    width: int = Query(default=256, ge=64, le=1024),
    height: int = Query(default=256, ge=64, le=1024),
    srs: str = Query(default="EPSG:4326"),
    format: str = Query(default="image/png")
):
    """
    Proxy WMS - Récupère une tuile depuis les serveurs officiels
    Contourne les restrictions CORS/IP pour les données écoforestières du Québec
    """
    if source not in WMS_SOURCES:
        raise HTTPException(status_code=400, detail=f"Source inconnue: {source}. Sources disponibles: {list(WMS_SOURCES.keys())}")
    
    source_config = WMS_SOURCES[source]
    
    # Vérifier si la couche existe
    layer_name = source_config["layers"].get(layer, layer)
    
    # Construire l'URL WMS
    wms_params = {
        "SERVICE": "WMS",
        "VERSION": "1.1.1",
        "REQUEST": "GetMap",
        "LAYERS": layer_name,
        "BBOX": bbox,
        "WIDTH": str(width),
        "HEIGHT": str(height),
        "SRS": srs,
        "FORMAT": format,
        "TRANSPARENT": "TRUE"
    }
    
    wms_url = source_config["url"]
    
    logger.info(f"[WMS Proxy] Requesting {source}/{layer} - bbox: {bbox}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(wms_url, params=wms_params)
            
            if response.status_code != 200:
                logger.warning(f"[WMS Proxy] Error from {source}: {response.status_code}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Erreur WMS: {response.text[:200]}"
                )
            
            # Retourner l'image avec le bon content-type
            from fastapi.responses import Response
            return Response(
                content=response.content,
                media_type=response.headers.get("content-type", "image/png"),
                headers={
                    "Cache-Control": "public, max-age=3600",
                    "X-WMS-Source": source,
                    "X-WMS-Layer": layer_name
                }
            )
            
    except httpx.TimeoutException:
        logger.error(f"[WMS Proxy] Timeout for {source}/{layer}")
        raise HTTPException(status_code=504, detail="Timeout lors de la requête WMS")
    except httpx.RequestError as e:
        logger.error(f"[WMS Proxy] Request error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Erreur de connexion au serveur WMS: {str(e)}")

@router.get("/wms/capabilities/{source}")
async def get_wms_capabilities(source: str):
    """
    Récupère les capacités WMS d'une source
    """
    if source not in WMS_SOURCES:
        raise HTTPException(status_code=400, detail=f"Source inconnue: {source}")
    
    source_config = WMS_SOURCES[source]
    wms_url = source_config["url"]
    
    params = {
        "SERVICE": "WMS",
        "VERSION": "1.1.1",
        "REQUEST": "GetCapabilities"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(wms_url, params=params)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Erreur GetCapabilities")
            
            from fastapi.responses import Response
            return Response(
                content=response.content,
                media_type="application/xml"
            )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

# ─────────────────────────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    """
    Health check pour le service BIONIC Territory
    """
    return {
        "status": "healthy",
        "service": "bionic-territory",
        "version": "1.1.0",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "wms_proxy": True,
            "waypoints": True,
            "analysis": True
        }
    }
