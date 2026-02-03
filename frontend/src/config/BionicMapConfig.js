/**
 * BionicMapConfig.js
 * 
 * Configuration de la carte BIONIC™ optimisée pour l'analyse faunique
 * Architecture multi-couches avec scoring intégré
 * 
 * Structure:
 * - base_map: Mapbox Terrain + Hydrography (vector tiles .pbf)
 * - layers: geology, hydrology, ecoforest, wildlife_score
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION BASE MAP
// ═══════════════════════════════════════════════════════════════
export const BIONIC_BASE_MAP = {
  source: 'Mapbox Terrain + Hydrography',
  format: 'vector_tiles',
  extension: '.pbf',
  styles: {
    terrain: 'mapbox://styles/mapbox/outdoors-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
    dark: 'mapbox://styles/mapbox/dark-v11'
  },
  // URLs de fallback si Mapbox n'est pas disponible
  fallback_urls: [
    'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}'
  ]
};

// ═══════════════════════════════════════════════════════════════
// COUCHE 1: GÉOLOGIE
// ═══════════════════════════════════════════════════════════════
export const BIONIC_LAYER_GEOLOGY = {
  id: 'geology',
  name: 'Géologie',
  source: 'RNCan + USGS',
  format: 'vector_tiles',
  style: {
    type: 'semi-transparent polygons',
    fillOpacity: 0.35,
    strokeWidth: 0.5,
    strokeColor: '#666666'
  },
  layers: [
    {
      id: 'bedrock',
      name: 'Socle rocheux',
      source_url: 'https://maps.geological-survey.ca/arcgis/rest/services/geology/geology_en/MapServer/tile/{z}/{y}/{x}',
      legend: [
        { color: '#8B4513', label: 'Roches sédimentaires' },
        { color: '#696969', label: 'Roches ignées' },
        { color: '#708090', label: 'Roches métamorphiques' },
        { color: '#D2691E', label: 'Dépôts quaternaires' }
      ]
    },
    {
      id: 'surficial',
      name: 'Dépôts de surface',
      source_url: 'https://maps.geological-survey.ca/arcgis/rest/services/surficial/surficial_en/MapServer/tile/{z}/{y}/{x}',
      legend: [
        { color: '#F5DEB3', label: 'Till glaciaire' },
        { color: '#DEB887', label: 'Dépôts fluvioglaciaires' },
        { color: '#D2B48C', label: 'Argiles marines' },
        { color: '#BC8F8F', label: 'Sables éoliens' }
      ]
    }
  ],
  relevance_hunting: 'Influence la végétation, le drainage et les corridors de déplacement du gibier'
};

// ═══════════════════════════════════════════════════════════════
// COUCHE 2: HYDROLOGIE
// ═══════════════════════════════════════════════════════════════
export const BIONIC_LAYER_HYDROLOGY = {
  id: 'hydrology',
  name: 'Hydrologie',
  source: 'RNCan Drainage + ZECs',
  format: 'vector_tiles',
  style: {
    type: 'blue lines + buffer zones',
    lineColor: '#1E90FF',
    lineWidth: 2,
    bufferColor: 'rgba(30, 144, 255, 0.15)',
    bufferRadius: 50 // mètres
  },
  layers: [
    {
      id: 'rivers_major',
      name: 'Rivières principales',
      minWidth: 3,
      color: '#0066CC',
      buffer: 100
    },
    {
      id: 'rivers_secondary',
      name: 'Rivières secondaires',
      minWidth: 2,
      color: '#3399FF',
      buffer: 50
    },
    {
      id: 'streams',
      name: 'Ruisseaux',
      minWidth: 1,
      color: '#66B2FF',
      buffer: 25
    },
    {
      id: 'lakes',
      name: 'Lacs',
      fillColor: 'rgba(30, 144, 255, 0.5)',
      strokeColor: '#0066CC',
      strokeWidth: 1
    },
    {
      id: 'wetlands',
      name: 'Milieux humides',
      fillColor: 'rgba(0, 128, 128, 0.3)',
      strokeColor: '#008080',
      pattern: 'hatched'
    },
    {
      id: 'zec_boundaries',
      name: 'Limites ZECs',
      strokeColor: '#FF6600',
      strokeWidth: 2,
      dashArray: [10, 5]
    }
  ],
  relevance_hunting: 'Points d\'eau = zones d\'abreuvement. Corridors de déplacement pour orignal et chevreuil.'
};

// ═══════════════════════════════════════════════════════════════
// COUCHE 3: ÉCOFORESTIER
// ═══════════════════════════════════════════════════════════════
export const BIONIC_LAYER_ECOFOREST = {
  id: 'ecoforest',
  name: 'Carte écoforestière',
  source: 'MFFP Québec',
  format: 'raster_tiles',
  style: {
    type: 'green gradient',
    opacity: 0.6
  },
  wms_config: {
    base_url: 'https://servicescarto.mffp.gouv.qc.ca/pes/services/Cartes',
    service: 'WMS',
    version: '1.3.0',
    layers: [
      'CARTE_ECO_QC_WMS'
    ],
    format: 'image/png',
    transparent: true
  },
  sublayers: [
    {
      id: 'peuplements',
      name: 'Peuplements forestiers',
      icon: '🌲',
      legend: [
        { color: '#006400', label: 'Résineux (>75%)' },
        { color: '#228B22', label: 'Mélangés à résineux' },
        { color: '#90EE90', label: 'Mélangés à feuillus' },
        { color: '#FFD700', label: 'Feuillus (>75%)' }
      ]
    },
    {
      id: 'essences',
      name: 'Essences principales',
      icon: '🍁',
      legend: [
        { color: '#006400', label: 'Épinette noire (EPN)' },
        { color: '#228B22', label: 'Sapin baumier (SAB)' },
        { color: '#8B4513', label: 'Bouleau jaune (BOJ)' },
        { color: '#DAA520', label: 'Érable à sucre (ERS)' }
      ]
    },
    {
      id: 'age_classes',
      name: 'Classes d\'âge',
      icon: '📅',
      legend: [
        { color: '#90EE90', label: 'Jeune (10-30 ans)' },
        { color: '#228B22', label: 'Jeune (30-50 ans)' },
        { color: '#006400', label: 'Mature (50-90 ans)' },
        { color: '#004400', label: 'Vieille forêt (90+ ans)' }
      ]
    },
    {
      id: 'density',
      name: 'Densité du couvert',
      icon: '📊',
      legend: [
        { color: '#006400', label: 'Dense (>80%)' },
        { color: '#228B22', label: 'Moyenne (60-80%)' },
        { color: '#90EE90', label: 'Claire (40-60%)' },
        { color: '#F0E68C', label: 'Très claire (<40%)' }
      ]
    }
  ],
  relevance_hunting: 'Type de forêt = habitats préférentiels. Âge = qualité de la nourriture. Densité = couvert de protection.'
};

// ═══════════════════════════════════════════════════════════════
// COUCHE 4: SCORE FAUNIQUE BIONIC™
// ═══════════════════════════════════════════════════════════════
export const BIONIC_LAYER_WILDLIFE_SCORE = {
  id: 'wildlife_score',
  name: 'Score faunique BIONIC™',
  source: 'BIONIC™ scoring engine',
  format: 'GeoJSON',
  style: {
    type: 'heatmap + icons',
    heatmap: {
      radius: 25,
      blur: 15,
      maxZoom: 14,
      gradient: {
        0.0: 'rgba(0, 0, 255, 0)',
        0.2: 'rgba(0, 255, 255, 0.5)',
        0.4: 'rgba(0, 255, 0, 0.6)',
        0.6: 'rgba(255, 255, 0, 0.7)',
        0.8: 'rgba(255, 165, 0, 0.8)',
        1.0: 'rgba(255, 0, 0, 0.9)'
      }
    },
    icons: {
      high_score: '🎯',
      medium_score: '🔶',
      low_score: '🔸',
      hotspot: '🔥'
    }
  },
  scoring_modules: [
    {
      id: 'habitat',
      name: 'Habitat optimal',
      weight: 0.20,
      icon: '🏠',
      factors: ['cover_type', 'food_availability', 'shelter_quality']
    },
    {
      id: 'rut',
      name: 'Zones de rut',
      weight: 0.15,
      icon: '💕',
      factors: ['terrain_openness', 'proximity_water', 'historical_sightings']
    },
    {
      id: 'salines',
      name: 'Salines naturelles',
      weight: 0.15,
      icon: '🧂',
      factors: ['mineral_deposits', 'soil_type', 'accessibility']
    },
    {
      id: 'affuts',
      name: 'Points d\'affût',
      weight: 0.20,
      icon: '🎯',
      factors: ['visibility', 'wind_patterns', 'approach_routes']
    },
    {
      id: 'trajets',
      name: 'Trajets fauniques',
      weight: 0.15,
      icon: '🛤️',
      factors: ['terrain_corridors', 'water_crossings', 'historical_tracks']
    },
    {
      id: 'peuplements',
      name: 'Peuplements favorables',
      weight: 0.15,
      icon: '🌲',
      factors: ['forest_type', 'age_class', 'disturbance_history']
    }
  ],
  species_profiles: {
    ORIGNAL: {
      name: 'Orignal',
      icon: '🦌',
      preferred_habitats: ['mixed_forest', 'wetland_edge', 'young_regeneration'],
      seasonal_patterns: {
        spring: 'wetlands',
        summer: 'highlands',
        fall_rut: 'openings',
        winter: 'dense_cover'
      }
    },
    CHEVREUIL: {
      name: 'Chevreuil',
      icon: '🦌',
      preferred_habitats: ['deciduous_edge', 'agricultural_fringe', 'young_forest'],
      seasonal_patterns: {
        spring: 'south_slopes',
        summer: 'fields_edge',
        fall_rut: 'scrubland',
        winter: 'conifer_yards'
      }
    },
    OURS_NOIR: {
      name: 'Ours noir',
      icon: '🐻',
      preferred_habitats: ['dense_forest', 'berry_patches', 'riparian'],
      seasonal_patterns: {
        spring: 'south_slopes',
        summer: 'berry_areas',
        fall: 'oak_beech_stands',
        winter: 'den_sites'
      }
    },
    DINDON: {
      name: 'Dindon sauvage',
      icon: '🦃',
      preferred_habitats: ['oak_forest', 'field_edge', 'roost_trees'],
      seasonal_patterns: {
        spring: 'open_areas',
        summer: 'mixed_forest',
        fall: 'mast_areas',
        winter: 'roost_sites'
      }
    }
  },
  relevance_hunting: 'Score intégré = probabilité de présence. Heatmap = concentration. Icônes = points prioritaires.'
};

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION COMPLÈTE CARTE BIONIC™
// ═══════════════════════════════════════════════════════════════
export const BIONIC_MAP_CONFIG = {
  id: 'bionic_map',
  name: 'Carte BIONIC™',
  version: '1.0.0',
  description: 'Carte multi-couches optimisée pour l\'analyse faunique et la chasse',
  
  base_map: BIONIC_BASE_MAP,
  
  layers: [
    {
      ...BIONIC_LAYER_GEOLOGY,
      order: 1,
      defaultEnabled: false,
      defaultOpacity: 0.35
    },
    {
      ...BIONIC_LAYER_HYDROLOGY,
      order: 2,
      defaultEnabled: true,
      defaultOpacity: 0.7
    },
    {
      ...BIONIC_LAYER_ECOFOREST,
      order: 3,
      defaultEnabled: true,
      defaultOpacity: 0.6
    },
    {
      ...BIONIC_LAYER_WILDLIFE_SCORE,
      order: 4,
      defaultEnabled: true,
      defaultOpacity: 0.8
    }
  ],
  
  // Contrôles de carte
  controls: {
    zoom: { position: 'topright', min: 5, max: 18 },
    scale: { position: 'bottomleft', metric: true, imperial: false },
    layers: { position: 'topright', collapsed: true },
    legend: { position: 'bottomright', collapsed: false }
  },
  
  // Interactions
  interactions: {
    click: 'show_details',
    hover: 'highlight',
    rightClick: 'context_menu'
  }
};

/**
 * Retourne la configuration de couche par ID
 * @param {string} layerId - ID de la couche
 * @returns {Object|null} Configuration de la couche
 */
export const getBionicLayerConfig = (layerId) => {
  const layers = {
    geology: BIONIC_LAYER_GEOLOGY,
    hydrology: BIONIC_LAYER_HYDROLOGY,
    ecoforest: BIONIC_LAYER_ECOFOREST,
    wildlife_score: BIONIC_LAYER_WILDLIFE_SCORE
  };
  return layers[layerId] || null;
};

/**
 * Retourne les modules de scoring pour une espèce donnée
 * @param {string} speciesId - ID de l'espèce (ORIGNAL, CHEVREUIL, etc.)
 * @returns {Object} Profil de l'espèce avec pondérations
 */
export const getSpeciesScoringProfile = (speciesId) => {
  return BIONIC_LAYER_WILDLIFE_SCORE.species_profiles[speciesId] || 
         BIONIC_LAYER_WILDLIFE_SCORE.species_profiles.ORIGNAL;
};

// ═══════════════════════════════════════════════════════════════
// INTÉGRATION BIONIC_VECTOR_TILES_CANADA
// Pipeline de tuiles vectorielles pour le Canada
// ═══════════════════════════════════════════════════════════════

import BIONIC_VECTOR_TILES_CANADA, {
  getZoomConfig,
  getVisibleLayersForZoom,
  getSimplificationParams,
  getTileUrl,
  isLayerVisibleAtZoom,
  getLayerStyle,
  isWithinCanadaCoverage,
  estimateProcessingStats,
  ZOOM_LEVELS_CONFIG,
  OUTPUT_CONFIG
} from '../services/BionicVectorTilesCanada';

/**
 * Configuration des tuiles vectorielles Canada pour la carte BIONIC™
 */
export const BIONIC_CANADA_TILES_CONFIG = {
  // Référence au pipeline complet
  pipeline: BIONIC_VECTOR_TILES_CANADA,
  
  // URL de base pour les tuiles vectorielles
  tileUrl: OUTPUT_CONFIG.cdn_distribution.base_url,
  fallbackUrl: OUTPUT_CONFIG.cdn_distribution.fallback_url,
  
  // Format des tuiles
  format: OUTPUT_CONFIG.format,
  tileSize: OUTPUT_CONFIG.tile_size,
  
  // Configuration de zoom
  zoomLevels: ZOOM_LEVELS_CONFIG,
  minZoom: 0,
  maxZoom: 18,
  
  // Couverture géographique
  coverage: BIONIC_VECTOR_TILES_CANADA.coverage,
  
  // Couches de données disponibles
  dataLayers: Object.keys(BIONIC_VECTOR_TILES_CANADA.data_layers),
  
  // Méthodes utilitaires exposées
  utils: {
    getZoomConfig,
    getVisibleLayersForZoom,
    getSimplificationParams,
    getTileUrl,
    isLayerVisibleAtZoom,
    getLayerStyle,
    isWithinCanadaCoverage,
    estimateProcessingStats
  }
};

/**
 * Source de tuiles vectorielles pour Leaflet/Mapbox GL
 * Configuration prête à l'emploi pour l'intégration carte
 */
export const BIONIC_VECTOR_TILE_SOURCE = {
  type: 'vector',
  tiles: [OUTPUT_CONFIG.cdn_distribution.base_url],
  minzoom: 0,
  maxzoom: 18,
  bounds: BIONIC_VECTOR_TILES_CANADA.coverage.bounds,
  attribution: '&copy; BIONIC™ | RNCan | StatCan | OSM'
};

/**
 * Styles de rendu pour les couches vectorielles
 * Compatible avec Mapbox GL Style Specification
 */
export const BIONIC_VECTOR_LAYER_STYLES = {
  // Style pour les routes
  roads: {
    'road-autoroute': {
      type: 'line',
      source: 'bionic-canada',
      'source-layer': 'roads',
      filter: ['==', 'class', 1],
      paint: {
        'line-color': '#E74C3C',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1, 14, 4]
      }
    },
    'road-nationale': {
      type: 'line',
      source: 'bionic-canada',
      'source-layer': 'roads',
      filter: ['==', 'class', 2],
      paint: {
        'line-color': '#E67E22',
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 14, 3]
      }
    }
  },
  
  // Style pour l'hydrologie
  hydrology: {
    'water-rivers': {
      type: 'line',
      source: 'bionic-canada',
      'source-layer': 'hydrology',
      filter: ['==', 'type', 'river'],
      paint: {
        'line-color': '#1E90FF',
        'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 14, 3]
      }
    },
    'water-lakes': {
      type: 'fill',
      source: 'bionic-canada',
      'source-layer': 'hydrology',
      filter: ['==', 'type', 'lake'],
      paint: {
        'fill-color': 'rgba(30, 144, 255, 0.5)',
        'fill-outline-color': '#0066CC'
      }
    }
  },
  
  // Style pour les zones administratives
  administrative: {
    'admin-provinces': {
      type: 'line',
      source: 'bionic-canada',
      'source-layer': 'administrative',
      filter: ['==', 'type', 'province'],
      paint: {
        'line-color': '#333333',
        'line-width': 2
      }
    },
    'admin-zecs': {
      type: 'fill',
      source: 'bionic-canada',
      'source-layer': 'administrative',
      filter: ['==', 'type', 'zec'],
      paint: {
        'fill-color': 'rgba(255, 102, 0, 0.1)',
        'fill-outline-color': '#FF6600'
      }
    }
  },
  
  // Style pour le score faunique BIONIC™
  wildlife: {
    'bionic-heatmap': {
      type: 'heatmap',
      source: 'bionic-canada',
      'source-layer': 'wildlife_score',
      paint: {
        'heatmap-weight': ['get', 'score'],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 14, 3],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 14, 25],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0, 0, 255, 0)',
          0.2, 'rgba(0, 255, 255, 0.5)',
          0.4, 'rgba(0, 255, 0, 0.6)',
          0.6, 'rgba(255, 255, 0, 0.7)',
          0.8, 'rgba(255, 165, 0, 0.8)',
          1, 'rgba(255, 0, 0, 0.9)'
        ]
      }
    }
  }
};

/**
 * Génère un style complet pour MapboxGL basé sur le pipeline BIONIC
 * @param {Object} options - Options de style
 * @returns {Object} Style MapboxGL complet
 */
export const generateBionicMapStyle = (options = {}) => {
  const {
    showRoads = true,
    showHydrology = true,
    showAdministrative = true,
    showWildlife = true,
    baseStyle = 'outdoors-v12'
  } = options;
  
  const layers = [];
  
  if (showRoads) {
    layers.push(...Object.values(BIONIC_VECTOR_LAYER_STYLES.roads));
  }
  if (showHydrology) {
    layers.push(...Object.values(BIONIC_VECTOR_LAYER_STYLES.hydrology));
  }
  if (showAdministrative) {
    layers.push(...Object.values(BIONIC_VECTOR_LAYER_STYLES.administrative));
  }
  if (showWildlife) {
    layers.push(...Object.values(BIONIC_VECTOR_LAYER_STYLES.wildlife));
  }
  
  return {
    version: 8,
    name: 'BIONIC Canada Vector Tiles',
    sources: {
      'bionic-canada': BIONIC_VECTOR_TILE_SOURCE
    },
    layers
  };
};

// Re-export des utilitaires du pipeline
export {
  getZoomConfig,
  getVisibleLayersForZoom,
  getSimplificationParams,
  getTileUrl,
  isLayerVisibleAtZoom,
  isWithinCanadaCoverage,
  estimateProcessingStats,
  BIONIC_VECTOR_TILES_CANADA
};

export default BIONIC_MAP_CONFIG;
