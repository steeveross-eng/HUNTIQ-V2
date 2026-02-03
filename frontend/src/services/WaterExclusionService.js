/**
 * WaterExclusionService.js - BIONIC Zone Relocation v6.0
 * 
 * Service UNIFIÉ de RELOCALISATION des zones d'attraction BIONIC™
 * 
 * RÈGLES ACTIVES:
 * 1. RELOCATE_FROM_WATER_5M: Zones sur eau → Relocaliser à 5m vers la terre
 * 2. RELOCATE_FROM_URBAN_200M: Zones urbaines → Relocaliser à 200m vers zone score max
 * 
 * Garantie: AUCUNE zone ne doit rester dans l'eau ou en zone urbaine dense
 */

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const CONFIG = Object.freeze({
  // Règle EAU
  WATER_BUFFER_METERS: 5,
  WATER_SEARCH_RADIUS_M: 1000,
  WATER_SEARCH_DIRECTIONS: 72,
  WATER_SEARCH_STEP_M: 5,
  WATER_RELOCATION_DISTANCE_M: 5,
  
  // Règle URBAIN
  URBAN_SEARCH_RADIUS_M: 200,
  URBAN_MIN_DISTANCE_M: 200,
  URBAN_SEARCH_DIRECTIONS: 36,
  
  // Cache
  CACHE_DURATION_MS: 300000,
  ZONE_CACHE_DURATION_MS: 60000,
  FETCH_RADIUS_METERS: 15000,
  
  // Général
  ENABLED: true
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

// Cache pour les résultats de filtrage (évite les recalculs)
const zoneFilterCache = {
  data: new Map(),
  maxSize: 10,
  getKey(zones, bounds) {
    if (!zones || !bounds) return null;
    const zoneHash = zones.length + '_' + (zones[0]?.center?.[0] || 0).toFixed(4);
    const boundsHash = (bounds.north || 0).toFixed(3) + '_' + (bounds.south || 0).toFixed(3);
    return `${zoneHash}_${boundsHash}`;
  },
  get(zones, bounds) {
    const key = this.getKey(zones, bounds);
    if (!key) return null;
    const cached = this.data.get(key);
    if (cached && Date.now() - cached.timestamp < CONFIG.ZONE_CACHE_DURATION_MS) {
      return cached.result;
    }
    return null;
  },
  set(zones, bounds, result) {
    const key = this.getKey(zones, bounds);
    if (!key) return;
    if (this.data.size >= this.maxSize) {
      const firstKey = this.data.keys().next().value;
      this.data.delete(firstKey);
    }
    this.data.set(key, { result, timestamp: Date.now() });
  }
};

// ════════════════════════════════════════════════════════════════
// DÉFINITION DES ZONES URBAINES DU QUÉBEC
// RÈGLE: RELOCATE_FROM_URBAN_200M
// ════════════════════════════════════════════════════════════════

// Zone urbaine de Québec (Vieux-Québec, Sainte-Foy, Beauport)
const QUEBEC_CITY_URBAN = [
  [46.8800, -71.3200], [46.8850, -71.2800], [46.8700, -71.2400],
  [46.8550, -71.2000], [46.8400, -71.1800], [46.8200, -71.1600],
  [46.8000, -71.1800], [46.7900, -71.2200], [46.7850, -71.2600],
  [46.7950, -71.3000], [46.8200, -71.3200], [46.8500, -71.3300],
  [46.8800, -71.3200]
];

// Zone urbaine de Lévis
const LEVIS_URBAN = [
  [46.8200, -71.2200], [46.8100, -71.1800], [46.7950, -71.1500],
  [46.7800, -71.1200], [46.7600, -71.1400], [46.7500, -71.1800],
  [46.7600, -71.2200], [46.7800, -71.2400], [46.8000, -71.2400],
  [46.8200, -71.2200]
];

// Zones urbaines combinées
const URBAN_ZONES = [
  { name: 'Québec', polygon: QUEBEC_CITY_URBAN },
  { name: 'Lévis', polygon: LEVIS_URBAN }
];

/**
 * Vérifie si un point est dans une zone urbaine
 */
function isPointInUrbanZone(lat, lng) {
  for (const zone of URBAN_ZONES) {
    if (pointInPolygon(lat, lng, zone.polygon)) {
      return { inUrban: true, zoneName: zone.name };
    }
  }
  return { inUrban: false };
}

/**
 * Trouve le point non-urbain avec le meilleur score dans un rayon de 200m
 */
function relocateFromUrban(lat, lng, score, allZones) {
  const degPerMeter = 1 / 111320;
  const cosLat = Math.cos(lat * Math.PI / 180);
  
  let bestCandidate = null;
  let bestScore = -Infinity;
  
  // Recherche dans 36 directions (tous les 10°)
  for (let step = 0; step < CONFIG.URBAN_SEARCH_DIRECTIONS; step++) {
    const angle = (step / CONFIG.URBAN_SEARCH_DIRECTIONS) * 2 * Math.PI;
    
    // Chercher à exactement 200m + un peu plus pour être sûr
    for (let dist = CONFIG.URBAN_MIN_DISTANCE_M; dist <= CONFIG.URBAN_SEARCH_RADIUS_M + 50; dist += 20) {
      const distDegLat = dist * degPerMeter;
      const distDegLng = dist * degPerMeter / cosLat;
      
      const testLat = lat + distDegLat * Math.cos(angle);
      const testLng = lng + distDegLng * Math.sin(angle);
      
      // Vérifier que le nouveau point n'est pas en zone urbaine
      if (isPointInUrbanZone(testLat, testLng).inUrban) continue;
      
      // Vérifier que le nouveau point n'est pas dans l'eau
      if (isPointInWater(testLat, testLng).inWater) continue;
      
      // Calculer le score potentiel (basé sur les zones environnantes)
      let candidateScore = score || 50;
      if (allZones && allZones.length > 0) {
        let totalWeight = 0;
        let weightedScore = 0;
        for (const zone of allZones) {
          if (zone._relocated) continue;
          const zCenter = zone.center || [zone.lat, zone.lng];
          const zDist = distanceInMeters(testLat, testLng, zCenter[0], zCenter[1]);
          if (zDist < 500 && zDist > 0) {
            const weight = 1 / (1 + zDist / 100);
            weightedScore += (zone.score || 50) * weight;
            totalWeight += weight;
          }
        }
        if (totalWeight > 0) {
          candidateScore = weightedScore / totalWeight;
        }
      }
      
      if (candidateScore > bestScore) {
        bestScore = candidateScore;
        bestCandidate = {
          lat: testLat,
          lng: testLng,
          distance: dist,
          direction: angle * 180 / Math.PI,
          score: candidateScore
        };
      }
    }
  }
  
  return bestCandidate;
}

// ════════════════════════════════════════════════════════════════
// DÉFINITION COMPLÈTE DE L'ÎLE D'ORLÉANS ET TERRES FERMES
// RÈGLE: RELOCATE_FROM_WATER_5M
// ════════════════════════════════════════════════════════════════

// Polygone complet de l'île d'Orléans (contour extérieur)
const ILE_ORLEANS_FULL = [
  // Pointe ouest (Sainte-Pétronille)
  [46.8510, -71.1290],
  [46.8550, -71.1200],
  [46.8600, -71.1050],
  [46.8640, -71.0850],
  // Côte nord-ouest
  [46.8680, -71.0600],
  [46.8720, -71.0300],
  [46.8750, -71.0000],
  [46.8770, -70.9700],
  [46.8780, -70.9400],
  [46.8790, -70.9100],
  // Centre nord
  [46.8800, -70.8800],
  [46.8790, -70.8500],
  [46.8780, -70.8200],
  [46.8760, -70.7900],
  [46.8740, -70.7600],
  // Côte nord-est
  [46.8710, -70.7300],
  [46.8680, -70.7000],
  [46.8640, -70.6700],
  [46.8590, -70.6400],
  // Pointe est (Saint-François)
  [46.8540, -70.6200],
  [46.8480, -70.6100],
  [46.8420, -70.6000],
  [46.8360, -70.5950],
  [46.8300, -70.5920],
  [46.8240, -70.5920],
  // Côte sud-est
  [46.8180, -70.5950],
  [46.8120, -70.6100],
  [46.8080, -70.6300],
  [46.8050, -70.6500],
  [46.8030, -70.6800],
  // Côte sud
  [46.8020, -70.7100],
  [46.8020, -70.7400],
  [46.8030, -70.7700],
  [46.8040, -70.8000],
  [46.8050, -70.8300],
  // Côte sud-ouest
  [46.8060, -70.8600],
  [46.8080, -70.8900],
  [46.8100, -70.9200],
  [46.8130, -70.9500],
  [46.8170, -70.9800],
  [46.8210, -71.0100],
  // Retour pointe ouest
  [46.8270, -71.0400],
  [46.8330, -71.0650],
  [46.8400, -71.0850],
  [46.8460, -71.1050],
  [46.8510, -71.1290]
];

// Zone tampon supplémentaire pour Sainte-Pétronille (pointe ouest de l'île)
const STE_PETRONILLE_EXTENDED = [
  [46.8450, -71.1350],
  [46.8550, -71.1350],
  [46.8620, -71.1100],
  [46.8600, -71.0900],
  [46.8480, -71.0900],
  [46.8400, -71.1100],
  [46.8450, -71.1350]
];

/**
 * Test point-in-polygon utilisant l'algorithme ray-casting
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
 * Calcule la distance approximative en mètres entre deux points
 */
function distanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Vérifie si un point est sur TERRE FERME
 * Utilise plusieurs zones de détection
 */
function isPointOnLand(lat, lng) {
  // 1. Zone hors du fleuve Saint-Laurent (latitude très haute ou très basse)
  if (lat > 46.92) return true;  // Nord de Québec
  if (lat < 46.78) return true;  // Sud du fleuve (Lévis et au-delà)
  
  // 2. Hors de la zone longitudinale du fleuve
  if (lng > -70.55 || lng < -71.35) return true;
  
  // 3. Rive nord (Québec/Beauport) - zone élargie
  if (lat > 46.86 && lng > -71.32 && lng < -70.98) {
    return true;
  }
  
  // 4. Rive nord côté est (Beauport vers Château-Richer)
  if (lat > 46.87 && lng >= -70.98 && lng < -70.75) {
    return true;
  }
  
  // 5. Rive sud (Lévis) - zone élargie
  if (lat < 46.84 && lng > -71.32 && lng < -70.55) {
    return true;
  }
  
  // 6. Île d'Orléans (polygone complet)
  if (pointInPolygon(lat, lng, ILE_ORLEANS_FULL)) {
    return true;
  }
  
  // 7. Extension Sainte-Pétronille
  if (pointInPolygon(lat, lng, STE_PETRONILLE_EXTENDED)) {
    return true;
  }
  
  return false;
}

/**
 * Vérifie si un point est dans l'EAU du fleuve Saint-Laurent
 */
function isPointInWater(lat, lng) {
  // Hors zone de détection du fleuve
  if (lat < 46.76 || lat > 46.94 || lng < -71.40 || lng > -70.50) {
    return { inWater: false };
  }
  
  // Si le point est sur terre, ce n'est pas de l'eau
  if (isPointOnLand(lat, lng)) {
    return { inWater: false };
  }
  
  // Tout le reste dans cette zone = EAU
  return { inWater: true, name: 'Fleuve Saint-Laurent' };
}

/**
 * Trouve le point de terre le plus proche et retourne une position
 * relocalisée à 5m à l'intérieur des terres
 */
function findNearestLandPoint(lat, lng) {
  const degPerMeter = 1 / 111320;
  const cosLat = Math.cos(lat * Math.PI / 180);
  
  let bestLand = null;
  let minDist = Infinity;
  
  // Recherche dans 72 directions (tous les 5 degrés)
  for (let step = 0; step < CONFIG.SEARCH_DIRECTIONS; step++) {
    const angle = (step / CONFIG.SEARCH_DIRECTIONS) * 2 * Math.PI;
    
    // Chercher la terre la plus proche dans cette direction
    for (let dist = CONFIG.SEARCH_STEP_M; dist <= CONFIG.SEARCH_RADIUS_M; dist += CONFIG.SEARCH_STEP_M) {
      const distDegLat = dist * degPerMeter;
      const distDegLng = dist * degPerMeter / cosLat;
      
      const testLat = lat + distDegLat * Math.cos(angle);
      const testLng = lng + distDegLng * Math.sin(angle);
      
      if (isPointOnLand(testLat, testLng)) {
        // Trouvé de la terre! Vérifier si c'est la plus proche
        if (dist < minDist) {
          minDist = dist;
          
          // Calculer le point relocalisé: 5m plus loin dans la même direction (à l'intérieur des terres)
          const safeDist = dist + CONFIG.RELOCATION_DISTANCE_M;
          const safeDistDegLat = safeDist * degPerMeter;
          const safeDistDegLng = safeDist * degPerMeter / cosLat;
          
          bestLand = {
            lat: lat + safeDistDegLat * Math.cos(angle),
            lng: lng + safeDistDegLng * Math.sin(angle),
            distance: dist,
            direction: angle * 180 / Math.PI
          };
        }
        break; // Passer à la direction suivante
      }
    }
  }
  
  return bestLand;
}

/**
 * Récupère les surfaces d'eau depuis l'API (cache si disponible)
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
    // Silencieux - on utilise les polygones statiques
  }
  
  return [];
}

/**
 * FONCTION PRINCIPALE - Filtre et RELOCALISE les zones dans l'eau
 * AUCUNE zone ne doit rester dans l'eau - elles sont toutes relocalisées vers la terre
 * OPTIMISÉ: Utilise le cache pour éviter les recalculs
 */
export async function filterZonesFromWater(zones, bounds) {
  if (!zones || zones.length === 0) {
    return { 
      filteredZones: [], 
      stats: { total: 0, kept: 0, relocated: 0, excluded: 0, ruleset: 'BIONIC_water_mask_v5' }
    };
  }
  
  // Vérifier le cache d'abord
  const cachedResult = zoneFilterCache.get(zones, bounds);
  if (cachedResult) {
    return cachedResult;
  }
  
  // Précharger le cache hydro (même si on utilise principalement les polygones statiques)
  await fetchWaterFeatures(bounds);
  
  const validZones = [];
  let relocatedCount = 0;
  let excludedCount = 0;
  let onLandCount = 0;
  
  for (const zone of zones) {
    const center = zone.center || [zone.lat, zone.lng];
    const [lat, lng] = center;
    const radius = zone.radiusMeters || 100;
    
    // Vérifier si le centre est dans l'eau
    const centerCheck = isPointInWater(lat, lng);
    
    if (centerCheck.inWater) {
      // Centre dans l'eau - DOIT être relocalisé
      const nearestLand = findNearestLandPoint(lat, lng);
      
      if (nearestLand) {
        // Relocalisation réussie
        relocatedCount++;
        validZones.push({
          ...zone,
          center: [nearestLand.lat, nearestLand.lng],
          lat: nearestLand.lat,
          lng: nearestLand.lng,
          _relocated: true,
          _originalCenter: [lat, lng],
          _relocationDistance: nearestLand.distance,
          _relocationDirection: nearestLand.direction
        });
      } else {
        // Impossible de relocaliser - exclure (cas rare)
        excludedCount++;
      }
      continue;
    }
    
    // Centre OK - vérifier aussi le périmètre (8 points)
    let perimeterInWater = false;
    const radiusDeg = radius / 111320;
    const cosLat = Math.cos(lat * Math.PI / 180);
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * 2 * Math.PI;
      const checkLat = lat + radiusDeg * Math.cos(angle);
      const checkLng = lng + (radiusDeg / cosLat) * Math.sin(angle);
      
      if (isPointInWater(checkLat, checkLng).inWater) {
        perimeterInWater = true;
        break;
      }
    }
    
    if (perimeterInWater) {
      // Le périmètre touche l'eau - relocaliser vers l'intérieur des terres
      const nearestLand = findNearestLandPoint(lat, lng);
      
      if (nearestLand) {
        relocatedCount++;
        validZones.push({
          ...zone,
          center: [nearestLand.lat, nearestLand.lng],
          lat: nearestLand.lat,
          lng: nearestLand.lng,
          _relocated: true,
          _originalCenter: [lat, lng],
          _relocationReason: 'perimeterInWater',
          _relocationDistance: nearestLand.distance
        });
      } else {
        excludedCount++;
      }
      continue;
    }
    
    // Zone entièrement sur terre - garder telle quelle
    onLandCount++;
    validZones.push(zone);
  }
  
  const stats = {
    total: zones.length,
    kept: onLandCount,
    relocated: relocatedCount,
    excluded: excludedCount,
    ruleset: 'BIONIC_water_mask_v5'
  };
  
  const result = { filteredZones: validZones, stats };
  
  // Mettre en cache le résultat
  zoneFilterCache.set(zones, bounds, result);
  
  if (relocatedCount > 0 || excludedCount > 0) {
    console.log(`[BIONIC_water_mask_v5] ✓ ${relocatedCount} relocalisées, ${excludedCount} exclues, ${onLandCount} sur terre / ${zones.length} total`);
  }
  
  return result;
}

/**
 * FONCTION PRINCIPALE V7 - Module BIONIC™ Complet (EAU + URBAIN 2000M + QA)
 * 
 * Applique les règles dans l'ordre:
 * 1. RELOCATE_FROM_WATER_5M - Relocalise les zones sur l'eau
 * 2. RELOCATE_FROM_URBAN_2000M - Relocalise hors buffer urbain 2000m vers score max
 * 3. QA_URBAN_REPORT - Validation stricte de toutes les zones
 * 
 * @param {Array} zones - Zones à traiter
 * @param {Object} bounds - Limites de la carte
 * @param {Object} options - Options (enableQA, etc.)
 * @returns {Object} { filteredZones, stats, qaReport }
 */
export async function filterAndRelocateZones(zones, bounds, options = {}) {
  const { enableQA = true } = options;
  
  if (!zones || zones.length === 0) {
    return { 
      filteredZones: [], 
      stats: { 
        total: 0, 
        kept: 0, 
        fromWater: 0, 
        fromUrban: 0, 
        excluded: 0, 
        ruleset: 'BIONIC_FULL_MODULE_v7',
        bufferUrban: 2000
      },
      qaReport: null
    };
  }
  
  // Vérifier le cache
  const cacheKey = `v7_${zones.length}_${bounds?.north?.toFixed(3) || 0}`;
  const cachedResult = zoneFilterCache.get(zones, bounds);
  if (cachedResult && cachedResult.stats?.ruleset === 'BIONIC_FULL_MODULE_v7') {
    return cachedResult;
  }
  
  // Import dynamique du module urbain
  const { processUrbanModule, isPointInWater } = await import('./UrbanExclusionService');
  
  // ============================================
  // ÉTAPE 1: Appliquer la règle EAU (WATER_5M)
  // ============================================
  const waterResult = await filterZonesFromWater(zones, bounds);
  const afterWater = waterResult.filteredZones;
  const fromWater = waterResult.stats.relocated || 0;
  const excludedWater = waterResult.stats.excluded || 0;
  
  console.log(`[BIONIC_v7] Étape 1/3 - EAU: ${fromWater} relocalisées, ${excludedWater} exclues`);
  
  // ============================================
  // ÉTAPE 2: Appliquer le MODULE URBAIN (2000M + SCORE MAX)
  // ============================================
  
  // Créer une fonction de vérification eau pour le module urbain
  const waterCheckFn = async (lat, lng) => {
    // Vérifier si le point est dans l'eau
    const inWater = await checkPointInWater(lat, lng);
    return { inWater };
  };
  
  const urbanResult = await processUrbanModule(afterWater, {
    waterCheckFn,
    enableQA
  });
  
  const afterUrban = urbanResult.processedZones;
  const fromUrban = urbanResult.stats.relocated || 0;
  const excludedUrban = urbanResult.stats.excluded || 0;
  const unchanged = urbanResult.stats.unchanged || 0;
  
  console.log(`[BIONIC_v7] Étape 2/3 - URBAIN: ${fromUrban} relocalisées, ${excludedUrban} exclues, ${unchanged} conformes`);
  
  // ============================================
  // ÉTAPE 3: Rapport QA
  // ============================================
  const qaReport = urbanResult.qaReport;
  
  if (enableQA && qaReport) {
    console.log(`[BIONIC_v7] Étape 3/3 - QA: ${qaReport.passedCount}/${qaReport.totalZones} zones validées`);
    
    if (qaReport.failedCount > 0) {
      console.warn(`[BIONIC_v7] ⚠️ ${qaReport.failedCount} zones ont échoué aux contrôles QA`);
    }
  }
  
  // ============================================
  // STATS FINALES
  // ============================================
  const stats = {
    total: zones.length,
    kept: afterUrban.length,
    fromWater,
    fromUrban,
    unchanged,
    excludedWater,
    excludedUrban,
    excluded: excludedWater + excludedUrban,
    ruleset: 'BIONIC_FULL_MODULE_v7',
    bufferUrban: 2000,
    bufferWater: 5,
    rules_applied: [
      'RELOCATE_FROM_WATER_5M',
      'RELOCATE_FROM_URBAN_2000M',
      'QA_URBAN_2000M'
    ],
    qaStatus: qaReport ? (qaReport.allPassed ? 'PASSED' : 'FAILED') : 'DISABLED',
    qaPassedCount: qaReport?.passedCount || 0,
    qaFailedCount: qaReport?.failedCount || 0
  };
  
  const result = { 
    filteredZones: afterUrban, 
    stats,
    qaReport
  };
  
  // Mettre en cache
  zoneFilterCache.set(zones, bounds, result);
  
  console.log(`[BIONIC_FULL_MODULE_v7] ✓ Traitement terminé: ${stats.kept}/${stats.total} zones conservées (Eau: ${fromWater}, Urbain: ${fromUrban} relocalisées)`);
  
  return result;
}

/**
 * Vérifie si un point est dans l'eau (pour le module urbain)
 */
async function checkPointInWater(lat, lng) {
  // Utiliser les polygones d'eau locaux si disponibles
  for (const polygon of Object.values(QUEBEC_WATER_POLYGONS || {})) {
    if (isPointInPolygon(lat, lng, polygon)) {
      return true;
    }
  }
  return false;
}

/**
 * Point dans polygone (helper)
 */
function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  const n = polygon.length;
  
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    
    if (((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

// Exports pour compatibilité
export async function filterZonesViaAPI(zones, bounds) {
  return filterAndRelocateZones(zones, bounds);
}

export async function preloadWaterData(bounds) {
  await fetchWaterFeatures(bounds);
}

export default {
  filterZonesFromWater,
  filterAndRelocateZones,
  filterZonesViaAPI,
  preloadWaterData,
  CONFIG
};
