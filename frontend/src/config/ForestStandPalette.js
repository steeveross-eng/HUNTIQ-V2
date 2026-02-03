/**
 * ForestStandPalette.js
 * 
 * PALETTE CARTOGRAPHIQUE COMPLÈTE POUR LES PEUPLEMENTS FORESTIERS
 * Inspirée des pratiques du MFFP (Ministère des Forêts, de la Faune et des Parcs du Québec)
 * 
 * HIÉRARCHIE VISUELLE:
 * 1. TYPE DE COUVERT (Couleur principale) > 
 * 2. COMPOSITION/ESSENCE (Variation de teinte) > 
 * 3. HAUTEUR (Luminosité) > 
 * 4. DENSITÉ (Saturation) > 
 * 5. STADE (Texture/contour)
 * 
 * Compatible: Mapbox GL JS, Leaflet, QGIS, moteurs vectoriels
 * Version: 1.0.0
 */

// ═══════════════════════════════════════════════════════════════
// CONSTANTES DE BASE - COULEURS MÈRES PAR TYPE DE COUVERT
// ═══════════════════════════════════════════════════════════════

/**
 * COULEURS MÈRES - Base HSL pour chaque type de couvert
 * C = Coniférien (Vert froid)
 * M = Mélangé (Olive/Brun-vert neutre)
 * F = Feuillu (Jaune-orangé chaud)
 */
export const COVER_TYPE_BASE = {
  C: { hue: 145, satBase: 65, lumBase: 40, name: 'Coniférien', nameShort: 'C' },
  M: { hue: 75,  satBase: 50, lumBase: 42, name: 'Mélangé', nameShort: 'M' },
  F: { hue: 38,  satBase: 70, lumBase: 48, name: 'Feuillu', nameShort: 'F' }
};

// ═══════════════════════════════════════════════════════════════
// ESSENCES DOMINANTES - Variations de teinte par type
// ═══════════════════════════════════════════════════════════════

/**
 * ESSENCES CONIFÉRIEN - Variations dans le spectre vert-bleuté
 */
export const CONIFER_SPECIES = {
  EPN: { code: 'EPN', name: 'Épinette noire', hueShift: -10, icon: '🌲' },
  EPB: { code: 'EPB', name: 'Épinette blanche', hueShift: -5, icon: '🌲' },
  EPR: { code: 'EPR', name: 'Épinette rouge', hueShift: 0, icon: '🌲' },
  SAB: { code: 'SAB', name: 'Sapin baumier', hueShift: +5, icon: '🌲' },
  PIB: { code: 'PIB', name: 'Pin blanc', hueShift: +10, icon: '🌲' },
  PIG: { code: 'PIG', name: 'Pin gris', hueShift: +8, icon: '🌲' },
  PIR: { code: 'PIR', name: 'Pin rouge', hueShift: +12, icon: '🌲' },
  THO: { code: 'THO', name: 'Thuya occidental', hueShift: -15, icon: '🌲' },
  MEL: { code: 'MEL', name: 'Mélèze laricin', hueShift: +15, icon: '🌲' },
  PRU: { code: 'PRU', name: 'Pruche', hueShift: -8, icon: '🌲' },
  RES: { code: 'RES', name: 'Résineux (général)', hueShift: 0, icon: '🌲' }
};

/**
 * ESSENCES FEUILLU - Variations dans le spectre jaune-orangé
 */
export const DECIDUOUS_SPECIES = {
  ERS: { code: 'ERS', name: 'Érable à sucre', hueShift: +5, icon: '🍁' },
  ERR: { code: 'ERR', name: 'Érable rouge', hueShift: +12, icon: '🍁' },
  BOJ: { code: 'BOJ', name: 'Bouleau jaune', hueShift: -8, icon: '🌳' },
  BOP: { code: 'BOP', name: 'Bouleau blanc', hueShift: -15, icon: '🌳' },
  HEG: { code: 'HEG', name: 'Hêtre à grandes feuilles', hueShift: +8, icon: '🌳' },
  CHR: { code: 'CHR', name: 'Chêne rouge', hueShift: +18, icon: '🌳' },
  FRN: { code: 'FRN', name: 'Frêne noir', hueShift: -5, icon: '🌳' },
  FRA: { code: 'FRA', name: 'Frêne d\'Amérique', hueShift: -3, icon: '🌳' },
  PET: { code: 'PET', name: 'Peuplier faux-tremble', hueShift: -20, icon: '🌳' },
  PEB: { code: 'PEB', name: 'Peuplier baumier', hueShift: -18, icon: '🌳' },
  TIL: { code: 'TIL', name: 'Tilleul', hueShift: +3, icon: '🌳' },
  ORM: { code: 'ORM', name: 'Orme', hueShift: 0, icon: '🌳' },
  FEU: { code: 'FEU', name: 'Feuillu (général)', hueShift: 0, icon: '🌳' }
};

/**
 * ESSENCES MÉLANGÉ - Combinaisons courantes
 */
export const MIXED_SPECIES = {
  MIX: { code: 'MIX', name: 'Mixte (général)', hueShift: 0, icon: '🌲🌳' },
  MIS: { code: 'MIS', name: 'Mixte à dominance résineuse', hueShift: +15, icon: '🌲' },
  MIF: { code: 'MIF', name: 'Mixte à dominance feuillue', hueShift: -15, icon: '🌳' },
  REM: { code: 'REM', name: 'Résineux-Érable', hueShift: -8, icon: '🌲🍁' },
  FIM: { code: 'FIM', name: 'Feuillu intolérant-Mixte', hueShift: -5, icon: '🌳' }
};

// ═══════════════════════════════════════════════════════════════
// CLASSES DE HAUTEUR - Variations de luminosité
// ═══════════════════════════════════════════════════════════════

/**
 * CLASSES DE HAUTEUR (mètres)
 * Plus clair = plus bas/jeune
 * Plus foncé = plus haut/mature
 */
export const HEIGHT_CLASSES = {
  H1: { code: '1', range: '0-7m', lumShift: +25, name: 'Très bas', description: 'Régénération' },
  H2: { code: '2', range: '7-12m', lumShift: +15, name: 'Bas', description: 'Jeune peuplement' },
  H3: { code: '3', range: '12-17m', lumShift: +5, name: 'Moyen-bas', description: 'Gaulis' },
  H4: { code: '4', range: '17-22m', lumShift: 0, name: 'Moyen', description: 'Perchis' },
  H5: { code: '5', range: '22-27m', lumShift: -8, name: 'Moyen-haut', description: 'Futaie' },
  H6: { code: '6', range: '27m+', lumShift: -15, name: 'Haut', description: 'Futaie mature' }
};

// ═══════════════════════════════════════════════════════════════
// CLASSES DE DENSITÉ - Variations de saturation
// ═══════════════════════════════════════════════════════════════

/**
 * CLASSES DE DENSITÉ (% de couvert)
 * Saturé = dense
 * Désaturé = ouvert
 */
export const DENSITY_CLASSES = {
  A: { code: 'A', range: '80-100%', satShift: +15, name: 'Dense', description: 'Couvert fermé' },
  B: { code: 'B', range: '60-80%', satShift: 0, name: 'Moyen', description: 'Couvert régulier' },
  C: { code: 'C', range: '40-60%', satShift: -15, name: 'Clair', description: 'Couvert irrégulier' },
  D: { code: 'D', range: '25-40%', satShift: -30, name: 'Très clair', description: 'Couvert ouvert' }
};

// ═══════════════════════════════════════════════════════════════
// STADES DE DÉVELOPPEMENT - Textures/Contours
// ═══════════════════════════════════════════════════════════════

/**
 * STADES DE DÉVELOPPEMENT
 * Définis par texture SVG ou style de contour
 */
export const DEVELOPMENT_STAGES = {
  REG: { 
    code: 'REG', 
    name: 'Régénération', 
    pattern: 'dotted-fine',
    strokeDasharray: '2,4',
    strokeWidth: 1,
    fillPattern: 'url(#pattern-dots)',
    description: '< 10 ans'
  },
  JEU: { 
    code: 'JEU', 
    name: 'Jeune', 
    pattern: 'hatched-light',
    strokeDasharray: '4,2',
    strokeWidth: 1.5,
    fillPattern: 'url(#pattern-hatch-light)',
    description: '10-30 ans'
  },
  MAT: { 
    code: 'MAT', 
    name: 'Mature', 
    pattern: 'solid',
    strokeDasharray: 'none',
    strokeWidth: 1,
    fillPattern: 'none',
    description: '30-80 ans'
  },
  SUR: { 
    code: 'SUR', 
    name: 'Suranné', 
    pattern: 'outlined',
    strokeDasharray: 'none',
    strokeWidth: 2.5,
    fillPattern: 'url(#pattern-aged)',
    description: '> 80 ans'
  },
  VIN: { 
    code: 'VIN', 
    name: 'Vieille forêt', 
    pattern: 'double-outline',
    strokeDasharray: 'none',
    strokeWidth: 3,
    fillPattern: 'url(#pattern-old-growth)',
    description: '> 120 ans'
  }
};

// ═══════════════════════════════════════════════════════════════
// FONCTIONS DE CALCUL DE COULEUR
// ═══════════════════════════════════════════════════════════════

/**
 * Convertit HSL en HEX
 */
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Calcule la couleur finale d'un peuplement
 * @param {string} coverType - Type de couvert (C, M, F)
 * @param {string} speciesCode - Code essence dominante
 * @param {string} heightClass - Classe de hauteur (1-6)
 * @param {string} densityClass - Classe de densité (A-D)
 * @returns {string} Couleur HEX finale
 */
export function calculateStandColor(coverType, speciesCode, heightClass, densityClass) {
  // Obtenir la base du type de couvert
  const base = COVER_TYPE_BASE[coverType] || COVER_TYPE_BASE.M;
  
  // Trouver l'essence dans la bonne catégorie
  let species;
  if (coverType === 'C') {
    species = CONIFER_SPECIES[speciesCode] || CONIFER_SPECIES.RES;
  } else if (coverType === 'F') {
    species = DECIDUOUS_SPECIES[speciesCode] || DECIDUOUS_SPECIES.FEU;
  } else {
    species = MIXED_SPECIES[speciesCode] || MIXED_SPECIES.MIX;
  }
  
  // Obtenir les modificateurs
  const height = HEIGHT_CLASSES[`H${heightClass}`] || HEIGHT_CLASSES.H4;
  const density = DENSITY_CLASSES[densityClass] || DENSITY_CLASSES.B;
  
  // Calculer les valeurs finales HSL
  const finalHue = (base.hue + species.hueShift + 360) % 360;
  const finalSat = Math.max(15, Math.min(100, base.satBase + density.satShift));
  const finalLum = Math.max(20, Math.min(75, base.lumBase + height.lumShift));
  
  return hslToHex(finalHue, finalSat, finalLum);
}

/**
 * Génère les informations complètes de style pour un peuplement
 */
export function getStandStyle(coverType, speciesCode, heightClass, densityClass, stage = 'MAT') {
  const color = calculateStandColor(coverType, speciesCode, heightClass, densityClass);
  const stageStyle = DEVELOPMENT_STAGES[stage] || DEVELOPMENT_STAGES.MAT;
  
  // Obtenir les infos descriptives
  const base = COVER_TYPE_BASE[coverType] || COVER_TYPE_BASE.M;
  let species;
  if (coverType === 'C') species = CONIFER_SPECIES[speciesCode] || CONIFER_SPECIES.RES;
  else if (coverType === 'F') species = DECIDUOUS_SPECIES[speciesCode] || DECIDUOUS_SPECIES.FEU;
  else species = MIXED_SPECIES[speciesCode] || MIXED_SPECIES.MIX;
  
  const height = HEIGHT_CLASSES[`H${heightClass}`] || HEIGHT_CLASSES.H4;
  const density = DENSITY_CLASSES[densityClass] || DENSITY_CLASSES.B;
  
  return {
    // Code complet du peuplement
    code: `${coverType}${speciesCode}${heightClass}${densityClass}${stage}`,
    
    // Informations descriptives
    coverType: base.name,
    species: species.name,
    speciesIcon: species.icon,
    height: height.name,
    heightRange: height.range,
    density: density.name,
    densityRange: density.range,
    stage: stageStyle.name,
    stageDescription: stageStyle.description,
    
    // Style visuel
    fillColor: color,
    fillOpacity: coverType === 'C' ? 0.75 : coverType === 'M' ? 0.70 : 0.72,
    strokeColor: adjustBrightness(color, -25),
    strokeWidth: stageStyle.strokeWidth,
    strokeDasharray: stageStyle.strokeDasharray,
    fillPattern: stageStyle.fillPattern,
    
    // Métadonnées
    hexColor: color
  };
}

/**
 * Ajuste la luminosité d'une couleur HEX
 */
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// ═══════════════════════════════════════════════════════════════
// PALETTE COMPLÈTE PRÉ-CALCULÉE
// ═══════════════════════════════════════════════════════════════

/**
 * Génère la palette complète de tous les peuplements possibles
 */
export function generateCompletePalette() {
  const palette = [];
  
  // CONIFÉRIENS
  Object.values(CONIFER_SPECIES).forEach(species => {
    Object.values(HEIGHT_CLASSES).forEach(height => {
      Object.values(DENSITY_CLASSES).forEach(density => {
        Object.values(DEVELOPMENT_STAGES).forEach(stage => {
          palette.push(getStandStyle('C', species.code, height.code, density.code, stage.code));
        });
      });
    });
  });
  
  // FEUILLUS
  Object.values(DECIDUOUS_SPECIES).forEach(species => {
    Object.values(HEIGHT_CLASSES).forEach(height => {
      Object.values(DENSITY_CLASSES).forEach(density => {
        Object.values(DEVELOPMENT_STAGES).forEach(stage => {
          palette.push(getStandStyle('F', species.code, height.code, density.code, stage.code));
        });
      });
    });
  });
  
  // MÉLANGÉS
  Object.values(MIXED_SPECIES).forEach(species => {
    Object.values(HEIGHT_CLASSES).forEach(height => {
      Object.values(DENSITY_CLASSES).forEach(density => {
        Object.values(DEVELOPMENT_STAGES).forEach(stage => {
          palette.push(getStandStyle('M', species.code, height.code, density.code, stage.code));
        });
      });
    });
  });
  
  return palette;
}

// ═══════════════════════════════════════════════════════════════
// PEUPLEMENTS COURANTS PRÉ-DÉFINIS (RACCOURCIS)
// ═══════════════════════════════════════════════════════════════

/**
 * Peuplements forestiers les plus courants au Québec
 * Prêts à l'emploi avec couleurs pré-calculées
 */
export const COMMON_STANDS = {
  // ─── PESSIÈRES (Épinette noire) ───
  PESSIERE_DENSE_MATURE: getStandStyle('C', 'EPN', '5', 'A', 'MAT'),
  PESSIERE_MOYENNE: getStandStyle('C', 'EPN', '4', 'B', 'MAT'),
  PESSIERE_JEUNE: getStandStyle('C', 'EPN', '2', 'B', 'JEU'),
  PESSIERE_VIEILLE: getStandStyle('C', 'EPN', '6', 'A', 'VIN'),
  
  // ─── SAPINIÈRES ───
  SAPINIERE_DENSE: getStandStyle('C', 'SAB', '5', 'A', 'MAT'),
  SAPINIERE_MOYENNE: getStandStyle('C', 'SAB', '4', 'B', 'MAT'),
  SAPINIERE_JEUNE: getStandStyle('C', 'SAB', '3', 'B', 'JEU'),
  
  // ─── PINÈDES ───
  PINEDE_GRISE: getStandStyle('C', 'PIG', '4', 'B', 'MAT'),
  PINEDE_BLANCHE: getStandStyle('C', 'PIB', '5', 'B', 'MAT'),
  PINEDE_ROUGE: getStandStyle('C', 'PIR', '5', 'A', 'MAT'),
  
  // ─── CÉDRIÈRES ───
  CEDRIERE_DENSE: getStandStyle('C', 'THO', '4', 'A', 'MAT'),
  CEDRIERE_OUVERTE: getStandStyle('C', 'THO', '3', 'C', 'MAT'),
  
  // ─── ÉRABLIÈRES ───
  ERABLIERE_SUCRE_MATURE: getStandStyle('F', 'ERS', '5', 'A', 'MAT'),
  ERABLIERE_SUCRE_JEUNE: getStandStyle('F', 'ERS', '3', 'B', 'JEU'),
  ERABLIERE_ROUGE: getStandStyle('F', 'ERR', '4', 'B', 'MAT'),
  
  // ─── BÉTULAIES (Bouleaux) ───
  BETULAIE_JAUNE: getStandStyle('F', 'BOJ', '5', 'B', 'MAT'),
  BETULAIE_BLANCHE: getStandStyle('F', 'BOP', '4', 'B', 'MAT'),
  
  // ─── PEUPLERAIES ───
  PEUPLERAIE_TREMBLE: getStandStyle('F', 'PET', '4', 'B', 'MAT'),
  PEUPLERAIE_BAUMIER: getStandStyle('F', 'PEB', '4', 'B', 'MAT'),
  
  // ─── FORÊTS MIXTES ───
  MIXTE_RESINEUX_DOM: getStandStyle('M', 'MIS', '4', 'B', 'MAT'),
  MIXTE_FEUILLU_DOM: getStandStyle('M', 'MIF', '4', 'B', 'MAT'),
  MIXTE_EQUILIBRE: getStandStyle('M', 'MIX', '4', 'B', 'MAT'),
  MIXTE_ERABLE_RESINEUX: getStandStyle('M', 'REM', '5', 'A', 'MAT'),
  
  // ─── RÉGÉNÉRATIONS ───
  REGEN_CONIFERE: getStandStyle('C', 'RES', '1', 'C', 'REG'),
  REGEN_FEUILLU: getStandStyle('F', 'FEU', '1', 'C', 'REG'),
  REGEN_MIXTE: getStandStyle('M', 'MIX', '1', 'C', 'REG'),
  
  // ─── VIEILLES FORÊTS ───
  VIEILLE_PESSIERE: getStandStyle('C', 'EPN', '6', 'A', 'VIN'),
  VIEILLE_SAPINIERE: getStandStyle('C', 'SAB', '6', 'A', 'VIN'),
  VIEILLE_ERABLIERE: getStandStyle('F', 'ERS', '6', 'A', 'VIN'),
  VIEILLE_CEDRAIE: getStandStyle('C', 'THO', '5', 'A', 'VIN')
};

// ═══════════════════════════════════════════════════════════════
// TABLEAU DE RÉFÉRENCE - Export pour documentation
// ═══════════════════════════════════════════════════════════════

/**
 * Génère un tableau de référence formaté
 */
export function generateReferenceTable() {
  const table = [];
  
  // En-têtes
  table.push({
    code: 'CODE',
    coverType: 'TYPE COUVERT',
    species: 'ESSENCE DOMINANTE',
    height: 'HAUTEUR',
    density: 'DENSITÉ',
    stage: 'STADE',
    hexColor: 'COULEUR HEX',
    texture: 'TEXTURE/CONTOUR'
  });
  
  // Ajouter les peuplements courants
  Object.entries(COMMON_STANDS).forEach(([key, stand]) => {
    table.push({
      code: stand.code,
      coverType: stand.coverType,
      species: stand.species,
      height: `${stand.height} (${stand.heightRange})`,
      density: `${stand.density} (${stand.densityRange})`,
      stage: `${stand.stage} (${stand.stageDescription})`,
      hexColor: stand.hexColor,
      texture: stand.fillPattern === 'none' ? 'Plein' : stand.strokeDasharray
    });
  });
  
  return table;
}

// ═══════════════════════════════════════════════════════════════
// PATTERNS SVG POUR TEXTURES
// ═══════════════════════════════════════════════════════════════

/**
 * Définitions SVG des patterns pour les stades de développement
 */
export const SVG_PATTERNS = `
<defs>
  <!-- Pattern pointillé fin - Régénération -->
  <pattern id="pattern-dots" patternUnits="userSpaceOnUse" width="4" height="4">
    <circle cx="2" cy="2" r="0.8" fill="currentColor" opacity="0.4"/>
  </pattern>
  
  <!-- Pattern hachures légères - Jeune -->
  <pattern id="pattern-hatch-light" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
  </pattern>
  
  <!-- Pattern texture âgée - Suranné -->
  <pattern id="pattern-aged" patternUnits="userSpaceOnUse" width="8" height="8">
    <circle cx="2" cy="2" r="0.5" fill="currentColor" opacity="0.2"/>
    <circle cx="6" cy="6" r="0.5" fill="currentColor" opacity="0.2"/>
  </pattern>
  
  <!-- Pattern vieille forêt -->
  <pattern id="pattern-old-growth" patternUnits="userSpaceOnUse" width="10" height="10">
    <circle cx="2" cy="2" r="0.6" fill="currentColor" opacity="0.25"/>
    <circle cx="7" cy="7" r="0.6" fill="currentColor" opacity="0.25"/>
    <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" stroke-width="0.3" opacity="0.15"/>
  </pattern>
</defs>
`;

// ═══════════════════════════════════════════════════════════════
// EXPORTS POUR MAPBOX GL JS / LEAFLET
// ═══════════════════════════════════════════════════════════════

/**
 * Génère les règles de style pour Mapbox GL JS
 */
export function generateMapboxStyle() {
  const stops = [];
  
  Object.entries(COMMON_STANDS).forEach(([key, stand]) => {
    stops.push([stand.code, stand.fillColor]);
  });
  
  return {
    'fill-color': ['match', ['get', 'stand_code'], ...stops.flat(), '#888888'],
    'fill-opacity': 0.7,
    'fill-outline-color': '#333333'
  };
}

/**
 * Génère un style Leaflet pour un peuplement
 */
export function getLeafletStyle(standCode) {
  // Parser le code: CoverType(1) + Species(2-3) + Height(1) + Density(1) + Stage(3)
  const coverType = standCode.charAt(0);
  const species = standCode.substring(1, 4);
  const height = standCode.charAt(4);
  const density = standCode.charAt(5);
  const stage = standCode.substring(6, 9);
  
  const style = getStandStyle(coverType, species, height, density, stage);
  
  return {
    fillColor: style.fillColor,
    fillOpacity: style.fillOpacity,
    color: style.strokeColor,
    weight: style.strokeWidth,
    dashArray: style.strokeDasharray === 'none' ? null : style.strokeDasharray
  };
}

// ═══════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════

export default {
  COVER_TYPE_BASE,
  CONIFER_SPECIES,
  DECIDUOUS_SPECIES,
  MIXED_SPECIES,
  HEIGHT_CLASSES,
  DENSITY_CLASSES,
  DEVELOPMENT_STAGES,
  COMMON_STANDS,
  calculateStandColor,
  getStandStyle,
  generateCompletePalette,
  generateReferenceTable,
  generateMapboxStyle,
  getLeafletStyle,
  SVG_PATTERNS
};
