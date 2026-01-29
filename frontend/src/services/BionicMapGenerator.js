/**
 * GENERATEUR_CARTE_BIONIC v3.3 - BIONIC Intelligence Plus Scoring Total
 * 
 * Génère la Carte BIONIC™ complète en combinant:
 * - Modules thématiques avec scoring détaillé par variable
 * - Analyse alimentaire 200% avec carences nutritionnelles
 * - Pondérations inter-modules avancées
 * - Convergence, rareté, cohérence spatiale
 * - Hotspots et meilleurs points de chasse
 * - Recommandations IA multi-niveaux
 * - Recommandations produits intelligentes
 * - Analyse météo/saison avec facteurs détaillés
 * - Approche optimale avec simulation de vent
 * - Moteur de simulation IA des déplacements du gibier
 * - Scoring détaillé à chaque étape (variable, module, espèce, météo, approche, simulation)
 * 
 * VERSION: 3.3_BIONIC_INTELLIGENCE_PLUS_SCORING_TOTAL
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION GLOBALE v3.3
// ═══════════════════════════════════════════════════════════════

export const BIONIC_GENERATOR_CONFIG = {
  version: '3.3_BIONIC_INTELLIGENCE_PLUS_SCORING_TOTAL',
  resolution_interne_m: 10,
  seuil_hotspot: 80,
  rasterisation: true,
  scoring_detaille: true,
  afficher_variables: true
};

// ═══════════════════════════════════════════════════════════════
// VARIABLES UNIVERSELLES DE SCORING (V1-V11)
// ═══════════════════════════════════════════════════════════════

export const VARIABLES_UNIVERSELLES = {
  V1: { id: 'V1', nom: 'Densité du couvert', description: 'Densité du couvert forestier normalisée (0-1)', unite: '%' },
  V2: { id: 'V2', nom: 'Type de couvert', description: 'Classification du type de couvert végétal (0-1)', unite: 'type' },
  V3: { id: 'V3', nom: 'Distance à l\'eau', description: 'Proximité aux points d\'eau (0-1, inverse)', unite: 'm' },
  V4: { id: 'V4', nom: 'Distance routes', description: 'Éloignement des routes (0-1)', unite: 'm' },
  V5: { id: 'V5', nom: 'Densité sous-bois', description: 'Densité de la végétation de sous-bois (0-1)', unite: '%' },
  V6: { id: 'V6', nom: 'Pente', description: 'Inclinaison du terrain normalisée (0-1)', unite: '°' },
  V7: { id: 'V7', nom: 'Orientation', description: 'Exposition solaire du versant (0-1)', unite: 'cardinal' },
  V8: { id: 'V8', nom: 'Perturbation humaine', description: 'Niveau de perturbation anthropique (0-1, inverse)', unite: 'index' },
  V9: { id: 'V9', nom: 'Proximité alimentation', description: 'Distance aux sources alimentaires (0-1)', unite: 'm' },
  V10: { id: 'V10', nom: 'Humidité du sol', description: 'Niveau d\'humidité du sol (0-1)', unite: '%' },
  V11: { id: 'V11', nom: 'Distance urbain', description: 'Éloignement des zones urbaines (0-1)', unite: 'km' }
};

// ═══════════════════════════════════════════════════════════════
// COULEURS BIONIC SIGNATURE POUR RENDU CARTOGRAPHIQUE
// ═══════════════════════════════════════════════════════════════

export const COULEURS_BIONIC_SIGNATURE = {
  // Couleurs principales
  primary: '#f5a623',
  secondary: '#ff6b00',
  accent: '#ffd700',
  glow: '#ff8c00',
  
  // Échelle de scoring
  scoring: {
    excellent: '#00ff88',    // 85-100
    tres_bon: '#88ff00',     // 70-84
    bon: '#ffdd00',          // 55-69
    moyen: '#ff8800',        // 40-54
    faible: '#ff3366'        // 0-39
  },
  
  // Peuplements forestiers (très colorés)
  peuplements: {
    resineux_dense: '#00ff66',      // Vert néon intense
    resineux: '#00cc44',            // Vert sapin vif
    mixte_resineux: '#66ff33',      // Vert-jaune vif
    mixte_feuillus: '#99ff00',      // Jaune-vert
    feuillus: '#ffdd00',            // Jaune doré
    feuillus_dense: '#ffaa00',      // Orange doré
    jeune_foret: '#88ffcc',         // Vert clair cyan
    foret_mature: '#009944',        // Vert profond
    regeneration: '#ccff66',        // Lime vif
    perturbation: '#ff6699'         // Rose vif
  },
  
  // Zones spéciales
  zones: {
    hotspot_haute: '#ff3300',       // Rouge-orange vif
    hotspot_moyenne: '#ff9900',     // Orange
    hotspot_basse: '#ffcc00',       // Jaune
    eau: '#00d4ff',                 // Cyan électrique
    milieu_humide: '#00ffcc',       // Turquoise
    corridor: '#cc66ff',            // Violet
    refuge: '#6666ff',              // Bleu-violet
    alimentation: '#66ff66'         // Vert vif
  }
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 1: NORMALISATION DES DONNÉES (avec variables V1-V11)
// ═══════════════════════════════════════════════════════════════

export const normaliserDonnees = (donnees) => {
  const {
    ecoforestier,
    mnt_lidar,
    hydrographie,
    reseau_routier,
    zones_urbaines,
    waypoints,
    meteo,
    date_saison
  } = donnees;

  // Calculer les variables universelles normalisées
  const variables = calculerVariablesUniverselles(donnees);

  return {
    ecoforestier: normaliserCouche(ecoforestier, 'ecoforestier'),
    elevation: normaliserCouche(mnt_lidar, 'elevation'),
    hydrographie: normaliserCouche(hydrographie, 'hydrographie'),
    routes: normaliserCouche(reseau_routier, 'routes'),
    urbain: normaliserCouche(zones_urbaines, 'urbain'),
    waypoints: waypoints || [],
    meteo: meteo || getMeteoDefaut(),
    date_saison: date_saison || getDateSaisonActuelle(),
    resolution_m: BIONIC_GENERATOR_CONFIG.resolution_interne_m,
    variables_universelles: variables,
    scoring_detaille: {
      actif: BIONIC_GENERATOR_CONFIG.scoring_detaille,
      variables_calculees: Object.keys(variables).length
    }
  };
};

/**
 * Calcule les 11 variables universelles normalisées (0-1)
 */
const calculerVariablesUniverselles = (donnees) => {
  const eco = donnees.ecoforestier?.data || {};
  const elev = donnees.mnt_lidar?.data || {};
  const hydro = donnees.hydrographie?.data || {};
  const routes = donnees.reseau_routier?.data || {};
  const urbain = donnees.zones_urbaines?.data || {};
  
  return {
    V1: { 
      valeur: eco.densite || 0.65, 
      nom: VARIABLES_UNIVERSELLES.V1.nom,
      description: 'Couvert forestier dense favorable',
      score_contribution: (eco.densite || 0.65) * 100
    },
    V2: { 
      valeur: eco.type_couvert || 0.7, 
      nom: VARIABLES_UNIVERSELLES.V2.nom,
      description: 'Type de couvert mixte à résineux',
      score_contribution: (eco.type_couvert || 0.7) * 100
    },
    V3: { 
      valeur: 1 - (hydro.distance_eau || 0.4), 
      nom: VARIABLES_UNIVERSELLES.V3.nom,
      description: 'Proximité aux points d\'eau',
      score_contribution: (1 - (hydro.distance_eau || 0.4)) * 100
    },
    V4: { 
      valeur: routes.distance_routes || 0.6, 
      nom: VARIABLES_UNIVERSELLES.V4.nom,
      description: 'Éloignement des perturbations routières',
      score_contribution: (routes.distance_routes || 0.6) * 100
    },
    V5: { 
      valeur: eco.sous_bois || 0.55, 
      nom: VARIABLES_UNIVERSELLES.V5.nom,
      description: 'Végétation de sous-bois présente',
      score_contribution: (eco.sous_bois || 0.55) * 100
    },
    V6: { 
      valeur: elev.pente_norm || 0.35, 
      nom: VARIABLES_UNIVERSELLES.V6.nom,
      description: 'Pente modérée favorable',
      score_contribution: (elev.pente_norm || 0.35) * 100
    },
    V7: { 
      valeur: elev.orientation || 0.6, 
      nom: VARIABLES_UNIVERSELLES.V7.nom,
      description: 'Orientation sud-ouest favorable',
      score_contribution: (elev.orientation || 0.6) * 100
    },
    V8: { 
      valeur: 1 - (urbain.perturbation || 0.2), 
      nom: VARIABLES_UNIVERSELLES.V8.nom,
      description: 'Faible perturbation humaine',
      score_contribution: (1 - (urbain.perturbation || 0.2)) * 100
    },
    V9: { 
      valeur: eco.alimentation || 0.7, 
      nom: VARIABLES_UNIVERSELLES.V9.nom,
      description: 'Ressources alimentaires accessibles',
      score_contribution: (eco.alimentation || 0.7) * 100
    },
    V10: { 
      valeur: hydro.humidite_sol || 0.5, 
      nom: VARIABLES_UNIVERSELLES.V10.nom,
      description: 'Humidité du sol modérée',
      score_contribution: (hydro.humidite_sol || 0.5) * 100
    },
    V11: { 
      valeur: urbain.distance_urbain || 0.8, 
      nom: VARIABLES_UNIVERSELLES.V11.nom,
      description: 'Zone éloignée des centres urbains',
      score_contribution: (urbain.distance_urbain || 0.8) * 100
    }
  };
};

const normaliserCouche = (couche, type) => {
  if (!couche) return { type, data: null, normalized: true };
  return {
    type,
    data: couche,
    normalized: true,
    resolution: BIONIC_GENERATOR_CONFIG.resolution_interne_m
  };
};

const getMeteoDefaut = () => ({
  temperature: 15,
  vent_direction: 'NO',
  vent_force: 10,
  pression: 1015,
  precipitations: 0,
  humidite: 60
});

const getDateSaisonActuelle = () => {
  const now = new Date();
  const month = now.getMonth();
  let saison = 'ete';
  if (month >= 2 && month <= 4) saison = 'printemps';
  else if (month >= 5 && month <= 7) saison = 'ete';
  else if (month >= 8 && month <= 10) saison = 'automne';
  else saison = 'hiver';
  
  return {
    date: now,
    saison,
    heure: now.getHours(),
    periode_rut: month >= 9 && month <= 11
  };
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 2: MODULES THÉMATIQUES
// ═══════════════════════════════════════════════════════════════

export const MODULES_THEMATIQUES = {
  ZONES_DE_REFUGE: {
    id: 'refuge',
    nom: 'Zones de refuge',
    description: 'Couvert dense pour protection du gibier',
    icon: '🏠',
    poids_defaut: { orignal: 0.20, chevreuil: 0.18, ours: 0.15, dindon: 0.12 },
    calculer: (donnees, espece) => {
      // Simuler le calcul basé sur la densité forestière
      const densite = donnees.ecoforestier?.data?.densite || 0.5;
      return Math.min(100, densite * 100 * 1.2);
    }
  },
  ZONES_DE_FRAICHEUR: {
    id: 'fraicheur',
    nom: 'Zones de fraîcheur',
    description: 'Points d\'eau et zones humides',
    icon: '💧',
    poids_defaut: { orignal: 0.10, chevreuil: 0.12, ours: 0.18, dindon: 0.10 },
    calculer: (donnees, espece) => {
      const proxEau = donnees.hydrographie?.data?.proximite || 0.3;
      return Math.min(100, proxEau * 100 * 1.5);
    }
  },
  ZONES_D_ALIMENTATION: {
    id: 'alimentation',
    nom: 'Zones d\'alimentation',
    description: 'Ressources alimentaires disponibles',
    icon: '🌿',
    poids_defaut: { orignal: 0.20, chevreuil: 0.22, ours: 0.25, dindon: 0.20 },
    calculer: (donnees, espece) => {
      const vegetation = donnees.ecoforestier?.data?.vegetation || 0.6;
      return Math.min(100, vegetation * 100 * 1.3);
    }
  },
  ZONES_DE_DEPLACEMENTS: {
    id: 'deplacements',
    nom: 'Corridors de déplacements',
    description: 'Trajets fauniques naturels',
    icon: '🛤️',
    poids_defaut: { orignal: 0.15, chevreuil: 0.15, ours: 0.12, dindon: 0.15 },
    calculer: (donnees, espece) => {
      const corridors = donnees.ecoforestier?.data?.corridors || 0.4;
      return Math.min(100, corridors * 100 * 1.4);
    }
  },
  ZONES_DORTOIR: {
    id: 'dortoir',
    nom: 'Zones dortoir',
    description: 'Aires de repos nocturne',
    icon: '🌙',
    poids_defaut: { orignal: 0.10, chevreuil: 0.10, ours: 0.10, dindon: 0.18 },
    calculer: (donnees, espece) => {
      const couvert = donnees.ecoforestier?.data?.densite || 0.5;
      const calme = 1 - (donnees.routes?.data?.proximite || 0.3);
      return Math.min(100, (couvert * 0.6 + calme * 0.4) * 100);
    }
  },
  RUT_POTENTIEL: {
    id: 'rut',
    nom: 'Zones de rut potentiel',
    description: 'Aires de reproduction',
    icon: '💕',
    poids_defaut: { orignal: 0.08, chevreuil: 0.08, ours: 0.05, dindon: 0.10 },
    calculer: (donnees, espece) => {
      const periodeRut = donnees.date_saison?.periode_rut ? 1.5 : 0.5;
      const habitat = donnees.ecoforestier?.data?.habitat || 0.5;
      return Math.min(100, habitat * 100 * periodeRut);
    }
  },
  SALINES_POTENTIELLES: {
    id: 'salines',
    nom: 'Salines naturelles',
    description: 'Sources de minéraux',
    icon: '🧂',
    poids_defaut: { orignal: 0.05, chevreuil: 0.05, ours: 0.05, dindon: 0.05 },
    calculer: (donnees, espece) => {
      const geologie = donnees.elevation?.data?.salinite || 0.2;
      return Math.min(100, geologie * 100 * 2);
    }
  },
  AFFUTS_POTENTIELS: {
    id: 'affuts',
    nom: 'Points d\'affût',
    description: 'Positions d\'observation optimales',
    icon: '🎯',
    poids_defaut: { orignal: 0.05, chevreuil: 0.05, ours: 0.05, dindon: 0.05 },
    calculer: (donnees, espece) => {
      const visibilite = donnees.elevation?.data?.visibilite || 0.5;
      const couvert = donnees.ecoforestier?.data?.couvert || 0.5;
      return Math.min(100, (visibilite * 0.6 + couvert * 0.4) * 100);
    }
  },
  HYDROGRAPHIE_AVANCEE: {
    id: 'hydro',
    nom: 'Réseau hydrique',
    description: 'Cours d\'eau et plans d\'eau',
    icon: '🌊',
    poids_defaut: { orignal: 0.05, chevreuil: 0.03, ours: 0.03, dindon: 0.03 },
    calculer: (donnees, espece) => {
      const hydro = donnees.hydrographie?.data?.densite || 0.3;
      return Math.min(100, hydro * 100 * 1.2);
    }
  },
  ENSOLEILLEMENT_ORIENTATION: {
    id: 'soleil',
    nom: 'Ensoleillement',
    description: 'Exposition solaire des versants',
    icon: '☀️',
    poids_defaut: { orignal: 0.02, chevreuil: 0.02, ours: 0.02, dindon: 0.02 },
    calculer: (donnees, espece) => {
      const orientation = donnees.elevation?.data?.exposition || 0.5;
      return Math.min(100, orientation * 100);
    }
  },
  PEUPLEMENTS_FORESTIERS: {
    id: 'peuplements',
    nom: 'Peuplements favorables',
    description: 'Types de forêts propices',
    icon: '🌲',
    poids_defaut: { orignal: 0.10, chevreuil: 0.10, ours: 0.10, dindon: 0.10 },
    calculer: (donnees, espece) => {
      const peuplement = donnees.ecoforestier?.data?.qualite || 0.6;
      return Math.min(100, peuplement * 100 * 1.1);
    }
  }
};

export const calculerModulesThematiques = (donnees, espece = 'orignal') => {
  const resultats = {};
  
  Object.entries(MODULES_THEMATIQUES).forEach(([key, module]) => {
    const score = module.calculer(donnees, espece);
    const poids = module.poids_defaut[espece] || 0.1;
    
    resultats[key] = {
      id: module.id,
      nom: module.nom,
      icon: module.icon,
      score_brut: score,
      poids: poids,
      score_pondere: score * poids
    };
  });
  
  return resultats;
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 3: MODULE MÉTÉO/SAISON
// ═══════════════════════════════════════════════════════════════

export const MODULE_METEO_SAISON = {
  analyserMeteo: (meteo, saison) => {
    const { temperature, vent_force, vent_direction, pression, precipitations } = meteo;
    
    let facteur_habitat = 1.0;
    let facteur_mouvement = 1.0;
    const recommandations = [];
    
    // Température
    if (temperature > 25) {
      facteur_habitat *= 1.3; // Valoriser zones de fraîcheur
      recommandations.push({
        type: 'temperature',
        message: 'Température élevée: privilégier les zones ombragées près de l\'eau',
        ajustement: '+30% zones de fraîcheur'
      });
    } else if (temperature < 0) {
      facteur_habitat *= 0.9;
      recommandations.push({
        type: 'temperature',
        message: 'Température froide: le gibier reste dans les zones abritées',
        ajustement: '+20% zones de refuge'
      });
    }
    
    // Vent
    if (vent_force > 30) {
      facteur_mouvement *= 0.7;
      recommandations.push({
        type: 'vent',
        message: `Vent fort (${vent_force} km/h): activité réduite en zones exposées`,
        ajustement: '-30% mouvement',
        direction: vent_direction
      });
    } else if (vent_force < 10) {
      facteur_mouvement *= 1.1;
      recommandations.push({
        type: 'vent',
        message: 'Vent faible: conditions favorables pour l\'approche',
        ajustement: '+10% mouvement'
      });
    }
    
    // Pression atmosphérique
    if (pression > 1020) {
      facteur_mouvement *= 1.2;
      recommandations.push({
        type: 'pression',
        message: 'Haute pression: activité accrue du gibier',
        ajustement: '+20% mouvement'
      });
    } else if (pression < 1005) {
      facteur_mouvement *= 0.8;
      recommandations.push({
        type: 'pression',
        message: 'Basse pression: activité réduite, gibier au repos',
        ajustement: '-20% mouvement'
      });
    }
    
    // Précipitations
    if (precipitations > 5) {
      facteur_mouvement *= 0.6;
      recommandations.push({
        type: 'precipitation',
        message: 'Précipitations: gibier à couvert',
        ajustement: '-40% mouvement'
      });
    }
    
    // Période de rut
    if (saison.periode_rut) {
      facteur_mouvement *= 1.5;
      recommandations.push({
        type: 'rut',
        message: '🔥 PÉRIODE DE RUT: Déplacements accrus!',
        ajustement: '+50% mouvement',
        important: true
      });
    }
    
    return {
      facteur_habitat,
      facteur_mouvement,
      recommandations,
      conditions_globales: facteur_habitat * facteur_mouvement > 1 ? 'favorables' : 'défavorables',
      score_meteo: Math.round((facteur_habitat * facteur_mouvement) * 50)
    };
  }
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 4: MODULE MAÎTRE HABITAT OPTIMAL
// ═══════════════════════════════════════════════════════════════

export const MODULE_HABITAT_OPTIMAL = {
  /**
   * Calcule l'habitat optimal final avec tous les ajustements
   */
  calculer: (modulesThematiques, analyseMeteo, espece) => {
    // Score de base pondéré
    let scoreBase = 0;
    Object.values(modulesThematiques).forEach(m => {
      scoreBase += m.score_pondere;
    });
    
    // Analyse alimentaire 200%
    const analyseAlimentaire = calculerAnalyseAlimentaire200(modulesThematiques, espece);
    
    // Appliquer convergence
    const convergence = calculerConvergence(modulesThematiques);
    
    // Appliquer rareté
    const rarete = calculerRarete(modulesThematiques);
    
    // Appliquer cohérence spatiale
    const coherence = calculerCoherenceSpatiale(modulesThematiques);
    
    // Ajustements météo
    const ajustementMeteo = analyseMeteo.facteur_habitat;
    
    // Score final
    const scoreFinal = Math.min(100, Math.round(
      (scoreBase * 0.5 +
       analyseAlimentaire.score * 0.2 +
       convergence * 0.1 +
       rarete * 0.1 +
       coherence * 0.1) * ajustementMeteo
    ));
    
    return {
      score_final: scoreFinal,
      score_base: Math.round(scoreBase),
      analyse_alimentaire: analyseAlimentaire,
      convergence: Math.round(convergence),
      rarete: Math.round(rarete),
      coherence: Math.round(coherence),
      ajustement_meteo: ajustementMeteo,
      niveau: getNiveauHabitat(scoreFinal)
    };
  }
};

const calculerAnalyseAlimentaire200 = (modules, espece) => {
  const alimentation = modules.ZONES_D_ALIMENTATION?.score_brut || 50;
  const peuplements = modules.PEUPLEMENTS_FORESTIERS?.score_brut || 50;
  
  // Qualité alimentaire
  const qualite = (alimentation * 0.6 + peuplements * 0.4);
  
  // Carences nutritionnelles
  const carences = [];
  if (alimentation < 40) {
    carences.push({ type: 'proteines', niveau: 'élevé', produit_recommande: 'BIONIC Protéines+' });
  }
  if (peuplements < 50) {
    carences.push({ type: 'mineraux', niveau: 'moyen', produit_recommande: 'BIONIC Minéraux' });
  }
  
  // Score 200% (double pondération)
  const score = Math.min(100, qualite * 2);
  
  return {
    score,
    qualite_alimentaire: Math.round(qualite),
    adequation_espece: Math.round(qualite * 0.9),
    carences,
    niveau: qualite > 70 ? 'excellent' : qualite > 50 ? 'bon' : qualite > 30 ? 'moyen' : 'faible'
  };
};

const calculerConvergence = (modules) => {
  // Zones où plusieurs modules convergent
  const scoresEleves = Object.values(modules).filter(m => m.score_brut > 70).length;
  return Math.min(100, scoresEleves * 15);
};

const calculerRarete = (modules) => {
  // Valorise les zones rares mais critiques
  const salines = modules.SALINES_POTENTIELLES?.score_brut || 0;
  const rut = modules.RUT_POTENTIEL?.score_brut || 0;
  return Math.min(100, (salines + rut) * 0.5 + 15); // +15% bonus rareté
};

const calculerCoherenceSpatiale = (modules) => {
  // Moyenne pondérée des voisins (simulée)
  const scores = Object.values(modules).map(m => m.score_brut);
  const moyenne = scores.reduce((a, b) => a + b, 0) / scores.length;
  return moyenne * 1.1; // Légère valorisation de la cohérence
};

const getNiveauHabitat = (score) => {
  if (score >= 85) return { label: 'EXCELLENT', color: '#22c55e', emoji: '🌟' };
  if (score >= 70) return { label: 'TRÈS BON', color: '#84cc16', emoji: '✨' };
  if (score >= 55) return { label: 'BON', color: '#f5a623', emoji: '👍' };
  if (score >= 40) return { label: 'MOYEN', color: '#f97316', emoji: '👌' };
  return { label: 'FAIBLE', color: '#ef4444', emoji: '⚠️' };
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 5: MODULE APPROCHE OPTIMALE
// ═══════════════════════════════════════════════════════════════

export const MODULE_APPROCHE_OPTIMALE = {
  calculer: (habitatOptimal, analyseMeteo, donnees) => {
    const { vent_direction, vent_force } = donnees.meteo || {};
    
    // Direction d'approche (contre le vent)
    const directionsOpposees = {
      'N': 'S', 'S': 'N', 'E': 'O', 'O': 'E',
      'NE': 'SO', 'NO': 'SE', 'SE': 'NO', 'SO': 'NE'
    };
    const directionApproche = directionsOpposees[vent_direction] || 'variable';
    
    // Conseils d'approche
    const conseils = [
      {
        priorite: 1,
        conseil: `Approcher depuis le ${directionApproche} (vent favorable)`,
        icon: '🧭'
      },
      {
        priorite: 2,
        conseil: 'Utiliser les couverts denses pour masquer votre approche',
        icon: '🌲'
      },
      {
        priorite: 3,
        conseil: 'Privilégier les vallons et zones basses',
        icon: '⛰️'
      },
      {
        priorite: 4,
        conseil: 'Éviter de traverser les zones de refuge avant l\'affût',
        icon: '⚠️'
      }
    ];
    
    // Ajuster selon la force du vent
    if (vent_force < 5) {
      conseils.push({
        priorite: 5,
        conseil: '⚠️ Vent très faible: soyez extrêmement silencieux',
        icon: '🤫'
      });
    }
    
    // Heure optimale
    const heureActuelle = new Date().getHours();
    let heureOptimale = 'aube (6h-8h)';
    if (heureActuelle >= 16) heureOptimale = 'crépuscule (17h-19h)';
    
    return {
      direction_approche: directionApproche,
      vent: { direction: vent_direction, force: vent_force },
      point_entree_recommande: {
        direction: directionApproche,
        distance_m: 500,
        description: `Entrée par le ${directionApproche}, à 500m de la zone cible`
      },
      position_affut_optimale: {
        type: 'elevated',
        hauteur_m: 4,
        orientation: vent_direction,
        description: 'Position surélevée face au vent'
      },
      heure_optimale: heureOptimale,
      conseils,
      score_approche: Math.round(70 + (100 - vent_force) * 0.3)
    };
  }
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 6: MOTEUR SIMULATION CHASSE IA
// ═══════════════════════════════════════════════════════════════

export const MOTEUR_SIMULATION_IA = {
  simuler: (habitatOptimal, modules, analyseMeteo, donnees) => {
    const { saison, heure, periode_rut } = donnees.date_saison || {};
    const { facteur_mouvement } = analyseMeteo;
    
    // Patterns de déplacement par période
    const patterns = {
      aube: { activite: 0.9, alimentation: 0.8, deplacement: 0.7 },
      matin: { activite: 0.5, alimentation: 0.3, deplacement: 0.4 },
      midi: { activite: 0.2, alimentation: 0.1, deplacement: 0.1 },
      apres_midi: { activite: 0.4, alimentation: 0.4, deplacement: 0.5 },
      crepuscule: { activite: 0.95, alimentation: 0.9, deplacement: 0.8 },
      nuit: { activite: 0.3, alimentation: 0.2, deplacement: 0.2 }
    };
    
    // Déterminer la période actuelle
    let periode = 'matin';
    if (heure >= 5 && heure < 8) periode = 'aube';
    else if (heure >= 8 && heure < 12) periode = 'matin';
    else if (heure >= 12 && heure < 14) periode = 'midi';
    else if (heure >= 14 && heure < 17) periode = 'apres_midi';
    else if (heure >= 17 && heure < 20) periode = 'crepuscule';
    else periode = 'nuit';
    
    const pattern = patterns[periode];
    
    // Calcul de la probabilité de présence
    let probabilitePresence = pattern.activite * facteur_mouvement;
    if (periode_rut) probabilitePresence *= 1.3;
    probabilitePresence = Math.min(1, probabilitePresence);
    
    // Fenêtres de tir recommandées
    const fenetresTir = [];
    if (pattern.activite > 0.7) {
      fenetresTir.push({
        debut: `${heure}:00`,
        fin: `${heure + 1}:30`,
        probabilite: Math.round(probabilitePresence * 100),
        qualite: probabilitePresence > 0.8 ? 'excellente' : 'bonne'
      });
    }
    
    // Zones de concentration probables
    const zonesConcentration = [];
    if (pattern.alimentation > 0.5) {
      zonesConcentration.push({
        type: 'alimentation',
        probabilite: Math.round(pattern.alimentation * 100),
        description: 'Zones d\'alimentation actives'
      });
    }
    if (pattern.deplacement > 0.5) {
      zonesConcentration.push({
        type: 'corridors',
        probabilite: Math.round(pattern.deplacement * 100),
        description: 'Corridors de déplacement'
      });
    }
    
    // Commentaires de simulation
    const commentaires = [];
    if (probabilitePresence > 0.7) {
      commentaires.push('🎯 Conditions optimales pour l\'observation');
    }
    if (periode_rut) {
      commentaires.push('🦌 Période de rut: déplacements imprévisibles possibles');
    }
    if (facteur_mouvement < 0.8) {
      commentaires.push('⚠️ Conditions météo défavorables aux déplacements');
    }
    
    return {
      periode_journee: periode,
      probabilite_presence: Math.round(probabilitePresence * 100),
      fenetres_tir: fenetresTir,
      zones_concentration: zonesConcentration,
      commentaires,
      heatmap_data: genererHeatmapData(modules, probabilitePresence),
      simulation_active: true
    };
  }
};

const genererHeatmapData = (modules, probabilite) => {
  // Générer des points pour le heatmap
  const points = [];
  const baseScore = probabilite * 100;
  
  // Points basés sur les scores des modules
  Object.values(modules).forEach(m => {
    if (m.score_brut > 60) {
      points.push({
        intensite: (m.score_brut / 100) * baseScore,
        module: m.id
      });
    }
  });
  
  return points;
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 7: EXTRACTION HOTSPOTS
// ═══════════════════════════════════════════════════════════════

export const extractionHotspots = (habitatOptimal, modules) => {
  const hotspots = [];
  const seuilHotspot = BIONIC_GENERATOR_CONFIG.seuil_hotspot;
  
  // Identifier les modules à score élevé
  Object.entries(modules).forEach(([key, module]) => {
    if (module.score_brut >= seuilHotspot) {
      hotspots.push({
        id: `hotspot_${module.id}`,
        type: module.id,
        nom: module.nom,
        icon: module.icon,
        score: module.score_brut,
        priorite: module.score_brut >= 90 ? 'haute' : 'moyenne',
        description: `Zone ${module.nom} - Score ${module.score_brut}/100`
      });
    }
  });
  
  // Trier par score décroissant
  hotspots.sort((a, b) => b.score - a.score);
  
  // Identifier les meilleurs points de chasse
  const meilleursPoints = hotspots.slice(0, 5).map((h, idx) => ({
    rang: idx + 1,
    ...h,
    recommandation: idx === 0 ? '⭐ MEILLEUR POINT' : `Point #${idx + 1}`
  }));
  
  return {
    hotspots,
    nombre_hotspots: hotspots.length,
    meilleurs_points_chasse: meilleursPoints,
    pixel_maximum: hotspots[0] || null,
    seuil_utilise: seuilHotspot
  };
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 9: RECOMMANDATIONS IA
// ═══════════════════════════════════════════════════════════════

export const genererRecommandationsIA = (
  habitatOptimal,
  modules,
  analyseMeteo,
  approche,
  simulation
) => {
  const recommandations = {
    affut: [],
    salines: [],
    nutritionnelles: [],
    deplacement: [],
    saison: [],
    approche: [],
    fenetres_tir: []
  };
  
  // Recommandations affût
  const affuts = modules.AFFUTS_POTENTIELS;
  if (affuts && affuts.score_brut > 60) {
    recommandations.affut.push({
      priorite: 'haute',
      message: 'Points d\'affût de qualité identifiés',
      details: `Score affût: ${Math.round(affuts.score_brut)}/100`,
      action: 'Installer votre affût dans les zones marquées en orange'
    });
  }
  
  // Recommandations salines
  const salines = modules.SALINES_POTENTIELLES;
  if (salines && salines.score_brut > 50) {
    recommandations.salines.push({
      priorite: 'moyenne',
      message: 'Zones salines naturelles détectées',
      details: `Potentiel salin: ${Math.round(salines.score_brut)}/100`,
      action: 'Installer une saline artificielle BIONIC™ à proximité'
    });
  }
  
  // Recommandations nutritionnelles
  if (habitatOptimal.analyse_alimentaire.carences.length > 0) {
    habitatOptimal.analyse_alimentaire.carences.forEach(carence => {
      recommandations.nutritionnelles.push({
        priorite: carence.niveau === 'élevé' ? 'haute' : 'moyenne',
        message: `Carence en ${carence.type} détectée`,
        details: `Niveau: ${carence.niveau}`,
        produit: carence.produit_recommande,
        action: `Utiliser ${carence.produit_recommande} pour attirer le gibier`
      });
    });
  }
  
  // Recommandations déplacement
  if (simulation.probabilite_presence > 70) {
    recommandations.deplacement.push({
      priorite: 'haute',
      message: 'Forte probabilité de mouvement détectée',
      details: `Probabilité: ${simulation.probabilite_presence}%`,
      action: 'Positionner dans les corridors de déplacement'
    });
  }
  
  // Recommandations saison
  analyseMeteo.recommandations.forEach(rec => {
    recommandations.saison.push({
      priorite: rec.important ? 'haute' : 'normale',
      message: rec.message,
      details: rec.ajustement,
      action: rec.type === 'rut' ? 'Profiter de la période de rut!' : 'Adapter votre stratégie'
    });
  });
  
  // Recommandations approche
  approche.conseils.forEach(conseil => {
    recommandations.approche.push({
      priorite: conseil.priorite <= 2 ? 'haute' : 'normale',
      message: conseil.conseil,
      icon: conseil.icon
    });
  });
  
  // Recommandations fenêtres de tir
  simulation.fenetres_tir.forEach(fenetre => {
    recommandations.fenetres_tir.push({
      priorite: fenetre.qualite === 'excellente' ? 'haute' : 'moyenne',
      message: `Fenêtre de tir ${fenetre.qualite}`,
      details: `${fenetre.debut} - ${fenetre.fin}`,
      probabilite: fenetre.probabilite
    });
  });
  
  return recommandations;
};

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 10: RECOMMANDATIONS PRODUITS
// ═══════════════════════════════════════════════════════════════

export const CATALOGUE_PRODUITS_BIONIC = {
  'BIONIC Protéines+': {
    id: 'proteines_plus',
    nom: 'BIONIC Protéines+',
    description: 'Complément protéique haute performance',
    prix: 49.99,
    image: '/products/proteines.jpg',
    carence_cible: 'proteines',
    efficacite: 95
  },
  'BIONIC Minéraux': {
    id: 'mineraux',
    nom: 'BIONIC Minéraux',
    description: 'Bloc minéral enrichi',
    prix: 34.99,
    image: '/products/mineraux.jpg',
    carence_cible: 'mineraux',
    efficacite: 90
  },
  'BIONIC Attractif Premium': {
    id: 'attractif',
    nom: 'BIONIC Attractif Premium',
    description: 'Attractif olfactif longue durée',
    prix: 29.99,
    image: '/products/attractif.jpg',
    carence_cible: 'general',
    efficacite: 85
  },
  'BIONIC Saline Pro': {
    id: 'saline_pro',
    nom: 'BIONIC Saline Pro',
    description: 'Saline artificielle haute concentration',
    prix: 39.99,
    image: '/products/saline.jpg',
    carence_cible: 'sel',
    efficacite: 92
  },
  'BIONIC Rut Master': {
    id: 'rut_master',
    nom: 'BIONIC Rut Master',
    description: 'Attractif spécial période de rut',
    prix: 44.99,
    image: '/products/rut.jpg',
    carence_cible: 'rut',
    efficacite: 88
  }
};

export const genererRecommandationsProduits = (habitatOptimal, analyseMeteo, espece) => {
  const produits = [];
  
  // Produit principal basé sur la carence dominante
  if (habitatOptimal.analyse_alimentaire.carences.length > 0) {
    const carencePrincipale = habitatOptimal.analyse_alimentaire.carences[0];
    const produitPrincipal = Object.values(CATALOGUE_PRODUITS_BIONIC)
      .find(p => p.carence_cible === carencePrincipale.type);
    
    if (produitPrincipal) {
      produits.push({
        ...produitPrincipal,
        raison: `Carence en ${carencePrincipale.type} détectée`,
        priorite: 'principale',
        highlight: true
      });
    }
  }
  
  // Période de rut
  if (analyseMeteo.recommandations.some(r => r.type === 'rut')) {
    produits.push({
      ...CATALOGUE_PRODUITS_BIONIC['BIONIC Rut Master'],
      raison: 'Période de rut active',
      priorite: 'secondaire',
      highlight: false
    });
  }
  
  // Produits complémentaires
  const complementaires = Object.values(CATALOGUE_PRODUITS_BIONIC)
    .filter(p => !produits.some(pr => pr.id === p.id))
    .slice(0, 2);
  
  complementaires.forEach(p => {
    produits.push({
      ...p,
      raison: 'Produit complémentaire recommandé',
      priorite: 'complementaire',
      highlight: false
    });
  });
  
  return {
    produits,
    produit_principal: produits.find(p => p.priorite === 'principale'),
    popup_config: {
      encadrer_produit_bionic: true,
      highlight_style: 'halo lumineux + bordure épaisse',
      declencheurs: ['clic_zone', 'carences_elevees', 'generation_carte']
    }
  };
};

// ═══════════════════════════════════════════════════════════════
// GÉNÉRATEUR PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const genererCarteBIONIC = (donneesEntree, espece = 'orignal') => {
  console.log('[BIONIC Generator] Démarrage génération v3.1...');
  
  // Étape 1: Normalisation
  const donneesNormalisees = normaliserDonnees(donneesEntree);
  
  // Étape 2: Calcul modules thématiques
  const modulesThematiques = calculerModulesThematiques(donneesNormalisees, espece);
  
  // Étape 3: Analyse météo/saison
  const analyseMeteo = MODULE_METEO_SAISON.analyserMeteo(
    donneesNormalisees.meteo,
    donneesNormalisees.date_saison
  );
  
  // Étape 4: Habitat optimal
  const habitatOptimal = MODULE_HABITAT_OPTIMAL.calculer(
    modulesThematiques,
    analyseMeteo,
    espece
  );
  
  // Étape 5: Approche optimale
  const approcheOptimale = MODULE_APPROCHE_OPTIMALE.calculer(
    habitatOptimal,
    analyseMeteo,
    donneesNormalisees
  );
  
  // Étape 6: Simulation IA
  const simulation = MOTEUR_SIMULATION_IA.simuler(
    habitatOptimal,
    modulesThematiques,
    analyseMeteo,
    donneesNormalisees
  );
  
  // Étape 7: Extraction hotspots
  const hotspots = extractionHotspots(habitatOptimal, modulesThematiques);
  
  // Étape 9: Recommandations IA
  const recommandationsIA = genererRecommandationsIA(
    habitatOptimal,
    modulesThematiques,
    analyseMeteo,
    approcheOptimale,
    simulation
  );
  
  // Étape 10: Recommandations produits
  const recommandationsProduits = genererRecommandationsProduits(
    habitatOptimal,
    analyseMeteo,
    espece
  );
  
  console.log('[BIONIC Generator] Génération terminée!');
  
  return {
    version: BIONIC_GENERATOR_CONFIG.version,
    timestamp: new Date().toISOString(),
    espece,
    
    // Données d'entrée normalisées
    donnees_normalisees: donneesNormalisees,
    
    // Résultats des calculs
    modules_thematiques: modulesThematiques,
    analyse_meteo: analyseMeteo,
    habitat_optimal: habitatOptimal,
    approche_optimale: approcheOptimale,
    simulation_ia: simulation,
    hotspots,
    
    // Recommandations
    recommandations_ia: recommandationsIA,
    recommandations_produits: recommandationsProduits,
    
    // Métadonnées
    meta: {
      resolution_m: BIONIC_GENERATOR_CONFIG.resolution_interne_m,
      seuil_hotspot: BIONIC_GENERATOR_CONFIG.seuil_hotspot,
      modules_actifs: Object.keys(modulesThematiques).length
    }
  };
};

// Export par défaut
export default genererCarteBIONIC;
