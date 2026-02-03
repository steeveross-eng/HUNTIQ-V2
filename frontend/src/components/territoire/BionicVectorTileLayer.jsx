/**
 * BionicVectorTileLayer.jsx
 * 
 * Composant de rendu des tuiles vectorielles BIONIC™ Canada
 * Utilise leaflet.vectorgrid pour le chargement des tuiles .pbf
 * 
 * Sources de données:
 * - OpenMapTiles (fallback gratuit)
 * - Mapbox Vector Tiles
 * - BIONIC™ CDN (quand disponible)
 */

import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Note: leaflet.vectorgrid désactivé temporairement - utilisation de TileLayer standard
// import 'leaflet.vectorgrid';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES SOURCES DE TUILES VECTORIELLES
// ═══════════════════════════════════════════════════════════════

const VECTOR_TILE_SOURCES = {
  // Source principale: OpenMapTiles (gratuit, données OSM)
  openmaptiles: {
    url: 'https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=get_your_own_key',
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OSM</a>',
    maxZoom: 14
  },
  
  // Mapbox Vector Tiles (nécessite token)
  mapbox: {
    url: 'https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
    attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 16
  },
  
  // BIONIC™ CDN (placeholder - à configurer avec votre propre serveur)
  bionic: {
    url: 'https://tiles.huntiq.ca/bionic/{z}/{x}/{y}.pbf',
    attribution: '&copy; BIONIC™ | RNCan | StatCan',
    maxZoom: 18
  }
};

// ═══════════════════════════════════════════════════════════════
// STYLES VECTORIELS PAR COUCHE
// ═══════════════════════════════════════════════════════════════

const VECTOR_LAYER_STYLES = {
  // Eau (lacs, rivières)
  water: {
    fill: true,
    fillColor: '#1E90FF',
    fillOpacity: 0.5,
    stroke: true,
    color: '#0066CC',
    weight: 1
  },
  
  // Cours d'eau linéaires
  waterway: {
    fill: false,
    stroke: true,
    color: '#3399FF',
    weight: 2
  },
  
  // Zones boisées
  landcover: {
    fill: true,
    fillColor: '#228B22',
    fillOpacity: 0.3,
    stroke: false
  },
  
  // Routes principales
  transportation: {
    fill: false,
    stroke: true,
    color: '#E74C3C',
    weight: 2
  },
  
  // Routes secondaires
  road: {
    fill: false,
    stroke: true,
    color: '#F1C40F',
    weight: 1.5
  },
  
  // Bâtiments
  building: {
    fill: true,
    fillColor: '#BDC3C7',
    fillOpacity: 0.6,
    stroke: true,
    color: '#7F8C8D',
    weight: 0.5
  },
  
  // Limites administratives
  boundary: {
    fill: false,
    stroke: true,
    color: '#8E44AD',
    weight: 2,
    dashArray: '5, 5'
  },
  
  // Parcs et espaces verts
  park: {
    fill: true,
    fillColor: '#27AE60',
    fillOpacity: 0.4,
    stroke: true,
    color: '#1E8449',
    weight: 1
  }
};

// ═══════════════════════════════════════════════════════════════
// FONCTION DE STYLE DYNAMIQUE
// ═══════════════════════════════════════════════════════════════

const getVectorStyle = (properties, zoom, layerName) => {
  // Style par défaut
  let style = {
    fill: true,
    fillColor: '#CCCCCC',
    fillOpacity: 0.2,
    stroke: true,
    color: '#999999',
    weight: 1
  };
  
  // Déterminer le type de feature
  const featureClass = properties.class || properties.type || layerName;
  
  // Appliquer le style approprié
  if (featureClass === 'water' || featureClass === 'lake' || featureClass === 'ocean') {
    style = { ...VECTOR_LAYER_STYLES.water };
  } else if (featureClass === 'river' || featureClass === 'stream' || featureClass === 'canal') {
    style = { ...VECTOR_LAYER_STYLES.waterway };
    // Largeur adaptative selon le zoom
    style.weight = zoom >= 14 ? 3 : zoom >= 10 ? 2 : 1;
  } else if (featureClass === 'forest' || featureClass === 'wood' || featureClass === 'grass') {
    style = { ...VECTOR_LAYER_STYLES.landcover };
    // Couleur selon le type
    if (featureClass === 'forest' || featureClass === 'wood') {
      style.fillColor = '#006400';
    }
  } else if (featureClass === 'motorway' || featureClass === 'trunk' || featureClass === 'primary') {
    style = { ...VECTOR_LAYER_STYLES.transportation };
    // Largeur selon le type de route
    if (featureClass === 'motorway') {
      style.color = '#E74C3C';
      style.weight = zoom >= 12 ? 4 : 2;
    } else if (featureClass === 'trunk') {
      style.color = '#E67E22';
      style.weight = zoom >= 12 ? 3 : 1.5;
    } else {
      style.color = '#F1C40F';
      style.weight = zoom >= 12 ? 2.5 : 1;
    }
  } else if (featureClass === 'secondary' || featureClass === 'tertiary' || featureClass === 'residential') {
    style = { ...VECTOR_LAYER_STYLES.road };
    style.weight = zoom >= 14 ? 2 : 1;
    style.color = '#FFFFFF';
  } else if (featureClass === 'building') {
    style = { ...VECTOR_LAYER_STYLES.building };
  } else if (featureClass === 'admin' || featureClass === 'boundary') {
    style = { ...VECTOR_LAYER_STYLES.boundary };
    // Épaisseur selon le niveau administratif
    const adminLevel = properties.admin_level || 4;
    style.weight = adminLevel <= 4 ? 3 : adminLevel <= 6 ? 2 : 1;
  } else if (featureClass === 'park' || featureClass === 'nature_reserve' || featureClass === 'protected_area') {
    style = { ...VECTOR_LAYER_STYLES.park };
  }
  
  return style;
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

/**
 * Composant de rendu des tuiles vectorielles BIONIC™ Canada
 * 
 * @param {Object} props
 * @param {boolean} props.enabled - Activer/désactiver la couche
 * @param {Object} props.layerVisibility - Visibilité des sous-couches
 * @param {number} props.opacity - Opacité globale (0-1)
 * @param {string} props.source - Source des tuiles ('openmaptiles', 'mapbox', 'bionic')
 */
const BionicVectorTileLayer = ({ 
  enabled = true,
  layerVisibility = {},
  opacity = 0.8,
  source = 'mapbox'
}) => {
  const map = useMap();
  const vectorLayerRef = useRef(null);
  
  // Configuration de la source
  const tileSource = useMemo(() => {
    return VECTOR_TILE_SOURCES[source] || VECTOR_TILE_SOURCES.mapbox;
  }, [source]);
  
  // Couches à afficher
  const visibleLayers = useMemo(() => {
    const defaults = {
      water: true,
      waterway: true,
      landcover: true,
      transportation: true,
      building: false,
      boundary: true,
      park: true
    };
    return { ...defaults, ...layerVisibility };
  }, [layerVisibility]);
  
  useEffect(() => {
    if (!map || !enabled) {
      // Retirer la couche si désactivée
      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
        vectorLayerRef.current = null;
      }
      return;
    }
    
    // Configuration du VectorGrid
    const vectorTileOptions = {
      rendererFactory: L.canvas.tile,
      vectorTileLayerStyles: {
        // Style pour chaque couche vectorielle
        water: (properties, zoom) => {
          if (!visibleLayers.water) return { fill: false, stroke: false };
          return getVectorStyle(properties, zoom, 'water');
        },
        waterway: (properties, zoom) => {
          if (!visibleLayers.waterway) return { fill: false, stroke: false };
          return getVectorStyle(properties, zoom, 'waterway');
        },
        landcover: (properties, zoom) => {
          if (!visibleLayers.landcover) return { fill: false, stroke: false };
          return getVectorStyle(properties, zoom, 'landcover');
        },
        landuse: (properties, zoom) => {
          if (!visibleLayers.landcover) return { fill: false, stroke: false };
          return getVectorStyle(properties, zoom, properties.class || 'landuse');
        },
        transportation: (properties, zoom) => {
          if (!visibleLayers.transportation) return { fill: false, stroke: false };
          return getVectorStyle(properties, zoom, properties.class || 'transportation');
        },
        building: (properties, zoom) => {
          if (!visibleLayers.building) return { fill: false, stroke: false };
          return getVectorStyle(properties, zoom, 'building');
        },
        boundary: (properties, zoom) => {
          if (!visibleLayers.boundary) return { fill: false, stroke: false };
          return getVectorStyle(properties, zoom, 'boundary');
        },
        park: (properties, zoom) => {
          if (!visibleLayers.park) return { fill: false, stroke: false };
          return getVectorStyle(properties, zoom, 'park');
        },
        // Couches additionnelles OSM
        place: () => ({ fill: false, stroke: false }), // Labels gérés séparément
        poi: () => ({ fill: false, stroke: false }),
        aeroway: (properties, zoom) => {
          return {
            fill: false,
            stroke: true,
            color: '#BDC3C7',
            weight: zoom >= 12 ? 2 : 1
          };
        },
        // Couche par défaut pour les autres
        default: (properties, zoom) => {
          return getVectorStyle(properties, zoom, 'default');
        }
      },
      maxZoom: tileSource.maxZoom,
      minZoom: 4,
      interactive: true,
      getFeatureId: (feature) => feature.properties.id || feature.properties.osm_id,
      attribution: tileSource.attribution
    };
    
    try {
      // Créer la couche VectorGrid
      const vectorLayer = L.vectorGrid.protobuf(tileSource.url, vectorTileOptions);
      
      // Appliquer l'opacité
      vectorLayer.setOpacity(opacity);
      
      // Ajouter à la carte
      vectorLayer.addTo(map);
      vectorLayerRef.current = vectorLayer;
      
      // Event handlers pour interactivité
      vectorLayer.on('click', (e) => {
        if (e.layer && e.layer.properties) {
          const props = e.layer.properties;
          const name = props.name || props.class || 'Feature';
          
          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <div class="bg-gray-900 text-white p-2 rounded">
                <strong>${name}</strong>
                ${props.class ? `<br><span class="text-gray-400 text-xs">${props.class}</span>` : ''}
              </div>
            `)
            .openOn(map);
        }
      });
      
      console.log('[BIONIC Vector Tiles] Couche chargée avec succès');
      
    } catch (error) {
      console.error('[BIONIC Vector Tiles] Erreur de chargement:', error);
    }
    
    // Cleanup
    return () => {
      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
        vectorLayerRef.current = null;
      }
    };
  }, [map, enabled, tileSource, visibleLayers, opacity]);
  
  // Mise à jour de l'opacité
  useEffect(() => {
    if (vectorLayerRef.current) {
      vectorLayerRef.current.setOpacity(opacity);
    }
  }, [opacity]);
  
  return null; // Composant sans rendu DOM direct
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT WRAPPER POUR BIONIC CANADA
// ═══════════════════════════════════════════════════════════════

/**
 * Wrapper configuré pour les tuiles vectorielles BIONIC™ Canada
 * Utilise les configurations du pipeline BIONIC_VECTOR_TILES_CANADA
 */
export const BionicCanadaVectorLayer = ({ 
  enabled = true,
  layerConfig = {}
}) => {
  // Mapper la configuration BIONIC vers les couches vectorielles
  const layerVisibility = useMemo(() => ({
    water: layerConfig.hydrology?.enabled !== false,
    waterway: layerConfig.hydrology?.enabled !== false,
    landcover: layerConfig.ecoforest?.enabled !== false,
    transportation: layerConfig.roads?.enabled !== false,
    building: layerConfig.urban?.enabled !== false,
    boundary: layerConfig.administrative?.enabled !== false,
    park: true
  }), [layerConfig]);
  
  // Calculer l'opacité moyenne
  const opacity = useMemo(() => {
    const opacities = [
      layerConfig.hydrology?.opacity || 0.7,
      layerConfig.ecoforest?.opacity || 0.6,
      layerConfig.roads?.opacity || 0.9,
      layerConfig.administrative?.opacity || 0.8
    ];
    return opacities.reduce((a, b) => a + b, 0) / opacities.length;
  }, [layerConfig]);
  
  return (
    <BionicVectorTileLayer
      enabled={enabled}
      layerVisibility={layerVisibility}
      opacity={opacity}
      source="mapbox" // Utiliser Mapbox comme source par défaut
    />
  );
};

export default BionicVectorTileLayer;
