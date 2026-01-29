/**
 * BIONIC_VECTOR_TILES_CANADA
 * Pipeline de génération de tuiles vectorielles pour le Canada
 * 
 * Version: 1.0.0
 * 
 * Architecture:
 * - Multi-zoom-level simplification
 * - Data layer preprocessing
 * - Vector tile export configuration
 * 
 * Couverture: Canada complet [-141.0, 41.7] à [-52.6, 83.1]
 * Projection: EPSG:3857 (Web Mercator)
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION GLOBALE
// ═══════════════════════════════════════════════════════════════

export const BIONIC_VECTOR_TILES_CONFIG = {
  version: '1.0.0',
  name: 'BIONIC_VECTOR_TILES_CANADA',
  description: `Pipeline de génération de tuiles vectorielles pour le Canada entier.
    Optimisation multi-niveaux de zoom avec simplification géométrique progressive.`,
  
  coverage: {
    name: 'Canada',
    bounds: [-141.0, 41.7, -52.6, 83.1], // [west, south, east, north]
    center: [-96.8, 62.4],
    projection: 'EPSG:3857'
  }
};

// ═══════════════════════════════════════════════════════════════
// NIVEAUX DE ZOOM - SIMPLIFICATION GÉOMÉTRIQUE
// ═══════════════════════════════════════════════════════════════

export const ZOOM_LEVELS_CONFIG = [
  {
    id: 'global',
    range: [0, 4],
    simplification: 'aggressive',
    tolerance_meters: 5000,
    min_area_km2: 1000,
    layers: ['provinces', 'major_rivers', 'major_lakes'],
    description: 'Vue continentale - Frontières provinciales uniquement'
  },
  {
    id: 'regional',
    range: [5, 7],
    simplification: 'moderate',
    tolerance_meters: 1000,
    min_area_km2: 100,
    layers: ['regions', 'rivers', 'lakes', 'major_roads'],
    description: 'Vue régionale - Régions et infrastructures majeures'
  },
  {
    id: 'local',
    range: [8, 10],
    simplification: 'light',
    tolerance_meters: 200,
    min_area_km2: 10,
    layers: ['municipalities', 'all_rivers', 'all_lakes', 'roads', 'forests_major'],
    description: 'Vue locale - Municipalités et couvert forestier'
  },
  {
    id: 'detailed',
    range: [11, 14],
    simplification: 'minimal',
    tolerance_meters: 50,
    min_area_km2: 1,
    layers: ['full_detail'],
    description: 'Vue détaillée - Toutes les entités'
  },
  {
    id: 'precision',
    range: [15, 18],
    simplification: 'none',
    tolerance_meters: 0,
    min_area_km2: 0,
    layers: ['full_detail', 'micro_features'],
    description: 'Vue haute précision - Micro-entités incluses'
  }
];

// ═══════════════════════════════════════════════════════════════
// COUCHES DE DONNÉES
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// TOPOGRAPHIE
// ─────────────────────────────────────────────
export const LAYER_TOPOGRAPHY = {
  id: 'topo',
  name: 'Topographie',
  sources: [
    {
      id: 'rncan_canvec',
      name: 'RNCan CanVec Topo',
      url: 'https://maps.canada.ca/arcgis/rest/services/BaseMaps/CBMT_CBCT_GEOM_3857/MapServer',
      type: 'REST'
    },
    {
      id: 'usgs_srtm',
      name: 'USGS SRTM DEM',
      url: 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer',
      type: 'ImageServer'
    }
  ],
  features: {
    contours: {
      enabled: true,
      intervals: [50, 100, 250, 500],
      unit: 'meters',
      style: {
        color: '#8B4513',
        weight: {
          major: 1.5,
          minor: 0.5
        },
        opacity: 0.7
      }
    },
    hillshade: {
      enabled: true,
      azimuth: 315,
      altitude: 45,
      opacity: 0.3
    },
    peaks: {
      enabled: true,
      min_prominence: 100,
      icon: '⛰️',
      style: {
        color: '#4A4A4A',
        labelOffset: [0, -10]
      }
    }
  },
  zoom_visibility: {
    contours: [8, 18],
    hillshade: [6, 18],
    peaks: [10, 18]
  }
};

// ─────────────────────────────────────────────
// GÉOLOGIE
// ─────────────────────────────────────────────
export const LAYER_GEOLOGY = {
  id: 'geo',
  name: 'Géologie',
  sources: [
    {
      id: 'rncan_bedrock',
      name: 'RNCan Bedrock Geology',
      url: 'https://maps.geological-survey.ca/arcgis/rest/services/geology/geology_en/MapServer',
      type: 'REST'
    },
    {
      id: 'rncan_surficial',
      name: 'RNCan Surficial Geology',
      url: 'https://maps.geological-survey.ca/arcgis/rest/services/surficial/surficial_en/MapServer',
      type: 'REST'
    }
  ],
  classification: [
    { id: 'igneous', name: 'Roches ignées', color: '#696969' },
    { id: 'sedimentary', name: 'Roches sédimentaires', color: '#8B4513' },
    { id: 'metamorphic', name: 'Roches métamorphiques', color: '#708090' },
    { id: 'quaternary', name: 'Dépôts quaternaires', color: '#D2691E' }
  ],
  attributes: ['formation_name', 'age_period', 'lithology'],
  style: {
    type: 'semi-transparent polygons',
    fillOpacity: 0.35,
    strokeWidth: 0.5,
    strokeColor: '#666666'
  },
  zoom_visibility: [5, 18],
  relevance_hunting: 'Influence la végétation, le drainage et les corridors de déplacement du gibier'
};

// ─────────────────────────────────────────────
// HYDROLOGIE
// ─────────────────────────────────────────────
export const LAYER_HYDROLOGY = {
  id: 'hydro',
  name: 'Hydrologie',
  sources: [
    {
      id: 'rncan_nhn',
      name: 'RNCan National Hydro Network',
      url: 'https://maps.canada.ca/arcgis/rest/services/NRCan/Hydro_Network_NHN/MapServer',
      type: 'REST'
    },
    {
      id: 'mffp_hydro_qc',
      name: 'MFFP Hydrographie Québec',
      url: 'https://servicescarto.mffp.gouv.qc.ca/pes/services/Territoires/SDA_Hydro/MapServer/WMSServer',
      type: 'WMS'
    }
  ],
  features: {
    rivers: {
      classification: [
        { class: 1, name: 'major', min_order: 6, width: 3, color: '#0066CC', buffer_m: 100 },
        { class: 2, name: 'secondary', min_order: 4, width: 2, color: '#3399FF', buffer_m: 50 },
        { class: 3, name: 'minor', min_order: 1, width: 1, color: '#66B2FF', buffer_m: 25 }
      ]
    },
    lakes: {
      classification: [
        { class: 1, name: 'large', min_area_km2: 100, fillOpacity: 0.6 },
        { class: 2, name: 'medium', min_area_km2: 10, fillOpacity: 0.5 },
        { class: 3, name: 'small', min_area_km2: 0.1, fillOpacity: 0.4 }
      ],
      style: {
        fillColor: 'rgba(30, 144, 255, 0.5)',
        strokeColor: '#0066CC',
        strokeWidth: 1
      }
    },
    wetlands: {
      types: ['marsh', 'bog', 'fen', 'swamp'],
      style: {
        fillColor: 'rgba(0, 128, 128, 0.3)',
        strokeColor: '#008080',
        pattern: 'hatched'
      }
    },
    watersheds: {
      levels: [1, 2, 3, 4],
      style: {
        strokeColor: '#1E90FF',
        strokeWidth: 2,
        dashArray: [5, 3]
      }
    }
  },
  style: {
    type: 'blue lines + buffer zones',
    lineColor: '#1E90FF',
    lineWidth: 2,
    bufferColor: 'rgba(30, 144, 255, 0.15)',
    bufferRadius: 50
  },
  zoom_visibility: {
    rivers_major: [4, 18],
    rivers_secondary: [7, 18],
    rivers_minor: [10, 18],
    lakes_large: [4, 18],
    lakes_medium: [7, 18],
    lakes_small: [10, 18],
    wetlands: [9, 18],
    watersheds: [6, 14]
  },
  relevance_hunting: 'Points d\'eau = zones d\'abreuvement. Corridors de déplacement pour orignal et chevreuil.'
};

// ─────────────────────────────────────────────
// ÉCOFORESTIER
// ─────────────────────────────────────────────
export const LAYER_ECOFOREST = {
  id: 'eco',
  name: 'Carte écoforestière',
  sources: [
    {
      id: 'mffp_ecoforest_qc',
      name: 'MFFP Carte Écoforestière Québec',
      url: 'https://servicescarto.mffp.gouv.qc.ca/pes/services/Inventaire/CarteEcoforestiere/MapServer/WMSServer',
      type: 'WMS'
    },
    {
      id: 'nrcan_eosd',
      name: 'NRCan Earth Observation for Sustainable Development',
      url: 'https://ca.nfis.org/cubewerx/cubeserv',
      datastore: 'EOSD',
      type: 'WMS'
    }
  ],
  features: {
    forest_cover: {
      types: [
        { id: 'coniferous', name: 'Résineux', threshold: 75, color: '#006400' },
        { id: 'deciduous', name: 'Feuillus', threshold: 75, color: '#FFD700' },
        { id: 'mixed_conifer', name: 'Mélangés à résineux', color: '#228B22' },
        { id: 'mixed_deciduous', name: 'Mélangés à feuillus', color: '#90EE90' }
      ],
      density_classes: [
        { id: 'dense', label: 'Dense', min: 80, color: '#006400' },
        { id: 'medium', label: 'Moyenne', min: 60, color: '#228B22' },
        { id: 'sparse', label: 'Claire', min: 40, color: '#90EE90' },
        { id: 'open', label: 'Très claire', min: 0, color: '#F0E68C' }
      ]
    },
    species_composition: {
      dominant_species: true,
      secondary_species: true,
      common_species: [
        { code: 'EPN', name: 'Épinette noire', color: '#006400' },
        { code: 'SAB', name: 'Sapin baumier', color: '#228B22' },
        { code: 'BOJ', name: 'Bouleau jaune', color: '#8B4513' },
        { code: 'ERS', name: 'Érable à sucre', color: '#DAA520' },
        { code: 'PIG', name: 'Pin gris', color: '#2E8B57' }
      ]
    },
    age_classes: {
      intervals: [10, 30, 50, 70, 90, 120],
      labels: ['Régénération', 'Jeune', 'Jeune mature', 'Mature', 'Vieille', 'Très vieille'],
      colors: ['#90EE90', '#228B22', '#006400', '#004D00', '#003300', '#001A00']
    },
    disturbance: {
      types: [
        { id: 'fire', name: 'Feu', color: '#FF0000', icon: '🔥' },
        { id: 'harvest', name: 'Coupe', color: '#FF8C00', icon: '🪓' },
        { id: 'insect', name: 'Insectes', color: '#800080', icon: '🐛' },
        { id: 'windthrow', name: 'Chablis', color: '#4169E1', icon: '💨' }
      ],
      since_year: 2000
    }
  },
  style: {
    type: 'green gradient',
    opacity: 0.6
  },
  zoom_visibility: [7, 18],
  relevance_hunting: 'Type de forêt = habitats préférentiels. Âge = qualité de la nourriture. Densité = couvert de protection.'
};

// ─────────────────────────────────────────────
// ZONES ADMINISTRATIVES
// ─────────────────────────────────────────────
export const LAYER_ADMINISTRATIVE = {
  id: 'admin',
  name: 'Zones administratives',
  sources: [
    {
      id: 'statcan_census',
      name: 'StatCan Census Boundaries',
      url: 'https://www12.statcan.gc.ca/rest/census-recensement/CR2021GCSPRD/data/',
      type: 'REST'
    },
    {
      id: 'rncan_atlas',
      name: 'RNCan National Atlas',
      url: 'https://maps.canada.ca/arcgis/rest/services/Atlas/MapServer',
      type: 'REST'
    }
  ],
  features: {
    provinces: {
      enabled: true,
      attributes: ['name_fr', 'name_en', 'code'],
      style: {
        strokeColor: '#333333',
        strokeWidth: 2,
        fillOpacity: 0
      }
    },
    regions: {
      enabled: true,
      attributes: ['name', 'type'],
      style: {
        strokeColor: '#666666',
        strokeWidth: 1,
        dashArray: [4, 2]
      }
    },
    municipalities: {
      enabled: true,
      attributes: ['name', 'population', 'area_km2'],
      style: {
        strokeColor: '#999999',
        strokeWidth: 0.5
      }
    },
    zecs: {
      source: 'MFFP ZECs Québec',
      enabled: true,
      attributes: ['name', 'species_allowed', 'season_dates'],
      style: {
        strokeColor: '#FF6600',
        strokeWidth: 2,
        fillColor: 'rgba(255, 102, 0, 0.1)'
      }
    },
    reserves_fauniques: {
      source: 'SEPAQ',
      enabled: true,
      attributes: ['name', 'hunting_zones'],
      style: {
        strokeColor: '#009900',
        strokeWidth: 2,
        fillColor: 'rgba(0, 153, 0, 0.1)'
      }
    }
  },
  zoom_visibility: {
    provinces: [0, 18],
    regions: [5, 18],
    municipalities: [8, 18],
    zecs: [7, 18],
    reserves_fauniques: [7, 18]
  }
};

// ─────────────────────────────────────────────
// RÉSEAU ROUTIER
// ─────────────────────────────────────────────
export const LAYER_ROADS = {
  id: 'road',
  name: 'Réseau routier',
  sources: [
    {
      id: 'statcan_road_network',
      name: 'StatCan Road Network',
      url: 'https://www12.statcan.gc.ca/open-ouvert/road-route/',
      type: 'REST'
    },
    {
      id: 'osm_canada',
      name: 'OpenStreetMap Canada',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      type: 'raster',
      vector_url: 'https://api.openstreetmap.org/api/0.6/map'
    }
  ],
  classification: [
    { 
      class: 1, 
      id: 'autoroute',
      name: 'Autoroute', 
      osm_type: 'motorway', 
      buffer_m: 50,
      style: { color: '#E74C3C', weight: 4 }
    },
    { 
      class: 2, 
      id: 'nationale',
      name: 'Nationale', 
      osm_type: 'trunk', 
      buffer_m: 30,
      style: { color: '#E67E22', weight: 3 }
    },
    { 
      class: 3, 
      id: 'regionale',
      name: 'Régionale', 
      osm_type: 'primary', 
      buffer_m: 20,
      style: { color: '#F1C40F', weight: 2.5 }
    },
    { 
      class: 4, 
      id: 'locale',
      name: 'Locale', 
      osm_type: 'secondary', 
      buffer_m: 15,
      style: { color: '#FFFFFF', weight: 2 }
    },
    { 
      class: 5, 
      id: 'chemin_forestier',
      name: 'Chemin forestier', 
      osm_type: 'track', 
      buffer_m: 10,
      style: { color: '#95A5A6', weight: 1.5, dashArray: [4, 2] }
    },
    { 
      class: 6, 
      id: 'sentier',
      name: 'Sentier', 
      osm_type: 'path', 
      buffer_m: 5,
      style: { color: '#7F8C8D', weight: 1, dashArray: [2, 2] }
    }
  ],
  railways: {
    enabled: true,
    buffer_m: 30,
    style: { color: '#2C3E50', weight: 2, dashArray: [8, 4] }
  },
  zoom_visibility: {
    autoroute: [4, 18],
    nationale: [6, 18],
    regionale: [8, 18],
    locale: [10, 18],
    chemin_forestier: [12, 18],
    sentier: [14, 18],
    railways: [6, 18]
  }
};

// ─────────────────────────────────────────────
// ZONES URBAINES
// ─────────────────────────────────────────────
export const LAYER_URBAN = {
  id: 'urban',
  name: 'Zones urbaines',
  sources: [
    {
      id: 'statcan_population',
      name: 'StatCan Population Centres',
      url: 'https://www12.statcan.gc.ca/census-recensement/2021/geo/',
      type: 'REST'
    },
    {
      id: 'osm_landuse',
      name: 'OpenStreetMap Landuse',
      type: 'vector'
    }
  ],
  classification: [
    { 
      class: 'large_urban', 
      name: 'Grande ville',
      min_population: 100000,
      style: { fillColor: '#E74C3C', fillOpacity: 0.4 }
    },
    { 
      class: 'medium_urban', 
      name: 'Ville moyenne',
      min_population: 30000,
      style: { fillColor: '#E67E22', fillOpacity: 0.3 }
    },
    { 
      class: 'small_urban', 
      name: 'Petite ville',
      min_population: 1000,
      style: { fillColor: '#F1C40F', fillOpacity: 0.2 }
    },
    { 
      class: 'rural', 
      name: 'Rural',
      min_population: 0,
      style: { fillColor: '#27AE60', fillOpacity: 0.1 }
    }
  ],
  buffer_hunting_exclusion_m: 2000,
  zoom_visibility: {
    large_urban: [4, 18],
    medium_urban: [6, 18],
    small_urban: [8, 18],
    rural: [10, 18]
  }
};

// ─────────────────────────────────────────────
// SCORE FAUNIQUE BIONIC™
// ─────────────────────────────────────────────
export const LAYER_WILDLIFE_SCORE = {
  id: 'bionic',
  name: 'Score faunique BIONIC™',
  computed: true,
  resolution: '100m_grid',
  species_specific: true,
  modules: [
    { id: 'habitat_optimal', name: 'Habitat optimal', weight: 0.20, icon: '🏠' },
    { id: 'zones_rut', name: 'Zones de rut', weight: 0.15, icon: '💕' },
    { id: 'salines_naturelles', name: 'Salines naturelles', weight: 0.15, icon: '🧂' },
    { id: 'points_affut', name: 'Points d\'affût', weight: 0.20, icon: '🎯' },
    { id: 'trajets_fauniques', name: 'Trajets fauniques', weight: 0.15, icon: '🛤️' },
    { id: 'peuplements_favorables', name: 'Peuplements favorables', weight: 0.15, icon: '🌲' }
  ],
  style: {
    type: 'heatmap + icons',
    gradient: {
      0.0: 'rgba(0, 0, 255, 0)',
      0.2: 'rgba(0, 255, 255, 0.5)',
      0.4: 'rgba(0, 255, 0, 0.6)',
      0.6: 'rgba(255, 255, 0, 0.7)',
      0.8: 'rgba(255, 165, 0, 0.8)',
      1.0: 'rgba(255, 0, 0, 0.9)'
    }
  }
};

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DE SORTIE
// ═══════════════════════════════════════════════════════════════

export const OUTPUT_CONFIG = {
  format: 'pbf', // Mapbox Vector Tiles
  tile_size: 512,
  extent: 4096,
  buffer: 64,
  compression: 'gzip',
  storage: {
    type: 'mbtiles',
    path: '/data/bionic_canada.mbtiles'
  },
  cdn_distribution: {
    enabled: true,
    base_url: 'https://tiles.huntiq.ca/bionic/{z}/{x}/{y}.pbf',
    fallback_url: 'https://cdn.huntiq.ca/tiles/bionic/{z}/{x}/{y}.pbf'
  }
};

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DE TRAITEMENT
// ═══════════════════════════════════════════════════════════════

export const PROCESSING_CONFIG = {
  parallel_workers: 8,
  memory_limit_gb: 32,
  tile_cache_mb: 4096,
  incremental_updates: true,
  last_updated_tracking: true,
  retry_config: {
    max_retries: 3,
    retry_delay_ms: 1000,
    exponential_backoff: true
  }
};

// ═══════════════════════════════════════════════════════════════
// PIPELINE COMPLET
// ═══════════════════════════════════════════════════════════════

export const BIONIC_VECTOR_TILES_CANADA = {
  ...BIONIC_VECTOR_TILES_CONFIG,
  
  zoom_levels: ZOOM_LEVELS_CONFIG,
  
  data_layers: {
    topography: LAYER_TOPOGRAPHY,
    geology: LAYER_GEOLOGY,
    hydrology: LAYER_HYDROLOGY,
    ecoforest: LAYER_ECOFOREST,
    administrative: LAYER_ADMINISTRATIVE,
    roads: LAYER_ROADS,
    urban: LAYER_URBAN,
    wildlife_score: LAYER_WILDLIFE_SCORE
  },
  
  output: OUTPUT_CONFIG,
  processing: PROCESSING_CONFIG
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Obtient la configuration de zoom appropriée pour un niveau donné
 * @param {number} zoom - Niveau de zoom
 * @returns {Object} Configuration du niveau de zoom
 */
export const getZoomConfig = (zoom) => {
  return ZOOM_LEVELS_CONFIG.find(config => 
    zoom >= config.range[0] && zoom <= config.range[1]
  ) || ZOOM_LEVELS_CONFIG[2]; // Défaut: 'local'
};

/**
 * Obtient les couches visibles pour un niveau de zoom
 * @param {number} zoom - Niveau de zoom
 * @returns {Array} Liste des IDs de couches visibles
 */
export const getVisibleLayersForZoom = (zoom) => {
  const config = getZoomConfig(zoom);
  return config.layers;
};

/**
 * Calcule le facteur de simplification pour un niveau de zoom
 * @param {number} zoom - Niveau de zoom
 * @returns {Object} Paramètres de simplification
 */
export const getSimplificationParams = (zoom) => {
  const config = getZoomConfig(zoom);
  return {
    tolerance: config.tolerance_meters,
    minArea: config.min_area_km2,
    type: config.simplification
  };
};

/**
 * Génère l'URL de tuile pour une position donnée
 * @param {number} z - Zoom
 * @param {number} x - Colonne
 * @param {number} y - Ligne
 * @returns {string} URL de la tuile
 */
export const getTileUrl = (z, x, y) => {
  return OUTPUT_CONFIG.cdn_distribution.base_url
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);
};

/**
 * Vérifie si une couche doit être visible à un niveau de zoom
 * @param {string} layerId - ID de la couche
 * @param {string} featureType - Type de feature (optionnel)
 * @param {number} zoom - Niveau de zoom
 * @returns {boolean} True si visible
 */
export const isLayerVisibleAtZoom = (layerId, featureType, zoom) => {
  const layer = BIONIC_VECTOR_TILES_CANADA.data_layers[layerId];
  if (!layer) return false;
  
  const visibility = layer.zoom_visibility;
  if (!visibility) return true;
  
  if (featureType && visibility[featureType]) {
    const [minZoom, maxZoom] = visibility[featureType];
    return zoom >= minZoom && zoom <= maxZoom;
  }
  
  if (Array.isArray(visibility)) {
    return zoom >= visibility[0] && zoom <= visibility[1];
  }
  
  return true;
};

/**
 * Obtient le style d'une couche
 * @param {string} layerId - ID de la couche
 * @param {number} zoom - Niveau de zoom pour ajustements
 * @returns {Object} Style de la couche
 */
export const getLayerStyle = (layerId, zoom = 12) => {
  const layer = BIONIC_VECTOR_TILES_CANADA.data_layers[layerId];
  if (!layer || !layer.style) return null;
  
  const baseStyle = { ...layer.style };
  
  // Ajustements selon le zoom
  const zoomConfig = getZoomConfig(zoom);
  if (zoomConfig.simplification === 'aggressive') {
    baseStyle.strokeWidth = (baseStyle.strokeWidth || 1) * 0.5;
  } else if (zoomConfig.simplification === 'none') {
    baseStyle.strokeWidth = (baseStyle.strokeWidth || 1) * 1.5;
  }
  
  return baseStyle;
};

/**
 * Obtient la configuration complète d'une couche
 * @param {string} layerId - ID de la couche
 * @returns {Object|null} Configuration de la couche
 */
export const getLayerConfig = (layerId) => {
  return BIONIC_VECTOR_TILES_CANADA.data_layers[layerId] || null;
};

/**
 * Liste toutes les couches disponibles
 * @returns {Array} Liste des configurations de couches
 */
export const getAllLayers = () => {
  return Object.entries(BIONIC_VECTOR_TILES_CANADA.data_layers).map(([id, config]) => ({
    id,
    ...config
  }));
};

/**
 * Valide si les coordonnées sont dans la couverture Canada
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True si dans la couverture
 */
export const isWithinCanadaCoverage = (lat, lng) => {
  const [west, south, east, north] = BIONIC_VECTOR_TILES_CONFIG.coverage.bounds;
  return lat >= south && lat <= north && lng >= west && lng <= east;
};

/**
 * Calcule les statistiques de traitement estimées
 * @param {Object} bounds - Zone à traiter { north, south, east, west }
 * @param {number} maxZoom - Zoom maximum
 * @returns {Object} Statistiques estimées
 */
export const estimateProcessingStats = (bounds, maxZoom = 14) => {
  const latRange = bounds.north - bounds.south;
  const lngRange = bounds.east - bounds.west;
  
  // Estimation approximative du nombre de tuiles
  let totalTiles = 0;
  for (let z = 0; z <= maxZoom; z++) {
    const tilesPerDegree = Math.pow(2, z) / 360;
    const tilesX = Math.ceil(lngRange * tilesPerDegree);
    const tilesY = Math.ceil(latRange * tilesPerDegree);
    totalTiles += tilesX * tilesY;
  }
  
  // Estimation du temps (basé sur ~100 tuiles/seconde)
  const estimatedTimeSeconds = totalTiles / 100;
  
  // Estimation de la taille (basé sur ~10KB/tuile moyenne)
  const estimatedSizeMB = (totalTiles * 10) / 1024;
  
  return {
    totalTiles,
    estimatedTimeSeconds,
    estimatedTimeMinutes: Math.ceil(estimatedTimeSeconds / 60),
    estimatedSizeMB: Math.round(estimatedSizeMB),
    estimatedSizeGB: (estimatedSizeMB / 1024).toFixed(2),
    maxZoom,
    coverage: {
      latRange: latRange.toFixed(2),
      lngRange: lngRange.toFixed(2)
    }
  };
};

// Export par défaut
export default BIONIC_VECTOR_TILES_CANADA;
