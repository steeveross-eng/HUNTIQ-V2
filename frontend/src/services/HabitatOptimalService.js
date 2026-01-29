/**
 * HabitatOptimalService.js
 * 
 * MODULE_HABITAT_OPTIMAL_SYNTHESE v2.0_BIONIC
 * 
 * Combine tous les modules thématiques, intègre l'analyse alimentaire 200%,
 * applique les pondérations inter-modules, la convergence, la rareté et
 * la cohérence spatiale pour générer la Carte BIONIC™.
 * 
 * MODULES ENTRANTS:
 * - ZONES_DE_REFUGE, ZONES_DE_FRAICHEUR, ZONES_D_ALIMENTATION
 * - ZONES_DE_DEPLACEMENTS, ZONES_DORTOIR, RUT_POTENTIEL
 * - SALINES_POTENTIELLES, AFFUTS_POTENTIELS, HYDROGRAPHIE_AVANCEE
 * - ENSOLEILLEMENT, ORIENTATION, PEUPLEMENTS_FORESTIERS
 * 
 * ESPÈCES SUPPORTÉES: Orignal, Chevreuil, Ours Noir, Dindon
 */

// ============================================
// CONFIGURATION DU MODULE
// ============================================
export const HABITAT_CONFIG = {
  version: '2.0_BIONIC',
  nom: 'HABITAT_OPTIMAL_SYNTHÈSE',
  analyseAlimentaireActif: true,
  convergenceActif: true,
  rareteActif: true,
  coherenceSpatiale: true
};

// ============================================
// ESPÈCES SUPPORTÉES
// ============================================
export const ESPECES = {
  ORIGNAL: {
    id: 'orignal',
    nom: 'Orignal',
    nomScientifique: 'Alces alces',
    icon: '🦌',
    couleur: '#8B4513',
    description: 'Grand cervidé des forêts boréales'
  },
  CHEVREUIL: {
    id: 'chevreuil',
    nom: 'Chevreuil',
    nomScientifique: 'Odocoileus virginianus',
    icon: '🦌',
    couleur: '#D2691E',
    description: 'Cervidé des forêts mixtes'
  },
  OURS_NOIR: {
    id: 'ours_noir',
    nom: 'Ours Noir',
    nomScientifique: 'Ursus americanus',
    icon: '🐻',
    couleur: '#2F4F4F',
    description: 'Omnivore opportuniste'
  },
  DINDON: {
    id: 'dindon',
    nom: 'Dindon Sauvage',
    nomScientifique: 'Meleagris gallopavo',
    icon: '🦃',
    couleur: '#8B0000',
    description: 'Gallinacé des forêts ouvertes'
  }
};

// ============================================
// MODULES THÉMATIQUES
// ============================================
export const MODULES_THEMATIQUES = {
  ZONES_DE_REFUGE: {
    id: 'refuge',
    nom: 'Zones de refuge',
    description: 'Couvert dense pour protection',
    icon: '🌲',
    couleur: '#2ECC71'
  },
  ZONES_DE_FRAICHEUR: {
    id: 'fraicheur',
    nom: 'Zones de fraîcheur',
    description: 'Points d\'eau et zones humides',
    icon: '💧',
    couleur: '#5DADE2'
  },
  ZONES_D_ALIMENTATION: {
    id: 'alimentation',
    nom: 'Zones d\'alimentation',
    description: 'Ressources alimentaires',
    icon: '🌿',
    couleur: '#A3E635'
  },
  ZONES_DE_DEPLACEMENTS: {
    id: 'deplacements',
    nom: 'Corridors de déplacements',
    description: 'Trajets de circulation',
    icon: '🦌',
    couleur: '#8E44AD'
  },
  ZONES_DORTOIR: {
    id: 'dortoir',
    nom: 'Zones dortoir',
    description: 'Aires de repos',
    icon: '💤',
    couleur: '#6E2C00'
  },
  RUT_POTENTIEL: {
    id: 'rut',
    nom: 'Rut potentiel',
    description: 'Zones de reproduction',
    icon: '💕',
    couleur: '#C0392B'
  },
  SALINES_POTENTIELLES: {
    id: 'salines',
    nom: 'Salines potentielles',
    description: 'Sources de minéraux',
    icon: '🧂',
    couleur: '#3498DB'
  },
  AFFUTS_POTENTIELS: {
    id: 'affuts',
    nom: 'Affûts potentiels',
    description: 'Points d\'observation stratégiques',
    icon: '🎯',
    couleur: '#E67E22'
  },
  HYDROGRAPHIE_AVANCEE: {
    id: 'hydrographie',
    nom: 'Hydrographie avancée',
    description: 'Réseau hydrique détaillé',
    icon: '🌊',
    couleur: '#5DADE2'
  },
  ENSOLEILLEMENT: {
    id: 'ensoleillement',
    nom: 'Ensoleillement',
    description: 'Exposition solaire',
    icon: '☀️',
    couleur: '#F1C40F'
  },
  ORIENTATION: {
    id: 'orientation',
    nom: 'Orientation',
    description: 'Exposition des pentes',
    icon: '🧭',
    couleur: '#A04000'
  },
  PEUPLEMENTS_FORESTIERS: {
    id: 'peuplements',
    nom: 'Peuplements forestiers',
    description: 'Types de forêts',
    icon: '🌳',
    couleur: '#6E2C00'
  }
};

// ============================================
// PONDÉRATIONS INTER-MODULES PAR ESPÈCE
// ============================================
export const PONDERATIONS = {
  ORIGNAL: {
    ZONES_DE_REFUGE: 0.20,
    ZONES_D_ALIMENTATION: 0.20,
    ZONES_DE_DEPLACEMENTS: 0.15,
    ZONES_DE_FRAICHEUR: 0.10,
    ZONES_DORTOIR: 0.10,
    HYDROGRAPHIE_AVANCEE: 0.10,
    ORIENTATION: 0.05,
    ENSOLEILLEMENT: 0.03,
    RUT_POTENTIEL: 0.03,
    SALINES_POTENTIELLES: 0.02,
    AFFUTS_POTENTIELS: 0.02,
    PEUPLEMENTS_FORESTIERS: 0.00,
    ANALYSE_ALIMENTAIRE_200: 0.20
  },
  CHEVREUIL: {
    ZONES_DE_REFUGE: 0.18,
    ZONES_D_ALIMENTATION: 0.25,
    ZONES_DE_DEPLACEMENTS: 0.15,
    ZONES_DORTOIR: 0.10,
    ZONES_DE_FRAICHEUR: 0.07,
    HYDROGRAPHIE_AVANCEE: 0.05,
    ORIENTATION: 0.05,
    ENSOLEILLEMENT: 0.05,
    RUT_POTENTIEL: 0.05,
    SALINES_POTENTIELLES: 0.03,
    AFFUTS_POTENTIELS: 0.02,
    PEUPLEMENTS_FORESTIERS: 0.00,
    ANALYSE_ALIMENTAIRE_200: 0.25
  },
  OURS_NOIR: {
    ZONES_DE_REFUGE: 0.15,
    ZONES_D_ALIMENTATION: 0.30,
    ZONES_DE_DEPLACEMENTS: 0.15,
    ZONES_DE_FRAICHEUR: 0.10,
    HYDROGRAPHIE_AVANCEE: 0.10,
    ZONES_DORTOIR: 0.05,
    PEUPLEMENTS_FORESTIERS: 0.05,
    SALINES_POTENTIELLES: 0.03,
    RUT_POTENTIEL: 0.03,
    AFFUTS_POTENTIELS: 0.02,
    ORIENTATION: 0.01,
    ENSOLEILLEMENT: 0.01,
    ANALYSE_ALIMENTAIRE_200: 0.30
  },
  DINDON: {
    ZONES_D_ALIMENTATION: 0.30,
    ZONES_DE_DEPLACEMENTS: 0.15,
    ZONES_DORTOIR: 0.15,
    ZONES_DE_REFUGE: 0.10,
    ENSOLEILLEMENT: 0.10,
    ORIENTATION: 0.05,
    HYDROGRAPHIE_AVANCEE: 0.05,
    AFFUTS_POTENTIELS: 0.05,
    RUT_POTENTIEL: 0.03,
    SALINES_POTENTIELLES: 0.02,
    ZONES_DE_FRAICHEUR: 0.00,
    PEUPLEMENTS_FORESTIERS: 0.00,
    ANALYSE_ALIMENTAIRE_200: 0.20
  }
};

// ============================================
// ANALYSE ALIMENTAIRE 200%
// ============================================

/**
 * Calcule la qualité alimentaire d'une zone
 * QUALITE = moyenne_normalisee(V2, V5, V9, POTENTIEL_BAIES, POTENTIEL_GLANDS, POTENTIEL_FRUITS, STADE_DEVELOPPEMENT)
 */
const calculerQualiteAlimentaire = (zoneData) => {
  const {
    V2 = 50,           // Variable végétation 2
    V5 = 50,           // Variable végétation 5
    V9 = 50,           // Variable végétation 9
    potentielBaies = 50,
    potentielGlands = 50,
    potentielFruits = 50,
    stadeDeveloppement = 50
  } = zoneData;
  
  const valeurs = [V2, V5, V9, potentielBaies, potentielGlands, potentielFruits, stadeDeveloppement];
  const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
  
  // Normaliser entre 0 et 100
  return Math.min(100, Math.max(0, moyenne));
};

/**
 * Calcule l'adéquation alimentaire selon l'espèce
 */
const calculerAdequationEspece = (qualite, espece, zoneData) => {
  const {
    feuillusTendres = 50,
    regeneration = 50,
    humidite = 50,
    glands = 50,
    fruits = 50,
    baies = 50,
    noix = 50,
    insectes = 50,
    graines = 50
  } = zoneData;
  
  let adequation = qualite;
  
  switch (espece) {
    case 'ORIGNAL':
      // ADEQUATION = f(QUALITE, feuillus_tendres, régénération, humidité)
      adequation = (qualite * 0.4) + (feuillusTendres * 0.25) + (regeneration * 0.2) + (humidite * 0.15);
      break;
      
    case 'CHEVREUIL':
      // ADEQUATION = f(QUALITE, feuillus_tendres, glands, fruits)
      adequation = (qualite * 0.4) + (feuillusTendres * 0.2) + (glands * 0.2) + (fruits * 0.2);
      break;
      
    case 'OURS_NOIR':
      // ADEQUATION = f(QUALITE, baies, fruits, noix)
      adequation = (qualite * 0.3) + (baies * 0.3) + (fruits * 0.2) + (noix * 0.2);
      break;
      
    case 'DINDON':
      // ADEQUATION = f(QUALITE, insectes, glands, graines)
      adequation = (qualite * 0.3) + (insectes * 0.25) + (glands * 0.25) + (graines * 0.2);
      break;
      
    default:
      adequation = qualite;
  }
  
  return Math.min(100, Math.max(0, adequation));
};

/**
 * Évalue les carences nutritionnelles
 * Nutriments: sodium, calcium, phosphore, proteines, energie, fibres, glucides, lipides
 */
const evaluerCarences = (zoneData, espece) => {
  const nutriments = ['sodium', 'calcium', 'phosphore', 'proteines', 'energie', 'fibres', 'glucides', 'lipides'];
  const carences = {};
  let totalPenalite = 0;
  
  // Besoins par espèce (simplifiés)
  const besoins = {
    ORIGNAL: { sodium: 70, calcium: 60, phosphore: 50, proteines: 80, energie: 75, fibres: 90, glucides: 40, lipides: 30 },
    CHEVREUIL: { sodium: 60, calcium: 70, phosphore: 55, proteines: 75, energie: 70, fibres: 85, glucides: 50, lipides: 35 },
    OURS_NOIR: { sodium: 50, calcium: 50, phosphore: 45, proteines: 85, energie: 90, fibres: 30, glucides: 70, lipides: 80 },
    DINDON: { sodium: 40, calcium: 80, phosphore: 60, proteines: 70, energie: 65, fibres: 50, glucides: 60, lipides: 40 }
  };
  
  const especeBesoins = besoins[espece] || besoins.ORIGNAL;
  
  nutriments.forEach(nutriment => {
    const disponible = zoneData[nutriment] || 50;
    const besoin = especeBesoins[nutriment];
    const ecart = besoin - disponible;
    
    let niveau, penalite;
    if (ecart <= 10) {
      niveau = 'faible';
      penalite = 0;
    } else if (ecart <= 30) {
      niveau = 'moyen';
      penalite = 5;
    } else {
      niveau = 'élevé';
      penalite = 10;
    }
    
    carences[nutriment] = { niveau, penalite, ecart };
    totalPenalite += penalite;
  });
  
  return { carences, totalPenalite };
};

/**
 * Calcule le score alimentaire final avec pénalités de carences
 * SCORE_ALIMENTAIRE_FINAL = ADEQUATION - pénalités_carençes
 */
const calculerScoreAlimentaireFinal = (adequation, carences) => {
  return Math.max(0, adequation - carences.totalPenalite);
};

/**
 * Module complet d'analyse alimentaire 200%
 */
export const analyseAlimentaire200 = (zoneData, espece) => {
  const qualite = calculerQualiteAlimentaire(zoneData);
  const adequation = calculerAdequationEspece(qualite, espece, zoneData);
  const carences = evaluerCarences(zoneData, espece);
  const scoreFinal = calculerScoreAlimentaireFinal(adequation, carences);
  
  return {
    qualite,
    adequation,
    carences: carences.carences,
    penaliteCarences: carences.totalPenalite,
    scoreFinal
  };
};

// ============================================
// CONVERGENCE
// ============================================

/**
 * Calcule la convergence des modules
 * CONVERGENCE = moyenne_des_5_meilleurs_scores_de_modules
 */
export const calculerConvergence = (scoresModules) => {
  const scores = Object.values(scoresModules).filter(s => typeof s === 'number');
  
  if (scores.length === 0) return 0;
  
  // Trier par score décroissant et prendre les 5 meilleurs
  const top5 = scores.sort((a, b) => b - a).slice(0, 5);
  
  // Moyenne des 5 meilleurs
  const convergence = top5.reduce((a, b) => a + b, 0) / top5.length;
  
  return Math.min(100, Math.max(0, convergence));
};

// ============================================
// RARETÉ
// ============================================

/**
 * Calcule la rareté d'une zone
 * RARETE = 1 - (surface_du_module / surface_totale)
 * Impact: HABITAT_OPTIMAL = HABITAT_OPTIMAL * (1 + RARETE * 0.15)
 */
export const calculerRarete = (surfaceModule, surfaceTotale) => {
  if (surfaceTotale <= 0) return 0;
  
  const ratio = surfaceModule / surfaceTotale;
  const rarete = 1 - Math.min(1, ratio);
  
  return rarete;
};

export const appliquerImpactRarete = (habitatOptimal, rarete) => {
  // HABITAT_OPTIMAL = HABITAT_OPTIMAL * (1 + RARETE * 0.15)
  return habitatOptimal * (1 + rarete * 0.15);
};

// ============================================
// COHÉRENCE SPATIALE
// ============================================

/**
 * Calcule la cohérence spatiale (moyenne des voisins 3x3)
 * COHERENCE = moyenne_des_voisins_3x3
 * Impact: HABITAT_OPTIMAL = (HABITAT_OPTIMAL + COHERENCE) / 2
 */
export const calculerCoherenceSpatiale = (zone, voisins) => {
  if (!voisins || voisins.length === 0) {
    return zone.score || 50;
  }
  
  const scoresVoisins = voisins.map(v => v.score || 50);
  const moyenne = scoresVoisins.reduce((a, b) => a + b, 0) / scoresVoisins.length;
  
  return moyenne;
};

export const appliquerCoherenceSpatiale = (habitatOptimal, coherence) => {
  // HABITAT_OPTIMAL = (HABITAT_OPTIMAL + COHERENCE) / 2
  return (habitatOptimal + coherence) / 2;
};

// ============================================
// CALCUL DU SCORE PAR MODULE
// ============================================

/**
 * Calcule le score d'un module pour une zone donnée
 */
const calculerScoreModule = (moduleId, zoneData, terrainData = {}) => {
  // Scores de base par module (peuvent être enrichis avec des données réelles)
  const baseScores = {
    ZONES_DE_REFUGE: zoneData.couvertDense || 50,
    ZONES_DE_FRAICHEUR: zoneData.proximiteEau || 50,
    ZONES_D_ALIMENTATION: zoneData.ressourcesAlimentaires || 50,
    ZONES_DE_DEPLACEMENTS: zoneData.accessibilite || 50,
    ZONES_DORTOIR: zoneData.tranquillite || 50,
    RUT_POTENTIEL: zoneData.activiteReproduction || 30,
    SALINES_POTENTIELLES: zoneData.mineralisation || 30,
    AFFUTS_POTENTIELS: zoneData.visibilite || 50,
    HYDROGRAPHIE_AVANCEE: zoneData.reseauHydrique || 50,
    ENSOLEILLEMENT: zoneData.expositionSolaire || 50,
    ORIENTATION: zoneData.orientationPente || 50,
    PEUPLEMENTS_FORESTIERS: zoneData.diversiteForestiere || 50
  };
  
  return baseScores[moduleId] || 50;
};

// ============================================
// SYNTHÈSE HABITAT OPTIMAL
// ============================================

/**
 * Calcule le score d'habitat optimal pour une zone
 * 
 * @param {Object} zoneData - Données de la zone
 * @param {string} espece - Espèce cible (ORIGNAL, CHEVREUIL, OURS_NOIR, DINDON)
 * @param {Object} options - Options de calcul
 * @returns {Object} Résultat complet avec score et détails
 */
export const calculerHabitatOptimal = (zoneData, espece = 'ORIGNAL', options = {}) => {
  const {
    appliquerConvergence = HABITAT_CONFIG.convergenceActif,
    appliquerRarete = HABITAT_CONFIG.rareteActif,
    appliquerCoherence = HABITAT_CONFIG.coherenceSpatiale,
    voisins = [],
    surfaceTotale = 1000000 // m²
  } = options;
  
  // Récupérer les pondérations de l'espèce
  const ponderations = PONDERATIONS[espece] || PONDERATIONS.ORIGNAL;
  
  // 1. Calculer les scores de chaque module
  const scoresModules = {};
  let habitatOptimal = 0;
  
  Object.keys(MODULES_THEMATIQUES).forEach(moduleId => {
    const score = calculerScoreModule(moduleId, zoneData);
    const poids = ponderations[moduleId] || 0;
    
    scoresModules[moduleId] = score;
    habitatOptimal += score * poids;
  });
  
  // 2. Ajouter l'analyse alimentaire 200%
  let analyseAlim = null;
  if (HABITAT_CONFIG.analyseAlimentaireActif) {
    analyseAlim = analyseAlimentaire200(zoneData, espece);
    const poidsAlim = ponderations.ANALYSE_ALIMENTAIRE_200 || 0.20;
    
    scoresModules.ANALYSE_ALIMENTAIRE_200 = analyseAlim.scoreFinal;
    
    // Intégration: HABITAT_OPTIMAL = (HABITAT_OPTIMAL + SCORE_ALIMENTAIRE_FINAL) / 2
    // Ajusté selon le poids
    habitatOptimal = (habitatOptimal * (1 - poidsAlim)) + (analyseAlim.scoreFinal * poidsAlim);
  }
  
  // 3. Appliquer la convergence
  let convergenceScore = 0;
  if (appliquerConvergence) {
    convergenceScore = calculerConvergence(scoresModules);
    // La convergence renforce le score
    habitatOptimal = (habitatOptimal + convergenceScore) / 2;
  }
  
  // 4. Appliquer la rareté
  let rareteScore = 0;
  if (appliquerRarete) {
    const surfaceZone = zoneData.surface || 10000; // m²
    rareteScore = calculerRarete(surfaceZone, surfaceTotale);
    habitatOptimal = appliquerImpactRarete(habitatOptimal, rareteScore);
  }
  
  // 5. Appliquer la cohérence spatiale
  let coherenceScore = 0;
  if (appliquerCoherence && voisins.length > 0) {
    coherenceScore = calculerCoherenceSpatiale(zoneData, voisins);
    habitatOptimal = appliquerCoherenceSpatiale(habitatOptimal, coherenceScore);
  }
  
  // 6. Clamp final entre 0 et 100
  const habitatFinal = Math.min(100, Math.max(0, habitatOptimal));
  
  // Déterminer le niveau de qualité
  let niveau;
  if (habitatFinal >= 80) niveau = 'EXCELLENT';
  else if (habitatFinal >= 65) niveau = 'TRÈS_BON';
  else if (habitatFinal >= 50) niveau = 'BON';
  else if (habitatFinal >= 35) niveau = 'MOYEN';
  else niveau = 'FAIBLE';
  
  return {
    habitatOptimal: habitatFinal,
    niveau,
    espece,
    scoresModules,
    analyseAlimentaire: analyseAlim,
    convergence: convergenceScore,
    rarete: rareteScore,
    coherenceSpatiale: coherenceScore,
    ponderationsUtilisees: ponderations,
    version: HABITAT_CONFIG.version
  };
};

// ============================================
// TRAITEMENT PAR LOT
// ============================================

/**
 * Calcule l'habitat optimal pour un ensemble de zones
 */
export const calculerHabitatOptimalBatch = (zones, espece = 'ORIGNAL', options = {}) => {
  if (!zones || zones.length === 0) return [];
  
  // Calculer la surface totale
  const surfaceTotale = zones.reduce((total, z) => total + (z.surface || 10000), 0);
  
  // Traiter chaque zone
  const resultats = zones.map((zone, index) => {
    // Trouver les voisins (zones adjacentes)
    const voisins = findVoisins(zone, zones, index);
    
    const resultat = calculerHabitatOptimal(zone, espece, {
      ...options,
      voisins,
      surfaceTotale
    });
    
    return {
      ...zone,
      habitatOptimal: resultat.habitatOptimal,
      niveauHabitat: resultat.niveau,
      detailsHabitat: resultat
    };
  });
  
  return resultats;
};

/**
 * Trouve les zones voisines (dans un rayon de 500m)
 */
const findVoisins = (zone, zones, currentIndex) => {
  const center = zone.center || [zone.lat, zone.lng];
  const rayonVoisinage = 500; // mètres
  
  return zones.filter((z, idx) => {
    if (idx === currentIndex) return false;
    
    const zCenter = z.center || [z.lat, z.lng];
    const distance = calculateDistance(center[0], center[1], zCenter[0], zCenter[1]);
    
    return distance <= rayonVoisinage;
  });
};

/**
 * Calcule la distance entre deux points (Haversine)
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ============================================
// IDENTIFICATION DES MEILLEURS POINTS DE CHASSE
// ============================================

/**
 * Identifie les meilleurs points de chasse dans un ensemble de zones
 */
export const identifierMeilleursPoints = (zones, espece = 'ORIGNAL', options = {}) => {
  const { nombrePoints = 10, seuilMinimum = 50 } = options;
  
  // Calculer l'habitat optimal pour toutes les zones
  const zonesAvecHabitat = calculerHabitatOptimalBatch(zones, espece, options);
  
  // Filtrer et trier par score
  const pointsValides = zonesAvecHabitat
    .filter(z => z.habitatOptimal >= seuilMinimum)
    .sort((a, b) => b.habitatOptimal - a.habitatOptimal);
  
  // Prendre les N meilleurs
  const meilleursPoints = pointsValides.slice(0, nombrePoints);
  
  // Ajouter un rang
  return meilleursPoints.map((point, index) => ({
    ...point,
    rang: index + 1,
    estMeilleurPoint: index < 3 // Top 3
  }));
};

// ============================================
// GÉNÉRATION DE LA CARTE BIONIC™
// ============================================

/**
 * Génère la Carte BIONIC™ complète pour une espèce
 */
export const genererCarteBionic = (zones, espece = 'ORIGNAL', options = {}) => {
  const {
    nombreMeilleursPoints = 10,
    seuilAffichage = 30
  } = options;
  
  // Calculer tous les scores
  const zonesProcessees = calculerHabitatOptimalBatch(zones, espece, options);
  
  // Filtrer selon le seuil
  const zonesAffichees = zonesProcessees.filter(z => z.habitatOptimal >= seuilAffichage);
  
  // Identifier les meilleurs points
  const meilleursPoints = identifierMeilleursPoints(zones, espece, {
    ...options,
    nombrePoints: nombreMeilleursPoints
  });
  
  // Statistiques globales
  const stats = {
    totalZones: zones.length,
    zonesAffichees: zonesAffichees.length,
    zonesExclues: zones.length - zonesAffichees.length,
    scoresMoyens: {
      global: zonesProcessees.reduce((s, z) => s + z.habitatOptimal, 0) / zonesProcessees.length,
      affichees: zonesAffichees.reduce((s, z) => s + z.habitatOptimal, 0) / (zonesAffichees.length || 1)
    },
    distribution: {
      excellent: zonesProcessees.filter(z => z.niveauHabitat === 'EXCELLENT').length,
      tresBon: zonesProcessees.filter(z => z.niveauHabitat === 'TRÈS_BON').length,
      bon: zonesProcessees.filter(z => z.niveauHabitat === 'BON').length,
      moyen: zonesProcessees.filter(z => z.niveauHabitat === 'MOYEN').length,
      faible: zonesProcessees.filter(z => z.niveauHabitat === 'FAIBLE').length
    },
    espece: ESPECES[espece],
    ponderations: PONDERATIONS[espece],
    version: HABITAT_CONFIG.version
  };
  
  return {
    zones: zonesAffichees,
    meilleursPoints,
    stats,
    espece,
    timestamp: new Date().toISOString()
  };
};

// ============================================
// EXPORTS
// ============================================
export default {
  // Configuration
  HABITAT_CONFIG,
  ESPECES,
  MODULES_THEMATIQUES,
  PONDERATIONS,
  
  // Analyse alimentaire
  analyseAlimentaire200,
  
  // Calculs
  calculerConvergence,
  calculerRarete,
  calculerCoherenceSpatiale,
  calculerHabitatOptimal,
  calculerHabitatOptimalBatch,
  
  // Points de chasse
  identifierMeilleursPoints,
  
  // Carte BIONIC
  genererCarteBionic
};
