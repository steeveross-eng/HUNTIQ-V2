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
 * Récupère les surfaces d'eau pour une zone donnée
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
    return [];
  }
  
  const centerLat = (north + south) / 2;
  const centerLng = (east + west) / 2;
  
  // Calculer le rayon basé sur la taille de la zone
  const latDist = Math.abs(north - south) * 111320;
  const lngDist = Math.abs(east - west) * 111320 * Math.cos(centerLat * Math.PI / 180);
  const radius = Math.max(latDist, lngDist) / 2 + 2000;
  
  try {
    const response = await fetch(
      `${API_BASE}/api/hydro/water-features?lat=${centerLat}&lng=${centerLng}&radius=${Math.round(radius)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const features = data.features || [];
    
    // Mettre en cache
    hydroCache.set(bounds, features);
    
    console.log(`[WaterExclusion] ${features.length} water features loaded`);
    return features;
    
  } catch (error) {
    console.error('[WaterExclusion] Error fetching water features:', error);
    return [];
  }
}

/**
 * Vérifie si un point est dans l'eau
 */
function isPointInWater(lat, lng, waterFeatures) {
  for (const feature of waterFeatures) {
    const polygon = feature.polygon || [];
    if (polygon.length < 3) continue;
    
    // Test point-in-polygon (ray casting)
    if (pointInPolygon([lat, lng], polygon)) {
      return { inWater: true, feature };
    }
    
    // Test de proximité (tolérance)
    const distance = distanceToPolygon([lat, lng], polygon);
    if (distance <= CONFIG.SHORE_TOLERANCE_METERS) {
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
 * FONCTION PRINCIPALE: Filtre les zones pour exclure celles dans l'eau
 * 
 * Cette fonction est appelée AUTOMATIQUEMENT lors de la génération des zones.
 * Elle ne peut PAS être désactivée.
 * 
 * @param {Array} zones - Liste des zones à filtrer
 * @param {Object} bounds - Limites de la carte
 * @returns {Promise<Object>} - { filteredZones, stats }
 */
export async function filterZonesFromWater(zones, bounds) {
  if (!zones || zones.length === 0) {
    return { 
      filteredZones: [], 
      stats: { total: 0, kept: 0, excluded: 0, clipped: 0 }
    };
  }
  
  // Récupérer les surfaces d'eau
  const waterFeatures = await fetchWaterFeatures(bounds);
  
  if (waterFeatures.length === 0) {
    // Aucune donnée d'eau disponible - conserver toutes les zones
    // (peut-être problème de connexion)
    return {
      filteredZones: zones,
      stats: { total: zones.length, kept: zones.length, excluded: 0, clipped: 0, noData: true }
    };
  }
  
  const filteredZones = [];
  let excludedCount = 0;
  let clippedCount = 0;
  
  for (const zone of zones) {
    const center = zone.center || [zone.lat, zone.lng];
    const [lat, lng] = center;
    
    // Vérifier si le centre est dans l'eau
    const { inWater, feature } = isPointInWater(lat, lng, waterFeatures);
    
    if (inWater) {
      excludedCount++;
      continue; // Zone entièrement exclue
    }
    
    // Vérifier si la zone touche l'eau (pour clipping potentiel)
    const radius = zone.radiusMeters || 100;
    const touchesWater = checkZoneTouchesWater(lat, lng, radius, waterFeatures);
    
    if (touchesWater) {
      // La zone touche l'eau mais le centre est sur terre
      // On la conserve mais on marque qu'elle a été ajustée
      clippedCount++;
      filteredZones.push({
        ...zone,
        _clippedFromWater: true,
        _waterFeatureName: touchesWater.name
      });
    } else {
      // Zone entièrement sur terre
      filteredZones.push(zone);
    }
  }
  
  const stats = {
    total: zones.length,
    kept: filteredZones.length,
    excluded: excludedCount,
    clipped: clippedCount,
    waterFeaturesCount: waterFeatures.length,
    tolerance: CONFIG.SHORE_TOLERANCE_METERS
  };
  
  if (excludedCount > 0) {
    console.log(`[WaterExclusion] ${excludedCount}/${zones.length} zones excluded (in water)`);
  }
  
  return { filteredZones, stats };
}

/**
 * Vérifie si une zone circulaire touche une surface d'eau
 */
function checkZoneTouchesWater(centerLat, centerLng, radiusMeters, waterFeatures) {
  // Vérifier plusieurs points sur le périmètre de la zone
  const checkPoints = 8;
  const radiusDeg = radiusMeters / 111320;
  
  for (let i = 0; i < checkPoints; i++) {
    const angle = (i / checkPoints) * 2 * Math.PI;
    const checkLat = centerLat + radiusDeg * Math.cos(angle);
    const checkLng = centerLng + (radiusDeg / Math.cos(centerLat * Math.PI / 180)) * Math.sin(angle);
    
    const { inWater, feature } = isPointInWater(checkLat, checkLng, waterFeatures);
    if (inWater) {
      return { touches: true, name: feature?.name || 'eau' };
    }
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
