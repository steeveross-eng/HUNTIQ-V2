/**
 * ProfessionalAssets.js
 * 
 * CONFIGURATION DES ASSETS PROFESSIONNELS - HUNTIQ
 * Photos d'animaux mâles matures + Icônes scientifiques
 * 
 * Style: Professionnel, Scientifique, Biologie de la faune
 */

// ═══════════════════════════════════════════════════════════════
// PHOTOS D'ANIMAUX MÂLES MATURES
// ═══════════════════════════════════════════════════════════════

export const SPECIES_IMAGES = {
  ORIGNAL: {
    id: 'ORIGNAL',
    name: 'Orignal',
    latinName: 'Alces alces',
    thumbnail: 'https://images.pexels.com/photos/76972/moose-moose-rack-male-bull-76972.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    fullSize: 'https://images.pexels.com/photos/76972/moose-moose-rack-male-bull-76972.jpeg?auto=compress&cs=tinysrgb&w=800',
    portrait: 'https://images.pexels.com/photos/39645/moose-bull-elk-yawns-39645.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    description: 'Mâle mature avec panache complet'
  },
  CHEVREUIL: {
    id: 'CHEVREUIL',
    name: 'Chevreuil',
    latinName: 'Odocoileus virginianus',
    thumbnail: 'https://images.pexels.com/photos/34973906/pexels-photo-34973906.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop',
    fullSize: 'https://images.pexels.com/photos/34973906/pexels-photo-34973906.jpeg?auto=compress&cs=tinysrgb&w=800',
    portrait: 'https://images.pexels.com/photos/29349041/pexels-photo-29349041.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    description: 'Buck mature avec bois développés'
  },
  OURS_NOIR: {
    id: 'OURS_NOIR',
    name: 'Ours Noir',
    latinName: 'Ursus americanus',
    thumbnail: 'https://images.unsplash.com/photo-1758678283024-ed25413e3714?w=200&h=200&fit=crop',
    fullSize: 'https://images.unsplash.com/photo-1758678283024-ed25413e3714?w=800',
    portrait: 'https://images.pexels.com/photos/34162062/pexels-photo-34162062.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    description: 'Mâle adulte en forêt boréale'
  },
  DINDON: {
    id: 'DINDON',
    name: 'Dindon Sauvage',
    latinName: 'Meleagris gallopavo',
    thumbnail: 'https://images.unsplash.com/photo-1742180763632-de7bc59020cb?w=200&h=200&fit=crop',
    fullSize: 'https://images.unsplash.com/photo-1742180763632-de7bc59020cb?w=800',
    portrait: 'https://images.unsplash.com/photo-1710908948863-66e1ec468d6f?w=400&h=400&fit=crop',
    description: 'Mâle (Tom) en parade'
  }
};

// ═══════════════════════════════════════════════════════════════
// ICÔNES PROFESSIONNELLES - Mapping Lucide React
// ═══════════════════════════════════════════════════════════════

/**
 * Remplacements d'emojis par icônes Lucide
 * Format: emoji -> { icon: 'LucideIconName', color: 'hex' }
 */
export const ICON_REPLACEMENTS = {
  // Animaux -> Utiliser images ou icônes génériques
  '🦌': { icon: 'Target', color: '#f5a623', description: 'Gibier' },
  '🐻': { icon: 'PawPrint', color: '#8b4513', description: 'Ours' },
  '🦃': { icon: 'Bird', color: '#964B00', description: 'Dindon' },
  '🌲': { icon: 'TreePine', color: '#228b22', description: 'Forêt' },
  '🌳': { icon: 'Trees', color: '#2e8b57', description: 'Feuillus' },
  '🍁': { icon: 'Leaf', color: '#ff6347', description: 'Érable' },
  
  // Comportements
  '🛡️': { icon: 'Shield', color: '#00ff88', description: 'Zone de cache' },
  '🍃': { icon: 'Sprout', color: '#22c55e', description: 'Alimentation' },
  '💧': { icon: 'Droplets', color: '#00aaff', description: 'Point d\'eau' },
  '😴': { icon: 'Moon', color: '#aa00ff', description: 'Repos' },
  '🔥': { icon: 'Flame', color: '#ff0055', description: 'Hotspot' },
  
  // Modules
  '🏠': { icon: 'Home', color: '#f5a623', description: 'Habitat' },
  '🌤️': { icon: 'CloudSun', color: '#87ceeb', description: 'Météo' },
  '🎯': { icon: 'Crosshair', color: '#22c55e', description: 'Approche' },
  '⛰️': { icon: 'Mountain', color: '#8b8b8b', description: 'Topographie' },
  
  // Actions
  '👍': { icon: 'ThumbsUp', color: '#22c55e', description: 'Bon' },
  '👎': { icon: 'ThumbsDown', color: '#ef4444', description: 'Mauvais' },
  '⚠️': { icon: 'AlertTriangle', color: '#f5a623', description: 'Attention' }
};

// ═══════════════════════════════════════════════════════════════
// COMPORTEMENTS GIBIER - Style Scientifique
// ═══════════════════════════════════════════════════════════════

export const WILDLIFE_BEHAVIORS_SCIENTIFIC = {
  corridor: {
    id: 'corridor',
    name: 'Corridor de déplacement',
    scientificName: 'Transit Corridor',
    icon: 'Route',
    color: '#ff5500',
    pattern: 'dashed',
    description: 'Voie de circulation préférentielle du gibier'
  },
  shelter: {
    id: 'shelter',
    name: 'Zone de couvert',
    scientificName: 'Shelter Zone',
    icon: 'TreePine',
    color: '#00ff44',
    pattern: 'solid',
    description: 'Couvert dense pour la protection thermique'
  },
  feeding: {
    id: 'feeding',
    name: 'Zone d\'alimentation',
    scientificName: 'Foraging Area',
    icon: 'Sprout',
    color: '#ffcc00',
    pattern: 'dotted',
    description: 'Ressources alimentaires abondantes'
  },
  bedding: {
    id: 'bedding',
    name: 'Zone de repos',
    scientificName: 'Bedding Site',
    icon: 'Moon',
    color: '#aa44ff',
    pattern: 'solid',
    description: 'Site de repos diurne et nocturne'
  },
  water: {
    id: 'water',
    name: 'Point d\'eau',
    scientificName: 'Water Source',
    icon: 'Droplets',
    color: '#00aaff',
    pattern: 'wave',
    description: 'Source d\'eau accessible'
  },
  hotspot: {
    id: 'hotspot',
    name: 'Hotspot optimal',
    scientificName: 'High Probability Zone',
    icon: 'Flame',
    color: '#ff0055',
    pattern: 'pulse',
    description: 'Zone à haute probabilité de présence'
  }
};

// ═══════════════════════════════════════════════════════════════
// MODULES THÉMATIQUES - Style Professionnel
// ═══════════════════════════════════════════════════════════════

export const THEMATIC_MODULES_CONFIG = [
  { 
    id: 'habitat', 
    name: 'Analyse Habitat', 
    scientificName: 'Habitat Suitability Index',
    icon: 'Home',
    color: '#f5a623',
    description: 'Évaluation de la qualité de l\'habitat'
  },
  { 
    id: 'meteo', 
    name: 'Conditions Météo', 
    scientificName: 'Weather Impact Analysis',
    icon: 'CloudSun',
    color: '#87ceeb',
    description: 'Impact des conditions météorologiques'
  },
  { 
    id: 'approche', 
    name: 'Stratégie Approche', 
    scientificName: 'Approach Optimization',
    icon: 'Crosshair',
    color: '#22c55e',
    description: 'Optimisation du trajet d\'approche'
  },
  { 
    id: 'alimentation', 
    name: 'Ressources Alimentaires', 
    scientificName: 'Food Resource Mapping',
    icon: 'Sprout',
    color: '#22c55e',
    description: 'Cartographie des ressources alimentaires'
  },
  { 
    id: 'comportement', 
    name: 'Comportement Animal', 
    scientificName: 'Behavioral Analysis',
    icon: 'Activity',
    color: '#f5a623',
    description: 'Analyse des patterns comportementaux'
  },
  { 
    id: 'hotspots', 
    name: 'Hotspots IA', 
    scientificName: 'AI-Predicted Hotspots',
    icon: 'Flame',
    color: '#ff0055',
    description: 'Zones optimales prédites par IA'
  },
  { 
    id: 'peuplements', 
    name: 'Peuplements Forestiers', 
    scientificName: 'Forest Stand Analysis',
    icon: 'TreePine',
    color: '#228b22',
    description: 'Analyse des peuplements forestiers'
  },
  { 
    id: 'topographie', 
    name: 'Relief & Topographie', 
    scientificName: 'Terrain Analysis',
    icon: 'Mountain',
    color: '#8b8b8b',
    description: 'Analyse du relief et des pentes'
  }
];

// ═══════════════════════════════════════════════════════════════
// SCORES & RATINGS - Style Scientifique
// ═══════════════════════════════════════════════════════════════

export const SCORE_RATINGS_SCIENTIFIC = {
  excellent: { 
    min: 80, 
    label: 'EXCELLENT', 
    color: '#22c55e', 
    bgColor: 'rgba(34, 197, 94, 0.15)',
    icon: 'TrendingUp',
    description: 'Conditions optimales'
  },
  good: { 
    min: 60, 
    label: 'BON', 
    color: '#f5a623', 
    bgColor: 'rgba(245, 166, 35, 0.15)',
    icon: 'ThumbsUp',
    description: 'Conditions favorables'
  },
  moderate: { 
    min: 40, 
    label: 'MODÉRÉ', 
    color: '#eab308', 
    bgColor: 'rgba(234, 179, 8, 0.15)',
    icon: 'Minus',
    description: 'Conditions acceptables'
  },
  poor: { 
    min: 20, 
    label: 'FAIBLE', 
    color: '#f97316', 
    bgColor: 'rgba(249, 115, 22, 0.15)',
    icon: 'TrendingDown',
    description: 'Conditions défavorables'
  },
  critical: { 
    min: 0, 
    label: 'CRITIQUE', 
    color: '#ef4444', 
    bgColor: 'rgba(239, 68, 68, 0.15)',
    icon: 'AlertTriangle',
    description: 'Conditions très défavorables'
  }
};

export function getScoreRatingScientific(score) {
  if (score >= 80) return SCORE_RATINGS_SCIENTIFIC.excellent;
  if (score >= 60) return SCORE_RATINGS_SCIENTIFIC.good;
  if (score >= 40) return SCORE_RATINGS_SCIENTIFIC.moderate;
  if (score >= 20) return SCORE_RATINGS_SCIENTIFIC.poor;
  return SCORE_RATINGS_SCIENTIFIC.critical;
}

export default {
  SPECIES_IMAGES,
  ICON_REPLACEMENTS,
  WILDLIFE_BEHAVIORS_SCIENTIFIC,
  THEMATIC_MODULES_CONFIG,
  SCORE_RATINGS_SCIENTIFIC,
  getScoreRatingScientific
};
