/**
 * QuebecEcoforestryService.js
 * 
 * Service pour charger les données écoforestières GeoJSON du Québec
 * Source: Données Québec / MRNF - Inventaire écoforestier
 * 
 * Utilise l'API ArcGIS REST du MRNF pour requêtes dynamiques par région
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES SOURCES DE DONNÉES
// ═══════════════════════════════════════════════════════════════

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Services ArcGIS REST du MRNF Québec
 */
const ARCGIS_SERVICES = {
  // Peuplements forestiers - Service principal
  peuplements: {
    id: 'peuplements',
    name: 'Peuplements forestiers',
    baseUrl: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services',
    serviceName: 'Canada_Forest_Lands_Ownership',
    layerId: 0,
    format: 'geojson'
  },
  // Alternative: Open Canada Forest Data
  canada_forest: {
    id: 'canada_forest',
    name: 'Couverture forestière Canada',
    baseUrl: 'https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services',
    serviceName: 'Canada_Forest_Lands_Ownership',
    layerId: 0,
    format: 'geojson'
  }
};

/**
 * Classification des types forestiers avec styles BIONIC
 */
export const FOREST_CLASSIFICATION = {
  // Résineux
  'EPN': { name: 'Épinette noire', type: 'resineux_dense', color: '#00ff66', score: 95 },
  'EPB': { name: 'Épinette blanche', type: 'resineux', color: '#00cc44', score: 90 },
  'SAB': { name: 'Sapin baumier', type: 'resineux', color: '#00dd55', score: 88 },
  'PIG': { name: 'Pin gris', type: 'resineux', color: '#33cc33', score: 85 },
  'PIB': { name: 'Pin blanc', type: 'resineux', color: '#44bb44', score: 83 },
  'PIR': { name: 'Pin rouge', type: 'resineux', color: '#55aa55', score: 82 },
  'THO': { name: 'Thuya (cèdre)', type: 'resineux', color: '#00aa44', score: 80 },
  'MEL': { name: 'Mélèze', type: 'resineux', color: '#66cc44', score: 78 },
  'PRU': { name: 'Pruche', type: 'resineux', color: '#339944', score: 75 },
  
  // Feuillus
  'BOP': { name: 'Bouleau à papier', type: 'feuillus', color: '#ffdd00', score: 70 },
  'BOJ': { name: 'Bouleau jaune', type: 'feuillus', color: '#ffcc00', score: 72 },
  'ERR': { name: 'Érable rouge', type: 'feuillus', color: '#ff9944', score: 68 },
  'ERS': { name: 'Érable à sucre', type: 'feuillus', color: '#ffaa33', score: 70 },
  'PET': { name: 'Peuplier faux-tremble', type: 'feuillus', color: '#ccdd44', score: 65 },
  'PEB': { name: 'Peuplier baumier', type: 'feuillus', color: '#bbcc44', score: 63 },
  'FRN': { name: 'Frêne noir', type: 'feuillus', color: '#aacc55', score: 60 },
  'CHR': { name: 'Chêne rouge', type: 'feuillus', color: '#cc8833', score: 65 },
  
  // Mixte
  'MIX': { name: 'Forêt mixte', type: 'mixte', color: '#88ff44', score: 75 },
  'FIM': { name: 'Mixte à feuillus', type: 'mixte_feuillus', color: '#99ee33', score: 70 },
  'REM': { name: 'Mixte à résineux', type: 'mixte_resineux', color: '#66ff33', score: 80 },
  
  // Autres
  'EAU': { name: 'Eau', type: 'eau', color: '#00d4ff', score: 60 },
  'MIL': { name: 'Milieu humide', type: 'milieu_humide', color: '#00ffcc', score: 75 },
  'DEN': { name: 'Dénudé', type: 'perturbe', color: '#ff6699', score: 30 },
  'ANT': { name: 'Anthropique', type: 'urbain', color: '#999999', score: 10 }
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS DE REQUÊTE
// ═══════════════════════════════════════════════════════════════

/**
 * Construit l'URL de requête ArcGIS REST
 */
const buildArcGISQueryUrl = (service, bounds, options = {}) => {
  const { minScore = 80 } = options;
  
  const baseUrl = `${service.baseUrl}/${service.serviceName}/FeatureServer/${service.layerId}/query`;
  
  // Construire la géométrie de requête (envelope)
  const geometry = {
    xmin: bounds.west,
    ymin: bounds.south,
    xmax: bounds.east,
    ymax: bounds.north,
    spatialReference: { wkid: 4326 }
  };
  
  const params = new URLSearchParams({
    where: '1=1',
    geometry: JSON.stringify(geometry),
    geometryType: 'esriGeometryEnvelope',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: '*',
    outSR: '4326',
    f: 'geojson',
    resultRecordCount: '1000'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

/**
 * Charge les données écoforestières pour une région
 */
export const loadEcoforestryData = async (bounds, options = {}) => {
  const { 
    minScore = 80,
    useProxy = true,
    service = 'canada_forest'
  } = options;
  
  try {
    const serviceConfig = ARCGIS_SERVICES[service];
    if (!serviceConfig) {
      throw new Error(`Service inconnu: ${service}`);
    }
    
    const queryUrl = buildArcGISQueryUrl(serviceConfig, bounds, { minScore });
    
    // Utiliser le proxy si nécessaire
    const fetchUrl = useProxy 
      ? `${API_BASE}/api/geojson-proxy?url=${encodeURIComponent(queryUrl)}`
      : queryUrl;
    
    const response = await fetch(fetchUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const geojson = await response.json();
    
    // Filtrer et enrichir les features avec les scores BIONIC
    if (geojson.features) {
      geojson.features = geojson.features
        .map(feature => enrichFeatureWithBionicScore(feature))
        .filter(feature => feature.properties.bionic_score >= minScore);
    }
    
    return geojson;
  } catch (error) {
    console.error('[BIONIC Ecoforestry] Erreur chargement données:', error);
    return { type: 'FeatureCollection', features: [] };
  }
};

/**
 * Enrichit une feature avec le score BIONIC
 */
const enrichFeatureWithBionicScore = (feature) => {
  const props = feature.properties || {};
  
  // Extraire le code d'essence (peut varier selon la source)
  const essenceCode = props.ESSENCE_DOM || props.DOMINANT_SPECIES || props.FOREST_TYPE || 'MIX';
  
  // Trouver la classification BIONIC
  const classification = FOREST_CLASSIFICATION[essenceCode] || FOREST_CLASSIFICATION['MIX'];
  
  // Calculer le score BIONIC
  const baseScore = classification.score;
  const densityFactor = (props.DENSITE || props.DENSITY || 50) / 100;
  const heightFactor = Math.min((props.HAUTEUR || props.HEIGHT || 15) / 25, 1);
  
  const bionicScore = Math.round(baseScore * (0.5 + densityFactor * 0.3 + heightFactor * 0.2));
  
  return {
    ...feature,
    properties: {
      ...props,
      bionic_score: bionicScore,
      bionic_type: classification.type,
      bionic_color: classification.color,
      bionic_name: classification.name,
      essence_code: essenceCode
    }
  };
};

/**
 * Génère des données de démonstration pour une région
 * Utilisé quand les services externes ne sont pas disponibles
 */
export const generateDemoForestData = (center, radius = 0.02) => {
  const features = [];
  const [lat, lng] = center;
  
  // Types forestiers à générer (seulement 80%+)
  const forestTypes = [
    { code: 'EPN', weight: 0.25 },
    { code: 'SAB', weight: 0.20 },
    { code: 'EPB', weight: 0.15 },
    { code: 'BOJ', weight: 0.10 },
    { code: 'REM', weight: 0.15 },
    { code: 'MIL', weight: 0.08 },
    { code: 'MIX', weight: 0.07 }
  ];
  
  // Générer des polygones irréguliers pour chaque type
  forestTypes.forEach((ft, typeIndex) => {
    const numZones = Math.floor(ft.weight * 15) + 1;
    
    for (let i = 0; i < numZones; i++) {
      const angle = (Math.random() * 2 * Math.PI);
      const distance = radius * (0.2 + Math.random() * 0.7);
      const zoneLat = lat + Math.cos(angle) * distance;
      const zoneLng = lng + Math.sin(angle) * distance * 1.3;
      const zoneRadius = radius * (0.08 + Math.random() * 0.15);
      
      // Créer un polygone irrégulier
      const polygon = generateIrregularPolygon([zoneLat, zoneLng], zoneRadius);
      
      const classification = FOREST_CLASSIFICATION[ft.code];
      const density = 70 + Math.random() * 30;
      const height = 12 + Math.random() * 13;
      const bionicScore = Math.round(classification.score * (0.5 + density/100 * 0.3 + height/25 * 0.2));
      
      // Seulement ajouter si score >= 80
      if (bionicScore >= 80) {
        features.push({
          type: 'Feature',
          properties: {
            id: `demo_${typeIndex}_${i}`,
            essence_code: ft.code,
            bionic_name: classification.name,
            bionic_type: classification.type,
            bionic_color: classification.color,
            bionic_score: bionicScore,
            DENSITE: Math.round(density),
            HAUTEUR: Math.round(height)
          },
          geometry: {
            type: 'Polygon',
            coordinates: [polygon]
          }
        });
      }
    }
  });
  
  return {
    type: 'FeatureCollection',
    features,
    properties: {
      source: 'BIONIC Demo Data',
      generated: new Date().toISOString(),
      center: { lat, lng },
      radius
    }
  };
};

/**
 * Génère un polygone irrégulier naturel
 */
const generateIrregularPolygon = (center, radius) => {
  const [lat, lng] = center;
  const points = [];
  const numPoints = 8 + Math.floor(Math.random() * 6);
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    // Variation pour aspect naturel
    const r = radius * (0.7 + Math.random() * 0.5);
    points.push([
      lng + Math.sin(angle) * r * 1.3,
      lat + Math.cos(angle) * r
    ]);
  }
  
  // Fermer le polygone
  points.push(points[0]);
  
  return points;
};

// ═══════════════════════════════════════════════════════════════
// STYLES BIONIC POUR GEOJSON
// ═══════════════════════════════════════════════════════════════

export const getBionicGeoJSONStyle = (feature) => {
  const props = feature.properties || {};
  const score = props.bionic_score || 50;
  const color = props.bionic_color || '#88ff44';
  
  // Opacité basée sur le score
  const opacity = 0.4 + (score / 100) * 0.4;
  
  return {
    fillColor: color,
    fillOpacity: opacity,
    color: color,
    weight: score >= 90 ? 2 : 1,
    opacity: 0.8
  };
};

export default {
  loadEcoforestryData,
  generateDemoForestData,
  getBionicGeoJSONStyle,
  FOREST_CLASSIFICATION,
  ARCGIS_SERVICES
};
