/**
 * QuebecOfficialWMSService.js
 * 
 * Service d'intégration des données officielles du Québec
 * Sources: MFFP/MRNF - Données Québec
 * 
 * COUCHES INTÉGRÉES:
 * 1. Carte écoforestière à jour (peuplements forestiers)
 * 2. Carte dendrométrique LiDAR (hauteur/densité arbres)
 * 3. Indice d'humidité topographique (TWI - milieux humides)
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION WMS OFFICIELLE QUÉBEC
// ═══════════════════════════════════════════════════════════════

/**
 * URL de base du service WMS MFFP
 * Toutes les couches écoforestières sont sur ce même endpoint
 */
export const QUEBEC_WMS_BASE_URL = 'https://geoegl.msp.gouv.qc.ca/ws/mffpecofor.fcgi';

/**
 * Configuration des couches WMS disponibles
 */
export const QUEBEC_WMS_LAYERS = {
  // ─────────────────────────────────────────────────────────────
  // 1. CARTE ÉCOFORESTIÈRE À JOUR
  // ─────────────────────────────────────────────────────────────
  carte_ecoforestiere: {
    id: 'carte_ecoforestiere',
    name: 'Carte Écoforestière à jour',
    description: 'Peuplements forestiers avec perturbations récentes',
    wmsLayer: 'CARTE_ECOFOR_MAJ',
    format: 'image/png',
    transparent: true,
    opacity: 0.75,
    minZoom: 8,
    maxZoom: 18,
    attribution: '© MFFP Québec - Inventaire écoforestier',
    source: 'https://www.donneesquebec.ca/recherche/fr/dataset/carte-ecoforestiere-avec-perturbations',
    icon: '🌲',
    color: '#00ff66',
    category: 'ecoforestier',
    priority: 1
  },
  
  peuplements: {
    id: 'peuplements',
    name: 'Peuplements forestiers',
    description: 'Types de peuplements et essences dominantes',
    wmsLayer: 'PEE_MAJ_PROV',
    format: 'image/png',
    transparent: true,
    opacity: 0.7,
    minZoom: 10,
    maxZoom: 18,
    attribution: '© MFFP Québec',
    icon: '🌳',
    color: '#22c55e',
    category: 'ecoforestier',
    priority: 2
  },
  
  perturbations: {
    id: 'perturbations',
    name: 'Perturbations récentes',
    description: 'Coupes, feux, épidémies, chablis',
    wmsLayer: 'PERTURB_MAJ',
    format: 'image/png',
    transparent: true,
    opacity: 0.65,
    minZoom: 8,
    maxZoom: 18,
    attribution: '© MFFP Québec',
    icon: '⚠️',
    color: '#ff6b6b',
    category: 'perturbations',
    priority: 3
  },
  
  // ─────────────────────────────────────────────────────────────
  // 2. CARTE DENDROMÉTRIQUE LIDAR
  // ─────────────────────────────────────────────────────────────
  lidar_dendrometrique: {
    id: 'lidar_dendrometrique',
    name: 'Dendrométrie LiDAR',
    description: 'Volume, hauteur et densité des arbres (LiDAR)',
    wmsLayer: 'DENDRO_LIDAR',
    format: 'image/png',
    transparent: true,
    opacity: 0.7,
    minZoom: 10,
    maxZoom: 18,
    attribution: '© MFFP Québec - LiDAR',
    source: 'https://www.donneesquebec.ca/recherche/dataset/carte_dendrometrique_lidar',
    icon: '📊',
    color: '#8b5cf6',
    category: 'lidar',
    priority: 1
  },
  
  lidar_disponibilite: {
    id: 'lidar_disponibilite',
    name: 'Disponibilité LiDAR',
    description: 'Zones couvertes par LiDAR',
    wmsLayer: 'lidar_dendro_dispo',
    format: 'image/png',
    transparent: true,
    opacity: 0.5,
    minZoom: 5,
    maxZoom: 18,
    attribution: '© MFFP Québec',
    icon: '🗺️',
    color: '#3b82f6',
    category: 'lidar',
    priority: 2
  },
  
  // ─────────────────────────────────────────────────────────────
  // 3. INDICE D'HUMIDITÉ TOPOGRAPHIQUE (TWI)
  // ─────────────────────────────────────────────────────────────
  humidite_twi: {
    id: 'humidite_twi',
    name: 'Indice d\'humidité (TWI)',
    description: 'Potentiel d\'accumulation d\'eau - milieux humides',
    wmsLayer: 'TWI_LIDAR',
    format: 'image/png',
    transparent: true,
    opacity: 0.6,
    minZoom: 10,
    maxZoom: 18,
    attribution: '© MFFP Québec - LiDAR',
    source: 'https://www.donneesquebec.ca/recherche/dataset/indice-humidite-topographique-issu-du-lidar',
    icon: '💧',
    color: '#00d4ff',
    category: 'hydrologie',
    priority: 1
  },
  
  ecotones_riverains: {
    id: 'ecotones_riverains',
    name: 'Écotones riverains',
    description: 'Zones de transition terre-eau',
    wmsLayer: 'ECOTONE_RIVERAIN',
    format: 'image/png',
    transparent: true,
    opacity: 0.65,
    minZoom: 10,
    maxZoom: 18,
    attribution: '© MFFP Québec - LiDAR',
    icon: '🏞️',
    color: '#06b6d4',
    category: 'hydrologie',
    priority: 2
  },
  
  lits_ecoulement: {
    id: 'lits_ecoulement',
    name: 'Lits d\'écoulement potentiels',
    description: 'Cours d\'eau potentiels détectés par LiDAR',
    wmsLayer: 'LIT_ECOULEMENT_POTENTIEL',
    format: 'image/png',
    transparent: true,
    opacity: 0.7,
    minZoom: 10,
    maxZoom: 18,
    attribution: '© MFFP Québec - LiDAR',
    icon: '🌊',
    color: '#0ea5e9',
    category: 'hydrologie',
    priority: 3
  }
};

/**
 * Groupes de couches pour l'interface utilisateur
 */
export const QUEBEC_WMS_CATEGORIES = {
  ecoforestier: {
    id: 'ecoforestier',
    name: 'Écoforestier',
    icon: '🌲',
    description: 'Peuplements et essences forestières',
    color: '#22c55e',
    layers: ['carte_ecoforestiere', 'peuplements', 'perturbations']
  },
  lidar: {
    id: 'lidar',
    name: 'LiDAR Dendrométrique',
    icon: '📊',
    description: 'Hauteur, volume et densité (LiDAR)',
    color: '#8b5cf6',
    layers: ['lidar_dendrometrique', 'lidar_disponibilite']
  },
  hydrologie: {
    id: 'hydrologie',
    name: 'Hydrologie',
    icon: '💧',
    description: 'Humidité, cours d\'eau, milieux humides',
    color: '#00d4ff',
    layers: ['humidite_twi', 'ecotones_riverains', 'lits_ecoulement']
  }
};

/**
 * Configuration par défaut pour les couches haute priorité
 */
export const DEFAULT_HIGH_PRIORITY_LAYERS = [
  'carte_ecoforestiere',  // Peuplements forestiers
  'lidar_dendrometrique', // Hauteur/densité arbres
  'humidite_twi'          // Milieux humides
];

// ═══════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Construit l'URL WMS pour une couche spécifique
 */
export const buildWMSUrl = (layerId) => {
  const layer = QUEBEC_WMS_LAYERS[layerId];
  if (!layer) return null;
  
  return QUEBEC_WMS_BASE_URL;
};

/**
 * Retourne les paramètres WMS pour une couche
 */
export const getWMSParams = (layerId) => {
  const layer = QUEBEC_WMS_LAYERS[layerId];
  if (!layer) return null;
  
  return {
    layers: layer.wmsLayer,
    format: layer.format || 'image/png',
    transparent: layer.transparent !== false,
    version: '1.3.0',
    crs: 'EPSG:4326'
  };
};

/**
 * Retourne les couches d'une catégorie
 */
export const getLayersByCategory = (categoryId) => {
  const category = QUEBEC_WMS_CATEGORIES[categoryId];
  if (!category) return [];
  
  return category.layers.map(layerId => QUEBEC_WMS_LAYERS[layerId]).filter(Boolean);
};

/**
 * Retourne toutes les couches triées par priorité
 */
export const getAllLayersSorted = () => {
  return Object.values(QUEBEC_WMS_LAYERS)
    .sort((a, b) => a.priority - b.priority);
};

/**
 * Vérifie si une couche est visible au zoom actuel
 */
export const isLayerVisibleAtZoom = (layerId, zoom) => {
  const layer = QUEBEC_WMS_LAYERS[layerId];
  if (!layer) return false;
  
  return zoom >= (layer.minZoom || 0) && zoom <= (layer.maxZoom || 22);
};

/**
 * Configuration pour React-Leaflet WMSTileLayer
 */
export const getReactLeafletWMSConfig = (layerId) => {
  const layer = QUEBEC_WMS_LAYERS[layerId];
  if (!layer) return null;
  
  return {
    url: QUEBEC_WMS_BASE_URL,
    params: {
      layers: layer.wmsLayer,
      format: layer.format || 'image/png',
      transparent: true,
      version: '1.3.0'
    },
    opacity: layer.opacity || 0.7,
    attribution: layer.attribution,
    zIndex: 400 + (layer.priority || 0)
  };
};

// ═══════════════════════════════════════════════════════════════
// STYLES BIONIC POUR LES COUCHES
// ═══════════════════════════════════════════════════════════════

/**
 * Filtres CSS pour améliorer la visibilité des couches WMS
 */
export const BIONIC_WMS_FILTERS = {
  ecoforestier: {
    filter: 'saturate(1.6) contrast(1.2) brightness(1.05)',
    className: 'bionic-wms-ecoforestier'
  },
  lidar: {
    filter: 'saturate(1.4) contrast(1.3)',
    className: 'bionic-wms-lidar'
  },
  hydrologie: {
    filter: 'saturate(2) brightness(1.1)',
    className: 'bionic-wms-hydrologie'
  }
};

/**
 * Retourne le filtre CSS pour une couche
 */
export const getBionicFilter = (layerId) => {
  const layer = QUEBEC_WMS_LAYERS[layerId];
  if (!layer) return BIONIC_WMS_FILTERS.ecoforestier;
  
  return BIONIC_WMS_FILTERS[layer.category] || BIONIC_WMS_FILTERS.ecoforestier;
};

// ═══════════════════════════════════════════════════════════════
// EXPORT PAR DÉFAUT
// ═══════════════════════════════════════════════════════════════

export default {
  QUEBEC_WMS_BASE_URL,
  QUEBEC_WMS_LAYERS,
  QUEBEC_WMS_CATEGORIES,
  DEFAULT_HIGH_PRIORITY_LAYERS,
  buildWMSUrl,
  getWMSParams,
  getLayersByCategory,
  getAllLayersSorted,
  isLayerVisibleAtZoom,
  getReactLeafletWMSConfig,
  BIONIC_WMS_FILTERS,
  getBionicFilter
};
