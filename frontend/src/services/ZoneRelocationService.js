/**
 * ZoneRelocationService.js - BIONIC Zone Relocation Engine v1.0
 * 
 * Service unifié de relocalisation des zones d'attraction BIONIC™
 * 
 * RÈGLES DE RELOCALISATION:
 * 1. WATER_5M: Zones sur eau → Relocaliser à 5m vers la terre
 * 2. URBAN_200M: Zones en milieu urbain → Relocaliser à 200m vers zone score max
 * 
 * STRATÉGIES:
 * - nearest_land: Vers le point terrestre le plus proche
 * - highest_score: Vers la zone avec le score d'attractivité le plus élevé
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Configuration des règles de relocalisation
export const RELOCATION_RULES = {
  RELOCATE_FROM_WATER_5M: {
    id: 'RELOCATE_FROM_WATER_5M',
    description: 'Relocalisation automatique des zones situées sur eau vers la terre la plus proche',
    target_layer: 'Z',
    condition: {
      type: 'spatial',
      operator: 'intersects',
      with_layer: 'WATER_BODIES'
    },
    operation: {
      type: 'relocate_nearest',
      search_radius_meters: 1000,
      relocation_distance_meters: 5,
      avoid_layers: ['WATER_BODIES'],
      strategy: 'nearest_land'
    },
    output_layer: 'Z_RELOCATED_WATER',
    priority: 1
  },
  
  RELOCATE_FROM_URBAN_200M: {
    id: 'RELOCATE_FROM_URBAN_200M',
    description: 'Relocalisation automatique des zones en milieu urbain dense vers zone score max',
    target_layer: 'Z',
    condition: {
      type: 'spatial',
      operator: 'intersects',
      with_layer: 'URBAIN_FULL'
    },
    operation: {
      type: 'relocate_by_score',
      search_radius_meters: 200,
      avoid_layers: ['URBAIN_FULL'],
      score_attribute: 'score',
      strategy: 'highest_score',
      constraints: [
        { type: 'spatial', operator: 'disjoint', with_layer: 'URBAIN_FULL' },
        { type: 'distance', operator: 'greater_or_equal', value_meters: 200 }
      ]
    },
    output_layer: 'Z_RELOCATED_URBAN',
    priority: 2
  }
};

// ════════════════════════════════════════════════════════════════
// DÉFINITION DES ZONES URBAINES DU QUÉBEC
// Polygones simplifiés des principales zones urbaines
// ════════════════════════════════════════════════════════════════

// Zone urbaine de Québec (Vieux-Québec, Sainte-Foy, Beauport)
const QUEBEC_CITY_URBAN = [
  [46.8800, -71.3200],
  [46.8850, -71.2800],
  [46.8700, -71.2400],
  [46.8550, -71.2000],
  [46.8400, -71.1800],
  [46.8200, -71.1600],
  [46.8000, -71.1800],
  [46.7900, -71.2200],
  [46.7850, -71.2600],
  [46.7950, -71.3000],
  [46.8200, -71.3200],
  [46.8500, -71.3300],
  [46.8800, -71.3200]
];

// Zone urbaine de Lévis
const LEVIS_URBAN = [
  [46.8200, -71.2200],
  [46.8100, -71.1800],
  [46.7950, -71.1500],
  [46.7800, -71.1200],
  [46.7600, -71.1400],
  [46.7500, -71.1800],
  [46.7600, -71.2200],
  [46.7800, -71.2400],
  [46.8000, -71.2400],
  [46.8200, -71.2200]
];

// Zone urbaine de Montréal (centre-ville et environs immédiats)
const MONTREAL_URBAN = [
  [45.5600, -73.6500],
  [45.5700, -73.6000],
  [45.5600, -73.5500],
  [45.5400, -73.5200],
  [45.5100, -73.5000],
  [45.4800, -73.5200],
  [45.4600, -73.5500],
  [45.4500, -73.5800],
  [45.4600, -73.6200],
  [45.4900, -73.6500],
  [45.5200, -73.6600],
  [45.5600, -73.6500]
];

// Zones urbaines combinées
const URBAN_ZONES = [
  { name: 'Quebec City', polygon: QUEBEC_CITY_URBAN },
  { name: 'Lévis', polygon: LEVIS_URBAN },
  { name: 'Montréal', polygon: MONTREAL_URBAN }
];

// ════════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES GÉOSPATIALES
// ════════════════════════════════════════════════════════════════

/**
 * Test point-in-polygon (ray-casting algorithm)
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
 * Calcule la distance en mètres entre deux points
 */
function distanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Convertit des mètres en degrés (approximation)
 */
function metersToDegrees(meters, latitude) {
  const degPerMeterLat = 1 / 111320;
  const degPerMeterLng = 1 / (111320 * Math.cos(latitude * Math.PI / 180));
  return { lat: meters * degPerMeterLat, lng: meters * degPerMeterLng };
}

// ════════════════════════════════════════════════════════════════
// DÉTECTION DES ZONES
// ════════════════════════════════════════════════════════════════

/**
 * Vérifie si un point est dans une zone urbaine
 */
export function isPointInUrbanZone(lat, lng) {
  for (const zone of URBAN_ZONES) {
    if (pointInPolygon(lat, lng, zone.polygon)) {
      return { inUrban: true, zoneName: zone.name };
    }
  }
  return { inUrban: false };
}

/**
 * Trouve la distance minimale jusqu'au bord de la zone urbaine
 */
function distanceToUrbanBoundary(lat, lng) {
  let minDistance = Infinity;
  
  for (const zone of URBAN_ZONES) {
    const polygon = zone.polygon;
    for (let i = 0; i < polygon.length - 1; i++) {
      const [lat1, lng1] = polygon[i];
      const [lat2, lng2] = polygon[i + 1];
      
      // Distance au segment
      const dist = distanceToSegment(lat, lng, lat1, lng1, lat2, lng2);
      if (dist < minDistance) {
        minDistance = dist;
      }
    }
  }
  
  return minDistance;
}

/**
 * Calcule la distance d'un point à un segment de ligne
 */
function distanceToSegment(px, py, x1, y1, x2, y2) {
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

  return distanceInMeters(px, py, xx, yy);
}

// ════════════════════════════════════════════════════════════════
// STRATÉGIES DE RELOCALISATION
// ════════════════════════════════════════════════════════════════

/**
 * Stratégie: Relocalisation vers le point non-urbain avec le score le plus élevé
 * dans un rayon de 200m
 */
function relocateByHighestScore(lat, lng, score, allZones, searchRadius = 200) {
  const degConv = metersToDegrees(searchRadius, lat);
  const numDirections = 36; // Tous les 10 degrés
  const numSteps = 10;
  const stepSize = searchRadius / numSteps;
  
  let bestCandidate = null;
  let bestScore = -Infinity;
  
  // Recherche dans toutes les directions
  for (let d = 0; d < numDirections; d++) {
    const angle = (d / numDirections) * 2 * Math.PI;
    
    for (let s = 1; s <= numSteps; s++) {
      const distance = s * stepSize;
      const degDist = metersToDegrees(distance, lat);
      
      const testLat = lat + degDist.lat * Math.cos(angle);
      const testLng = lng + degDist.lng * Math.sin(angle);
      
      // Vérifier que le point n'est pas en zone urbaine
      const urbanCheck = isPointInUrbanZone(testLat, testLng);
      if (urbanCheck.inUrban) continue;
      
      // Vérifier la distance minimale de 200m du bord urbain
      const distToBoundary = distanceToUrbanBoundary(testLat, testLng);
      if (distToBoundary < 200) continue;
      
      // Calculer le score potentiel à cette position
      // (basé sur la distance aux autres zones de score élevé)
      const candidateScore = calculatePositionScore(testLat, testLng, allZones);
      
      if (candidateScore > bestScore) {
        bestScore = candidateScore;
        bestCandidate = {
          lat: testLat,
          lng: testLng,
          distance: distance,
          direction: angle * 180 / Math.PI,
          score: candidateScore
        };
      }
    }
  }
  
  return bestCandidate;
}

/**
 * Calcule un score pour une position basé sur les zones environnantes
 */
function calculatePositionScore(lat, lng, allZones) {
  if (!allZones || allZones.length === 0) return 50; // Score par défaut
  
  let totalScore = 0;
  let weightSum = 0;
  
  for (const zone of allZones) {
    if (!zone.center || zone._relocated) continue;
    
    const [zoneLat, zoneLng] = zone.center;
    const dist = distanceInMeters(lat, lng, zoneLat, zoneLng);
    
    // Pondération inverse de la distance (zones proches comptent plus)
    if (dist < 500) {
      const weight = 1 / (1 + dist / 100);
      totalScore += (zone.score || 50) * weight;
      weightSum += weight;
    }
  }
  
  return weightSum > 0 ? totalScore / weightSum : 50;
}

// ════════════════════════════════════════════════════════════════
// FONCTION PRINCIPALE DE RELOCALISATION
// ════════════════════════════════════════════════════════════════

/**
 * Applique toutes les règles de relocalisation aux zones
 * Ordre: Eau d'abord, puis Urbain
 */
export async function applyRelocationRules(zones, bounds) {
  if (!zones || zones.length === 0) {
    return {
      relocatedZones: [],
      stats: {
        total: 0,
        fromWater: 0,
        fromUrban: 0,
        unchanged: 0,
        excluded: 0
      }
    };
  }
  
  const results = [];
  let fromWater = 0;
  let fromUrban = 0;
  let unchanged = 0;
  let excluded = 0;
  
  // Importer le service d'exclusion d'eau existant
  let waterService = null;
  try {
    waterService = await import('./WaterExclusionService.js');
  } catch (e) {
    console.warn('[ZoneRelocation] Water service not available');
  }
  
  for (const zone of zones) {
    const center = zone.center || [zone.lat, zone.lng];
    const [lat, lng] = center;
    let relocatedZone = { ...zone };
    let wasRelocated = false;
    
    // RÈGLE 1: Vérification eau (priorité 1)
    if (waterService) {
      const waterResult = await waterService.filterZonesFromWater([zone], bounds);
      if (waterResult.stats.relocated > 0 && waterResult.filteredZones[0]?._relocated) {
        relocatedZone = waterResult.filteredZones[0];
        fromWater++;
        wasRelocated = true;
      }
    }
    
    // RÈGLE 2: Vérification urbaine (priorité 2) - seulement si pas déjà relocalisé
    if (!wasRelocated) {
      const urbanCheck = isPointInUrbanZone(lat, lng);
      
      if (urbanCheck.inUrban) {
        // Appliquer la stratégie highest_score
        const newPosition = relocateByHighestScore(lat, lng, zone.score || 50, zones, 200);
        
        if (newPosition) {
          relocatedZone = {
            ...zone,
            center: [newPosition.lat, newPosition.lng],
            lat: newPosition.lat,
            lng: newPosition.lng,
            _relocated: true,
            _relocationRule: 'RELOCATE_FROM_URBAN_200M',
            _originalCenter: [lat, lng],
            _relocationDistance: newPosition.distance,
            _relocationDirection: newPosition.direction,
            _urbanZone: urbanCheck.zoneName,
            _newScore: newPosition.score
          };
          fromUrban++;
          wasRelocated = true;
        } else {
          // Impossible de relocaliser - exclure
          excluded++;
          continue;
        }
      }
    }
    
    if (!wasRelocated) {
      unchanged++;
    }
    
    results.push(relocatedZone);
  }
  
  const stats = {
    total: zones.length,
    kept: results.length,
    fromWater,
    fromUrban,
    unchanged,
    excluded,
    rules_applied: ['RELOCATE_FROM_WATER_5M', 'RELOCATE_FROM_URBAN_200M']
  };
  
  if (fromWater > 0 || fromUrban > 0) {
    console.log(`[BIONIC_ZoneRelocation] ✓ Eau: ${fromWater}, Urbain: ${fromUrban}, Inchangées: ${unchanged}, Exclues: ${excluded} / ${zones.length} total`);
  }
  
  return { relocatedZones: results, stats };
}

/**
 * Vérifie si une zone nécessite une relocalisation
 */
export function checkZoneRelocation(lat, lng) {
  const urbanCheck = isPointInUrbanZone(lat, lng);
  
  return {
    needsRelocation: urbanCheck.inUrban,
    reason: urbanCheck.inUrban ? `Zone urbaine: ${urbanCheck.zoneName}` : null,
    rule: urbanCheck.inUrban ? 'RELOCATE_FROM_URBAN_200M' : null
  };
}

/**
 * Retourne la configuration des règles actives
 */
export function getActiveRules() {
  return Object.values(RELOCATION_RULES);
}

export default {
  applyRelocationRules,
  isPointInUrbanZone,
  checkZoneRelocation,
  getActiveRules,
  RELOCATION_RULES
};
