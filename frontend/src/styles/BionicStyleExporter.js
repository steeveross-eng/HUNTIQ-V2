/**
 * BionicStyleExporter.js
 * 
 * Utilitaire pour exporter les styles BIONIC™ vers différents formats
 * Compatible avec : QGIS, ArcGIS, Mapbox, GeoJSON
 */

import { 
  BIONIC_ZONE_COLORS, 
  generateQGISStyle, 
  generateArcGISStyle,
  getMapboxGLFullConfig,
  generateBionicCSS
} from './BionicZoneStyles';

/**
 * Génère tous les fichiers QML pour QGIS
 * @returns {Object} Objet avec les fichiers QML par type de zone
 */
export const exportQGISStyles = () => {
  const files = {};
  
  Object.keys(BIONIC_ZONE_COLORS).forEach(zoneType => {
    const config = BIONIC_ZONE_COLORS[zoneType];
    files[`bionic_${zoneType}.qml`] = {
      content: generateQGISStyle(zoneType),
      label: config.labelFr,
      color: config.color
    };
  });
  
  return files;
};

/**
 * Génère tous les fichiers JSON pour ArcGIS
 * @returns {Object} Objet avec les fichiers JSON par type de zone
 */
export const exportArcGISStyles = () => {
  const files = {};
  
  Object.keys(BIONIC_ZONE_COLORS).forEach(zoneType => {
    const config = BIONIC_ZONE_COLORS[zoneType];
    files[`bionic_${zoneType}_arcgis.json`] = {
      content: JSON.stringify(generateArcGISStyle(zoneType), null, 2),
      label: config.labelFr,
      color: config.color
    };
  });
  
  return files;
};

/**
 * Génère le fichier de configuration Mapbox GL complet
 * @returns {string} Configuration Mapbox GL en JSON
 */
export const exportMapboxGLStyle = () => {
  return JSON.stringify(getMapboxGLFullConfig(), null, 2);
};

/**
 * Génère le fichier CSS complet
 * @returns {string} CSS avec tous les styles BIONIC
 */
export const exportCSS = () => {
  return generateBionicCSS();
};

/**
 * Génère un fichier GeoJSON de légende
 * @returns {Object} GeoJSON FeatureCollection avec les métadonnées de style
 */
export const exportLegendGeoJSON = () => {
  const features = Object.entries(BIONIC_ZONE_COLORS).map(([zoneType, config], index) => ({
    type: 'Feature',
    properties: {
      zoneType,
      label: config.labelFr,
      color: config.color,
      icon: config.icon,
      iconLucide: config.iconLucide,
      sortOrder: index
    },
    geometry: {
      type: 'Point',
      coordinates: [0, 0] // Placeholder
    }
  }));
  
  return {
    type: 'FeatureCollection',
    name: 'BIONIC_Zone_Legend',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features
  };
};

/**
 * Génère un fichier README avec la documentation des styles
 * @returns {string} Contenu du README en Markdown
 */
export const exportReadme = () => {
  let readme = `# BIONIC™ Zone Styles - Documentation

## Couleurs Officielles

| Zone | Code Couleur | Hex |
|------|-------------|-----|
`;

  Object.entries(BIONIC_ZONE_COLORS).forEach(([zoneType, config]) => {
    readme += `| ${config.labelFr} | ${config.icon} | \`${config.color}\` |\n`;
  });

  readme += `

## Compatibilité

Ces styles sont compatibles avec les moteurs cartographiques suivants :

### Leaflet
\`\`\`javascript
import { getLeafletCircleStyle, getLeafletHaloStyle } from '@/styles/BionicZoneStyles';

// Obtenir le style pour une zone
const style = getLeafletCircleStyle('habitats_optimaux', zoomLevel);
const haloStyle = getLeafletHaloStyle('habitats_optimaux', zoomLevel);
\`\`\`

### Mapbox GL
\`\`\`javascript
import { getMapboxGLFullConfig } from '@/styles/BionicZoneStyles';

// Ajouter les couches à la carte
const config = getMapboxGLFullConfig();
map.addSource('bionic-zones', config.source);
config.layers.forEach(layer => map.addLayer(layer));
\`\`\`

### QGIS
1. Importez les fichiers \`.qml\` générés
2. Appliquez le style au calque correspondant
3. Les variables de zoom sont automatiquement gérées

### ArcGIS
1. Importez les fichiers \`.json\` générés
2. Utilisez les symboles CIM pour le rendu
3. Les expressions Arcade gèrent le zoom dynamique

## Paramètres du Halo

| Zoom | Épaisseur | Opacité |
|------|-----------|---------|
| 5 | 1px | 30% |
| 10 | 4px | 55% |
| 15 | 10px | 80% |
| 18 | 16px | 95% |

## Notes Techniques

- **Intérieur Transparent** : Tous les cercles ont un intérieur totalement transparent (fillOpacity: 0)
- **Halo Coloré** : Le halo est l'unique élément visible, permettant de voir le terrain sous-jacent
- **Zoom Adaptatif** : L'épaisseur du halo varie automatiquement selon le niveau de zoom
- **Performances** : Les styles sont optimisés pour un rendu fluide même avec de nombreuses zones

## Licence

Ces styles sont propriétaires de BIONIC™ / HUNTIQ. Tous droits réservés.
`;

  return readme;
};

/**
 * Télécharge tous les fichiers de style dans un ZIP
 * @returns {Promise<Blob>} Blob du fichier ZIP
 */
export const downloadAllStyles = async () => {
  // Note: Cette fonction nécessite JSZip pour créer le ZIP
  // Elle est prévue pour une utilisation côté client
  
  const files = {
    // QGIS
    ...exportQGISStyles(),
    // ArcGIS
    ...exportArcGISStyles(),
    // Mapbox GL
    'mapbox_gl_config.json': { content: exportMapboxGLStyle() },
    // CSS
    'bionic-zones.css': { content: exportCSS() },
    // Légende GeoJSON
    'bionic_legend.geojson': { content: JSON.stringify(exportLegendGeoJSON(), null, 2) },
    // Documentation
    'README.md': { content: exportReadme() }
  };
  
  return files;
};

/**
 * Génère le contenu pour affichage dans la console
 * Utile pour le débogage
 */
export const logAllStyles = () => {
  console.log('=== BIONIC™ Zone Colors ===');
  Object.entries(BIONIC_ZONE_COLORS).forEach(([type, config]) => {
    console.log(`%c● ${config.labelFr}`, `color: ${config.color}; font-weight: bold;`, config.color);
  });
};

export default {
  exportQGISStyles,
  exportArcGISStyles,
  exportMapboxGLStyle,
  exportCSS,
  exportLegendGeoJSON,
  exportReadme,
  downloadAllStyles,
  logAllStyles
};
