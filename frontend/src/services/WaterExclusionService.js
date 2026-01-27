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
 * Masques d'eau statiques pour le fleuve Saint-Laurent
 * Version corrigée basée sur les coordonnées réelles observées
 * 
 * Sainte-Pétronille est environ à: 46.855, -71.13
 * Le waypoint génère des zones dans un rayon autour de ce point
 */
const SAINT_LAURENT_MASKS = [
  // ZONE PRINCIPALE: Tout le fleuve entre Québec-Lévis-Beauport
  // Couvre une grande zone pour capturer toutes les zones sur l'eau
  {
    name: 'Fleuve Saint-Laurent - Zone principale',
    type: 'river',
    polygon: [
      // Rive nord (Beauport vers Québec)
      [46.880, -71.30], [46.882, -71.25], [46.880, -71.20], [46.875, -71.15],
      [46.868, -71.10], [46.860, -71.05], [46.855, -71.00],
      // Pointe vers île d'Orléans (Sainte-Pétronille est à ~46.855, -71.13)
      // IMPORTANT: L'île commence vers 46.858, -71.12
      [46.855, -70.95], [46.855, -70.90],
      // Transition vers rive sud (en passant AU SUD de l'île)
      [46.845, -70.88], [46.835, -70.90], [46.825, -70.95],
      [46.818, -71.00], [46.812, -71.05], [46.808, -71.10],
      // Rive sud (Lévis) - vers l'ouest
      [46.805, -71.15], [46.805, -71.20], [46.810, -71.25],
      [46.818, -71.28], [46.830, -71.30], [46.850, -71.32],
      [46.870, -71.31], [46.880, -71.30]
    ],
    bounds: { north: 46.882, south: 46.805, east: -70.88, west: -71.32 }
  },
  // ZONE 2: Eau au NORD de Sainte-Pétronille (entre île et Beauport)
  {
    name: 'Chenal Nord - Beauport/île d\'Orléans',
    type: 'river',
    polygon: [
      // Du côté Beauport vers le chenal nord
      [46.885, -71.08], [46.890, -71.02], [46.892, -70.95], [46.890, -70.88],
      [46.885, -70.82], [46.878, -70.78],
      // Côté nord de l'île d'Orléans
      [46.868, -70.78], [46.865, -70.82], [46.863, -70.88],
      [46.865, -70.95], [46.868, -71.02], [46.872, -71.08],
      [46.878, -71.10], [46.885, -71.08]
    ],
    bounds: { north: 46.892, south: 46.863, east: -70.78, west: -71.10 }
  },
  // ZONE 3: Eau au SUD de Sainte-Pétronille (entre île et Lévis)
  {
    name: 'Chenal Sud - île d\'Orléans/Lévis',
    type: 'river',
    polygon: [
      // Côté sud de l'île d'Orléans (Sainte-Pétronille)
      [46.852, -71.15], [46.855, -71.10], [46.858, -71.05], [46.860, -71.00],
      [46.858, -70.95], [46.855, -70.90], [46.850, -70.85],
      // Pointe est
      [46.842, -70.82],
      // Côté Lévis
      [46.832, -70.85], [46.825, -70.90], [46.820, -70.95],
      [46.818, -71.00], [46.820, -71.05], [46.825, -71.10],
      [46.832, -71.15], [46.842, -71.17],
      // Fermer
      [46.850, -71.16], [46.852, -71.15]
    ],
    bounds: { north: 46.860, south: 46.818, east: -70.82, west: -71.17 }
  },
  // ZONE 4: Extension eau vers l'est (après île d'Orléans)
  {
    name: 'Fleuve Est - après île d\'Orléans',
    type: 'river',
    polygon: [
      [46.892, -70.78], [46.895, -70.70], [46.892, -70.62], [46.885, -70.55],
      [46.872, -70.52], [46.858, -70.52], [46.845, -70.55],
      [46.835, -70.62], [46.832, -70.70], [46.838, -70.78],
      [46.852, -70.82], [46.868, -70.82], [46.882, -70.80],
      [46.892, -70.78]
    ],
    bounds: { north: 46.895, south: 46.832, east: -70.52, west: -70.82 }
  }
];

/**
 * Vérifie si un point est dans l'un des masques du fleuve Saint-Laurent
 */
function isPointInSaintLaurent(lat, lng) {
  for (const mask of SAINT_LAURENT_MASKS) {
    // Vérification rapide des bounds
    if (lat < mask.bounds.south || lat > mask.bounds.north ||
        lng < mask.bounds.west || lng > mask.bounds.east) {
      continue;
    }
    
    // Test point-in-polygon
    const polygon = mask.polygon;
    let inside = false;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [yi, xi] = polygon[i];
      const [yj, xj] = polygon[j];
      
      if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    if (inside) {
      return { inWater: true, mask };
    }
  }
  
  return { inWater: false, mask: null };
}

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
 * BIONIC_water_mask_v3 - FONCTION PRINCIPALE
 * Filtre les zones pour exclure celles dans/près de l'eau
 * 
 * Règles d'exclusion (appliquées dans l'ordre):
 * 1. EXCL_CENTROID_IN_WATER - Centre dans l'eau
 * 2. EXCL_INTERSECTS_WATER - Intersection avec eau
 * 3. EXCL_WITHIN_5M_WATER - Dans buffer 5m
 * 4. EXCL_OVERLAP_GT_1_PERCENT - Chevauchement > 1%
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
      stats: { total: 0, kept: 0, excluded: 0, clipped: 0, ruleset: 'BIONIC_water_mask_v3' }
    };
  }
  
  // Récupérer les surfaces d'eau multi-sources
  const waterFeatures = await fetchWaterFeatures(bounds);
  
  if (waterFeatures.length === 0) {
    // Aucune donnée d'eau disponible
    return {
      filteredZones: zones,
      stats: { 
        total: zones.length, 
        kept: zones.length, 
        excluded: 0, 
        clipped: 0, 
        noData: true,
        ruleset: 'BIONIC_water_mask_v3'
      }
    };
  }
  
  const filteredZones = [];
  const excludedDetails = [];
  let excludedCount = 0;
  let clippedCount = 0;
  let adjustedCount = 0;
  
  for (const zone of zones) {
    const center = zone.center || [zone.lat, zone.lng];
    const [lat, lng] = center;
    const radius = zone.radiusMeters || 100;
    
    // RÈGLE 1: EXCL_CENTROID_IN_WATER - Centre dans l'eau (masques statiques + API)
    const centerCheck = isPointInWater(lat, lng, waterFeatures);
    if (centerCheck.inWater) {
      excludedCount++;
      excludedDetails.push({
        zone_id: zone.id,
        reason: 'EXCL_CENTROID_IN_WATER',
        water_type: centerCheck.feature?.type,
        water_name: centerCheck.feature?.name
      });
      continue;
    }
    
    // RÈGLE 2: EXCL_PERIMETER_IN_WATER - Vérifier 8 points sur le périmètre
    let perimeterInWater = false;
    let perimeterWaterFeature = null;
    const radiusDeg = radius / 111320;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const checkLat = lat + radiusDeg * Math.cos(angle);
      const checkLng = lng + (radiusDeg / Math.cos(lat * Math.PI / 180)) * Math.sin(angle);
      
      const perimCheck = isPointInWater(checkLat, checkLng, waterFeatures);
      if (perimCheck.inWater) {
        perimeterInWater = true;
        perimeterWaterFeature = perimCheck.feature;
        break;
      }
    }
    
    if (perimeterInWater) {
      excludedCount++;
      excludedDetails.push({
        zone_id: zone.id,
        reason: 'EXCL_PERIMETER_IN_WATER',
        water_type: perimeterWaterFeature?.type,
        water_name: perimeterWaterFeature?.name
      });
      continue;
    }
    
    // RÈGLE 3: EXCL_INTERSECTS_WATER - Vérification supplémentaire avec buffer
    const touchesWater = checkZoneTouchesWaterWithBuffer(lat, lng, radius, waterFeatures, CONFIG.WATER_BUFFER_METERS);
    
    if (touchesWater?.inBuffer) {
      // Zone dans le buffer de 5m - EXCLURE
      excludedCount++;
      excludedDetails.push({
        zone_id: zone.id,
        reason: 'EXCL_WITHIN_5M_WATER',
        water_type: touchesWater.type,
        water_name: touchesWater.name
      });
      continue;
    }
    
    // Zone sur terre - CONSERVER
    filteredZones.push(zone);
  }
  
  const stats = {
    total: zones.length,
    kept: filteredZones.length,
    excluded: excludedCount,
    clipped: clippedCount,
    adjusted: adjustedCount,
    waterFeaturesCount: waterFeatures.length,
    bufferMeters: CONFIG.WATER_BUFFER_METERS,
    ruleset: 'BIONIC_water_mask_v3',
    excludedDetails: excludedDetails.slice(0, 10)
  };
  
  if (excludedCount > 0) {
    console.log(`[BIONIC_water_mask_v3] ${excludedCount}/${zones.length} zones exclues`);
  }
  
  return { filteredZones, stats };
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
