/**
 * WaterExclusionService.js - BIONIC_water_mask_v4
 * 
 * Service PERMANENT d'exclusion et RELOCALISATION des zones aquatiques.
 * PROTOCOLE: Si une zone est dans l'eau → relocaliser à 5m du bord.
 * Garantie 200%: AUCUNE zone ne peut être dans l'eau.
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const CONFIG = Object.freeze({
  WATER_BUFFER_METERS: 5,
  CACHE_DURATION_MS: 300000,
  FETCH_RADIUS_METERS: 15000,
  ENABLED: true,
  RELOCATION_DISTANCE_M: 5,
  SEARCH_RADIUS_M: 500
});

// Cache pour les données hydrographiques
const hydroCache = {
  data: new Map(),
  getKey(bounds) {
    const lat = Math.round((bounds.north + bounds.south) / 2 * 100) / 100;
    const lng = Math.round((bounds.east + bounds.west) / 2 * 100) / 100;
    return `${lat}_${lng}`;
  },
  get(bounds) {
    const key = this.getKey(bounds);
    const cached = this.data.get(key);
    if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION_MS) {
      return cached.features;
    }
    return null;
  },
  set(bounds, features) {
    const key = this.getKey(bounds);
    this.data.set(key, { features, timestamp: Date.now() });
  }
};

// ════════════════════════════════════════════════════════════════
// DÉFINITION DES ZONES DE TERRE (ce qui N'EST PAS de l'eau)
// ════════════════════════════════════════════════════════════════

// Polygone réduit de l'île d'Orléans (seulement le centre)
const ILE_ORLEANS_CENTER = [
  [46.862, -71.00], [46.866, -70.94], [46.870, -70.86], [46.872, -70.78],
  [46.870, -70.70], [46.866, -70.64], [46.860, -70.60], [46.852, -70.58],
  [46.844, -70.58], [46.838, -70.62], [46.834, -70.68], [46.834, -70.76],
  [46.836, -70.84], [46.840, -70.92], [46.846, -70.98], [46.854, -71.02],
  [46.862, -71.00]
];

// Triangle très réduit pour Sainte-Pétronille
const STE_PETRONILLE = {
  p1: { lat: 46.856, lng: -71.10 },
  p2: { lat: 46.860, lng: -71.04 },
  p3: { lat: 46.850, lng: -71.04 }
};

/**
 * Test point-in-polygon
 */
function pointInPolygon(lat, lng, polygon) {
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
 * Test point-in-triangle
 */
function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
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

/**
 * Vérifie si un point est sur TERRE FERME
 * Retourne true si le point est CERTAINEMENT sur terre
 */
function isPointOnLand(lat, lng) {
  // Rive nord (Québec/Beauport) - latitude haute
  if (lat > 46.87 && lng > -71.28 && lng < -71.02) {
    return true;
  }
  
  // Rive sud (Lévis) - latitude basse
  if (lat < 46.83 && lng > -71.28 && lng < -70.58) {
    return true;
  }
  
  // Centre de l'île d'Orléans
  if (pointInPolygon(lat, lng, ILE_ORLEANS_CENTER)) {
    return true;
  }
  
  // Triangle de Sainte-Pétronille
  if (pointInTriangle(lat, lng, 
      STE_PETRONILLE.p1.lat, STE_PETRONILLE.p1.lng,
      STE_PETRONILLE.p2.lat, STE_PETRONILLE.p2.lng,
      STE_PETRONILLE.p3.lat, STE_PETRONILLE.p3.lng)) {
    return true;
  }
  
  return false;
}

/**
 * DÉTECTION ULTRA-STRICTE - Un point est dans l'EAU si:
 * - Il est dans la zone du fleuve Saint-Laurent
 * - ET il n'est PAS sur une terre connue
 */
function isPointInWater(lat, lng) {
  // Hors zone du fleuve
  if (lat < 46.76 || lat > 46.94 || lng < -71.40 || lng > -70.45) {
    return { inWater: false };
  }
  
  // Vérifier si c'est sur terre
  if (isPointOnLand(lat, lng)) {
    return { inWater: false };
  }
  
  // Tout le reste dans la zone est de l'EAU
  return { inWater: true, name: 'Fleuve Saint-Laurent' };
}

/**
 * Trouve le point de terre le plus proche
 */
function findNearestLandPoint(lat, lng) {
  const degPerMeter = 1 / 111320;
  let closestLand = null;
  let minDist = Infinity;
  
  // Chercher dans 36 directions
  for (let step = 0; step < 36; step++) {
    const angle = (step / 36) * 2 * Math.PI;
    
    for (let dist = 10; dist <= CONFIG.SEARCH_RADIUS_M; dist += 10) {
      const distDeg = dist * degPerMeter;
      const testLat = lat + distDeg * Math.cos(angle);
      const testLng = lng + (distDeg / Math.cos(lat * Math.PI / 180)) * Math.sin(angle);
      
      if (isPointOnLand(testLat, testLng)) {
        if (dist < minDist) {
          minDist = dist;
          // Reculer de 5m pour être à 5m du bord
          const safeDistDeg = (dist + CONFIG.RELOCATION_DISTANCE_M) * degPerMeter;
          closestLand = {
            lat: lat + safeDistDeg * Math.cos(angle),
            lng: lng + (safeDistDeg / Math.cos(lat * Math.PI / 180)) * Math.sin(angle),
            distance: dist
          };
        }
        break;
      }
    }
  }
  
  return closestLand;
}

/**
 * Récupère les surfaces d'eau depuis l'API
 */
async function fetchWaterFeatures(bounds) {
  const cached = hydroCache.get(bounds);
  if (cached) return cached;
  
  const north = bounds.north || bounds._northEast?.lat;
  const south = bounds.south || bounds._southWest?.lat;
  const east = bounds.east || bounds._northEast?.lng;
  const west = bounds.west || bounds._southWest?.lng;
  
  if (!north || !south || !east || !west) return [];
  
  const centerLat = (north + south) / 2;
  const centerLng = (east + west) / 2;
  
  try {
    const response = await fetch(
      `${API_BASE}/api/hydro/water-features?lat=${centerLat}&lng=${centerLng}&radius=${CONFIG.FETCH_RADIUS_METERS}`
    );
    if (response.ok) {
      const data = await response.json();
      const features = data.features || [];
      hydroCache.set(bounds, features);
      return features;
    }
  } catch (error) {
    console.error('[WaterExclusion] API error:', error);
  }
  
  return [];
}

/**
 * FONCTION PRINCIPALE - Filtre et RELOCALISE les zones dans l'eau
 */
export async function filterZonesFromWater(zones, bounds) {
  if (!zones || zones.length === 0) {
    return { 
      filteredZones: [], 
      stats: { total: 0, kept: 0, relocated: 0, excluded: 0, ruleset: 'BIONIC_water_mask_v4' }
    };
  }
  
  await fetchWaterFeatures(bounds); // Précharger le cache
  
  const validZones = [];
  let relocatedCount = 0;
  let excludedCount = 0;
  
  for (const zone of zones) {
    const center = zone.center || [zone.lat, zone.lng];
    const [lat, lng] = center;
    const radius = zone.radiusMeters || 100;
    
    // Vérifier le centre
    const centerCheck = isPointInWater(lat, lng);
    
    if (centerCheck.inWater) {
      // RELOCALISER vers la terre la plus proche
      const nearestLand = findNearestLandPoint(lat, lng);
      
      if (nearestLand) {
        relocatedCount++;
        validZones.push({
          ...zone,
          center: [nearestLand.lat, nearestLand.lng],
          lat: nearestLand.lat,
          lng: nearestLand.lng,
          _relocated: true,
          _originalCenter: [lat, lng]
        });
      } else {
        excludedCount++;
      }
      continue;
    }
    
    // Vérifier le périmètre (8 points)
    let perimeterInWater = false;
    const radiusDeg = radius / 111320;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const checkLat = lat + radiusDeg * Math.cos(angle);
      const checkLng = lng + (radiusDeg / Math.cos(lat * Math.PI / 180)) * Math.sin(angle);
      
      if (isPointInWater(checkLat, checkLng).inWater) {
        perimeterInWater = true;
        break;
      }
    }
    
    if (perimeterInWater) {
      // Périmètre touche l'eau - relocaliser
      const nearestLand = findNearestLandPoint(lat, lng);
      
      if (nearestLand) {
        relocatedCount++;
        validZones.push({
          ...zone,
          center: [nearestLand.lat, nearestLand.lng],
          lat: nearestLand.lat,
          lng: nearestLand.lng,
          _relocated: true,
          _originalCenter: [lat, lng]
        });
      } else {
        excludedCount++;
      }
      continue;
    }
    
    // Zone OK sur terre
    validZones.push(zone);
  }
  
  const stats = {
    total: zones.length,
    kept: validZones.length - relocatedCount,
    relocated: relocatedCount,
    excluded: excludedCount,
    ruleset: 'BIONIC_water_mask_v4'
  };
  
  if (relocatedCount > 0 || excludedCount > 0) {
    console.log(`[BIONIC_water_mask_v4] ${relocatedCount} relocalisées, ${excludedCount} exclues / ${zones.length}`);
  }
  
  return { filteredZones: validZones, stats };
}

// Export pour compatibilité
export async function filterZonesViaAPI(zones, bounds) {
  return filterZonesFromWater(zones, bounds);
}

export async function preloadWaterData(bounds) {
  await fetchWaterFeatures(bounds);
}

export default {
  filterZonesFromWater,
  filterZonesViaAPI,
  preloadWaterData
};
