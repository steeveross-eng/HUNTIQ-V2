/**
 * useHabitatOptimal.js
 * 
 * Hook personnalisé pour appliquer les scores HABITAT_OPTIMAL_SYNTHESE
 * aux zones BIONIC en fonction de l'espèce sélectionnée.
 * 
 * Permet une mise à jour en temps réel de la carte selon l'espèce.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  ESPECES, 
  PONDERATIONS, 
  MODULES_THEMATIQUES,
  calculerHabitatOptimal,
  calculerHabitatOptimalBatch,
  identifierMeilleursPoints,
  genererCarteBionic
} from '@/services/HabitatOptimalService';

// Mapping des moduleId vers les clés de pondération
const MODULE_MAPPING = {
  habitats: 'ZONES_DE_REFUGE',
  rut: 'RUT_POTENTIEL',
  affuts: 'AFFUTS_POTENTIELS',
  corridors: 'ZONES_DE_DEPLACEMENTS',
  alimentation: 'ZONES_D_ALIMENTATION',
  repos: 'ZONES_DORTOIR',
  fraicheur: 'ZONES_DE_FRAICHEUR',
  salines: 'SALINES_POTENTIELLES',
  ensoleillement: 'ENSOLEILLEMENT',
  orientation: 'ORIENTATION',
  hydrographie: 'HYDROGRAPHIE_AVANCEE',
  peuplements: 'PEUPLEMENTS_FORESTIERS'
};

// Mapping inverse
const REVERSE_MAPPING = Object.fromEntries(
  Object.entries(MODULE_MAPPING).map(([k, v]) => [v, k])
);

/**
 * Enrichit une zone avec les données nécessaires pour le calcul habitat optimal
 */
const enrichZoneData = (zone) => {
  // Extraire les données de base de la zone
  const baseScore = zone.percentage || zone.score || 50;
  
  // Créer les données enrichies selon le type de module
  const moduleId = zone.moduleId;
  const moduleKey = MODULE_MAPPING[moduleId] || moduleId;
  
  return {
    ...zone,
    // Scores par type de module (simulation basée sur le score de base)
    couvertDense: moduleId === 'habitats' ? baseScore : 30 + Math.random() * 40,
    proximiteEau: moduleId === 'fraicheur' || moduleId === 'hydrographie' ? baseScore : 20 + Math.random() * 30,
    ressourcesAlimentaires: moduleId === 'alimentation' ? baseScore : 25 + Math.random() * 35,
    accessibilite: moduleId === 'corridors' ? baseScore : 40 + Math.random() * 30,
    tranquillite: moduleId === 'repos' ? baseScore : 30 + Math.random() * 40,
    activiteReproduction: moduleId === 'rut' ? baseScore : 10 + Math.random() * 30,
    mineralisation: moduleId === 'salines' ? baseScore : 15 + Math.random() * 25,
    visibilite: moduleId === 'affuts' ? baseScore : 35 + Math.random() * 35,
    reseauHydrique: moduleId === 'hydrographie' ? baseScore : 20 + Math.random() * 30,
    expositionSolaire: moduleId === 'ensoleillement' ? baseScore : 40 + Math.random() * 30,
    orientationPente: moduleId === 'orientation' ? baseScore : 35 + Math.random() * 35,
    diversiteForestiere: moduleId === 'peuplements' ? baseScore : 25 + Math.random() * 35,
    
    // Données alimentaires simulées
    V2: 40 + Math.random() * 30,
    V5: 35 + Math.random() * 35,
    V9: 30 + Math.random() * 40,
    potentielBaies: 25 + Math.random() * 50,
    potentielGlands: 20 + Math.random() * 45,
    potentielFruits: 30 + Math.random() * 40,
    stadeDeveloppement: 40 + Math.random() * 30,
    feuillusTendres: 35 + Math.random() * 40,
    regeneration: 30 + Math.random() * 35,
    humidite: 40 + Math.random() * 30,
    glands: 25 + Math.random() * 45,
    fruits: 30 + Math.random() * 40,
    baies: 35 + Math.random() * 45,
    noix: 20 + Math.random() * 35,
    insectes: 40 + Math.random() * 30,
    graines: 35 + Math.random() * 35,
    
    // Surface estimée
    surface: zone.radiusMeters ? Math.PI * zone.radiusMeters * zone.radiusMeters : 10000,
    
    // Type de module principal
    moduleKey
  };
};

/**
 * Applique les scores habitat optimal à un ensemble de zones
 */
const appliquerScoresHabitat = (zones, espece) => {
  if (!zones || zones.length === 0) return [];
  
  // Enrichir toutes les zones
  const zonesEnrichies = zones.map(enrichZoneData);
  
  // Calculer les scores avec le service
  const zonesAvecHabitat = calculerHabitatOptimalBatch(zonesEnrichies, espece, {
    appliquerConvergence: true,
    appliquerRarete: true,
    appliquerCoherence: true
  });
  
  return zonesAvecHabitat;
};

/**
 * Hook principal pour gérer les scores habitat optimal
 */
export const useHabitatOptimal = (zones, espece = 'ORIGNAL') => {
  // État des zones avec scores habitat
  const [zonesOptimisees, setZonesOptimisees] = useState([]);
  const [meilleursPoints, setMeilleursPoints] = useState([]);
  const [stats, setStats] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Ref pour éviter les calculs redondants
  const lastCalculation = useRef({ zonesCount: 0, espece: '' });
  
  // Pondérations de l'espèce courante
  const ponderations = useMemo(() => {
    return PONDERATIONS[espece] || PONDERATIONS.ORIGNAL;
  }, [espece]);
  
  // Info espèce
  const especeInfo = useMemo(() => {
    return ESPECES[espece] || ESPECES.ORIGNAL;
  }, [espece]);
  
  // Calculer les scores quand les zones ou l'espèce changent
  useEffect(() => {
    if (!zones || zones.length === 0) {
      setZonesOptimisees([]);
      setMeilleursPoints([]);
      setStats(null);
      return;
    }
    
    // Vérifier si on a besoin de recalculer
    const needsRecalc = 
      lastCalculation.current.zonesCount !== zones.length ||
      lastCalculation.current.espece !== espece;
    
    if (!needsRecalc) return;
    
    setIsCalculating(true);
    
    // Utiliser requestIdleCallback pour ne pas bloquer l'UI
    const calculate = () => {
      try {
        // Appliquer les scores habitat
        const zonesCalculees = appliquerScoresHabitat(zones, espece);
        
        // Identifier les meilleurs points
        const topPoints = identifierMeilleursPoints(zones, espece, {
          nombrePoints: 10,
          seuilMinimum: 40
        });
        
        // Calculer les statistiques
        const distribution = {
          excellent: zonesCalculees.filter(z => z.niveauHabitat === 'EXCELLENT').length,
          tresBon: zonesCalculees.filter(z => z.niveauHabitat === 'TRÈS_BON').length,
          bon: zonesCalculees.filter(z => z.niveauHabitat === 'BON').length,
          moyen: zonesCalculees.filter(z => z.niveauHabitat === 'MOYEN').length,
          faible: zonesCalculees.filter(z => z.niveauHabitat === 'FAIBLE').length
        };
        
        const moyenneScore = zonesCalculees.length > 0
          ? zonesCalculees.reduce((s, z) => s + (z.habitatOptimal || 0), 0) / zonesCalculees.length
          : 0;
        
        setZonesOptimisees(zonesCalculees);
        setMeilleursPoints(topPoints);
        setStats({
          total: zonesCalculees.length,
          moyenneScore,
          distribution,
          espece,
          ponderations
        });
        
        // Mettre à jour la ref
        lastCalculation.current = { zonesCount: zones.length, espece };
        
      } catch (error) {
        console.error('[useHabitatOptimal] Erreur calcul:', error);
      } finally {
        setIsCalculating(false);
      }
    };
    
    // Utiliser setTimeout pour simuler requestIdleCallback
    const timeoutId = setTimeout(calculate, 50);
    
    return () => clearTimeout(timeoutId);
  }, [zones, espece, ponderations]);
  
  // Fonction pour obtenir le score d'une zone spécifique
  const getZoneScore = useCallback((zoneId) => {
    const zone = zonesOptimisees.find(z => z.id === zoneId);
    return zone ? zone.habitatOptimal : null;
  }, [zonesOptimisees]);
  
  // Fonction pour obtenir la couleur selon le niveau d'habitat
  const getHabitatColor = useCallback((niveau) => {
    switch (niveau) {
      case 'EXCELLENT': return '#22c55e'; // green-500
      case 'TRÈS_BON': return '#84cc16'; // lime-500
      case 'BON': return '#eab308'; // yellow-500
      case 'MOYEN': return '#f97316'; // orange-500
      case 'FAIBLE': return '#ef4444'; // red-500
      default: return '#6b7280'; // gray-500
    }
  }, []);
  
  // Fonction pour obtenir l'opacité selon le score
  const getHabitatOpacity = useCallback((score) => {
    if (score >= 80) return 0.9;
    if (score >= 65) return 0.75;
    if (score >= 50) return 0.6;
    if (score >= 35) return 0.45;
    return 0.3;
  }, []);
  
  return {
    // Zones avec scores
    zonesOptimisees,
    meilleursPoints,
    stats,
    isCalculating,
    
    // Infos espèce
    espece,
    especeInfo,
    ponderations,
    
    // Helpers
    getZoneScore,
    getHabitatColor,
    getHabitatOpacity,
    
    // Mapping des modules
    MODULE_MAPPING,
    REVERSE_MAPPING
  };
};

/**
 * Fonction utilitaire pour appliquer les scores directement à un tableau de zones
 * (utilisable sans le hook)
 */
export const applyHabitatScores = (zones, espece = 'ORIGNAL') => {
  return appliquerScoresHabitat(zones, espece);
};

/**
 * Obtient le facteur de pondération pour un module et une espèce donnés
 */
export const getModuleWeight = (moduleId, espece = 'ORIGNAL') => {
  const ponderations = PONDERATIONS[espece] || PONDERATIONS.ORIGNAL;
  const moduleKey = MODULE_MAPPING[moduleId] || moduleId;
  return ponderations[moduleKey] || 0;
};

/**
 * Calcule un score ajusté selon l'espèce pour une zone
 */
export const calculateAdjustedScore = (zone, espece = 'ORIGNAL') => {
  const baseScore = zone.percentage || zone.score || 50;
  const weight = getModuleWeight(zone.moduleId, espece);
  
  // Le score ajusté tient compte du poids du module pour l'espèce
  // Un module avec un poids élevé aura plus d'impact
  const adjustedScore = baseScore * (0.5 + weight * 2);
  
  return Math.min(100, Math.max(0, adjustedScore));
};

export default useHabitatOptimal;
