/**
 * ZoneMerger.js
 * 
 * Service de fusion des zones comportementales
 * Utilise Turf.js pour fusionner les polygones adjacents du même type
 * et créer des zones organiques qui suivent la topographie naturelle
 * 
 * OBJECTIF: Transformer les cercles individuels en zones cohérentes
 */

// Import turf avec fallback
let turf;
try {
  turf = require('@turf/turf');
} catch (e) {
  console.warn('Turf.js not available, using fallback');
  turf = null;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const MERGE_CONFIG = {
  // Distance maximale pour considérer deux zones comme adjacentes (en km)
  adjacencyThreshold: 1.5,  // Augmenté de 0.5 à 1.5
  
  // Facteur de buffer pour la fusion (en km)
  bufferDistance: 0.3,  // Augmenté de 0.15 à 0.3
  
  // Tolérance pour la simplification des polygones
  simplifyTolerance: 0.002,  // Augmenté pour des contours plus lisses
  
  // Lissage des contours (0-1, plus haut = plus lisse)
  smoothingFactor: 0.85,
  
  // Nombre minimum de zones pour fusionner
  minZonesToMerge: 1  // Réduit de 2 à 1 pour toujours fusionner
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS UTILITAIRES
// ═══════════════════════════════════════════════════════════════

/**
 * Génère un polygone organique au lieu d'un cercle parfait
 * Simule une forme naturelle basée sur la topographie
 * VERSION 2.0 - Formes ALLONGÉES suivant les corridors naturels
 */
const generateOrganicPolygon = (center, baseRadius, seed = 0) => {
  const points = [];
  const numPoints = 16 + Math.floor(Math.random() * 12); // 16-28 points pour plus de détail
  
  // Facteur d'élongation - crée des formes plus allongées (corridors)
  const elongation = 1.2 + Math.random() * 0.8; // 1.2 à 2.0
  const elongationAngle = Math.random() * Math.PI; // Direction de l'élongation
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    
    // Variation organique du rayon (±25%)
    const variation = 0.75 + Math.random() * 0.5;
    
    // Ondulation naturelle basée sur l'angle
    const waveVariation = Math.sin(angle * 2 + seed) * 0.12 + 
                          Math.sin(angle * 5 + seed * 2) * 0.06;
    
    // Appliquer l'élongation dans une direction
    const angleDiff = Math.abs(Math.cos(angle - elongationAngle));
    const elongationFactor = 1 + (elongation - 1) * angleDiff;
    
    const radius = baseRadius * (variation + waveVariation) * elongationFactor;
    
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
 * 
 * VERSION 2.0 - Zones LARGES et ORGANIQUES
 */
export const generateOrganicForestZones = (center, radius = 0.03, options = {}) => {
  const {
    targetSpecies = 'ORIGNAL',
    gridDensity = 5,  // Réduit pour moins de zones
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
  
  // Générer des clusters de comportement plus grands et moins nombreux
  const numClusters = 4 + Math.floor(Math.random() * 3); // 4-6 clusters
  
  for (let cluster = 0; cluster < numClusters; cluster++) {
    // Position aléatoire du centre du cluster - plus espacés
    const clusterAngle = (cluster / numClusters) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
    const clusterDist = radius * (0.4 + Math.random() * 0.4);
    const clusterCenter = [
      center[0] + Math.cos(clusterAngle) * clusterDist,
      center[1] + Math.sin(clusterAngle) * clusterDist
    ];
    
    // Déterminer le comportement dominant pour ce cluster
    // Distribution plus réaliste
    const behaviorWeights = {
      shelter: 0.35,
      feeding: 0.25,
      bedding: 0.15,
      corridor: 0.15,
      water: 0.10
    };
    
    const rand = Math.random();
    let cumulative = 0;
    let dominantBehavior = 'shelter';
    for (const [behavior, weight] of Object.entries(behaviorWeights)) {
      cumulative += weight;
      if (rand < cumulative) {
        dominantBehavior = behavior;
        break;
      }
    }
    
    // Générer UNE SEULE grande zone organique par cluster
    // au lieu de plusieurs petites
    const zoneRadius = radius * (0.15 + Math.random() * 0.15); // Plus grandes zones
    
    const polygon = generateOrganicPolygon(clusterCenter, zoneRadius, seed + cluster);
    polygon.properties = {
      behaviorId: dominantBehavior,
      clusterId: cluster,
      behaviorScore: 65 + Math.floor(Math.random() * 30),
      merged: true,
      mergedCount: 1
    };
    
    behaviorClusters[dominantBehavior].push(polygon);
    
    // Ajouter des zones secondaires adjacentes pour créer des formes complexes
    if (Math.random() > 0.4) {
      const secondaryAngle = Math.random() * Math.PI * 2;
      const secondaryDist = zoneRadius * 0.6;
      const secondaryCenter = [
        clusterCenter[0] + Math.cos(secondaryAngle) * secondaryDist,
        clusterCenter[1] + Math.sin(secondaryAngle) * secondaryDist
      ];
      
      const secondaryPolygon = generateOrganicPolygon(
        secondaryCenter, 
        zoneRadius * 0.7, 
        seed + cluster + 100
      );
      secondaryPolygon.properties = {
        behaviorId: dominantBehavior,
        clusterId: cluster,
        behaviorScore: polygon.properties.behaviorScore - 5,
        merged: true,
        mergedCount: 1
      };
      behaviorClusters[dominantBehavior].push(secondaryPolygon);
    }
    
    // Hotspot - zone PLUS GRANDE au centre du cluster (probabilité réduite)
    if (Math.random() > 0.8) {  // Seulement 20% des clusters ont un hotspot
      const hotspotPolygon = generateOrganicPolygon(
        clusterCenter, 
        radius * 0.12,  // Plus grand (était 0.08)
        seed + cluster + 200
      );
      hotspotPolygon.properties = {
        behaviorId: 'hotspot',
        clusterId: cluster,
        behaviorScore: 90 + Math.floor(Math.random() * 10),  // Score plus élevé
        merged: true,
        mergedCount: 1
      };
      behaviorClusters.hotspot.push(hotspotPolygon);
    }
  }
  
  // Fusionner AGRESSIVEMENT toutes les zones adjacentes du même comportement
  Object.entries(behaviorClusters).forEach(([behaviorId, polygons]) => {
    if (polygons.length === 0) return;
    
    // Toujours tenter de fusionner, même avec 1 seul polygone (pour simplifier)
    const groups = groupByProximity(polygons, MERGE_CONFIG.adjacencyThreshold);
    
    groups.forEach(group => {
      if (group.length >= 2) {
        // Fusionner le groupe
        const merged = mergePolygonGroup(group, MERGE_CONFIG.bufferDistance);
        if (merged) {
          merged.properties = {
            behaviorId,
            merged: true,
            mergedCount: group.length,
            behaviorScore: Math.round(
              group.reduce((sum, p) => sum + (p.properties?.behaviorScore || 70), 0) / group.length
            )
          };
          features.push(merged);
        } else {
          // Fallback: ajouter le premier du groupe (simplifié)
          features.push(group[0]);
        }
      } else {
        // Un seul polygone dans le groupe, l'ajouter directement
        features.push(group[0]);
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
