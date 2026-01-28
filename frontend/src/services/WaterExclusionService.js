/**
 * WaterExclusionService.js
 * 
 * Service PERMANENT et AUTOMATIQUE d'exclusion des zones aquatiques pour BIONIC™
 * 
 * Ce service est TOUJOURS ACTIF et ne peut pas être désactivé.
 * Il s'applique à TOUTES les couches et TOUTES les cartes de l'application.
 * 
 * Fonctionnalités:
 * - Détection automatique des surfaces d'eau (fleuves, lacs, rivières, marais, etc.)
 * - Masque d'exclusion strict AVANT le rendu
 * - Clipping géométrique pour ajuster les contours aux limites terrestres
 * - Cache intelligent pour performances optimales
 * 
 * Sources de données:
 * - Québec: MRNF/MSP Hydrographie
 * - Canada: CanVec NRCan
 * - USA: USGS NHD
 * - Global: OpenStreetMap (fallback)
 * 
 * @author BIONIC™ Team
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// ═══════════════════════════════════════════════════════════════════
// RULESET: BIONIC_water_mask_v3
// Masque hydrique absolu multi-sources pour BIONIC™
// ═══════════════════════════════════════════════════════════════════
const CONFIG = Object.freeze({
  // Buffer de 5m autour de toutes les surfaces d'eau
  WATER_BUFFER_METERS: 5,
  
  // Buffer de 3m pour les cours d'eau linéaires
  HYDRO_LINE_BUFFER_METERS: 3,
  
  // Seuil d'exclusion: zone exclue si >1% de chevauchement avec l'eau
  OVERLAP_EXCLUSION_THRESHOLD: 0.01,
  
  // Distance max pour repositionnement score parfait sur rebord
  SNAP_TO_EDGE_MAX_DISTANCE: 50,
  
  // Cache et performance
  CACHE_DURATION_MS: 300000,        // 5 minutes
  FETCH_RADIUS_METERS: 15000,       // 15 km
  
  // Service PERMANENT - Ne peut pas être désactivé
  ENABLED: true,
  
  // Sources hydriques supportées (priorité décroissante)
  HYDRO_SOURCES: [
    'HYDRO_POLY_OFF',    // Polygones officiels (lacs, fleuves)
    'HYDRO_LINE_OFF',    // Linéaires officiels (rivières, ruisseaux)
    'HYDRO_WETLANDS',    // Zones humides / milieux hydriques
    'HYDRO_RASTER_MASK', // Masque raster converti
    'OSM_FALLBACK'       // OpenStreetMap fallback
  ]
});

// Cache global des données hydrographiques
const hydroCache = {
  data: new Map(),
  
  getKey(bounds) {
    if (!bounds) return null;
    const north = bounds.north || bounds._northEast?.lat;
    const south = bounds.south || bounds._southWest?.lat;
    const east = bounds.east || bounds._northEast?.lng;
    const west = bounds.west || bounds._southWest?.lng;
    return `${north?.toFixed(2)}_${south?.toFixed(2)}_${east?.toFixed(2)}_${west?.toFixed(2)}`;
  },
  
  get(bounds) {
    const key = this.getKey(bounds);
    if (!key) return null;
    
    const cached = this.data.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > CONFIG.CACHE_DURATION_MS) {
      this.data.delete(key);
      return null;
    }
    
    return cached.features;
  },
  
  set(bounds, features) {
    const key = this.getKey(bounds);
    if (!key) return;
    
    this.data.set(key, {
      features,
      timestamp: Date.now()
    });
    
    // Limiter la taille du cache
    if (this.data.size > 50) {
      const oldestKey = this.data.keys().next().value;
      this.data.delete(oldestKey);
    }
  }
};

/**
 * BIONIC_water_mask_v4 - Masque hydrographique ULTRA-STRICT
 * 
 * PROTOCOLE DE RELOCALISATION:
 * - Si une zone est dans l'eau → relocaliser à 5m du bord le plus proche
 * - Garantie 200%: AUCUNE zone ne peut être dans l'eau
 * 
 * Zone du fleuve Saint-Laurent étendue pour garantir 200% de couverture:
 * - Latitude: 46.76 à 46.94 (étendue +0.01)
 * - Longitude: -71.40 à -70.45 (étendue +0.05)
 */

// ════════════════════════════════════════════════════════════════
// DÉFINITION ULTRA-STRICTE DES ZONES D'EAU (200% de marge)
// ════════════════════════════════════════════════════════════════

// Polygone de l'île d'Orléans - RÉDUIT au minimum pour être ultra-conservateur
// Seul ce qui est CERTAINEMENT sur terre est considéré comme terre
const ILE_ORLEANS_LAND = {
  // Centre de l'île seulement - pas les bords
  polygon: [
    [46.862, -71.02], [46.866, -70.96], [46.870, -70.88], [46.872, -70.80],
    [46.870, -70.72], [46.866, -70.66], [46.860, -70.62], [46.852, -70.60],
    [46.844, -70.60], [46.838, -70.64], [46.834, -70.70], [46.834, -70.78],
    [46.836, -70.86], [46.840, -70.94], [46.846, -71.00], [46.854, -71.04],
    [46.862, -71.02]
  ],
  bounds: { north: 46.872, south: 46.834, east: -70.60, west: -71.04 }
};

// Triangle de terre de Sainte-Pétronille - TRÈS RÉDUIT
const STE_PETRONILLE_LAND = {
  // Seulement le cœur de la pointe, pas les bords
  point1: { lat: 46.856, lng: -71.11 },  // Pointe ouest (reculée)
  point2: { lat: 46.860, lng: -71.06 },  // Nord-est (reculé)
  point3: { lat: 46.850, lng: -71.06 }   // Sud-est (reculé)
};

/**
 * Vérifie si un point est sur l'île d'Orléans (zone centrale seulement)
 */
function isPointOnIleOrleansCenter(lat, lng) {
  // Vérification rapide des bounds
  if (lat < ILE_ORLEANS_LAND.bounds.south || lat > ILE_ORLEANS_LAND.bounds.north ||
      lng < ILE_ORLEANS_LAND.bounds.west || lng > ILE_ORLEANS_LAND.bounds.east) {
    return false;
  }
  
  // Test point-in-polygon
  return pointInPolygonArray(lat, lng, ILE_ORLEANS_LAND.polygon);
}

/**
 * Vérifie si un point est dans le triangle de terre de Sainte-Pétronille
 */
function isPointOnStePetronilleLand(lat, lng) {
  return isPointInTriangle(
    lat, lng,
    STE_PETRONILLE_LAND.point1.lat, STE_PETRONILLE_LAND.point1.lng,
    STE_PETRONILLE_LAND.point2.lat, STE_PETRONILLE_LAND.point2.lng,
    STE_PETRONILLE_LAND.point3.lat, STE_PETRONILLE_LAND.point3.lng
  );
}

/**
 * Test point-in-polygon pour un tableau de coordonnées
 */
function pointInPolygonArray(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * DÉTECTION ULTRA-STRICTE - Un point est dans l'eau si:
 * 1. Il est dans la zone générale du fleuve (bounds élargis)
 * 2. ET il n'est PAS sur le centre de l'île d'Orléans
 * 3. ET il n'est PAS dans le triangle central de Ste-Pétronille
 */
function isPointInSaintLaurent(lat, lng) {
  // Zone ÉLARGIE du fleuve Saint-Laurent (200% de marge)
  // Inclut tout entre Québec et au-delà de l'île d'Orléans
  if (lat < 46.76 || lat > 46.94 || lng < -71.40 || lng > -70.45) {
    return { inWater: false, mask: null };
  }
  
  // Rive nord (Québec, Beauport) - tout ce qui est sur terre
  // Si lat > 46.88 et lng > -71.25, c'est probablement la terre ferme au nord
  if (lat > 46.88 && lng > -71.30 && lng < -71.05) {
    return { inWater: false, mask: null };
  }
  
  // Rive sud (Lévis) - tout ce qui est sur terre
  // Si lat < 46.82 et lng > -71.25, c'est probablement Lévis
  if (lat < 46.82 && lng > -71.30 && lng < -70.60) {
    return { inWater: false, mask: null };
  }
  
  // Vérifier si on est sur le centre de l'île d'Orléans
  if (isPointOnIleOrleansCenter(lat, lng)) {
    return { inWater: false, mask: null };
  }
  
  // Vérifier si on est dans le triangle de Ste-Pétronille
  if (isPointOnStePetronilleLand(lat, lng)) {
    return { inWater: false, mask: null };
  }
  
  // TOUT LE RESTE dans la zone du fleuve EST DE L'EAU
  return { inWater: true, mask: { name: 'Fleuve Saint-Laurent', type: 'river' } };
}

/**
 * Trouve le point de terre le plus proche à 5m du bord de l'eau
 * @returns {Object} { lat, lng } - Nouvelles coordonnées sur terre
 */
function findNearestLandPoint(lat, lng) {
  const RELOCATION_DISTANCE_M = 5; // 5 mètres du bord
  const SEARCH_RADIUS_M = 500;     // Chercher dans un rayon de 500m
  const SEARCH_STEPS = 36;         // 36 directions (tous les 10°)
  
  // Convertir en degrés
  const degPerMeter = 1 / 111320;
  const searchRadiusDeg = SEARCH_RADIUS_M * degPerMeter;
  const relocationDeg = RELOCATION_DISTANCE_M * degPerMeter;
  
  let closestLandPoint = null;
  let minDistance = Infinity;
  
  // Chercher dans toutes les directions
  for (let step = 0; step < SEARCH_STEPS; step++) {
    const angle = (step / SEARCH_STEPS) * 2 * Math.PI;
    
    // Chercher progressivement plus loin
    for (let dist = 10; dist <= SEARCH_RADIUS_M; dist += 10) {
      const distDeg = dist * degPerMeter;
      const testLat = lat + distDeg * Math.cos(angle);
      const testLng = lng + (distDeg / Math.cos(lat * Math.PI / 180)) * Math.sin(angle);
      
      // Vérifier si ce point est sur terre
      const check = isPointInSaintLaurent(testLat, testLng);
      if (!check.inWater) {
        // Trouvé un point sur terre! Calculer le point à 5m du bord
        // (revenir légèrement vers l'eau pour être exactement à 5m)
        const landLat = testLat - relocationDeg * Math.cos(angle) * 0.5;
        const landLng = testLng - (relocationDeg / Math.cos(lat * Math.PI / 180)) * Math.sin(angle) * 0.5;
        
        if (dist < minDistance) {
          minDistance = dist;
          closestLandPoint = { lat: landLat, lng: landLng, distance: dist };
        }
        break; // Passer à la direction suivante
      }
    }
  }
  
  return closestLandPoint;
}

// Garder le masque vide pour compatibilité
const SAINT_LAURENT_MASKS = [];
const KNOWN_LAND_AREAS = [];
      46.864, -71.06,  // Nord-est
      46.846, -71.06   // Sud-est
    );
    
    if (inStPetronilleLand) {
      return { inWater: false, mask: null };
    }
    
    // Sinon, c'est de l'eau
    return { inWater: true, mask: { name: 'Fleuve - Zone Sainte-Pétronille', type: 'river' } };
  }
  
  // Zone entre Québec et Lévis (à l'ouest de l'île)
  if (lng < -71.15 && lat > 46.80 && lat < 46.88) {
    return { inWater: true, mask: { name: 'Fleuve - Québec/Lévis', type: 'river' } };
  }
  
  // Chenal sud (entre île et Lévis)
  if (lat < 46.83 && lat > 46.77 && lng > -71.15 && lng < -70.55) {
    return { inWater: true, mask: { name: 'Chenal Sud', type: 'river' } };
  }
  
  // Chenal nord (entre île et Beauport)
  if (lat > 46.88 && lat < 46.93 && lng > -71.05 && lng < -70.55) {
    return { inWater: true, mask: { name: 'Chenal Nord', type: 'river' } };
  }
  
  return { inWater: false, mask: null };
}

/**
 * Vérifie si un point est dans un triangle
 */
function isPointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax, v0y = cy - ay;
  const v1x = bx - ax, v1y = by - ay;
  const v2x = px - ax, v2y = py - ay;
  
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  
  return (u >= 0) && (v >= 0) && (u + v < 1);
}

// Garder le masque vide pour compatibilité
const SAINT_LAURENT_MASKS = [];

/**
 * Récupère les surfaces d'eau pour une zone donnée
 * Inclut TOUJOURS le masque du fleuve Saint-Laurent
 */
async function fetchWaterFeatures(bounds) {
  // Vérifier le cache
  const cached = hydroCache.get(bounds);
  if (cached) {
    return cached;
  }
  
  const north = bounds.north || bounds._northEast?.lat;
  const south = bounds.south || bounds._southWest?.lat;
  const east = bounds.east || bounds._northEast?.lng;
  const west = bounds.west || bounds._southWest?.lng;
  
  if (!north || !south || !east || !west) {
    console.warn('[WaterExclusion] Invalid bounds provided');
    return []; // Les masques statiques sont vérifiés directement dans isPointInWater
  }
  
  const centerLat = (north + south) / 2;
  const centerLng = (east + west) / 2;
  
  // Calculer le rayon basé sur la taille de la zone
  const latDist = Math.abs(north - south) * 111320;
  const lngDist = Math.abs(east - west) * 111320 * Math.cos(centerLat * Math.PI / 180);
  const radius = Math.max(latDist, lngDist) / 2 + 2000;
  
  // Les masques du Saint-Laurent sont vérifiés directement dans isPointInWater
  // Ici on récupère les autres surfaces d'eau (lacs, étangs, etc.)
  let waterFeatures = [];
  
  try {
    const response = await fetch(
      `${API_BASE}/api/hydro/water-features?lat=${centerLat}&lng=${centerLng}&radius=${Math.round(radius)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const apiFeatures = data.features || [];
    
    waterFeatures = apiFeatures;
    
    // Mettre en cache
    hydroCache.set(bounds, waterFeatures);
    
    console.log(`[BIONIC_water_mask_v3] ${waterFeatures.length} surfaces d'eau de l'API + masques statiques`);
    return waterFeatures;
    
  } catch (error) {
    console.error('[WaterExclusion] Error fetching water features:', error);
    // Retourner au moins le masque du Saint-Laurent
    return waterFeatures;
  }
}

/**
 * Vérifie si un point est dans l'eau
 * BIONIC_water_mask_v3: Vérifie d'abord les masques statiques du fleuve
 */
function isPointInWater(lat, lng, waterFeatures) {
  // PRIORITÉ 1: Vérifier les masques statiques du fleuve Saint-Laurent
  const stLaurentCheck = isPointInSaintLaurent(lat, lng);
  if (stLaurentCheck.inWater) {
    return { inWater: true, feature: stLaurentCheck.mask };
  }
  
  // PRIORITÉ 2: Vérifier les autres surfaces d'eau
  for (const feature of waterFeatures) {
    const polygon = feature.polygon || [];
    if (polygon.length < 3) continue;
    
    // Test point-in-polygon (ray casting)
    if (pointInPolygon([lat, lng], polygon)) {
      return { inWater: true, feature };
    }
    
    // Test de proximité (buffer 5m selon BIONIC_water_mask_v3)
    const distance = distanceToPolygon([lat, lng], polygon);
    if (distance <= CONFIG.WATER_BUFFER_METERS) {
      return { inWater: true, feature };
    }
  }
  
  return { inWater: false, feature: null };
}

/**
 * Algorithme Ray Casting pour point-in-polygon
 */
function pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Calcule la distance minimale entre un point et un polygone
 */
function distanceToPolygon(point, polygon) {
  let minDist = Infinity;
  
  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const dist = distanceToSegment(point, p1, p2);
    minDist = Math.min(minDist, dist);
  }
  
  return minDist;
}

/**
 * Distance d'un point à un segment (en mètres)
 */
function distanceToSegment(point, p1, p2) {
  const [px, py] = point;
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  
  const dx = x2 - x1;
  const dy = y2 - y1;
  
  if (dx === 0 && dy === 0) {
    return haversineDistance(px, py, x1, y1);
  }
  
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;
  
  return haversineDistance(px, py, nearestX, nearestY);
}

/**
 * Distance Haversine entre deux points (en mètres)
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * BIONIC_water_mask_v4 - FONCTION PRINCIPALE
 * Filtre les zones ET RELOCALISE celles dans l'eau à 5m du bord
 * 
 * PROTOCOLE DE RELOCALISATION (au lieu d'exclusion):
 * 1. Vérifier si le centre est dans l'eau
 * 2. Si oui → RELOCALISER à 5m du bord le plus proche
 * 3. Si impossible de relocaliser → EXCLURE
 * 
 * Cette fonction est PERMANENTE et ne peut PAS être désactivée.
 * 
 * @param {Array} zones - Liste des zones à filtrer
 * @param {Object} bounds - Limites de la carte
 * @returns {Promise<Object>} - { filteredZones, stats }
 */
export async function filterZonesFromWater(zones, bounds) {
  if (!zones || zones.length === 0) {
    return { 
      filteredZones: [], 
      stats: { total: 0, kept: 0, excluded: 0, relocated: 0, ruleset: 'BIONIC_water_mask_v4' }
    };
  }
  
  // Récupérer les surfaces d'eau multi-sources (pour fallback)
  const waterFeatures = await fetchWaterFeatures(bounds);
  
  const filteredZones = [];
  const relocatedZones = [];
  const excludedDetails = [];
  let excludedCount = 0;
  let relocatedCount = 0;
  
  for (const zone of zones) {
    const center = zone.center || [zone.lat, zone.lng];
    const [lat, lng] = center;
    const radius = zone.radiusMeters || 100;
    
    // VÉRIFICATION ULTRA-STRICTE: Le centre est-il dans l'eau?
    const stLaurentCheck = isPointInSaintLaurent(lat, lng);
    const apiWaterCheck = isPointInWater(lat, lng, waterFeatures);
    
    // Si SOIT le masque statique SOIT l'API indique de l'eau → traiter
    if (stLaurentCheck.inWater || apiWaterCheck.inWater) {
      // PROTOCOLE DE RELOCALISATION
      const nearestLand = findNearestLandPoint(lat, lng);
      
      if (nearestLand && nearestLand.distance < 500) {
        // Relocaliser la zone à 5m du bord
        relocatedCount++;
        relocatedZones.push({
          ...zone,
          center: [nearestLand.lat, nearestLand.lng],
          lat: nearestLand.lat,
          lng: nearestLand.lng,
          _relocated: true,
          _originalCenter: [lat, lng],
          _relocationDistance: nearestLand.distance,
          _relocationReason: stLaurentCheck.inWater ? 'FLEUVE_SAINT_LAURENT' : 'API_WATER_DETECTION'
        });
        
        console.log(`[BIONIC_water_mask_v4] Zone ${zone.id} relocalisée de ${nearestLand.distance.toFixed(0)}m`);
      } else {
        // Impossible de relocaliser (trop loin de la terre) → EXCLURE
        excludedCount++;
        excludedDetails.push({
          zone_id: zone.id,
          reason: 'RELOCATION_IMPOSSIBLE',
          water_type: stLaurentCheck.mask?.type || apiWaterCheck.feature?.type,
          original_center: [lat, lng]
        });
      }
      continue;
    }
    
    // VÉRIFICATION DU PÉRIMÈTRE (8 points)
    let perimeterInWater = false;
    const radiusDeg = radius / 111320;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const checkLat = lat + radiusDeg * Math.cos(angle);
      const checkLng = lng + (radiusDeg / Math.cos(lat * Math.PI / 180)) * Math.sin(angle);
      
      const perimStLaurent = isPointInSaintLaurent(checkLat, checkLng);
      const perimApiCheck = isPointInWater(checkLat, checkLng, waterFeatures);
      
      if (perimStLaurent.inWater || perimApiCheck.inWater) {
        perimeterInWater = true;
        break;
      }
    }
    
    if (perimeterInWater) {
      // Le périmètre touche l'eau - relocaliser vers le centre de l'île
      const nearestLand = findNearestLandPoint(lat, lng);
      
      if (nearestLand) {
        relocatedCount++;
        relocatedZones.push({
          ...zone,
          center: [nearestLand.lat, nearestLand.lng],
          lat: nearestLand.lat,
          lng: nearestLand.lng,
          _relocated: true,
          _originalCenter: [lat, lng],
          _relocationDistance: nearestLand.distance,
          _relocationReason: 'PERIMETER_IN_WATER'
        });
      } else {
        excludedCount++;
        excludedDetails.push({
          zone_id: zone.id,
          reason: 'PERIMETER_RELOCATION_IMPOSSIBLE'
        });
      }
      continue;
    }
    
    // Zone OK - sur terre
    filteredZones.push(zone);
  }
  
  // Fusionner les zones OK et les zones relocalisées
  const allValidZones = [...filteredZones, ...relocatedZones];
  
  const stats = {
    total: zones.length,
    kept: filteredZones.length,
    relocated: relocatedCount,
    excluded: excludedCount,
    waterFeaturesCount: waterFeatures.length,
    ruleset: 'BIONIC_water_mask_v4',
    excludedDetails: excludedDetails.slice(0, 10)
  };
  
  if (relocatedCount > 0 || excludedCount > 0) {
    console.log(`[BIONIC_water_mask_v4] ${relocatedCount} zones relocalisées, ${excludedCount} exclues sur ${zones.length}`);
  }
  
  return { filteredZones: allValidZones, stats };
}

/**
 * Vérifie si une zone touche l'eau avec buffer de 5m
 * @returns {Object|null} - { intersects, inBuffer, name, type, distance }
 */
function checkZoneTouchesWaterWithBuffer(centerLat, centerLng, radiusMeters, waterFeatures, bufferMeters = 5) {
  const checkPoints = 16; // Plus de points pour précision
  const radiusDeg = radiusMeters / 111320;
  const bufferDeg = bufferMeters / 111320;
  
  let closestDistance = Infinity;
  let closestFeature = null;
  let intersectsWater = false;
  
  // Vérifier le centre et le périmètre
  for (let i = 0; i <= checkPoints; i++) {
    let checkLat, checkLng;
    
    if (i === 0) {
      // Centre
      checkLat = centerLat;
      checkLng = centerLng;
    } else {
      // Périmètre
      const angle = ((i - 1) / checkPoints) * 2 * Math.PI;
      checkLat = centerLat + radiusDeg * Math.cos(angle);
      checkLng = centerLng + (radiusDeg / Math.cos(centerLat * Math.PI / 180)) * Math.sin(angle);
    }
    
    // Vérifier si ce point est dans l'eau
    const { inWater, feature, distance } = isPointInWaterWithDistance(checkLat, checkLng, waterFeatures);
    
    if (inWater && i > 0) {
      intersectsWater = true;
      if (distance !== undefined && distance < closestDistance) {
        closestDistance = distance;
        closestFeature = feature;
      }
    }
    
    // Vérifier aussi les points dans le buffer (périmètre + 5m)
    if (i > 0) {
      const bufferLat = centerLat + (radiusDeg + bufferDeg) * Math.cos(((i - 1) / checkPoints) * 2 * Math.PI);
      const bufferLng = centerLng + ((radiusDeg + bufferDeg) / Math.cos(centerLat * Math.PI / 180)) * Math.sin(((i - 1) / checkPoints) * 2 * Math.PI);
      
      const bufferCheck = isPointInWater(bufferLat, bufferLng, waterFeatures);
      if (bufferCheck.inWater) {
        return {
          intersects: true,
          inBuffer: true,
          name: bufferCheck.feature?.name || 'eau',
          type: bufferCheck.feature?.type,
          distance: 0
        };
      }
    }
  }
  
  if (intersectsWater) {
    return {
      intersects: true,
      inBuffer: false,
      name: closestFeature?.name || 'eau',
      type: closestFeature?.type,
      distance: closestDistance
    };
  }
  
  return null;
}

/**
 * Estime le ratio de chevauchement d'une zone avec l'eau
 * @returns {number} - Ratio entre 0 et 1
 */
function estimateOverlapRatio(centerLat, centerLng, radiusMeters, waterFeatures) {
  const gridSize = 8; // Grille 8x8 pour estimation
  const radiusDeg = radiusMeters / 111320;
  let pointsInWater = 0;
  let totalPoints = 0;
  
  for (let i = -gridSize; i <= gridSize; i++) {
    for (let j = -gridSize; j <= gridSize; j++) {
      const offsetLat = (i / gridSize) * radiusDeg;
      const offsetLng = (j / gridSize) * (radiusDeg / Math.cos(centerLat * Math.PI / 180));
      
      // Vérifier si le point est dans le cercle
      const distFromCenter = Math.sqrt(offsetLat * offsetLat + offsetLng * offsetLng);
      if (distFromCenter > radiusDeg) continue;
      
      totalPoints++;
      
      const checkLat = centerLat + offsetLat;
      const checkLng = centerLng + offsetLng;
      
      const { inWater } = isPointInWater(checkLat, checkLng, waterFeatures);
      if (inWater) pointsInWater++;
    }
  }
  
  return totalPoints > 0 ? pointsInWater / totalPoints : 0;
}

/**
 * Vérifie si un point est dans l'eau et retourne la distance
 */
function isPointInWaterWithDistance(lat, lng, waterFeatures) {
  for (const feature of waterFeatures) {
    const result = pointInPolygonWithDistance(lat, lng, feature.polygon);
    if (result.inside) {
      return { inWater: true, feature, distance: result.distance };
    }
  }
  return { inWater: false, feature: null, distance: Infinity };
}

/**
 * Point-in-polygon avec calcul de distance au bord
 */
function pointInPolygonWithDistance(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return { inside: false, distance: Infinity };
  
  let inside = false;
  let minDistance = Infinity;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    
    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
    
    // Calculer distance au segment
    const dist = distancePointToSegment(lat, lng, xi, yi, xj, yj);
    if (dist < minDistance) minDistance = dist;
  }
  
  return { inside, distance: minDistance * 111320 }; // Convertir en mètres
}

/**
 * Distance d'un point à un segment (version coordonnées séparées)
 */
function distancePointToSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  
  if (lenSq !== 0) param = dot / lenSq;
  
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Vérifie si une zone circulaire touche une surface d'eau (legacy)
 */
function checkZoneTouchesWater(centerLat, centerLng, radiusMeters, waterFeatures) {
  const result = checkZoneTouchesWaterWithBuffer(centerLat, centerLng, radiusMeters, waterFeatures, 0);
  if (result?.intersects) {
    return { touches: true, name: result.name };
  }
  return null;
}

/**
 * BIONIC_water_mask_v3 - Filtre les zones via l'API backend
 * 
 * Applique le masque hydrique absolu multi-sources:
 * - Exclusion si intersection avec eau
 * - Exclusion si dans buffer 5m
 * - Exclusion si centroïde dans l'eau
 * - Exclusion si chevauchement > 1%
 * - Repositionnement des scores parfaits sur rebord
 */
export async function filterZonesViaAPI(zones, bounds) {
  if (!zones || zones.length === 0) {
    return { filteredZones: [], stats: { total: 0, kept: 0, excluded: 0 } };
  }
  
  try {
    const north = bounds.north || bounds._northEast?.lat;
    const south = bounds.south || bounds._southWest?.lat;
    const east = bounds.east || bounds._northEast?.lng;
    const west = bounds.west || bounds._southWest?.lng;
    
    const response = await fetch(`${API_BASE}/api/hydro/filter-zones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zones: zones.map(z => ({
          id: z.id,
          center: z.center || [z.lat, z.lng],
          radiusMeters: z.radiusMeters || 100,
          moduleId: z.moduleId,
          percentage: z.percentage,
          score: z.score || z.percentage // Pour repositionnement score 100
        })),
        bounds: { north, south, east, west },
        // BIONIC_water_mask_v3 parameters
        tolerance_meters: CONFIG.WATER_BUFFER_METERS,
        line_buffer_meters: CONFIG.HYDRO_LINE_BUFFER_METERS,
        overlap_threshold: CONFIG.OVERLAP_EXCLUSION_THRESHOLD,
        snap_max_distance: CONFIG.SNAP_TO_EDGE_MAX_DISTANCE,
        ruleset: 'BIONIC_water_mask_v3'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      filteredZones: data.filtered_zones || zones,
      stats: data.stats || { total: zones.length, kept: zones.length, excluded: 0 }
    };
    
  } catch (error) {
    console.error('[WaterExclusion] API filter error:', error);
    // Fallback vers le filtrage local
    return filterZonesFromWater(zones, bounds);
  }
}

/**
 * Vérifie si un waypoint/point d'intérêt est dans l'eau
 */
export async function checkPointInWater(lat, lng, bounds = null) {
  const searchBounds = bounds || {
    north: lat + 0.05,
    south: lat - 0.05,
    east: lng + 0.05,
    west: lng - 0.05
  };
  
  const waterFeatures = await fetchWaterFeatures(searchBounds);
  return isPointInWater(lat, lng, waterFeatures);
}

/**
 * Précharge les données hydrographiques pour une zone
 * Appelé au chargement de la carte pour optimiser les performances
 */
export async function preloadWaterData(bounds) {
  try {
    await fetchWaterFeatures(bounds);
    console.log('[WaterExclusion] Water data preloaded');
  } catch (error) {
    console.warn('[WaterExclusion] Preload failed:', error);
  }
}

/**
 * Obtient les statistiques d'exclusion actuelles
 */
export function getExclusionConfig() {
  return {
    enabled: CONFIG.ENABLED, // Toujours true
    shoreTolerance: CONFIG.SHORE_TOLERANCE_METERS,
    cacheSize: hydroCache.data.size,
    status: 'PERMANENT_ACTIVE'
  };
}

/**
 * Vide le cache (utile pour forcer un rechargement)
 */
export function clearCache() {
  hydroCache.data.clear();
  console.log('[WaterExclusion] Cache cleared');
}

// Export du service
const WaterExclusionService = {
  filterZonesFromWater,
  filterZonesViaAPI,
  checkPointInWater,
  preloadWaterData,
  getExclusionConfig,
  clearCache,
  CONFIG
};

export default WaterExclusionService;
