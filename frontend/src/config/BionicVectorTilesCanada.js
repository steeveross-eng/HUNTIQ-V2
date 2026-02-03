/**
 * BionicVectorTilesCanada.js
 * 
 * Pipeline BIONIC™ pour la génération de tuiles vectorielles maîtresses (Canada)
 * Intègre topo, géologie, hydrologie, écoforestier, occupation du sol et urbain
 * Optimisé pour Mapbox GL JS / Leaflet
 * 
 * Version: 1.0.0
 */

// ─────────────────────────────────────────────
// 1. INPUTS — Couches sources Canada
// ─────────────────────────────────────────────
export const BIONIC_VT_INPUTS = {
  layers: {
    // Topographie CanVec
    TOPO_CANVEC: {
      id: 'TOPO_CAN',
      geometry_types: ['line', 'polygon'],
      attributes: ['elev', 'type'],
      source: 'Ressources naturelles Canada - CanVec',
      url: 'https://maps.canada.ca/arcgis/rest/services/CanVec/CanVec_en/MapServer'
    },
    
    // Géologie Canada
    GEO_CANADA: {
      id: 'GEO_CAN',
      geometry_types: ['polygon'],
      attributes: ['lithology', 'soil_type', 'unit'],
      source: 'Commission géologique du Canada',
      url: 'https://maps.geological-survey.ca/arcgis/rest/services/geology/geology_en/MapServer'
    },
    
    // Hydrologie - Lacs
    HYDRO_LAKES: {
      id: 'HYDRO_LAKES',
      geometry_types: ['polygon'],
      attributes: ['name', 'type'],
      source: 'RNCan - Réseau hydrographique national'
    },
    
    // Hydrologie - Rivières
    HYDRO_RIVERS: {
      id: 'HYDRO_RIVERS',
      geometry_types: ['line'],
      attributes: ['name', 'order'],
      source: 'RNCan - Réseau hydrographique national'
    },
    
    // Hydrologie - Milieux humides
    HYDRO_WETLANDS: {
      id: 'HYDRO_WET',
      geometry_types: ['polygon'],
      attributes: ['type'],
      source: 'Inventaire canadien des terres humides'
    },
    
    // Hydrologie - Masque raster
    HYDRO_RASTER_MASK: {
      id: 'HYDRO_RASTER',
      format: 'raster',
      source: 'Données satellitaires compilées'
    },
    
    // Écoforestier Canada
    ECO_FOREST: {
      id: 'ECO_CAN',
      geometry_types: ['polygon'],
      attributes: ['species', 'age_class', 'canopy'],
      source: 'Inventaire forestier national du Canada'
    },
    
    // Occupation du sol
    LANDUSE_CAN: {
      id: 'LANDUSE_CAN',
      geometry_types: ['polygon'],
      attributes: ['landuse', 'intensity'],
      source: 'Agriculture et Agroalimentaire Canada'
    },
    
    // Zones urbaines
    URBAIN_VILLES: {
      id: 'U_VILLES',
      geometry_types: ['polygon'],
      attributes: ['name', 'pop_class'],
      source: 'Statistique Canada - Limites des centres de population'
    },
    URBAIN_VILLAGES: {
      id: 'U_VILLAGES',
      geometry_types: ['polygon'],
      attributes: ['name', 'pop_class'],
      source: 'Statistique Canada'
    },
    URBAIN_DENSE: {
      id: 'U_DENSE',
      geometry_types: ['polygon'],
      attributes: ['density_class'],
      source: 'Statistique Canada - Îlots de diffusion'
    },
    URBAIN_MUNICIPAL: {
      id: 'U_MUNICIPAL',
      geometry_types: ['polygon'],
      attributes: ['name', 'admin_level'],
      source: 'Limites administratives municipales'
    }
  }
};

// ─────────────────────────────────────────────
// 2. PREPROCESS — Normalisation & harmonisation
// ─────────────────────────────────────────────
export const BIONIC_VT_PREPROCESS = {
  // 2.1 — Topographie : simplification multi-échelle
  topography: [
    { id: 'TOPO_SIMPL_Z6', type: 'geometry_simplify', input_layer: 'TOPO_CAN', tolerance: 100, output_layer: 'TOPO_Z6' },
    { id: 'TOPO_SIMPL_Z10', type: 'geometry_simplify', input_layer: 'TOPO_CAN', tolerance: 30, output_layer: 'TOPO_Z10' },
    { id: 'TOPO_SIMPL_Z14', type: 'geometry_simplify', input_layer: 'TOPO_CAN', tolerance: 5, output_layer: 'TOPO_Z14' }
  ],
  
  // 2.2 — Géologie : nettoyage + simplification
  geology: [
    { id: 'GEO_CLEAN', type: 'geometry_make_valid', input_layer: 'GEO_CAN', output_layer: 'GEO_VALID' },
    { id: 'GEO_SIMPL_Z6', type: 'geometry_simplify', input_layer: 'GEO_VALID', tolerance: 150, output_layer: 'GEO_Z6' },
    { id: 'GEO_SIMPL_Z10', type: 'geometry_simplify', input_layer: 'GEO_VALID', tolerance: 50, output_layer: 'GEO_Z10' },
    { id: 'GEO_SIMPL_Z14', type: 'geometry_simplify', input_layer: 'GEO_VALID', tolerance: 10, output_layer: 'GEO_Z14' }
  ],
  
  // 2.3 — Hydrologie : union + masque
  hydrology: [
    { id: 'HYDRO_RIVERS_BUFFER', type: 'geometry_buffer', input_layer: 'HYDRO_RIVERS', distance_meters: 3, output_layer: 'HYDRO_RIVERS_BUF' },
    { id: 'HYDRO_VECTOR_UNION', type: 'geometry_union', input_layers: ['HYDRO_LAKES', 'HYDRO_RIVERS_BUF', 'HYDRO_WET'], output_layer: 'HYDRO_VEC' },
    { id: 'HYDRO_FULL', type: 'geometry_union', input_layers: ['HYDRO_VEC', 'HYDRO_RASTER'], output_layer: 'HYDRO_FULL' },
    { id: 'HYDRO_SIMPL_Z6', type: 'geometry_simplify', input_layer: 'HYDRO_FULL', tolerance: 80, output_layer: 'HYDRO_Z6' },
    { id: 'HYDRO_SIMPL_Z10', type: 'geometry_simplify', input_layer: 'HYDRO_FULL', tolerance: 25, output_layer: 'HYDRO_Z10' },
    { id: 'HYDRO_SIMPL_Z14', type: 'geometry_simplify', input_layer: 'HYDRO_FULL', tolerance: 5, output_layer: 'HYDRO_Z14' }
  ],
  
  // 2.4 — Écoforestier : nettoyage + simplification
  ecoforest: [
    { id: 'ECO_CLEAN', type: 'geometry_make_valid', input_layer: 'ECO_CAN', output_layer: 'ECO_VALID' },
    { id: 'ECO_SIMPL_Z6', type: 'geometry_simplify', input_layer: 'ECO_VALID', tolerance: 150, output_layer: 'ECO_Z6' },
    { id: 'ECO_SIMPL_Z10', type: 'geometry_simplify', input_layer: 'ECO_VALID', tolerance: 50, output_layer: 'ECO_Z10' },
    { id: 'ECO_SIMPL_Z14', type: 'geometry_simplify', input_layer: 'ECO_VALID', tolerance: 10, output_layer: 'ECO_Z14' }
  ],
  
  // 2.5 — Occupation du sol : simplification
  landuse: [
    { id: 'LANDUSE_CLEAN', type: 'geometry_make_valid', input_layer: 'LANDUSE_CAN', output_layer: 'LANDUSE_VALID' },
    { id: 'LANDUSE_SIMPL_Z6', type: 'geometry_simplify', input_layer: 'LANDUSE_VALID', tolerance: 150, output_layer: 'LANDUSE_Z6' },
    { id: 'LANDUSE_SIMPL_Z10', type: 'geometry_simplify', input_layer: 'LANDUSE_VALID', tolerance: 50, output_layer: 'LANDUSE_Z10' },
    { id: 'LANDUSE_SIMPL_Z14', type: 'geometry_simplify', input_layer: 'LANDUSE_VALID', tolerance: 10, output_layer: 'LANDUSE_Z14' }
  ],
  
  // 2.6 — Urbain : union + simplification
  urban: [
    { id: 'URBAIN_FULL', type: 'geometry_union', input_layers: ['U_VILLES', 'U_VILLAGES', 'U_DENSE', 'U_MUNICIPAL'], output_layer: 'URBAIN_FULL' },
    { id: 'URBAIN_SIMPL_Z6', type: 'geometry_simplify', input_layer: 'URBAIN_FULL', tolerance: 150, output_layer: 'URBAIN_Z6' },
    { id: 'URBAIN_SIMPL_Z10', type: 'geometry_simplify', input_layer: 'URBAIN_FULL', tolerance: 50, output_layer: 'URBAIN_Z10' },
    { id: 'URBAIN_SIMPL_Z14', type: 'geometry_simplify', input_layer: 'URBAIN_FULL', tolerance: 10, output_layer: 'URBAIN_Z14' }
  ]
};

// ─────────────────────────────────────────────
// 3. STRUCTURATION DES COUCHES PAR NIVEAU DE ZOOM
// ─────────────────────────────────────────────
export const BIONIC_VT_SCHEMA = {
  id: 'BIONIC_VECTOR_TILES_CANADA',
  minzoom: 6,
  maxzoom: 16,
  
  // Zoom 6-8 : Vue macro (province/région)
  zoom_macro: {
    range: [6, 8],
    description: 'Vue macro - Niveau province/région',
    layers: [
      { id: 'topo_z6', source_layer: 'TOPO_Z6', attributes: ['elev', 'type'] },
      { id: 'geologie_z6', source_layer: 'GEO_Z6', attributes: ['lithology', 'soil_type', 'unit'] },
      { id: 'hydrologie_z6', source_layer: 'HYDRO_Z6', attributes: ['type'] },
      { id: 'ecoforestier_z6', source_layer: 'ECO_Z6', attributes: ['species', 'age_class'] },
      { id: 'landuse_z6', source_layer: 'LANDUSE_Z6', attributes: ['landuse', 'intensity'] },
      { id: 'urbain_z6', source_layer: 'URBAIN_Z6', attributes: ['name', 'pop_class', 'density_class'] }
    ]
  },
  
  // Zoom 9-12 : Vue intermédiaire (MRC/territoire)
  zoom_intermediate: {
    range: [9, 12],
    description: 'Vue intermédiaire - Niveau MRC/territoire',
    layers: [
      { id: 'topo_z10', source_layer: 'TOPO_Z10', attributes: ['elev', 'type'] },
      { id: 'geologie_z10', source_layer: 'GEO_Z10', attributes: ['lithology', 'soil_type', 'unit'] },
      { id: 'hydrologie_z10', source_layer: 'HYDRO_Z10', attributes: ['type'] },
      { id: 'ecoforestier_z10', source_layer: 'ECO_Z10', attributes: ['species', 'age_class', 'canopy'] },
      { id: 'landuse_z10', source_layer: 'LANDUSE_Z10', attributes: ['landuse', 'intensity'] },
      { id: 'urbain_z10', source_layer: 'URBAIN_Z10', attributes: ['name', 'pop_class', 'density_class', 'admin_level'] }
    ]
  },
  
  // Zoom 13-16 : Vue détaillée (terrain/parcelle)
  zoom_detailed: {
    range: [13, 16],
    description: 'Vue détaillée - Niveau terrain/parcelle',
    layers: [
      { id: 'topo_z14', source_layer: 'TOPO_Z14', attributes: ['elev', 'type'] },
      { id: 'geologie_z14', source_layer: 'GEO_Z14', attributes: ['lithology', 'soil_type', 'unit'] },
      { id: 'hydrologie_z14', source_layer: 'HYDRO_Z14', attributes: ['type'] },
      { id: 'ecoforestier_z14', source_layer: 'ECO_Z14', attributes: ['species', 'age_class', 'canopy'] },
      { id: 'landuse_z14', source_layer: 'LANDUSE_Z14', attributes: ['landuse', 'intensity'] },
      { id: 'urbain_z14', source_layer: 'URBAIN_Z14', attributes: ['name', 'pop_class', 'density_class', 'admin_level'] }
    ]
  }
};

// ─────────────────────────────────────────────
// 4. STYLES MAPBOX GL / LEAFLET
// ─────────────────────────────────────────────
export const BIONIC_VT_STYLES = {
  // Topographie
  topography: {
    'line-color': '#8B4513',
    'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 14, 2],
    'line-opacity': 0.7
  },
  
  // Géologie
  geology: {
    'fill-color': [
      'match', ['get', 'lithology'],
      'sedimentary', '#DEB887',
      'igneous', '#696969',
      'metamorphic', '#708090',
      'quaternary', '#D2691E',
      '#CCCCCC'
    ],
    'fill-opacity': 0.35,
    'fill-outline-color': '#666666'
  },
  
  // Hydrologie
  hydrology: {
    lakes: {
      'fill-color': 'rgba(30, 144, 255, 0.5)',
      'fill-outline-color': '#0066CC'
    },
    rivers: {
      'line-color': '#1E90FF',
      'line-width': ['interpolate', ['linear'], ['zoom'], 6, 1, 14, 3]
    },
    wetlands: {
      'fill-color': 'rgba(0, 128, 128, 0.3)',
      'fill-pattern': 'wetland-pattern'
    }
  },
  
  // Écoforestier
  ecoforest: {
    'fill-color': [
      'match', ['get', 'species'],
      'conifer', '#006400',
      'mixed_conifer', '#228B22',
      'mixed_deciduous', '#90EE90',
      'deciduous', '#FFD700',
      '#CCCCCC'
    ],
    'fill-opacity': ['interpolate', ['linear'], ['zoom'], 6, 0.4, 14, 0.7]
  },
  
  // Occupation du sol
  landuse: {
    'fill-color': [
      'match', ['get', 'landuse'],
      'agriculture', '#F5DEB3',
      'forest', '#228B22',
      'urban', '#808080',
      'water', '#1E90FF',
      'wetland', '#008080',
      '#EEEEEE'
    ],
    'fill-opacity': 0.5
  },
  
  // Zones urbaines
  urban: {
    'fill-color': [
      'match', ['get', 'density_class'],
      'high', '#4a4a4a',
      'medium', '#6a6a6a',
      'low', '#8a8a8a',
      '#aaaaaa'
    ],
    'fill-opacity': 0.6,
    'fill-outline-color': '#333333'
  }
};

// ─────────────────────────────────────────────
// 5. CONFIGURATION COMPLÈTE DU PIPELINE
// ─────────────────────────────────────────────
export const BIONIC_VECTOR_TILES_CANADA = {
  ruleset: 'BIONIC_VECTOR_TILES_CANADA',
  version: '1.0.0',
  description: `Pipeline BIONIC™ pour la génération de tuiles vectorielles maîtresses (Canada).
    Intègre topo, géologie, hydrologie, écoforestier, occupation du sol et urbain,
    optimisé pour Mapbox GL JS / Leaflet.`,
  
  inputs: BIONIC_VT_INPUTS,
  preprocess: BIONIC_VT_PREPROCESS,
  schema: BIONIC_VT_SCHEMA,
  styles: BIONIC_VT_STYLES,
  
  // Configuration de sortie
  output: {
    id: 'BIONIC_VECTOR_TILES_CANADA_FINAL',
    type: 'vector_tiles_export',
    format: 'pbf',
    minzoom: 6,
    maxzoom: 16,
    tile_size: 512,
    buffer: 64
  },
  
  // Sources de données officielles Canada
  data_sources: {
    topography: 'Ressources naturelles Canada - CanVec+',
    geology: 'Commission géologique du Canada',
    hydrology: 'Réseau hydrographique national (RHN)',
    ecoforest: 'Inventaire forestier national',
    landuse: 'Agriculture et Agroalimentaire Canada',
    urban: 'Statistique Canada - Limites géographiques'
  }
};

/**
 * Retourne les couches appropriées selon le niveau de zoom
 * @param {number} zoom - Niveau de zoom actuel
 * @returns {Array} Couches à afficher
 */
export const getLayersForZoom = (zoom) => {
  if (zoom >= 13) return BIONIC_VT_SCHEMA.zoom_detailed.layers;
  if (zoom >= 9) return BIONIC_VT_SCHEMA.zoom_intermediate.layers;
  return BIONIC_VT_SCHEMA.zoom_macro.layers;
};

/**
 * Retourne le style Mapbox GL pour une couche donnée
 * @param {string} layerType - Type de couche (topography, geology, etc.)
 * @returns {Object} Configuration de style
 */
export const getLayerStyle = (layerType) => {
  return BIONIC_VT_STYLES[layerType] || {};
};

/**
 * Génère la configuration de source pour Mapbox GL
 * @param {string} tilesetUrl - URL du tileset
 * @returns {Object} Configuration de source
 */
export const generateMapboxSource = (tilesetUrl) => {
  return {
    type: 'vector',
    tiles: [`${tilesetUrl}/{z}/{x}/{y}.pbf`],
    minzoom: BIONIC_VT_SCHEMA.minzoom,
    maxzoom: BIONIC_VT_SCHEMA.maxzoom
  };
};

export default BIONIC_VECTOR_TILES_CANADA;
