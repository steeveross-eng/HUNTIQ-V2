/**
 * WildlifeBehaviorZones.js
 * 
 * Système de classification des zones selon les comportements du gibier
 * - Circulation (corridors de déplacement)
 * - Cache/Repos (couvert dense)
 * - Alimentation (zones de nourrissage)
 * - Repos/Dodo (ravages, dortoirs)
 * - Points d'eau
 * 
 * Basé sur les données écoforestières + LiDAR + TWI
 */

// ═══════════════════════════════════════════════════════════════
// CLASSIFICATION COMPORTEMENTALE DU GIBIER
// ═══════════════════════════════════════════════════════════════

/**
 * Comportements du gibier avec couleurs distinctives BIONIC
 * COULEURS OPTIMISÉES pour visibilité maximale
 */
export const WILDLIFE_BEHAVIORS = {
  // 🦌 CIRCULATION - Corridors de déplacement
  corridor: {
    id: 'corridor',
    name: 'Corridor de circulation',
    icon: '🦌',
    description: 'Zones de déplacement préférées',
    color: '#ff5500',           // Orange INTENSE
    glowColor: '#ff7733',
    pattern: 'arrows',
    criteria: {
      forestTypes: ['MIX', 'FIM', 'REM'],
      minDensity: 40,
      maxDensity: 70,
      heightRange: [8, 18],
      slopeRange: [2, 15],
      nearWater: true
    },
    huntingTip: 'Positionnez-vous sur les bordures, vent dans le dos'
  },
  
  // 🌲 CACHE/ABRI - Couvert thermique dense
  shelter: {
    id: 'shelter',
    name: 'Zone de cache/abri',
    icon: '🌲',
    description: 'Couvert dense pour se cacher',
    color: '#00ff44',           // Vert NÉON INTENSE
    glowColor: '#44ff77',
    pattern: 'dense',
    criteria: {
      forestTypes: ['EPN', 'SAB', 'THO', 'PRU'],
      minDensity: 75,
      maxDensity: 100,
      heightRange: [15, 35],
      slopeRange: [0, 20],
      nearWater: false
    },
    huntingTip: 'Le gibier reste caché pendant les heures chaudes'
  },
  
  // 🍂 ALIMENTATION - Zones de nourrissage
  feeding: {
    id: 'feeding',
    name: 'Zone d\'alimentation',
    icon: '🍂',
    description: 'Ressources alimentaires abondantes',
    color: '#ffcc00',           // Jaune OR INTENSE
    glowColor: '#ffdd44',
    pattern: 'dots',
    criteria: {
      forestTypes: ['BOJ', 'ERS', 'ERR', 'PET', 'FRN', 'BOP'],
      minDensity: 30,
      maxDensity: 70,
      heightRange: [5, 20],
      slopeRange: [0, 10],
      nearWater: true
    },
    huntingTip: 'Actif tôt le matin et en fin de journée'
  },
  
  // 🛏️ REPOS/DORTOIR - Ravages, zones de repos
  bedding: {
    id: 'bedding',
    name: 'Zone de repos/dortoir',
    icon: '🛏️',
    description: 'Ravages et zones de repos nocturne',
    color: '#aa44ff',           // Violet INTENSE
    glowColor: '#cc77ff',
    pattern: 'circles',
    criteria: {
      forestTypes: ['EPN', 'SAB', 'THO', 'MEL'],
      minDensity: 60,
      maxDensity: 90,
      heightRange: [12, 25],
      slopeRange: [5, 25],       // Pentes légères pour drainage
      nearWater: false
    },
    huntingTip: 'Approchez très tôt avant l\'aube ou tard le soir'
  },
  
  // 💧 POINT D'EAU - Zones humides, ruisseaux
  water: {
    id: 'water',
    name: 'Point d\'eau',
    icon: '💧',
    description: 'Sources d\'eau et zones humides',
    color: '#00ccff',           // Cyan ÉLECTRIQUE
    glowColor: '#44ddff',
    pattern: 'waves',
    criteria: {
      forestTypes: ['MIL', 'EAU'],
      minDensity: 0,
      maxDensity: 50,
      heightRange: [0, 10],
      twiMin: 12,               // Indice humidité élevé
      nearWater: true
    },
    huntingTip: 'Embuscade idéale aux heures de forte chaleur'
  },
  
  // 🔥 HOTSPOT OPTIMAL - Intersection de tous les comportements
  hotspot: {
    id: 'hotspot',
    name: 'Hotspot Optimal BIONIC',
    icon: '🔥',
    description: 'Zone à très haute probabilité de présence',
    color: '#ff0055',           // Rose/Magenta ÉLECTRIQUE
    glowColor: '#ff4488',
    pattern: 'pulse',
    criteria: {
      multiZone: true,          // Intersection de plusieurs comportements
      minBehaviors: 3
    },
    huntingTip: 'ZONE PREMIUM - Présence quasi garantie'
  }
};

/**
 * Couleurs par espèce cible
 */
export const SPECIES_BEHAVIOR_MODIFIERS = {
  ORIGNAL: {
    preferredBehaviors: ['shelter', 'water', 'feeding'],
    corridorWidth: 'wide',      // Corridors larges
    feedingPref: ['SAB', 'BOJ', 'PET', 'MIL'],
    beddingPref: ['EPN', 'SAB', 'THO'],
    waterImportance: 'critical'
  },
  CHEVREUIL: {
    preferredBehaviors: ['feeding', 'shelter', 'corridor'],
    corridorWidth: 'narrow',    // Corridors étroits
    feedingPref: ['ERR', 'ERS', 'BOP', 'FRN'],
    beddingPref: ['THO', 'PRU', 'PIB'],
    waterImportance: 'moderate'
  },
  OURS_NOIR: {
    preferredBehaviors: ['feeding', 'water', 'bedding'],
    corridorWidth: 'variable',
    feedingPref: ['BOJ', 'ERS', 'FRN', 'MIL'],
    beddingPref: ['EPN', 'SAB'],
    waterImportance: 'high'
  },
  DINDON: {
    preferredBehaviors: ['feeding', 'corridor'],
    corridorWidth: 'wide',
    feedingPref: ['ERR', 'ERS', 'CHR', 'FRN'],
    beddingPref: [],            // Perchoirs, pas de ravages
    waterImportance: 'low'
  }
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS D'ANALYSE COMPORTEMENTALE
// ═══════════════════════════════════════════════════════════════

/**
 * Détermine le comportement principal d'une zone forestière
 * @param {Object} zoneProps - Propriétés de la zone (essence, densité, hauteur, etc.)
 * @param {Object} options - Options (espèce cible, TWI, etc.)
 * @returns {Object} Comportement principal et score
 */
export const classifyZoneBehavior = (zoneProps, options = {}) => {
  const { targetSpecies = 'ORIGNAL', twiValue = null } = options;
  const speciesModifiers = SPECIES_BEHAVIOR_MODIFIERS[targetSpecies];
  
  const {
    essence_code,
    bionic_type,
    DENSITE = 50,
    HAUTEUR = 15,
    PENTE = 5
  } = zoneProps;
  
  const scores = {};
  
  // Évaluer chaque comportement
  Object.entries(WILDLIFE_BEHAVIORS).forEach(([behaviorId, behavior]) => {
    if (behaviorId === 'hotspot') return; // Calculé séparément
    
    let score = 0;
    const criteria = behavior.criteria;
    
    // Score type forestier
    if (criteria.forestTypes?.includes(essence_code)) {
      score += 40;
    } else if (criteria.forestTypes?.some(ft => bionic_type?.includes(ft.toLowerCase()))) {
      score += 20;
    }
    
    // Score densité
    if (DENSITE >= criteria.minDensity && DENSITE <= criteria.maxDensity) {
      score += 25;
    } else if (DENSITE >= criteria.minDensity - 10 && DENSITE <= criteria.maxDensity + 10) {
      score += 10;
    }
    
    // Score hauteur
    if (HAUTEUR >= criteria.heightRange[0] && HAUTEUR <= criteria.heightRange[1]) {
      score += 20;
    }
    
    // Score pente (si applicable)
    if (criteria.slopeRange && PENTE >= criteria.slopeRange[0] && PENTE <= criteria.slopeRange[1]) {
      score += 10;
    }
    
    // Score TWI (pour points d'eau)
    if (criteria.twiMin && twiValue !== null) {
      if (twiValue >= criteria.twiMin) {
        score += 30;
      }
    }
    
    // Bonus espèce
    if (speciesModifiers.preferredBehaviors.includes(behaviorId)) {
      score *= 1.3;
    }
    
    scores[behaviorId] = Math.min(Math.round(score), 100);
  });
  
  // Trouver le comportement dominant
  const sortedBehaviors = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);
  
  const primaryBehavior = sortedBehaviors[0];
  const secondaryBehavior = sortedBehaviors[1];
  
  // Détecter les hotspots (3+ comportements avec score > 50)
  const highScoreBehaviors = sortedBehaviors.filter(([_, s]) => s >= 50);
  const isHotspot = highScoreBehaviors.length >= 3;
  
  return {
    primary: {
      id: primaryBehavior[0],
      score: primaryBehavior[1],
      ...WILDLIFE_BEHAVIORS[primaryBehavior[0]]
    },
    secondary: secondaryBehavior ? {
      id: secondaryBehavior[0],
      score: secondaryBehavior[1],
      ...WILDLIFE_BEHAVIORS[secondaryBehavior[0]]
    } : null,
    allScores: scores,
    isHotspot,
    hotspotScore: isHotspot ? Math.round(highScoreBehaviors.reduce((sum, [_, s]) => sum + s, 0) / highScoreBehaviors.length) : 0
  };
};

/**
 * Génère le style visuel pour une zone selon son comportement
 * @param {Object} behaviorResult - Résultat de classifyZoneBehavior
 * @returns {Object} Style Leaflet
 */
export const getBehaviorStyle = (behaviorResult) => {
  const { primary, isHotspot, hotspotScore } = behaviorResult;
  
  if (isHotspot) {
    return {
      fillColor: WILDLIFE_BEHAVIORS.hotspot.color,
      color: WILDLIFE_BEHAVIORS.hotspot.glowColor,
      weight: 3,
      opacity: 1,
      fillOpacity: 0.7,
      className: 'bionic-hotspot-zone bionic-pulse'
    };
  }
  
  const behavior = WILDLIFE_BEHAVIORS[primary.id];
  const opacity = 0.4 + (primary.score / 100) * 0.4;
  
  return {
    fillColor: behavior.color,
    color: behavior.glowColor,
    weight: primary.score >= 70 ? 2 : 1,
    opacity: primary.score >= 70 ? 0.9 : 0.6,
    fillOpacity: opacity,
    className: `bionic-${primary.id}-zone`
  };
};

/**
 * Génère une légende pour les comportements
 */
export const generateBehaviorLegend = () => {
  return Object.entries(WILDLIFE_BEHAVIORS).map(([id, behavior]) => ({
    id,
    name: behavior.name,
    icon: behavior.icon,
    color: behavior.color,
    description: behavior.description,
    huntingTip: behavior.huntingTip
  }));
};

export default {
  WILDLIFE_BEHAVIORS,
  SPECIES_BEHAVIOR_MODIFIERS,
  classifyZoneBehavior,
  getBehaviorStyle,
  generateBehaviorLegend
};
