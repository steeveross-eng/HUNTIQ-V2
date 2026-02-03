/**
 * ForestStandReferenceTable.js
 * 
 * TABLEAU DE RÉFÉRENCE COMPLET DES PEUPLEMENTS FORESTIERS
 * Couleurs pré-calculées selon la palette MFFP
 * 
 * FORMAT: Prêt à intégrer dans Mapbox GL JS, Leaflet, QGIS
 */

// ═══════════════════════════════════════════════════════════════
// TABLEAU DE RÉFÉRENCE - PEUPLEMENTS FORESTIERS QUÉBEC
// ═══════════════════════════════════════════════════════════════

export const FOREST_STAND_REFERENCE = [
  // ═══════════════════════════════════════════════════════════════
  // CONIFÉRIENS (C) - Base verte froide (Hue: 145)
  // ═══════════════════════════════════════════════════════════════
  
  // ─── ÉPINETTE NOIRE (EPN) ───
  { code: 'CEPN1AREG', coverType: 'Coniférien', species: 'Épinette noire', height: '0-7m', density: '80-100%', stage: 'Régénération', hex: '#7dd9a1', texture: 'pointillé fin' },
  { code: 'CEPN2BJEU', coverType: 'Coniférien', species: 'Épinette noire', height: '7-12m', density: '60-80%', stage: 'Jeune', hex: '#4dbd7a', texture: 'hachures légères' },
  { code: 'CEPN3BMAT', coverType: 'Coniférien', species: 'Épinette noire', height: '12-17m', density: '60-80%', stage: 'Mature', hex: '#3da366', texture: 'plein' },
  { code: 'CEPN4AMAT', coverType: 'Coniférien', species: 'Épinette noire', height: '17-22m', density: '80-100%', stage: 'Mature', hex: '#339957', texture: 'plein' },
  { code: 'CEPN5AMAT', coverType: 'Coniférien', species: 'Épinette noire', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#267343', texture: 'plein' },
  { code: 'CEPN6AVIN', coverType: 'Coniférien', species: 'Épinette noire', height: '27m+', density: '80-100%', stage: 'Vieille forêt', hex: '#1a5c34', texture: 'double contour' },
  { code: 'CEPN5ASUR', coverType: 'Coniférien', species: 'Épinette noire', height: '22-27m', density: '80-100%', stage: 'Suranné', hex: '#267343', texture: 'contour renforcé' },
  
  // ─── ÉPINETTE BLANCHE (EPB) ───
  { code: 'CEPB4AMAT', coverType: 'Coniférien', species: 'Épinette blanche', height: '17-22m', density: '80-100%', stage: 'Mature', hex: '#36a35d', texture: 'plein' },
  { code: 'CEPB5AMAT', coverType: 'Coniférien', species: 'Épinette blanche', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#2a7d48', texture: 'plein' },
  { code: 'CEPB3BJEU', coverType: 'Coniférien', species: 'Épinette blanche', height: '12-17m', density: '60-80%', stage: 'Jeune', hex: '#40ad6c', texture: 'hachures légères' },
  
  // ─── SAPIN BAUMIER (SAB) ───
  { code: 'CSAB4AMAT', coverType: 'Coniférien', species: 'Sapin baumier', height: '17-22m', density: '80-100%', stage: 'Mature', hex: '#3db363', texture: 'plein' },
  { code: 'CSAB5AMAT', coverType: 'Coniférien', species: 'Sapin baumier', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#308d4e', texture: 'plein' },
  { code: 'CSAB3BJEU', coverType: 'Coniférien', species: 'Sapin baumier', height: '12-17m', density: '60-80%', stage: 'Jeune', hex: '#4abd72', texture: 'hachures légères' },
  { code: 'CSAB6AVIN', coverType: 'Coniférien', species: 'Sapin baumier', height: '27m+', density: '80-100%', stage: 'Vieille forêt', hex: '#24703c', texture: 'double contour' },
  
  // ─── PIN GRIS (PIG) ───
  { code: 'CPIG4BMAT', coverType: 'Coniférien', species: 'Pin gris', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#4db86a', texture: 'plein' },
  { code: 'CPIG5AMAT', coverType: 'Coniférien', species: 'Pin gris', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#389253', texture: 'plein' },
  { code: 'CPIG3CMAT', coverType: 'Coniférien', species: 'Pin gris', height: '12-17m', density: '40-60%', stage: 'Mature', hex: '#6fc98a', texture: 'plein' },
  
  // ─── PIN BLANC (PIB) ───
  { code: 'CPIB4BMAT', coverType: 'Coniférien', species: 'Pin blanc', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#52bd6f', texture: 'plein' },
  { code: 'CPIB5AMAT', coverType: 'Coniférien', species: 'Pin blanc', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#3d9658', texture: 'plein' },
  { code: 'CPIB6AVIN', coverType: 'Coniférien', species: 'Pin blanc', height: '27m+', density: '80-100%', stage: 'Vieille forêt', hex: '#2e7844', texture: 'double contour' },
  
  // ─── PIN ROUGE (PIR) ───
  { code: 'CPIR5AMAT', coverType: 'Coniférien', species: 'Pin rouge', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#42995c', texture: 'plein' },
  { code: 'CPIR4BMAT', coverType: 'Coniférien', species: 'Pin rouge', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#57c274', texture: 'plein' },
  
  // ─── THUYA / CÈDRE (THO) ───
  { code: 'CTHO4AMAT', coverType: 'Coniférien', species: 'Thuya occidental', height: '17-22m', density: '80-100%', stage: 'Mature', hex: '#2a8f4d', texture: 'plein' },
  { code: 'CTHO3CMAT', coverType: 'Coniférien', species: 'Thuya occidental', height: '12-17m', density: '40-60%', stage: 'Mature', hex: '#5fb87a', texture: 'plein' },
  { code: 'CTHO5AVIN', coverType: 'Coniférien', species: 'Thuya occidental', height: '22-27m', density: '80-100%', stage: 'Vieille forêt', hex: '#1f6e3b', texture: 'double contour' },
  
  // ─── MÉLÈZE (MEL) ───
  { code: 'CMEL4BMAT', coverType: 'Coniférien', species: 'Mélèze laricin', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#5fc77a', texture: 'plein' },
  { code: 'CMEL3CMAT', coverType: 'Coniférien', species: 'Mélèze laricin', height: '12-17m', density: '40-60%', stage: 'Mature', hex: '#7ed49a', texture: 'plein' },
  
  // ─── PRUCHE (PRU) ───
  { code: 'CPRU5AMAT', coverType: 'Coniférien', species: 'Pruche', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#298048', texture: 'plein' },
  { code: 'CPRU4BMAT', coverType: 'Coniférien', species: 'Pruche', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#3aa55d', texture: 'plein' },
  
  // ─── RÉSINEUX GÉNÉRAL (RES) ───
  { code: 'CRES1CREG', coverType: 'Coniférien', species: 'Résineux (général)', height: '0-7m', density: '40-60%', stage: 'Régénération', hex: '#8fe0b0', texture: 'pointillé fin' },
  { code: 'CRES4BMAT', coverType: 'Coniférien', species: 'Résineux (général)', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#40a860', texture: 'plein' },
  
  // ═══════════════════════════════════════════════════════════════
  // FEUILLUS (F) - Base jaune-orangé chaude (Hue: 38)
  // ═══════════════════════════════════════════════════════════════
  
  // ─── ÉRABLE À SUCRE (ERS) ───
  { code: 'FERS1AREG', coverType: 'Feuillu', species: 'Érable à sucre', height: '0-7m', density: '80-100%', stage: 'Régénération', hex: '#f5c96d', texture: 'pointillé fin' },
  { code: 'FERS2BJEU', coverType: 'Feuillu', species: 'Érable à sucre', height: '7-12m', density: '60-80%', stage: 'Jeune', hex: '#e0a83d', texture: 'hachures légères' },
  { code: 'FERS3BJEU', coverType: 'Feuillu', species: 'Érable à sucre', height: '12-17m', density: '60-80%', stage: 'Jeune', hex: '#cc9530', texture: 'hachures légères' },
  { code: 'FERS4AMAT', coverType: 'Feuillu', species: 'Érable à sucre', height: '17-22m', density: '80-100%', stage: 'Mature', hex: '#c48a28', texture: 'plein' },
  { code: 'FERS5AMAT', coverType: 'Feuillu', species: 'Érable à sucre', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#a6751f', texture: 'plein' },
  { code: 'FERS6AVIN', coverType: 'Feuillu', species: 'Érable à sucre', height: '27m+', density: '80-100%', stage: 'Vieille forêt', hex: '#8a6018', texture: 'double contour' },
  
  // ─── ÉRABLE ROUGE (ERR) ───
  { code: 'FERR4BMAT', coverType: 'Feuillu', species: 'Érable rouge', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#d9852e', texture: 'plein' },
  { code: 'FERR5AMAT', coverType: 'Feuillu', species: 'Érable rouge', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#b87025', texture: 'plein' },
  { code: 'FERR3BJEU', coverType: 'Feuillu', species: 'Érable rouge', height: '12-17m', density: '60-80%', stage: 'Jeune', hex: '#e5993a', texture: 'hachures légères' },
  
  // ─── BOULEAU JAUNE (BOJ) ───
  { code: 'FBOJ4BMAT', coverType: 'Feuillu', species: 'Bouleau jaune', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#c9a040', texture: 'plein' },
  { code: 'FBOJ5BMAT', coverType: 'Feuillu', species: 'Bouleau jaune', height: '22-27m', density: '60-80%', stage: 'Mature', hex: '#a88835', texture: 'plein' },
  { code: 'FBOJ5AMAT', coverType: 'Feuillu', species: 'Bouleau jaune', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#9c7e30', texture: 'plein' },
  
  // ─── BOULEAU BLANC (BOP) ───
  { code: 'FBOP4BMAT', coverType: 'Feuillu', species: 'Bouleau blanc', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#bfb050', texture: 'plein' },
  { code: 'FBOP3CMAT', coverType: 'Feuillu', species: 'Bouleau blanc', height: '12-17m', density: '40-60%', stage: 'Mature', hex: '#d4c578', texture: 'plein' },
  { code: 'FBOP2BJEU', coverType: 'Feuillu', species: 'Bouleau blanc', height: '7-12m', density: '60-80%', stage: 'Jeune', hex: '#d0be60', texture: 'hachures légères' },
  
  // ─── HÊTRE (HEG) ───
  { code: 'FHEG5AMAT', coverType: 'Feuillu', species: 'Hêtre à grandes feuilles', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#b07828', texture: 'plein' },
  { code: 'FHEG4BMAT', coverType: 'Feuillu', species: 'Hêtre à grandes feuilles', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#d49038', texture: 'plein' },
  
  // ─── CHÊNE ROUGE (CHR) ───
  { code: 'FCHR5AMAT', coverType: 'Feuillu', species: 'Chêne rouge', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#c26825', texture: 'plein' },
  { code: 'FCHR4BMAT', coverType: 'Feuillu', species: 'Chêne rouge', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#e07d35', texture: 'plein' },
  
  // ─── PEUPLIER FAUX-TREMBLE (PET) ───
  { code: 'FPET4BMAT', coverType: 'Feuillu', species: 'Peuplier faux-tremble', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#b5b855', texture: 'plein' },
  { code: 'FPET3CMAT', coverType: 'Feuillu', species: 'Peuplier faux-tremble', height: '12-17m', density: '40-60%', stage: 'Mature', hex: '#ccd080', texture: 'plein' },
  { code: 'FPET2BJEU', coverType: 'Feuillu', species: 'Peuplier faux-tremble', height: '7-12m', density: '60-80%', stage: 'Jeune', hex: '#c5c865', texture: 'hachures légères' },
  
  // ─── FRÊNE NOIR (FRN) ───
  { code: 'FFRN4BMAT', coverType: 'Feuillu', species: 'Frêne noir', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#c9a242', texture: 'plein' },
  { code: 'FFRN3CMAT', coverType: 'Feuillu', species: 'Frêne noir', height: '12-17m', density: '40-60%', stage: 'Mature', hex: '#e0bc70', texture: 'plein' },
  
  // ─── FEUILLU GÉNÉRAL (FEU) ───
  { code: 'FFEU1CREG', coverType: 'Feuillu', species: 'Feuillu (général)', height: '0-7m', density: '40-60%', stage: 'Régénération', hex: '#f0d080', texture: 'pointillé fin' },
  { code: 'FFEU4BMAT', coverType: 'Feuillu', species: 'Feuillu (général)', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#d4a040', texture: 'plein' },
  
  // ═══════════════════════════════════════════════════════════════
  // MÉLANGÉS (M) - Base olive/brun-vert (Hue: 75)
  // ═══════════════════════════════════════════════════════════════
  
  // ─── MIXTE GÉNÉRAL (MIX) ───
  { code: 'MMIX1CREG', coverType: 'Mélangé', species: 'Mixte (général)', height: '0-7m', density: '40-60%', stage: 'Régénération', hex: '#c4d078', texture: 'pointillé fin' },
  { code: 'MMIX2BJEU', coverType: 'Mélangé', species: 'Mixte (général)', height: '7-12m', density: '60-80%', stage: 'Jeune', hex: '#a8b850', texture: 'hachures légères' },
  { code: 'MMIX4BMAT', coverType: 'Mélangé', species: 'Mixte (général)', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#8a9840', texture: 'plein' },
  { code: 'MMIX5AMAT', coverType: 'Mélangé', species: 'Mixte (général)', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#6e7a32', texture: 'plein' },
  
  // ─── MIXTE DOMINANCE RÉSINEUSE (MIS) ───
  { code: 'MMIS4BMAT', coverType: 'Mélangé', species: 'Mixte à dominance résineuse', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#7fa848', texture: 'plein' },
  { code: 'MMIS5AMAT', coverType: 'Mélangé', species: 'Mixte à dominance résineuse', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#658838', texture: 'plein' },
  { code: 'MMIS3BJEU', coverType: 'Mélangé', species: 'Mixte à dominance résineuse', height: '12-17m', density: '60-80%', stage: 'Jeune', hex: '#90b855', texture: 'hachures légères' },
  
  // ─── MIXTE DOMINANCE FEUILLUE (MIF) ───
  { code: 'MMIF4BMAT', coverType: 'Mélangé', species: 'Mixte à dominance feuillue', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#9a9040', texture: 'plein' },
  { code: 'MMIF5AMAT', coverType: 'Mélangé', species: 'Mixte à dominance feuillue', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#7e7432', texture: 'plein' },
  { code: 'MMIF3BJEU', coverType: 'Mélangé', species: 'Mixte à dominance feuillue', height: '12-17m', density: '60-80%', stage: 'Jeune', hex: '#aba050', texture: 'hachures légères' },
  
  // ─── RÉSINEUX-ÉRABLE (REM) ───
  { code: 'MREM4BMAT', coverType: 'Mélangé', species: 'Résineux-Érable', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#909845', texture: 'plein' },
  { code: 'MREM5AMAT', coverType: 'Mélangé', species: 'Résineux-Érable', height: '22-27m', density: '80-100%', stage: 'Mature', hex: '#747c38', texture: 'plein' },
  
  // ─── FEUILLU INTOLÉRANT-MIXTE (FIM) ───
  { code: 'MFIM4BMAT', coverType: 'Mélangé', species: 'Feuillu intolérant-Mixte', height: '17-22m', density: '60-80%', stage: 'Mature', hex: '#959542', texture: 'plein' },
  { code: 'MFIM3CMAT', coverType: 'Mélangé', species: 'Feuillu intolérant-Mixte', height: '12-17m', density: '40-60%', stage: 'Mature', hex: '#b0b068', texture: 'plein' }
];

// ═══════════════════════════════════════════════════════════════
// LÉGENDE SIMPLIFIÉE POUR L'UI
// ═══════════════════════════════════════════════════════════════

export const FOREST_LEGEND_SIMPLIFIED = {
  // Types principaux
  types: [
    { id: 'C', name: 'Coniférien', color: '#339957', icon: '🌲', description: 'Forêt résineuse' },
    { id: 'M', name: 'Mélangé', color: '#8a9840', icon: '🌲🌳', description: 'Forêt mixte' },
    { id: 'F', name: 'Feuillu', color: '#c48a28', icon: '🌳', description: 'Forêt feuillue' }
  ],
  
  // Essences principales
  conifers: [
    { code: 'EPN', name: 'Épinette noire', color: '#267343', coverage: '95%' },
    { code: 'SAB', name: 'Sapin baumier', color: '#308d4e', coverage: '85-90%' },
    { code: 'PIB', name: 'Pin blanc', color: '#3d9658', coverage: '80%' },
    { code: 'THO', name: 'Thuya (Cèdre)', color: '#2a8f4d', coverage: '75%' }
  ],
  
  deciduous: [
    { code: 'ERS', name: 'Érable à sucre', color: '#a6751f', coverage: '90%' },
    { code: 'BOJ', name: 'Bouleau jaune', color: '#9c7e30', coverage: '85%' },
    { code: 'PET', name: 'Peuplier', color: '#b5b855', coverage: '80%' },
    { code: 'HEG', name: 'Hêtre', color: '#b07828', coverage: '75%' }
  ],
  
  mixed: [
    { code: 'MIS', name: 'Mixte résineux', color: '#658838', coverage: '80-100%' },
    { code: 'MIF', name: 'Mixte feuillu', color: '#7e7432', coverage: '80-100%' },
    { code: 'MIX', name: 'Mixte équilibré', color: '#8a9840', coverage: '70-80%' }
  ],
  
  // Classes de hauteur (pour légende)
  heights: [
    { class: 'H1', range: '0-7m', luminosity: 'Très clair', description: 'Régénération' },
    { class: 'H2', range: '7-12m', luminosity: 'Clair', description: 'Jeune' },
    { class: 'H3', range: '12-17m', luminosity: 'Moyen-clair', description: 'Gaulis' },
    { class: 'H4', range: '17-22m', luminosity: 'Moyen', description: 'Perchis' },
    { class: 'H5', range: '22-27m', luminosity: 'Moyen-foncé', description: 'Futaie' },
    { class: 'H6', range: '27m+', luminosity: 'Foncé', description: 'Futaie mature' }
  ],
  
  // Classes de densité
  densities: [
    { class: 'A', range: '80-100%', saturation: 'Très saturé', description: 'Couvert fermé' },
    { class: 'B', range: '60-80%', saturation: 'Saturé', description: 'Couvert régulier' },
    { class: 'C', range: '40-60%', saturation: 'Moyen', description: 'Couvert irrégulier' },
    { class: 'D', range: '25-40%', saturation: 'Désaturé', description: 'Couvert ouvert' }
  ],
  
  // Stades de développement
  stages: [
    { code: 'REG', name: 'Régénération', texture: 'Pointillé fin', age: '< 10 ans' },
    { code: 'JEU', name: 'Jeune', texture: 'Hachures légères', age: '10-30 ans' },
    { code: 'MAT', name: 'Mature', texture: 'Plein (aucun motif)', age: '30-80 ans' },
    { code: 'SUR', name: 'Suranné', texture: 'Contour renforcé', age: '> 80 ans' },
    { code: 'VIN', name: 'Vieille forêt', texture: 'Double contour', age: '> 120 ans' }
  ]
};

// ═══════════════════════════════════════════════════════════════
// EXPORT MAPBOX STYLE EXPRESSION
// ═══════════════════════════════════════════════════════════════

export const MAPBOX_FOREST_STYLE = {
  'fill-color': [
    'match',
    ['get', 'TYPE_COUV'],
    // Conifériens
    'C', ['interpolate', ['linear'], ['get', 'HAUTEUR'],
      7, '#7dd9a1',
      12, '#4dbd7a',
      17, '#3da366',
      22, '#339957',
      27, '#267343'
    ],
    // Feuillus
    'F', ['interpolate', ['linear'], ['get', 'HAUTEUR'],
      7, '#f5c96d',
      12, '#e0a83d',
      17, '#c48a28',
      22, '#a6751f',
      27, '#8a6018'
    ],
    // Mélangés
    'M', ['interpolate', ['linear'], ['get', 'HAUTEUR'],
      7, '#c4d078',
      12, '#a8b850',
      17, '#8a9840',
      22, '#6e7a32',
      27, '#586428'
    ],
    '#888888' // Fallback
  ],
  'fill-opacity': [
    'match',
    ['get', 'DENSITE'],
    'A', 0.85,
    'B', 0.75,
    'C', 0.60,
    'D', 0.45,
    0.70
  ]
};

export default {
  FOREST_STAND_REFERENCE,
  FOREST_LEGEND_SIMPLIFIED,
  MAPBOX_FOREST_STYLE
};
