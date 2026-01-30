/**
 * UrbanExclusionService.js
 * 
 * BIONIC_URBAN_MODULE - Module urbain autonome BIONIC™
 * 
 * Fonctionnalités:
 * - Exclusion stricte des zones urbaines
 * - Buffer 2000m autour des zones urbaines
 * - Relocalisation intelligente vers score maximal (rayon 5000m)
 * - QA urbain complet avec rapport détaillé
 * - Compatible avec les couches hydriques (WATER_FULL, WATER_BUF_5M)
 * 
 * @version 2.0.0
 * @ruleset BIONIC_URBAN_MODULE
 */

// ============================================
// CONFIGURATION DU MODULE URBAIN
// ============================================
export const URBAN_CONFIG = {
  // Distance de buffer autour des zones urbaines (mètres)
  BUFFER_DISTANCE_M: 2000,
  
  // Rayon de recherche pour la relocalisation (mètres)
  RELOCATION_SEARCH_RADIUS_M: 5000,
  
  // Distance minimale de la zone urbaine après relocalisation
  MIN_DISTANCE_FROM_URBAN_M: 2000,
  
  // Stratégie de relocalisation
  RELOCATION_STRATEGY: 'highest_score',
  
  // Nombre de points candidats à évaluer
  CANDIDATE_POINTS_COUNT: 36, // Un point tous les 10°
  
  // Nombre de rayons à tester
  DISTANCE_STEPS: 10,
  
  // Activer le debug
  DEBUG: false,
  
  // Module activé/désactivé
  ENABLED: true
};

/**
 * Met à jour la configuration du module urbain depuis une source externe
 * @param {Object} newConfig - Configuration partielle à appliquer
 */
export const updateUrbanConfig = (newConfig) => {
  if (newConfig.bufferDistance !== undefined) {
    URBAN_CONFIG.BUFFER_DISTANCE_M = newConfig.bufferDistance;
  }
  if (newConfig.searchRadius !== undefined) {
    URBAN_CONFIG.RELOCATION_SEARCH_RADIUS_M = newConfig.searchRadius;
  }
  if (newConfig.minDistance !== undefined) {
    URBAN_CONFIG.MIN_DISTANCE_FROM_URBAN_M = newConfig.minDistance;
  }
  if (newConfig.candidatePoints !== undefined) {
    URBAN_CONFIG.CANDIDATE_POINTS_COUNT = newConfig.candidatePoints;
  }
  if (newConfig.debugMode !== undefined) {
    URBAN_CONFIG.DEBUG = newConfig.debugMode;
  }
  if (newConfig.enabled !== undefined) {
    URBAN_CONFIG.ENABLED = newConfig.enabled;
  }
  
  if (URBAN_CONFIG.DEBUG) {
    console.log('[URBAN_CONFIG] Updated:', URBAN_CONFIG);
  }
  
  return URBAN_CONFIG;
};

/**
 * Charge la configuration depuis le localStorage
 */
export const loadUrbanConfigFromStorage = () => {
  try {
    const stored = localStorage.getItem('bionic_urban_config');
    if (stored) {
      const parsed = JSON.parse(stored);
      updateUrbanConfig(parsed);
      return parsed;
    }
  } catch (e) {
    console.warn('[URBAN_CONFIG] Failed to load from storage:', e);
  }
  return null;
};

// ============================================
// 1. PREPROCESS - DÉFINITION DES ZONES URBAINES
// ============================================

/**
 * U_VILLES - Grandes villes du Québec
 * Polygones simplifiés des centres urbains majeurs
 */
const U_VILLES = {
  quebec_centre: [
    [46.8139, -71.2080], [46.8139, -71.2280], [46.8200, -71.2400],
    [46.8300, -71.2450], [46.8400, -71.2400], [46.8450, -71.2280],
    [46.8450, -71.2080], [46.8400, -71.1950], [46.8300, -71.1900],
    [46.8200, -71.1950], [46.8139, -71.2080]
  ],
  montreal_centre: [
    [45.5017, -73.5673], [45.5017, -73.5873], [45.5100, -73.5950],
    [45.5200, -73.5950], [45.5300, -73.5873], [45.5300, -73.5573],
    [45.5200, -73.5500], [45.5100, -73.5500], [45.5017, -73.5573],
    [45.5017, -73.5673]
  ],
  levis_centre: [
    [46.8000, -71.1800], [46.8000, -71.2000], [46.8100, -71.2100],
    [46.8200, -71.2100], [46.8250, -71.2000], [46.8250, -71.1800],
    [46.8200, -71.1700], [46.8100, -71.1700], [46.8000, -71.1800]
  ],
  trois_rivieres: [
    [46.3432, -72.5419], [46.3432, -72.5619], [46.3532, -72.5719],
    [46.3632, -72.5719], [46.3732, -72.5619], [46.3732, -72.5419],
    [46.3632, -72.5319], [46.3532, -72.5319], [46.3432, -72.5419]
  ],
  sherbrooke: [
    [45.4042, -71.8929], [45.4042, -71.9129], [45.4142, -71.9229],
    [45.4242, -71.9229], [45.4342, -71.9129], [45.4342, -71.8929],
    [45.4242, -71.8829], [45.4142, -71.8829], [45.4042, -71.8929]
  ],
  gatineau: [
    [45.4765, -75.7013], [45.4765, -75.7213], [45.4865, -75.7313],
    [45.4965, -75.7313], [45.5065, -75.7213], [45.5065, -75.7013],
    [45.4965, -75.6913], [45.4865, -75.6913], [45.4765, -75.7013]
  ],
  saguenay: [
    [48.4279, -71.0690], [48.4279, -71.0890], [48.4379, -71.0990],
    [48.4479, -71.0990], [48.4579, -71.0890], [48.4579, -71.0690],
    [48.4479, -71.0590], [48.4379, -71.0590], [48.4279, -71.0690]
  ]
};

/**
 * U_VILLAGES - Villages et petites municipalités
 */
const U_VILLAGES = {
  sainte_foy: [
    [46.7800, -71.2800], [46.7800, -71.3000], [46.7900, -71.3100],
    [46.8000, -71.3100], [46.8050, -71.3000], [46.8050, -71.2800],
    [46.8000, -71.2700], [46.7900, -71.2700], [46.7800, -71.2800]
  ],
  beauport: [
    [46.8600, -71.1800], [46.8600, -71.2100], [46.8750, -71.2200],
    [46.8900, -71.2100], [46.8900, -71.1800], [46.8750, -71.1700],
    [46.8600, -71.1800]
  ],
  charlesbourg: [
    [46.8700, -71.2500], [46.8700, -71.2800], [46.8850, -71.2900],
    [46.9000, -71.2800], [46.9000, -71.2500], [46.8850, -71.2400],
    [46.8700, -71.2500]
  ],
  cap_rouge: [
    [46.7600, -71.3500], [46.7600, -71.3700], [46.7700, -71.3800],
    [46.7800, -71.3800], [46.7850, -71.3700], [46.7850, -71.3500],
    [46.7800, -71.3400], [46.7700, -71.3400], [46.7600, -71.3500]
  ]
};

/**
 * U_RESIDENTIEL - Zones résidentielles denses
 */
const U_RESIDENTIEL = {
  quebec_limoilou: [
    [46.8350, -71.2200], [46.8350, -71.2400], [46.8450, -71.2450],
    [46.8550, -71.2400], [46.8550, -71.2200], [46.8450, -71.2150],
    [46.8350, -71.2200]
  ],
  quebec_montcalm: [
    [46.8100, -71.2200], [46.8100, -71.2350], [46.8180, -71.2400],
    [46.8260, -71.2350], [46.8260, -71.2200], [46.8180, -71.2150],
    [46.8100, -71.2200]
  ]
};

/**
 * U_COMMERCIAL - Zones commerciales
 */
const U_COMMERCIAL = {
  galeries_capitale: [
    [46.8450, -71.2550], [46.8450, -71.2650], [46.8500, -71.2700],
    [46.8550, -71.2650], [46.8550, -71.2550], [46.8500, -71.2500],
    [46.8450, -71.2550]
  ],
  place_laurier: [
    [46.7850, -71.2750], [46.7850, -71.2850], [46.7900, -71.2900],
    [46.7950, -71.2850], [46.7950, -71.2750], [46.7900, -71.2700],
    [46.7850, -71.2750]
  ]
};

/**
 * U_INDUSTRIEL - Zones industrielles
 */
const U_INDUSTRIEL = {
  parc_industriel_quebec: [
    [46.8200, -71.3000], [46.8200, -71.3200], [46.8350, -71.3300],
    [46.8500, -71.3200], [46.8500, -71.3000], [46.8350, -71.2900],
    [46.8200, -71.3000]
  ],
  port_quebec: [
    [46.8250, -71.1950], [46.8250, -71.2050], [46.8350, -71.2100],
    [46.8450, -71.2050], [46.8450, -71.1950], [46.8350, -71.1900],
    [46.8250, -71.1950]
  ]
};

/**
 * U_DENSE - Zones à haute densité de population
 */
const U_DENSE = {
  vieux_quebec: [
    [46.8120, -71.2050], [46.8120, -71.2150], [46.8170, -71.2200],
    [46.8220, -71.2150], [46.8220, -71.2050], [46.8170, -71.2000],
    [46.8120, -71.2050]
  ],
  place_royale: [
    [46.8130, -71.2020], [46.8130, -71.2070], [46.8160, -71.2090],
    [46.8190, -71.2070], [46.8190, -71.2020], [46.8160, -71.2000],
    [46.8130, -71.2020]
  ]
};

/**
 * U_MUNICIPAL - Zones municipales administratives
 */
const U_MUNICIPAL = {
  hotel_ville_quebec: [
    [46.8140, -71.2070], [46.8140, -71.2110], [46.8165, -71.2130],
    [46.8190, -71.2110], [46.8190, -71.2070], [46.8165, -71.2050],
    [46.8140, -71.2070]
  ]
};

// ============================================
// URBAIN_FULL - Union de toutes les couches urbaines
// ============================================
export const URBAIN_FULL = {
  ...U_VILLES,
  ...U_VILLAGES,
  ...U_RESIDENTIEL,
  ...U_COMMERCIAL,
  ...U_INDUSTRIEL,
  ...U_DENSE,
  ...U_MUNICIPAL
};

// Liste des polygones pour itération rapide
const URBAIN_POLYGONS = Object.values(URBAIN_FULL);

// ============================================
// 2. FONCTIONS GÉOMÉTRIQUES DE BASE
// ============================================

/**
 * Convertit des degrés en radians
 */
const toRadians = (degrees) => degrees * Math.PI / 180;

/**
 * Convertit des radians en degrés
 */
const toDegrees = (radians) => radians * 180 / Math.PI;

/**
 * Calcule la distance en mètres entre deux points (Haversine)
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calcule un point à une distance et direction données
 */
const calculateDestination = (lat, lng, distanceM, bearingDeg) => {
  const R = 6371000;
  const d = distanceM / R;
  const brng = toRadians(bearingDeg);
  const lat1 = toRadians(lat);
  const lng1 = toRadians(lng);
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  
  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: toDegrees(lat2),
    lng: toDegrees(lng2)
  };
};

/**
 * Vérifie si un point est dans un polygone (Ray Casting)
 */
const isPointInPolygon = (lat, lng, polygon) => {
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
};

/**
 * Calcule la distance minimale d'un point à un polygone
 */
const distanceToPolygon = (lat, lng, polygon) => {
  let minDist = Infinity;
  
  for (let i = 0; i < polygon.length; i++) {
    const [lat1, lng1] = polygon[i];
    const [lat2, lng2] = polygon[(i + 1) % polygon.length];
    
    // Distance au segment
    const dist = distanceToSegment(lat, lng, lat1, lng1, lat2, lng2);
    minDist = Math.min(minDist, dist);
  }
  
  return minDist;
};

/**
 * Distance d'un point à un segment de ligne
 */
const distanceToSegment = (px, py, x1, y1, x2, y2) => {
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
  
  return calculateDistance(px, py, xx, yy);
};

// ============================================
// 3. LOGIQUE D'EXCLUSION URBAINE
// ============================================

/**
 * Vérifie si un point est dans une zone urbaine (URBAIN_FULL)
 * @returns {Object} { inUrban: boolean, zoneName: string|null, distance: number }
 */
export const isPointInUrbanZone = (lat, lng) => {
  for (const [zoneName, polygon] of Object.entries(URBAIN_FULL)) {
    if (isPointInPolygon(lat, lng, polygon)) {
      return {
        inUrban: true,
        zoneName,
        distance: 0
      };
    }
  }
  return { inUrban: false, zoneName: null, distance: null };
};

/**
 * Vérifie si un point est dans le buffer urbain (2000m)
 * @returns {Object} { inBuffer: boolean, distance: number, nearestZone: string }
 */
export const isPointInUrbanBuffer = (lat, lng) => {
  let minDistance = Infinity;
  let nearestZone = null;
  
  for (const [zoneName, polygon] of Object.entries(URBAIN_FULL)) {
    // D'abord vérifier si dans le polygone
    if (isPointInPolygon(lat, lng, polygon)) {
      return {
        inBuffer: true,
        inUrban: true,
        distance: 0,
        nearestZone: zoneName
      };
    }
    
    // Sinon calculer la distance au polygone
    const dist = distanceToPolygon(lat, lng, polygon);
    if (dist < minDistance) {
      minDistance = dist;
      nearestZone = zoneName;
    }
  }
  
  return {
    inBuffer: minDistance <= URBAN_CONFIG.BUFFER_DISTANCE_M,
    inUrban: false,
    distance: minDistance,
    nearestZone
  };
};

/**
 * EXCL_INTERSECTS_URBAIN - Zone intersecte URBAIN_FULL
 */
export const checkIntersectsUrban = (zone) => {
  const center = zone.center || [zone.lat, zone.lng];
  const radius = zone.radius || 50; // mètres
  
  // Vérifier le centre
  const centerCheck = isPointInUrbanZone(center[0], center[1]);
  if (centerCheck.inUrban) {
    return { flagged: true, reason: 'EXCL_INTERSECTS_URBAIN', zone: centerCheck.zoneName };
  }
  
  // Vérifier les points cardinaux du cercle
  const cardinalPoints = [0, 90, 180, 270];
  for (const bearing of cardinalPoints) {
    const point = calculateDestination(center[0], center[1], radius, bearing);
    const check = isPointInUrbanZone(point.lat, point.lng);
    if (check.inUrban) {
      return { flagged: true, reason: 'EXCL_INTERSECTS_URBAIN', zone: check.zoneName };
    }
  }
  
  return { flagged: false };
};

/**
 * EXCL_INTERSECTS_URBAIN_BUFFER - Zone intersecte buffer 2000m
 */
export const checkIntersectsUrbanBuffer = (zone) => {
  const center = zone.center || [zone.lat, zone.lng];
  const radius = zone.radius || 50;
  
  // Vérifier le centre
  const centerCheck = isPointInUrbanBuffer(center[0], center[1]);
  if (centerCheck.inBuffer) {
    return { 
      flagged: true, 
      reason: 'EXCL_INTERSECTS_URBAIN_BUFFER', 
      zone: centerCheck.nearestZone,
      distance: centerCheck.distance
    };
  }
  
  // Vérifier les points cardinaux
  const cardinalPoints = [0, 90, 180, 270];
  for (const bearing of cardinalPoints) {
    const point = calculateDestination(center[0], center[1], radius, bearing);
    const check = isPointInUrbanBuffer(point.lat, point.lng);
    if (check.inBuffer) {
      return { 
        flagged: true, 
        reason: 'EXCL_INTERSECTS_URBAIN_BUFFER', 
        zone: check.nearestZone,
        distance: check.distance
      };
    }
  }
  
  return { flagged: false };
};

/**
 * EXCL_CENTROID_IN_URBAIN - Centroïde dans URBAIN_FULL
 */
export const checkCentroidInUrban = (zone) => {
  const center = zone.center || [zone.lat, zone.lng];
  const check = isPointInUrbanZone(center[0], center[1]);
  
  if (check.inUrban) {
    return { flagged: true, reason: 'EXCL_CENTROID_IN_URBAIN', zone: check.zoneName };
  }
  return { flagged: false };
};

/**
 * EXCL_CENTROID_IN_URBAIN_BUFFER - Centroïde dans buffer 2000m
 */
export const checkCentroidInUrbanBuffer = (zone) => {
  const center = zone.center || [zone.lat, zone.lng];
  const check = isPointInUrbanBuffer(center[0], center[1]);
  
  if (check.inBuffer) {
    return { 
      flagged: true, 
      reason: 'EXCL_CENTROID_IN_URBAIN_BUFFER', 
      zone: check.nearestZone,
      distance: check.distance
    };
  }
  return { flagged: false };
};

/**
 * Applique toutes les exclusions urbaines à une zone
 */
export const applyUrbanExclusions = (zone) => {
  const checks = [
    checkIntersectsUrban(zone),
    checkIntersectsUrbanBuffer(zone),
    checkCentroidInUrban(zone),
    checkCentroidInUrbanBuffer(zone)
  ];
  
  for (const check of checks) {
    if (check.flagged) {
      return {
        excluded: true,
        ...check
      };
    }
  }
  
  return { excluded: false };
};

// ============================================
// 4. RELOCALISATION URBAINE - 2000m vers score max
// ============================================

/**
 * Vérifie si un point candidat est valide (hors zones interdites)
 * Compatible avec les couches hydriques si disponibles
 */
const isValidRelocationPoint = async (lat, lng, waterCheckFn = null) => {
  // Vérifier URBAIN_FULL
  const urbanCheck = isPointInUrbanZone(lat, lng);
  if (urbanCheck.inUrban) return { valid: false, reason: 'in_urban' };
  
  // Vérifier URBAIN_FULL_BUFFER_2000M
  const bufferCheck = isPointInUrbanBuffer(lat, lng);
  if (bufferCheck.inBuffer) return { valid: false, reason: 'in_urban_buffer' };
  
  // Vérifier WATER_FULL et WATER_BUF_5M si fonction disponible
  if (waterCheckFn) {
    const waterCheck = await waterCheckFn(lat, lng);
    if (waterCheck.inWater) return { valid: false, reason: 'in_water' };
  }
  
  return { valid: true };
};

/**
 * Calcule le score d'une position candidate
 * Basé sur: distance de l'urbain, score original, terrain
 */
const calculateCandidateScore = (lat, lng, originalScore, allZones) => {
  // Distance minimale à l'urbain
  const bufferCheck = isPointInUrbanBuffer(lat, lng);
  const distanceToUrban = bufferCheck.distance || URBAN_CONFIG.BUFFER_DISTANCE_M + 1000;
  
  // Bonus pour distance (plus loin = mieux)
  const distanceBonus = Math.min(100, (distanceToUrban / URBAN_CONFIG.BUFFER_DISTANCE_M) * 50);
  
  // Bonus si proche d'autres zones à haut score
  let proximityBonus = 0;
  if (allZones && allZones.length > 0) {
    for (const zone of allZones) {
      const zCenter = zone.center || [zone.lat, zone.lng];
      const dist = calculateDistance(lat, lng, zCenter[0], zCenter[1]);
      if (dist < 500 && zone.score > 70) {
        proximityBonus += 10;
      }
    }
  }
  
  // Score final
  return originalScore + distanceBonus + Math.min(30, proximityBonus);
};

/**
 * RELOCATE_FROM_URBAN_2000M
 * Relocalise une zone hors du buffer urbain vers le meilleur score
 */
export const relocateFromUrban = async (lat, lng, originalScore, allZones, waterCheckFn = null) => {
  const candidates = [];
  const { RELOCATION_SEARCH_RADIUS_M, CANDIDATE_POINTS_COUNT, DISTANCE_STEPS, MIN_DISTANCE_FROM_URBAN_M } = URBAN_CONFIG;
  
  // Générer les points candidats
  const angleStep = 360 / CANDIDATE_POINTS_COUNT;
  const distanceStep = RELOCATION_SEARCH_RADIUS_M / DISTANCE_STEPS;
  
  for (let angle = 0; angle < 360; angle += angleStep) {
    for (let step = 1; step <= DISTANCE_STEPS; step++) {
      const distance = MIN_DISTANCE_FROM_URBAN_M + (step * distanceStep);
      const candidate = calculateDestination(lat, lng, distance, angle);
      
      // Vérifier si le point est valide
      const validCheck = await isValidRelocationPoint(candidate.lat, candidate.lng, waterCheckFn);
      
      if (validCheck.valid) {
        // Vérifier la distance minimale à l'urbain
        const bufferCheck = isPointInUrbanBuffer(candidate.lat, candidate.lng);
        
        if (!bufferCheck.inBuffer && bufferCheck.distance >= MIN_DISTANCE_FROM_URBAN_M) {
          const score = calculateCandidateScore(candidate.lat, candidate.lng, originalScore, allZones);
          candidates.push({
            lat: candidate.lat,
            lng: candidate.lng,
            distance,
            direction: angle,
            score,
            distanceToUrban: bufferCheck.distance
          });
        }
      }
    }
  }
  
  // Trier par score (highest_score strategy)
  candidates.sort((a, b) => b.score - a.score);
  
  if (candidates.length === 0) {
    return null; // Impossible de relocaliser
  }
  
  // Retourner le meilleur candidat
  const best = candidates[0];
  return {
    lat: best.lat,
    lng: best.lng,
    distance: best.distance,
    direction: best.direction,
    score: best.score,
    distanceToUrban: best.distanceToUrban,
    strategy: URBAN_CONFIG.RELOCATION_STRATEGY,
    candidatesEvaluated: candidates.length
  };
};

// ============================================
// 5. QA URBAIN - Validation stricte 2000m
// ============================================

/**
 * QA_URBAN_INTERSECT - Vérifie intersection avec URBAIN_FULL
 */
const qaUrbanIntersect = (zone) => {
  const check = checkIntersectsUrban(zone);
  return {
    id: 'QA_URBAN_INTERSECT',
    passed: !check.flagged,
    details: check
  };
};

/**
 * QA_URBAN_INTERSECT_BUFFER - Vérifie intersection avec buffer
 */
const qaUrbanIntersectBuffer = (zone) => {
  const check = checkIntersectsUrbanBuffer(zone);
  return {
    id: 'QA_URBAN_INTERSECT_BUFFER',
    passed: !check.flagged,
    details: check
  };
};

/**
 * QA_URBAN_CENTROID - Vérifie centroïde dans URBAIN_FULL
 */
const qaUrbanCentroid = (zone) => {
  const check = checkCentroidInUrban(zone);
  return {
    id: 'QA_URBAN_CENTROID',
    passed: !check.flagged,
    details: check
  };
};

/**
 * QA_URBAN_CENTROID_BUFFER - Vérifie centroïde dans buffer
 */
const qaUrbanCentroidBuffer = (zone) => {
  const check = checkCentroidInUrbanBuffer(zone);
  return {
    id: 'QA_URBAN_CENTROID_BUFFER',
    passed: !check.flagged,
    details: check
  };
};

/**
 * QA_URBAN_DISTANCE - Vérifie distance >= 2000m de l'urbain
 */
const qaUrbanDistance = (zone) => {
  const center = zone.center || [zone.lat, zone.lng];
  const bufferCheck = isPointInUrbanBuffer(center[0], center[1]);
  
  const passed = bufferCheck.distance >= URBAN_CONFIG.MIN_DISTANCE_FROM_URBAN_M;
  
  return {
    id: 'QA_URBAN_DISTANCE',
    passed,
    distance: bufferCheck.distance,
    required: URBAN_CONFIG.MIN_DISTANCE_FROM_URBAN_M,
    nearestZone: bufferCheck.nearestZone
  };
};

/**
 * Exécute tous les contrôles QA urbains sur une zone
 */
export const runUrbanQA = (zone) => {
  const checks = [
    qaUrbanIntersect(zone),
    qaUrbanIntersectBuffer(zone),
    qaUrbanCentroid(zone),
    qaUrbanCentroidBuffer(zone),
    qaUrbanDistance(zone)
  ];
  
  const allPassed = checks.every(c => c.passed);
  const failedChecks = checks.filter(c => !c.passed);
  
  return {
    id: 'QA_URBAN_REPORT',
    zone: zone.id || 'unknown',
    timestamp: new Date().toISOString(),
    allPassed,
    totalChecks: checks.length,
    passedCount: checks.filter(c => c.passed).length,
    failedCount: failedChecks.length,
    checks,
    failedChecks: failedChecks.map(c => c.id)
  };
};

// ============================================
// 6. FONCTION PRINCIPALE - TRAITEMENT COMPLET
// ============================================

/**
 * Traite toutes les zones avec le module urbain BIONIC™
 * 
 * @param {Array} zones - Zones à traiter
 * @param {Object} options - Options de traitement
 * @returns {Object} { processedZones, stats, qaReport }
 */
export const processUrbanModule = async (zones, options = {}) => {
  const { waterCheckFn = null, enableQA = true } = options;
  
  if (!zones || zones.length === 0) {
    return {
      processedZones: [],
      stats: {
        total: 0,
        unchanged: 0,
        relocated: 0,
        excluded: 0,
        ruleset: 'BIONIC_URBAN_MODULE'
      },
      qaReport: null
    };
  }
  
  const processedZones = [];
  const stats = {
    total: zones.length,
    unchanged: 0,
    relocated: 0,
    excluded: 0,
    exclusionReasons: {},
    relocationDetails: [],
    ruleset: 'BIONIC_URBAN_MODULE',
    bufferDistance: URBAN_CONFIG.BUFFER_DISTANCE_M
  };
  
  const qaResults = [];
  
  for (const zone of zones) {
    const center = zone.center || [zone.lat, zone.lng];
    const [lat, lng] = center;
    
    // Appliquer les exclusions
    const exclusion = applyUrbanExclusions(zone);
    
    if (exclusion.excluded) {
      // Tenter la relocalisation
      const relocation = await relocateFromUrban(
        lat, lng,
        zone.score || 50,
        zones,
        waterCheckFn
      );
      
      if (relocation) {
        // Relocalisation réussie
        stats.relocated++;
        stats.relocationDetails.push({
          originalLat: lat,
          originalLng: lng,
          newLat: relocation.lat,
          newLng: relocation.lng,
          distance: relocation.distance,
          score: relocation.score
        });
        
        const relocatedZone = {
          ...zone,
          center: [relocation.lat, relocation.lng],
          lat: relocation.lat,
          lng: relocation.lng,
          _relocated: true,
          _relocationRule: 'RELOCATE_FROM_URBAN_2000M',
          _originalCenter: [lat, lng],
          _relocationDistance: relocation.distance,
          _relocationDirection: relocation.direction,
          _relocationScore: relocation.score,
          _distanceToUrban: relocation.distanceToUrban
        };
        
        // QA sur la zone relocalisée
        if (enableQA) {
          const qa = runUrbanQA(relocatedZone);
          qaResults.push(qa);
          relocatedZone._qaResult = qa;
        }
        
        processedZones.push(relocatedZone);
      } else {
        // Relocalisation impossible - exclure
        stats.excluded++;
        const reason = exclusion.reason || 'URBAN_EXCLUSION';
        stats.exclusionReasons[reason] = (stats.exclusionReasons[reason] || 0) + 1;
      }
    } else {
      // Zone conforme
      stats.unchanged++;
      
      // QA optionnel
      if (enableQA) {
        const qa = runUrbanQA(zone);
        qaResults.push(qa);
        zone._qaResult = qa;
      }
      
      processedZones.push(zone);
    }
  }
  
  // Rapport QA global
  const qaReport = enableQA ? {
    id: 'QA_URBAN_REPORT',
    timestamp: new Date().toISOString(),
    totalZones: qaResults.length,
    allPassed: qaResults.every(r => r.allPassed),
    passedCount: qaResults.filter(r => r.allPassed).length,
    failedCount: qaResults.filter(r => !r.allPassed).length,
    results: qaResults
  } : null;
  
  if (URBAN_CONFIG.DEBUG) {
    console.log(`[BIONIC_URBAN_MODULE] Traitement terminé:`, stats);
  }
  
  return {
    processedZones,
    stats,
    qaReport
  };
};

// ============================================
// EXPORTS
// ============================================
export default {
  // Configuration
  URBAN_CONFIG,
  URBAIN_FULL,
  
  // Vérifications
  isPointInUrbanZone,
  isPointInUrbanBuffer,
  applyUrbanExclusions,
  
  // Exclusions
  checkIntersectsUrban,
  checkIntersectsUrbanBuffer,
  checkCentroidInUrban,
  checkCentroidInUrbanBuffer,
  
  // Relocalisation
  relocateFromUrban,
  
  // QA
  runUrbanQA,
  
  // Fonction principale
  processUrbanModule
};
