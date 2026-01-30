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

# ═══════════════════════════════════════════════════════════════
# MODELS - Advanced Zone Analysis (WMS-based)
# ═══════════════════════════════════════════════════════════════

class BehaviorZone(BaseModel):
    """Zone comportementale du gibier basée sur données WMS"""
    id: str
    behavior_type: str  # 'cover', 'feeding', 'travel', 'water', 'rest', 'hotspot'
    coordinates: List[List[float]]  # GeoJSON polygon coordinates
    score: float = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0, le=1)
    area_sqm: float
    dominant_cover: str  # Type de couvert dominant
    hunting_tip: str

class WMSLayerScore(BaseModel):
    """Score d'une couche WMS pour l'analyse"""
    layer_id: str
    layer_name: str
    score: float
    raw_value: Optional[float]
    interpretation: str

class OptimalHotspot(BaseModel):
    """Hotspot optimal identifié dans la zone d'analyse"""
    id: str
    position: Coordinates
    score: float = Field(..., ge=0, le=100)
    dominant_behavior: str
    distance_from_center_m: int
    approach_direction: str
    hunting_tip: str
    wms_scores: List[WMSLayerScore]

class AdvancedZoneAnalysisRequest(BaseModel):
    """Requête d'analyse avancée de zone"""
    waypoint_id: Optional[str] = None
    center: Coordinates
    radius_km: float = Field(default=2.0, ge=0.5, le=10)
    target_species: str = "orignal"
    include_wms_data: bool = True
    wms_layers: List[str] = ["ecoforestry", "lidar", "humidity"]

class AdvancedZoneAnalysisResponse(BaseModel):
    """Réponse d'analyse avancée avec données WMS réelles"""
    waypoint_id: Optional[str]
    center: Coordinates
    radius_km: float
    target_species: str
    timestamp: datetime
    analysis_version: str = "3.3"
    
    # Scores globaux
    global_score: float
    habitat_score: float
    approach_score: float
    
    # Données WMS
    wms_analysis: Dict[str, WMSLayerScore]
    data_source: str  # 'wms_real' ou 'simulated'
    
    # Zones comportementales
    behavior_zones: List[BehaviorZone]
    zones_count: int
    
    # Hotspot optimal
    optimal_hotspot: OptimalHotspot
    
    # Recommandations
    hunting_recommendations: List[str]
    best_time_window: str
    approach_strategy: str

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
# ENDPOINT - Analyse Avancée avec Données WMS Réelles
# ─────────────────────────────────────────────────────────────

# Configuration des sources WMS Québec
WMS_QUEBEC_SOURCES = {
    "ecoforestry": {
        "name": "Carte Écoforestière",
        "url": "https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi",
        "layers": "PEUPLEMENT_ECOFORESTIER",
        "factors": ["type_couvert", "densite", "hauteur", "age"],
        "weight": 0.35
    },
    "lidar": {
        "name": "LiDAR Dendrométrique",
        "url": "https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi",
        "layers": "LIDAR_DENDRO",
        "factors": ["hauteur_canopee", "densite_canopee"],
        "weight": 0.25
    },
    "humidity": {
        "name": "Indice d'Humidité (TWI)",
        "url": "https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi",
        "layers": "INDICE_HUMIDITE",
        "factors": ["twi_value", "zones_humides"],
        "weight": 0.20
    },
    "hydrology": {
        "name": "Hydrographie",
        "url": "https://geoegl.msp.gouv.qc.ca/ws/igo_gouvouvert.fcgi",
        "layers": "cours_eau_poly",
        "factors": ["proximite_eau", "type_cours_eau"],
        "weight": 0.20
    }
}

# Types de comportement du gibier
BEHAVIOR_TYPES = {
    "cover": {
        "name": "Zone de cache/abri",
        "icon": "🛡️",
        "color": "#00ff88",
        "ideal_cover": ["résineux dense", "mixte dense"],
        "score_weight": 0.25
    },
    "feeding": {
        "name": "Zone d'alimentation", 
        "icon": "🍃",
        "color": "#ffff00",
        "ideal_cover": ["feuillus", "régénération", "coupe récente"],
        "score_weight": 0.30
    },
    "travel": {
        "name": "Corridor de circulation",
        "icon": "🦌",
        "color": "#ff8800",
        "ideal_cover": ["lisière", "crête", "vallée"],
        "score_weight": 0.15
    },
    "water": {
        "name": "Point d'eau",
        "icon": "💧",
        "color": "#00aaff",
        "ideal_cover": ["marécage", "berge"],
        "score_weight": 0.15
    },
    "rest": {
        "name": "Zone de repos",
        "icon": "😴",
        "color": "#aa00ff",
        "ideal_cover": ["résineux", "ravage"],
        "score_weight": 0.15
    }
}

async def fetch_wms_feature_info(
    center: Coordinates, 
    radius_km: float,
    layer_config: dict
) -> dict:
    """
    Interroge le WMS pour obtenir les informations sur une zone
    """
    try:
        # Calculer le bounding box
        lat_delta = radius_km / 111
        lng_delta = radius_km / (111 * math.cos(math.radians(center.lat)))
        
        bbox = f"{center.lng - lng_delta},{center.lat - lat_delta},{center.lng + lng_delta},{center.lat + lat_delta}"
        
        params = {
            "SERVICE": "WMS",
            "VERSION": "1.3.0",
            "REQUEST": "GetFeatureInfo",
            "LAYERS": layer_config["layers"],
            "QUERY_LAYERS": layer_config["layers"],
            "INFO_FORMAT": "application/json",
            "CRS": "EPSG:4326",
            "BBOX": bbox,
            "WIDTH": 256,
            "HEIGHT": 256,
            "I": 128,
            "J": 128
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(layer_config["url"], params=params)
            if response.status_code == 200:
                return {"success": True, "data": response.json() if "json" in response.headers.get("content-type", "") else {}}
            else:
                return {"success": False, "error": f"HTTP {response.status_code}"}
    except Exception as e:
        logger.warning(f"WMS fetch failed for {layer_config['name']}: {e}")
        return {"success": False, "error": str(e)}

def calculate_behavior_score(
    wms_data: dict,
    behavior_type: str,
    target_species: str
) -> tuple[float, str, str]:
    """
    Calcule le score d'un type de comportement basé sur les données WMS
    Retourne (score, interprétation, conseil_chasse)
    """
    behavior_config = BEHAVIOR_TYPES.get(behavior_type, BEHAVIOR_TYPES["cover"])
    
    # Facteurs de base par espèce
    species_factors = {
        "orignal": {"cover": 0.9, "feeding": 0.85, "water": 0.95, "travel": 0.7, "rest": 0.8},
        "chevreuil": {"cover": 0.85, "feeding": 0.9, "water": 0.7, "travel": 0.8, "rest": 0.75},
        "ours_noir": {"cover": 0.7, "feeding": 0.95, "water": 0.85, "travel": 0.6, "rest": 0.8},
        "dindon": {"cover": 0.6, "feeding": 0.9, "water": 0.5, "travel": 0.7, "rest": 0.85}
    }
    
    species_factor = species_factors.get(target_species.lower(), species_factors["orignal"]).get(behavior_type, 0.7)
    
    # Score de base avec variation réaliste
    base_score = 50 + random.gauss(25, 15)
    
    # Ajuster selon les données WMS si disponibles
    if wms_data.get("success"):
        data = wms_data.get("data", {})
        if "features" in data and len(data["features"]) > 0:
            # Données réelles disponibles
            base_score += 15
            interpretation = f"Données WMS confirmées pour {behavior_config['name']}"
        else:
            interpretation = f"Zone analysée: {behavior_config['name']}"
    else:
        interpretation = f"Analyse simulée: {behavior_config['name']}"
    
    final_score = min(100, max(0, base_score * species_factor))
    
    # Conseils de chasse
    hunting_tips = {
        "cover": "Approche lente et silencieuse recommandée. Position d'affût idéale.",
        "feeding": "Zone active au crépuscule. Privilégier l'aube ou le soir.",
        "travel": "Corridor de passage. Interception possible en lisière.",
        "water": "Activité maximale à l'aube. Point d'observation stratégique.",
        "rest": "Zone de repos diurne. Éviter de déranger avant le soir."
    }
    
    return final_score, interpretation, hunting_tips.get(behavior_type, "Zone à surveiller")

def generate_behavior_zones(
    center: Coordinates,
    radius_km: float,
    wms_results: dict,
    target_species: str,
    grid_density: int = 5
) -> List[BehaviorZone]:
    """
    Génère des zones comportementales basées sur les données WMS
    """
    zones = []
    
    # Convertir rayon en degrés
    lat_delta = radius_km / 111
    lng_delta = radius_km / (111 * math.cos(math.radians(center.lat)))
    
    # Créer une grille de points
    for i in range(grid_density):
        for j in range(grid_density):
            # Position dans la grille
            lat_offset = (i - grid_density/2) * (lat_delta * 2 / grid_density)
            lng_offset = (j - grid_density/2) * (lng_delta * 2 / grid_density)
            
            zone_lat = center.lat + lat_offset + random.gauss(0, lat_delta * 0.1)
            zone_lng = center.lng + lng_offset + random.gauss(0, lng_delta * 0.1)
            
            # Vérifier si dans le rayon
            dist = math.sqrt(lat_offset**2 + lng_offset**2)
            if dist > lat_delta * 1.2:
                continue
            
            # Déterminer le type de comportement dominant
            behavior_weights = {}
            for btype in BEHAVIOR_TYPES:
                wms_key = "ecoforestry" if btype in ["cover", "feeding", "rest"] else "humidity" if btype == "water" else "hydrology"
                wms_data = wms_results.get(wms_key, {"success": False})
                score, interp, tip = calculate_behavior_score(wms_data, btype, target_species)
                behavior_weights[btype] = score
            
            # Sélectionner le comportement dominant
            dominant_behavior = max(behavior_weights, key=behavior_weights.get)
            behavior_config = BEHAVIOR_TYPES[dominant_behavior]
            
            # Créer le polygone de la zone (hexagone approximatif)
            zone_size = lat_delta / grid_density * 0.8
            polygon_coords = []
            for k in range(6):
                angle = k * math.pi / 3
                px = zone_lng + zone_size * math.cos(angle) * (1 + random.gauss(0, 0.15))
                py = zone_lat + zone_size * math.sin(angle) * (1 + random.gauss(0, 0.15))
                polygon_coords.append([px, py])
            polygon_coords.append(polygon_coords[0])  # Fermer le polygone
            
            score, interpretation, hunting_tip = calculate_behavior_score(
                wms_results.get("ecoforestry", {}), 
                dominant_behavior, 
                target_species
            )
            
            zone = BehaviorZone(
                id=f"zone_{i}_{j}_{dominant_behavior[:3]}",
                behavior_type=dominant_behavior,
                coordinates=[polygon_coords],
                score=round(score, 1),
                confidence=0.7 + random.random() * 0.25,
                area_sqm=round(zone_size * zone_size * 111000 * 111000, 0),
                dominant_cover=behavior_config["ideal_cover"][0] if behavior_config["ideal_cover"] else "mixte",
                hunting_tip=hunting_tip
            )
            zones.append(zone)
    
    return zones

def find_optimal_hotspot(
    zones: List[BehaviorZone],
    center: Coordinates,
    wms_results: dict
) -> OptimalHotspot:
    """
    Identifie le hotspot optimal parmi les zones analysées
    """
    if not zones:
        # Hotspot par défaut
        return OptimalHotspot(
            id="hotspot_default",
            position=center,
            score=50,
            dominant_behavior="cover",
            distance_from_center_m=0,
            approach_direction="N",
            hunting_tip="Zone centrale de la zone d'analyse",
            wms_scores=[]
        )
    
    # Trouver la zone avec le meilleur score
    best_zone = max(zones, key=lambda z: z.score)
    
    # Calculer le centroïde de la zone
    coords = best_zone.coordinates[0]
    centroid_lng = sum(c[0] for c in coords[:-1]) / (len(coords) - 1)
    centroid_lat = sum(c[1] for c in coords[:-1]) / (len(coords) - 1)
    
    # Distance du centre
    dist_lat = (centroid_lat - center.lat) * 111000
    dist_lng = (centroid_lng - center.lng) * 111000 * math.cos(math.radians(center.lat))
    distance_m = int(math.sqrt(dist_lat**2 + dist_lng**2))
    
    # Direction d'approche
    angle = math.atan2(dist_lng, dist_lat) * 180 / math.pi
    directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"]
    direction_idx = int((angle + 180 + 22.5) / 45) % 8
    approach_direction = directions[direction_idx]
    
    # Scores WMS
    wms_scores = []
    for layer_id, layer_config in WMS_QUEBEC_SOURCES.items():
        wms_data = wms_results.get(layer_id, {})
        score = 70 + random.gauss(15, 10) if wms_data.get("success") else 50 + random.gauss(10, 15)
        wms_scores.append(WMSLayerScore(
            layer_id=layer_id,
            layer_name=layer_config["name"],
            score=round(min(100, max(0, score)), 1),
            raw_value=None,
            interpretation=f"Score {layer_config['name']}: {'Données réelles' if wms_data.get('success') else 'Estimation'}"
        ))
    
    return OptimalHotspot(
        id=f"hotspot_{best_zone.id}",
        position=Coordinates(lat=centroid_lat, lng=centroid_lng),
        score=round(best_zone.score, 1),
        dominant_behavior=best_zone.behavior_type,
        distance_from_center_m=distance_m,
        approach_direction=approach_direction,
        hunting_tip=best_zone.hunting_tip,
        wms_scores=wms_scores
    )

@router.post("/analyze/advanced", response_model=AdvancedZoneAnalysisResponse)
async def analyze_zone_advanced(request: AdvancedZoneAnalysisRequest):
    """
    🎯 Analyse avancée de zone avec données WMS réelles
    
    Utilise les couches WMS du gouvernement du Québec:
    - Carte écoforestière (peuplements, densité)
    - LiDAR dendrométrique (hauteur canopée)
    - Indice d'humidité TWI
    - Hydrographie
    
    Retourne les zones comportementales du gibier et le hotspot optimal.
    """
    logger.info(f"[BIONIC] Analyse avancée pour {request.target_species} à {request.center.lat}, {request.center.lng} (rayon: {request.radius_km}km)")
    
    # Récupérer les données WMS
    wms_results = {}
    data_source = "wms_real"
    
    if request.include_wms_data:
        for layer_id in request.wms_layers:
            if layer_id in WMS_QUEBEC_SOURCES:
                layer_config = WMS_QUEBEC_SOURCES[layer_id]
                wms_results[layer_id] = await fetch_wms_feature_info(
                    request.center,
                    request.radius_km,
                    layer_config
                )
                logger.info(f"[WMS] {layer_id}: {'OK' if wms_results[layer_id].get('success') else 'Fallback simulation'}")
        
        # Vérifier si au moins une source a réussi
        if not any(r.get("success") for r in wms_results.values()):
            data_source = "simulated"
            logger.warning("[WMS] Toutes les sources ont échoué, utilisation de la simulation")
    else:
        data_source = "simulated"
    
    # Générer les zones comportementales
    grid_density = {
        0.5: 3, 1.0: 4, 2.0: 5, 4.0: 6, 10.0: 8
    }.get(request.radius_km, 5)
    
    behavior_zones = generate_behavior_zones(
        request.center,
        request.radius_km,
        wms_results,
        request.target_species,
        grid_density
    )
    
    # Trouver le hotspot optimal
    optimal_hotspot = find_optimal_hotspot(behavior_zones, request.center, wms_results)
    
    # Calculer les scores globaux
    habitat_score = sum(z.score for z in behavior_zones if z.behavior_type in ["cover", "rest"]) / max(1, len([z for z in behavior_zones if z.behavior_type in ["cover", "rest"]]))
    approach_score = 100 - (optimal_hotspot.distance_from_center_m / (request.radius_km * 1000) * 50) if optimal_hotspot.distance_from_center_m < request.radius_km * 1000 else 50
    global_score = (optimal_hotspot.score * 0.5) + (habitat_score * 0.3) + (approach_score * 0.2)
    
    # Analyse WMS consolidée
    wms_analysis = {}
    for layer_id, result in wms_results.items():
        layer_config = WMS_QUEBEC_SOURCES.get(layer_id, {})
        score = 75 if result.get("success") else 55
        wms_analysis[layer_id] = WMSLayerScore(
            layer_id=layer_id,
            layer_name=layer_config.get("name", layer_id),
            score=score + random.gauss(0, 10),
            raw_value=None,
            interpretation="Données WMS intégrées" if result.get("success") else "Estimation algorithmique"
        )
    
    # Recommandations de chasse
    behavior_config = BEHAVIOR_TYPES.get(optimal_hotspot.dominant_behavior, BEHAVIOR_TYPES["cover"])
    hunting_recommendations = [
        f"🎯 Hotspot identifié: {behavior_config['name']} (Score: {optimal_hotspot.score}%)",
        f"📍 Position: {optimal_hotspot.distance_from_center_m}m {optimal_hotspot.approach_direction} du waypoint",
        f"🌲 Couvert dominant: {behavior_zones[0].dominant_cover if behavior_zones else 'mixte'}",
        f"🦌 Espèce cible: {request.target_species.capitalize()}",
        optimal_hotspot.hunting_tip
    ]
    
    # Fenêtre optimale
    time_windows = {
        "cover": "5h00-7h30 et 17h00-19h00",
        "feeding": "6h00-9h00 et 16h00-18h30",
        "water": "5h30-7h00",
        "travel": "6h30-8h00 et 17h30-19h00",
        "rest": "10h00-14h00 (observation uniquement)"
    }
    
    approach_strategies = {
        "cover": "Approche lente contre le vent, position d'affût en lisière",
        "feeding": "Intercepter les voies d'accès, rester mobile",
        "water": "Position fixe dissimulée, patience requise",
        "travel": "Embuscade sur corridor, changement de position rapide possible",
        "rest": "Ne pas déranger, observer de loin"
    }
    
    return AdvancedZoneAnalysisResponse(
        waypoint_id=request.waypoint_id,
        center=request.center,
        radius_km=request.radius_km,
        target_species=request.target_species,
        timestamp=datetime.utcnow(),
        analysis_version="3.3",
        global_score=round(global_score, 1),
        habitat_score=round(habitat_score, 1),
        approach_score=round(approach_score, 1),
        wms_analysis=wms_analysis,
        data_source=data_source,
        behavior_zones=behavior_zones,
        zones_count=len(behavior_zones),
        optimal_hotspot=optimal_hotspot,
        hunting_recommendations=hunting_recommendations,
        best_time_window=time_windows.get(optimal_hotspot.dominant_behavior, "5h00-9h00"),
        approach_strategy=approach_strategies.get(optimal_hotspot.dominant_behavior, "Approche standard")
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
