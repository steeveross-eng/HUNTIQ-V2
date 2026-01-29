/**
 * ZoneMerger.js
 * 
 * Service de fusion des zones comportementales
 * Utilise Turf.js pour fusionner les polygones adjacents du même type
 * et créer des zones organiques qui suivent la topographie naturelle
 * 
 * OBJECTIF: Transformer les cercles individuels en zones cohérentes
 */

import * as turf from '@turf/turf';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const MERGE_CONFIG = {
  // Distance maximale pour considérer deux zones comme adjacentes (en km)
  adjacencyThreshold: 0.5,
  
  // Facteur de buffer pour la fusion (en km)
  bufferDistance: 0.15,
  
  // Tolérance pour la simplification des polygones
  simplifyTolerance: 0.001,
  
  // Lissage des contours (0-1, plus haut = plus lisse)
  smoothingFactor: 0.85,
  
  // Nombre minimum de zones pour fusionner
  minZonesToMerge: 2
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Génère un polygone organique au lieu d'un cercle parfait
 * Simule une forme naturelle basée sur la topographie
 */
const generateOrganicPolygon = (center, baseRadius, seed = 0) => {
  const points = [];
  const numPoints = 12 + Math.floor(Math.random() * 8); // 12-20 points
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    // Variation organique du rayon (±30%)
    const variation = 0.7 + Math.random() * 0.6;
    // Ajouter une ondulation basée sur l'angle
    const waveVariation = Math.sin(angle * 3 + seed) * 0.15;
    const radius = baseRadius * (variation + waveVariation);
    
    const x = center[0] + Math.cos(angle) * radius;
    const y = center[1] + Math.sin(angle) * radius;
    points.push([x, y]);
  }
  
  // Fermer le polygone
  points.push(points[0]);
  
  return turf.polygon([points]);
};

/**
 * Fusionne un groupe de polygones en un seul polygone lissé
 */
const mergePolygonGroup = (polygons, bufferDistance = MERGE_CONFIG.bufferDistance) => {
  if (!polygons || polygons.length === 0) return null;
  if (polygons.length === 1) return polygons[0];
  
  try {
    // Étape 1: Buffer les polygones pour qu'ils se touchent
    const bufferedPolygons = polygons.map(p => 
      turf.buffer(p, bufferDistance, { units: 'kilometers' })
    ).filter(p => p !== null);
    
    if (bufferedPolygons.length === 0) return null;
    
    // Étape 2: Créer une FeatureCollection
    const fc = turf.featureCollection(bufferedPolygons);
    
    // Étape 3: Dissoudre/Unir tous les polygones
    let merged;
    try {
      // Essayer dissolve d'abord
      merged = turf.dissolve(fc);
      if (merged.features && merged.features.length > 0) {
        merged = merged.features[0];
      }
    } catch (e) {
      // Fallback: union manuelle
      merged = bufferedPolygons[0];
      for (let i = 1; i < bufferedPolygons.length; i++) {
        try {
          const unionResult = turf.union(
            turf.featureCollection([merged, bufferedPolygons[i]])
          );
          if (unionResult) merged = unionResult;
        } catch (unionError) {
          // Ignorer les erreurs d'union individuelle
        }
      }
    }
    
    // Étape 4: Retirer le buffer négatif pour revenir à la taille originale
    const unbuffered = turf.buffer(merged, -bufferDistance * 0.5, { units: 'kilometers' });
    
    // Étape 5: Simplifier le polygone pour des contours plus propres
    const simplified = turf.simplify(unbuffered || merged, {
      tolerance: MERGE_CONFIG.simplifyTolerance,
      highQuality: true
    });
    
    return simplified;
    
  } catch (error) {
    console.warn('[ZoneMerger] Erreur de fusion:', error.message);
    // Retourner le premier polygone en cas d'erreur
    return polygons[0];
  }
};

/**
 * Groupe les zones par proximité spatiale
 */
const groupByProximity = (features, threshold = MERGE_CONFIG.adjacencyThreshold) => {
  const groups = [];
  const assigned = new Set();
  
  features.forEach((feature, i) => {
    if (assigned.has(i)) return;
    
    const group = [feature];
    assigned.add(i);
    
    // Trouver toutes les features proches
    const centroid1 = turf.centroid(feature);
    
    features.forEach((other, j) => {
      if (i === j || assigned.has(j)) return;
      
      const centroid2 = turf.centroid(other);
      const distance = turf.distance(centroid1, centroid2, { units: 'kilometers' });
      
      if (distance <= threshold) {
        group.push(other);
        assigned.add(j);
      }
    });
    
    groups.push(group);
  });
  
  return groups;
};

// ═══════════════════════════════════════════════════════════════
// FONCTION PRINCIPALE DE FUSION
// ═══════════════════════════════════════════════════════════════

/**
 * Fusionne les zones comportementales par type
 * @param {GeoJSON} geojsonData - Données GeoJSON avec les zones
 * @returns {GeoJSON} Données avec zones fusionnées
 */
export const mergeZonesByBehavior = (geojsonData) => {
  if (!geojsonData || !geojsonData.features) return geojsonData;
  
  const features = geojsonData.features;
  
  // Grouper par type de comportement
  const behaviorGroups = {};
  
  features.forEach(feature => {
    const behaviorId = feature.properties?.behaviorId || feature.properties?.behavior?.primary?.id || 'unknown';
    if (!behaviorGroups[behaviorId]) {
      behaviorGroups[behaviorId] = [];
    }
    behaviorGroups[behaviorId].push(feature);
  });
  
  // Fusionner chaque groupe de comportement
  const mergedFeatures = [];
  
  Object.entries(behaviorGroups).forEach(([behaviorId, behaviorFeatures]) => {
    if (behaviorFeatures.length < MERGE_CONFIG.minZonesToMerge) {
      // Pas assez de zones pour fusionner, garder telles quelles
      mergedFeatures.push(...behaviorFeatures);
      return;
    }
    
    // Grouper par proximité spatiale
    const proximityGroups = groupByProximity(behaviorFeatures);
    
    proximityGroups.forEach((group, groupIndex) => {
      if (group.length >= MERGE_CONFIG.minZonesToMerge) {
        // Fusionner le groupe
        const merged = mergePolygonGroup(group);
        
        if (merged) {
          // Transférer les propriétés du premier élément
          merged.properties = {
            ...group[0].properties,
            merged: true,
            mergedCount: group.length,
            groupIndex
          };
          
          // Calculer le score moyen
          const avgScore = group.reduce((sum, f) => 
            sum + (f.properties?.behaviorScore || 0), 0
          ) / group.length;
          merged.properties.behaviorScore = Math.round(avgScore);
          
          mergedFeatures.push(merged);
        }
      } else {
        // Groupe trop petit, garder les zones individuelles
        mergedFeatures.push(...group);
      }
    });
  });
  
  return {
    ...geojsonData,
    features: mergedFeatures
  };
};

// ═══════════════════════════════════════════════════════════════
// GÉNÉRATION DE ZONES ORGANIQUES (REMPLACE LES CERCLES)
// ═══════════════════════════════════════════════════════════════

/**
 * Génère des données forestières avec zones organiques fusionnées
 * au lieu de cercles individuels
 */
export const generateOrganicForestZones = (center, radius = 0.03, options = {}) => {
  const {
    targetSpecies = 'ORIGNAL',
    gridDensity = 8,  // Réduit pour moins de zones
    seed = Date.now()
  } = options;
  
  const features = [];
  const behaviorClusters = {
    shelter: [],
    feeding: [],
    bedding: [],
    corridor: [],
    water: [],
    hotspot: []
  };
  
  // Générer des clusters de comportement basés sur des patterns naturels
  const numClusters = 3 + Math.floor(Math.random() * 4); // 3-6 clusters
  
  for (let cluster = 0; cluster < numClusters; cluster++) {
    // Position aléatoire du centre du cluster
    const clusterAngle = (cluster / numClusters) * Math.PI * 2 + Math.random() * 0.5;
    const clusterDist = radius * (0.3 + Math.random() * 0.5);
    const clusterCenter = [
      center[0] + Math.cos(clusterAngle) * clusterDist,
      center[1] + Math.sin(clusterAngle) * clusterDist
    ];
    
    // Déterminer le comportement dominant pour ce cluster
    const behaviors = ['shelter', 'feeding', 'bedding', 'corridor', 'water'];
    const dominantBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
    
    // Générer 2-5 zones organiques dans ce cluster
    const numZonesInCluster = 2 + Math.floor(Math.random() * 4);
    
    for (let z = 0; z < numZonesInCluster; z++) {
      const zoneAngle = Math.random() * Math.PI * 2;
      const zoneDist = radius * 0.1 * (1 + Math.random());
      const zoneCenter = [
        clusterCenter[0] + Math.cos(zoneAngle) * zoneDist,
        clusterCenter[1] + Math.sin(zoneAngle) * zoneDist
      ];
      
      // Taille variable de la zone
      const zoneRadius = radius * (0.08 + Math.random() * 0.12);
      
      const polygon = generateOrganicPolygon(zoneCenter, zoneRadius, seed + cluster + z);
      polygon.properties = {
        behaviorId: dominantBehavior,
        clusterId: cluster,
        behaviorScore: 60 + Math.floor(Math.random() * 35)
      };
      
      behaviorClusters[dominantBehavior].push(polygon);
    }
    
    // Probabilité de hotspot si 3+ comportements dans le cluster
    if (numZonesInCluster >= 3 && Math.random() > 0.6) {
      const hotspotPolygon = generateOrganicPolygon(clusterCenter, radius * 0.06, seed + cluster);
      hotspotPolygon.properties = {
        behaviorId: 'hotspot',
        clusterId: cluster,
        behaviorScore: 85 + Math.floor(Math.random() * 15)
      };
      behaviorClusters.hotspot.push(hotspotPolygon);
    }
  }
  
  // Fusionner les clusters par comportement
  Object.entries(behaviorClusters).forEach(([behaviorId, polygons]) => {
    if (polygons.length === 0) return;
    
    // Grouper par proximité et fusionner
    const groups = groupByProximity(polygons, MERGE_CONFIG.adjacencyThreshold);
    
    groups.forEach(group => {
      if (group.length >= 2) {
        const merged = mergePolygonGroup(group);
        if (merged) {
          merged.properties = {
            ...group[0].properties,
            merged: true,
            mergedCount: group.length,
            behaviorScore: Math.round(
              group.reduce((sum, p) => sum + (p.properties?.behaviorScore || 70), 0) / group.length
            )
          };
          features.push(merged);
        }
      } else {
        features.push(...group);
      }
    });
  });
  
  return {
    type: 'FeatureCollection',
    features
  };
};

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export default {
  mergeZonesByBehavior,
  generateOrganicForestZones,
  mergePolygonGroup,
  groupByProximity,
  generateOrganicPolygon,
  MERGE_CONFIG
};
