/**
 * BionicZoneStyles.js
 * 
 * Système de styles cartographiques universels pour les zones BIONIC™
 * Compatible avec : Leaflet, Mapbox GL, QGIS, ArcGIS
 * 
 * CARACTÉRISTIQUES :
 * - Cercles avec intérieur transparent
 * - Halo coloré variant selon le niveau de zoom
 * - Couleurs officielles par catégorie
 * - Export multi-format
 */

// ============================================
// COULEURS OFFICIELLES BIONIC™
// ============================================
export const BIONIC_ZONE_COLORS = {
  // Catégories principales avec couleurs officielles
  habitats_optimaux: {
    color: '#2ECC71',
    label: 'Habitats optimaux',
    labelFr: 'Habitats optimaux',
    icon: '🌲',
    iconLucide: 'TreePine'
  },
  rut_potentiel: {
    color: '#C0392B',
    label: 'Rut potentiel',
    labelFr: 'Rut potentiel',
    icon: '💕',
    iconLucide: 'Heart'
  },
  salines_potentielles: {
    color: '#3498DB',
    label: 'Salines potentielles',
    labelFr: 'Salines potentielles',
    icon: '🧂',
    iconLucide: 'Droplets'
  },
  affuts_potentiels: {
    color: '#E67E22',
    label: 'Affûts potentiels',
    labelFr: 'Affûts potentiels',
    icon: '🎯',
    iconLucide: 'Target'
  },
  trajets_chasse: {
    color: '#8E44AD',
    label: 'Trajets de chasse',
    labelFr: 'Trajets de chasse',
    icon: '🦌',
    iconLucide: 'Navigation'
  },
  peuplements_forestiers: {
    color: '#6E2C00',
    label: 'Peuplements forestiers',
    labelFr: 'Peuplements forestiers',
    icon: '🌳',
    iconLucide: 'Trees'
  },
  ensoleillement: {
    color: '#F1C40F',
    label: 'Ensoleillement',
    labelFr: 'Ensoleillement',
    icon: '☀️',
    iconLucide: 'Sun'
  },
  orientation: {
    color: '#A04000',
    label: 'Orientation',
    labelFr: 'Orientation',
    icon: '🧭',
    iconLucide: 'Compass'
  },
  hydrographie_avancee: {
    color: '#5DADE2',
    label: 'Hydrographie avancée',
    labelFr: 'Hydrographie avancée',
    icon: '💧',
    iconLucide: 'Waves'
  },
  zones_alimentation: {
    color: '#A3E635',
    label: 'Zones d\'alimentation',
    labelFr: 'Zones d\'alimentation',
    icon: '🌿',
    iconLucide: 'Leaf'
  }
};

// ============================================
// CONFIGURATION DU HALO SELON LE ZOOM
// ============================================
export const HALO_CONFIG = {
  // Zoom levels et épaisseurs correspondantes
  zoomLevels: {
    // Zoom très faible (vue régionale)
    5: { weight: 1, opacity: 0.3, dashArray: null },
    6: { weight: 1.5, opacity: 0.35, dashArray: null },
    7: { weight: 2, opacity: 0.4, dashArray: null },
    // Zoom moyen (vue locale)
    8: { weight: 2.5, opacity: 0.45, dashArray: null },
    9: { weight: 3, opacity: 0.5, dashArray: null },
    10: { weight: 4, opacity: 0.55, dashArray: null },
    11: { weight: 5, opacity: 0.6, dashArray: null },
    // Zoom élevé (vue détaillée)
    12: { weight: 6, opacity: 0.65, dashArray: null },
    13: { weight: 7, opacity: 0.7, dashArray: null },
    14: { weight: 8, opacity: 0.75, dashArray: null },
    15: { weight: 10, opacity: 0.8, dashArray: null },
    // Zoom très élevé (analyse de précision)
    16: { weight: 12, opacity: 0.85, dashArray: null },
    17: { weight: 14, opacity: 0.9, dashArray: null },
    18: { weight: 16, opacity: 0.95, dashArray: null }
  },
  
  // Fonction pour interpoler les valeurs entre niveaux de zoom
  getHaloParams: (zoom) => {
    const levels = Object.keys(HALO_CONFIG.zoomLevels).map(Number).sort((a, b) => a - b);
    
    // Trouver les niveaux encadrants
    let lowerLevel = levels[0];
    let upperLevel = levels[levels.length - 1];
    
    for (let i = 0; i < levels.length - 1; i++) {
      if (zoom >= levels[i] && zoom < levels[i + 1]) {
        lowerLevel = levels[i];
        upperLevel = levels[i + 1];
        break;
      }
    }
    
    if (zoom <= levels[0]) return HALO_CONFIG.zoomLevels[levels[0]];
    if (zoom >= levels[levels.length - 1]) return HALO_CONFIG.zoomLevels[levels[levels.length - 1]];
    
    // Interpolation linéaire
    const lower = HALO_CONFIG.zoomLevels[lowerLevel];
    const upper = HALO_CONFIG.zoomLevels[upperLevel];
    const ratio = (zoom - lowerLevel) / (upperLevel - lowerLevel);
    
    return {
      weight: lower.weight + (upper.weight - lower.weight) * ratio,
      opacity: lower.opacity + (upper.opacity - lower.opacity) * ratio,
      dashArray: null
    };
  }
};

// ============================================
// STYLES LEAFLET
// ============================================
export const getLeafletCircleStyle = (zoneType, zoom = 10, options = {}) => {
  const zoneConfig = BIONIC_ZONE_COLORS[zoneType];
  if (!zoneConfig) return null;
  
  const haloParams = HALO_CONFIG.getHaloParams(zoom);
  
  return {
    // Cercle principal - intérieur transparent
    color: zoneConfig.color,
    weight: options.weight || haloParams.weight,
    opacity: options.opacity || haloParams.opacity,
    fillColor: zoneConfig.color,
    fillOpacity: options.fillOpacity || 0, // Intérieur totalement transparent
    dashArray: options.dashArray || haloParams.dashArray,
    lineCap: 'round',
    lineJoin: 'round',
    className: `bionic-zone bionic-zone-${zoneType}`
  };
};

// Style pour le halo externe (effet de glow)
export const getLeafletHaloStyle = (zoneType, zoom = 10, options = {}) => {
  const zoneConfig = BIONIC_ZONE_COLORS[zoneType];
  if (!zoneConfig) return null;
  
  const haloParams = HALO_CONFIG.getHaloParams(zoom);
  const haloWeight = (options.weight || haloParams.weight) * 2;
  
  return {
    color: zoneConfig.color,
    weight: haloWeight,
    opacity: (options.opacity || haloParams.opacity) * 0.3, // Halo plus transparent
    fillOpacity: 0,
    lineCap: 'round',
    lineJoin: 'round',
    className: `bionic-zone-halo bionic-zone-halo-${zoneType}`
  };
};

// Fonction de création de cercle Leaflet avec halo
export const createLeafletBionicCircle = (L, center, radius, zoneType, zoom = 10) => {
  const haloStyle = getLeafletHaloStyle(zoneType, zoom);
  const mainStyle = getLeafletCircleStyle(zoneType, zoom);
  
  // Créer le groupe de couches
  const group = L.layerGroup();
  
  // Halo externe (premier, en dessous)
  if (haloStyle) {
    const haloCircle = L.circle(center, { radius: radius * 1.1, ...haloStyle });
    group.addLayer(haloCircle);
  }
  
  // Cercle principal (par dessus)
  if (mainStyle) {
    const mainCircle = L.circle(center, { radius, ...mainStyle });
    group.addLayer(mainCircle);
  }
  
  return group;
};

// ============================================
// STYLES MAPBOX GL
// ============================================
export const getMapboxGLLayerStyle = (zoneType, sourceId = 'bionic-zones') => {
  const zoneConfig = BIONIC_ZONE_COLORS[zoneType];
  if (!zoneConfig) return null;
  
  return {
    // Couche de halo (cercle externe)
    haloLayer: {
      id: `bionic-halo-${zoneType}`,
      type: 'circle',
      source: sourceId,
      filter: ['==', ['get', 'zoneType'], zoneType],
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          5, 4,
          10, 12,
          15, 40,
          18, 80
        ],
        'circle-color': zoneConfig.color,
        'circle-opacity': [
          'interpolate', ['linear'], ['zoom'],
          5, 0.15,
          10, 0.25,
          15, 0.35
        ],
        'circle-stroke-width': 0
      }
    },
    
    // Couche principale (anneau)
    mainLayer: {
      id: `bionic-zone-${zoneType}`,
      type: 'circle',
      source: sourceId,
      filter: ['==', ['get', 'zoneType'], zoneType],
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['zoom'],
          5, 3,
          10, 10,
          15, 35,
          18, 70
        ],
        'circle-color': 'transparent',
        'circle-opacity': 0,
        'circle-stroke-color': zoneConfig.color,
        'circle-stroke-width': [
          'interpolate', ['linear'], ['zoom'],
          5, 1,
          10, 3,
          15, 6,
          18, 10
        ],
        'circle-stroke-opacity': [
          'interpolate', ['linear'], ['zoom'],
          5, 0.4,
          10, 0.6,
          15, 0.8,
          18, 0.95
        ]
      }
    }
  };
};

// Configuration complète Mapbox GL pour toutes les zones
export const getMapboxGLFullConfig = (sourceId = 'bionic-zones') => {
  const layers = [];
  
  Object.keys(BIONIC_ZONE_COLORS).forEach(zoneType => {
    const style = getMapboxGLLayerStyle(zoneType, sourceId);
    if (style) {
      layers.push(style.haloLayer);
      layers.push(style.mainLayer);
    }
  });
  
  return {
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    },
    layers
  };
};

// ============================================
// STYLES QGIS (QML)
// ============================================
export const generateQGISStyle = (zoneType) => {
  const zoneConfig = BIONIC_ZONE_COLORS[zoneType];
  if (!zoneConfig) return null;
  
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };
  
  const rgb = hexToRgb(zoneConfig.color);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<qgis version="3.28" styleCategories="Symbology">
  <renderer-v2 type="singleSymbol" symbollevels="0" enableorderby="0" forceraster="0">
    <symbols>
      <symbol alpha="1" type="marker" name="0" force_rhr="0" clip_to_extent="1">
        <!-- Halo externe -->
        <layer class="SimpleMarker" pass="0" enabled="1" locked="0">
          <Option type="Map">
            <Option type="QString" name="color" value="${rgb.r},${rgb.g},${rgb.b},77"/>
            <Option type="QString" name="size" value="@zoom_dependent_size * 1.3"/>
            <Option type="QString" name="outline_style" value="no"/>
          </Option>
        </layer>
        <!-- Cercle principal avec intérieur transparent -->
        <layer class="SimpleMarker" pass="1" enabled="1" locked="0">
          <Option type="Map">
            <Option type="QString" name="color" value="0,0,0,0"/>
            <Option type="QString" name="outline_color" value="${rgb.r},${rgb.g},${rgb.b},230"/>
            <Option type="QString" name="outline_width" value="@zoom_dependent_width"/>
            <Option type="QString" name="size" value="@zoom_dependent_size"/>
          </Option>
        </layer>
      </symbol>
    </symbols>
  </renderer-v2>
  <!-- Variables dépendantes du zoom -->
  <variables>
    <variable name="zoom_dependent_size">
      <definition>CASE 
        WHEN @map_scale &gt; 500000 THEN 4
        WHEN @map_scale &gt; 100000 THEN 8
        WHEN @map_scale &gt; 50000 THEN 12
        WHEN @map_scale &gt; 10000 THEN 20
        WHEN @map_scale &gt; 5000 THEN 30
        ELSE 40
      END</definition>
    </variable>
    <variable name="zoom_dependent_width">
      <definition>CASE 
        WHEN @map_scale &gt; 500000 THEN 0.5
        WHEN @map_scale &gt; 100000 THEN 1
        WHEN @map_scale &gt; 50000 THEN 2
        WHEN @map_scale &gt; 10000 THEN 3
        WHEN @map_scale &gt; 5000 THEN 4
        ELSE 5
      END</definition>
    </variable>
  </variables>
</qgis>`;
};

// ============================================
// STYLES ARCGIS (JSON)
// ============================================
export const generateArcGISStyle = (zoneType) => {
  const zoneConfig = BIONIC_ZONE_COLORS[zoneType];
  if (!zoneConfig) return null;
  
  const hexToRgba = (hex, alpha = 255) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      alpha
    ] : [0, 0, 0, alpha];
  };
  
  return {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPointSymbol',
      symbolLayers: [
        // Halo externe
        {
          type: 'CIMVectorMarker',
          enable: true,
          anchorPointUnits: 'Relative',
          frame: { xmin: -5, ymin: -5, xmax: 5, ymax: 5 },
          markerGraphics: [{
            type: 'CIMMarkerGraphic',
            geometry: { rings: [[[-5,-5], [-5,5], [5,5], [5,-5], [-5,-5]]] },
            symbol: {
              type: 'CIMPolygonSymbol',
              symbolLayers: [{
                type: 'CIMSolidFill',
                enable: true,
                color: hexToRgba(zoneConfig.color, 77)
              }]
            }
          }],
          scaleSymbolsProportionally: true,
          respectFrame: true,
          size: '$feature.ZOOM_SIZE * 1.3'
        },
        // Cercle principal (anneau)
        {
          type: 'CIMVectorMarker',
          enable: true,
          anchorPointUnits: 'Relative',
          frame: { xmin: -5, ymin: -5, xmax: 5, ymax: 5 },
          markerGraphics: [{
            type: 'CIMMarkerGraphic',
            geometry: { rings: [[[-5,-5], [-5,5], [5,5], [5,-5], [-5,-5]]] },
            symbol: {
              type: 'CIMPolygonSymbol',
              symbolLayers: [
                // Intérieur transparent
                {
                  type: 'CIMSolidFill',
                  enable: true,
                  color: [0, 0, 0, 0]
                },
                // Contour coloré
                {
                  type: 'CIMSolidStroke',
                  enable: true,
                  color: hexToRgba(zoneConfig.color, 230),
                  width: '$feature.ZOOM_WIDTH'
                }
              ]
            }
          }],
          scaleSymbolsProportionally: true,
          respectFrame: true,
          size: '$feature.ZOOM_SIZE'
        }
      ]
    },
    // Arcade expressions pour le zoom
    primitiveOverrides: [
      {
        type: 'CIMPrimitiveOverride',
        primitiveName: 'ZOOM_SIZE',
        propertyName: 'Size',
        valueExpressionInfo: {
          type: 'CIMExpressionInfo',
          expression: `
            var scale = $view.scale;
            When(
              scale > 500000, 8,
              scale > 100000, 16,
              scale > 50000, 24,
              scale > 10000, 40,
              scale > 5000, 60,
              80
            )
          `
        }
      },
      {
        type: 'CIMPrimitiveOverride',
        primitiveName: 'ZOOM_WIDTH',
        propertyName: 'Width',
        valueExpressionInfo: {
          type: 'CIMExpressionInfo',
          expression: `
            var scale = $view.scale;
            When(
              scale > 500000, 1,
              scale > 100000, 2,
              scale > 50000, 3,
              scale > 10000, 4,
              scale > 5000, 5,
              6
            )
          `
        }
      }
    ]
  };
};

// ============================================
// STYLES CSS POUR PANNEAU LATÉRAL
// ============================================
export const getBionicPanelStyles = () => {
  const styles = {};
  
  Object.entries(BIONIC_ZONE_COLORS).forEach(([zoneType, config]) => {
    styles[zoneType] = {
      // Couleur de l'icône
      iconColor: config.color,
      iconStyle: { color: config.color, fill: config.color },
      
      // Couleur de la pastille/badge
      badgeStyle: {
        backgroundColor: `${config.color}20`, // 20 = 12% opacity
        borderColor: config.color,
        color: config.color
      },
      badgeClassName: `bg-[${config.color}]/10 border-[${config.color}]/50 text-[${config.color}]`,
      
      // Couleur du texte
      textStyle: { color: config.color },
      textClassName: `text-[${config.color}]`,
      
      // Couleur du fond au survol
      hoverStyle: {
        backgroundColor: `${config.color}15` // 15 = ~8% opacity
      },
      
      // Label et icône
      label: config.labelFr,
      icon: config.icon,
      iconLucide: config.iconLucide
    };
  });
  
  return styles;
};

// ============================================
// GÉNÉRATION CSS DYNAMIQUE
// ============================================
export const generateBionicCSS = () => {
  let css = `/* BIONIC™ Zone Styles - Auto-generated */\n\n`;
  
  // Styles de base pour les zones
  css += `.bionic-zone {
  transition: stroke-width 0.3s ease, stroke-opacity 0.3s ease;
}

.bionic-zone-halo {
  transition: stroke-width 0.3s ease, stroke-opacity 0.3s ease;
  pointer-events: none;
}\n\n`;
  
  // Styles spécifiques par type de zone
  Object.entries(BIONIC_ZONE_COLORS).forEach(([zoneType, config]) => {
    css += `/* ${config.labelFr} */
.bionic-zone-${zoneType} {
  stroke: ${config.color};
}

.bionic-zone-halo-${zoneType} {
  stroke: ${config.color};
}

.bionic-panel-item-${zoneType} {
  --zone-color: ${config.color};
}

.bionic-panel-item-${zoneType} .zone-icon {
  color: ${config.color};
}

.bionic-panel-item-${zoneType} .zone-badge {
  background-color: ${config.color}20;
  border-color: ${config.color}80;
  color: ${config.color};
}

.bionic-panel-item-${zoneType} .zone-label {
  color: ${config.color};
}

.bionic-panel-item-${zoneType}:hover {
  background-color: ${config.color}15;
}

`;
  });
  
  return css;
};

// ============================================
// EXPORT MULTI-FORMAT
// ============================================
export const exportAllStyles = () => {
  const exports = {
    leaflet: {},
    mapboxgl: getMapboxGLFullConfig(),
    qgis: {},
    arcgis: {},
    css: generateBionicCSS(),
    panelStyles: getBionicPanelStyles()
  };
  
  Object.keys(BIONIC_ZONE_COLORS).forEach(zoneType => {
    exports.leaflet[zoneType] = {
      main: getLeafletCircleStyle(zoneType, 12),
      halo: getLeafletHaloStyle(zoneType, 12)
    };
    exports.qgis[zoneType] = generateQGISStyle(zoneType);
    exports.arcgis[zoneType] = generateArcGISStyle(zoneType);
  });
  
  return exports;
};

// ============================================
// COMPOSANT REACT - LÉGENDE DU PANNEAU
// ============================================
export const BionicZoneLegend = ({ activeZones = [], onToggleZone, className = '' }) => {
  const panelStyles = getBionicPanelStyles();
  
  return (
    <div className={`bionic-zone-legend space-y-1 ${className}`}>
      {Object.entries(BIONIC_ZONE_COLORS).map(([zoneType, config]) => {
        const isActive = activeZones.includes(zoneType);
        const styles = panelStyles[zoneType];
        
        return (
          <div
            key={zoneType}
            className={`bionic-panel-item-${zoneType} flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
              isActive ? 'ring-1 ring-current' : 'opacity-60 hover:opacity-100'
            }`}
            style={isActive ? styles.hoverStyle : {}}
            onClick={() => onToggleZone?.(zoneType)}
          >
            {/* Icône colorée */}
            <span 
              className="zone-icon text-lg"
              style={styles.iconStyle}
            >
              {config.icon}
            </span>
            
            {/* Label coloré */}
            <span 
              className="zone-label text-sm font-medium flex-1"
              style={styles.textStyle}
            >
              {config.labelFr}
            </span>
            
            {/* Badge/pastille */}
            <span 
              className="zone-badge px-2 py-0.5 text-xs rounded-full border"
              style={styles.badgeStyle}
            >
              {isActive ? 'ON' : 'OFF'}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// HOOK REACT POUR STYLES DYNAMIQUES
// ============================================
export const useBionicZoneStyles = (zoom = 10) => {
  const [currentZoom, setCurrentZoom] = React.useState(zoom);
  
  React.useEffect(() => {
    setCurrentZoom(zoom);
  }, [zoom]);
  
  const getStyle = React.useCallback((zoneType) => {
    return {
      leaflet: getLeafletCircleStyle(zoneType, currentZoom),
      halo: getLeafletHaloStyle(zoneType, currentZoom),
      panel: getBionicPanelStyles()[zoneType]
    };
  }, [currentZoom]);
  
  const getAllStyles = React.useCallback(() => {
    const styles = {};
    Object.keys(BIONIC_ZONE_COLORS).forEach(zoneType => {
      styles[zoneType] = getStyle(zoneType);
    });
    return styles;
  }, [getStyle]);
  
  return {
    getStyle,
    getAllStyles,
    currentZoom,
    colors: BIONIC_ZONE_COLORS,
    haloConfig: HALO_CONFIG
  };
};

export default {
  BIONIC_ZONE_COLORS,
  HALO_CONFIG,
  getLeafletCircleStyle,
  getLeafletHaloStyle,
  createLeafletBionicCircle,
  getMapboxGLLayerStyle,
  getMapboxGLFullConfig,
  generateQGISStyle,
  generateArcGISStyle,
  getBionicPanelStyles,
  generateBionicCSS,
  exportAllStyles,
  BionicZoneLegend,
  useBionicZoneStyles
};
