/**
 * useUrbanConfig.js
 * 
 * Hook personnalisé pour gérer la configuration du module urbain BIONIC™
 * Permet de persister les paramètres et de les propager aux autres composants
 */

import { useState, useCallback, useEffect } from 'react';
import { URBAN_CONFIG } from '@/services/UrbanExclusionService';

// Clé de stockage local
const STORAGE_KEY = 'bionic_urban_config';

// Configuration par défaut
const DEFAULT_CONFIG = {
  enabled: true,
  bufferDistance: URBAN_CONFIG.BUFFER_DISTANCE_M,
  searchRadius: URBAN_CONFIG.RELOCATION_SEARCH_RADIUS_M,
  minDistance: URBAN_CONFIG.MIN_DISTANCE_FROM_URBAN_M,
  candidatePoints: URBAN_CONFIG.CANDIDATE_POINTS_COUNT,
  enableQA: true,
  debugMode: URBAN_CONFIG.DEBUG
};

/**
 * Hook pour gérer la configuration du module urbain
 * @returns {Object} { config, updateConfig, resetConfig, applyToService }
 */
export function useUrbanConfig() {
  // Charger la config depuis le localStorage au montage
  const [config, setConfig] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[useUrbanConfig] Failed to load config:', e);
    }
    return DEFAULT_CONFIG;
  });

  // Persister dans le localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('[useUrbanConfig] Failed to save config:', e);
    }
  }, [config]);

  // Appliquer la config au service UrbanExclusionService
  const applyToService = useCallback(() => {
    // Mettre à jour la constante exportée (elle est mutable)
    URBAN_CONFIG.BUFFER_DISTANCE_M = config.bufferDistance;
    URBAN_CONFIG.RELOCATION_SEARCH_RADIUS_M = config.searchRadius;
    URBAN_CONFIG.MIN_DISTANCE_FROM_URBAN_M = config.minDistance;
    URBAN_CONFIG.CANDIDATE_POINTS_COUNT = config.candidatePoints;
    URBAN_CONFIG.DEBUG = config.debugMode;
    
    console.log('[useUrbanConfig] Applied config to service:', config);
    return true;
  }, [config]);

  // Appliquer automatiquement au montage et à chaque changement
  useEffect(() => {
    applyToService();
  }, [applyToService]);

  // Mettre à jour un paramètre spécifique
  const updateConfig = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Mettre à jour plusieurs paramètres à la fois
  const updateMultiple = useCallback((updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Réinitialiser à la config par défaut
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  return {
    config,
    updateConfig,
    updateMultiple,
    resetConfig,
    applyToService,
    isEnabled: config.enabled
  };
}

/**
 * Hook pour accéder en lecture seule à la configuration urbaine
 */
export function useUrbanConfigReadOnly() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.warn('[useUrbanConfigReadOnly] Failed to load config:', e);
    }

    // Écouter les changements de localStorage (cross-tab)
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(e.newValue) });
        } catch (err) {
          console.warn('[useUrbanConfigReadOnly] Failed to parse storage change:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return config;
}

export default useUrbanConfig;
