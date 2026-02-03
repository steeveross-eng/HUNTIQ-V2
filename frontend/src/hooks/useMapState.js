/**
 * useMapState.js
 * Hook centralisé pour gérer l'état de la carte BIONIC
 * Optimise la mémoire en regroupant les états liés
 */

import { useState, useCallback, useRef } from 'react';

// État initial pour la carte
const INITIAL_MAP_STATE = {
  center: [46.8139, -71.2080],
  zoom: 12,
  bounds: null
};

// État initial pour le curseur/GPS
const INITIAL_CURSOR_STATE = {
  position: null,
  data: null,
  elevation: null,
  gpsLiveEnabled: false
};

// État initial pour les dialogues
const INITIAL_DIALOG_STATE = {
  showAddPlace: false,
  showAddWaypoint: false,
  showShare: false,
  showCreateGroup: false,
  showNotifications: false,
  showGroupDashboard: false,
  showEcoforestry: false
};

/**
 * Hook pour gérer l'état de la carte
 */
export function useMapPosition(initialCenter = INITIAL_MAP_STATE.center, initialZoom = INITIAL_MAP_STATE.zoom) {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [mapZoom, setMapZoom] = useState(initialZoom);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);
  const [currentMapCenter, setCurrentMapCenter] = useState({ lat: initialCenter[0], lng: initialCenter[1] });
  const [currentMapBounds, setCurrentMapBounds] = useState(null);

  const handleZoomChange = useCallback((newZoom) => {
    setCurrentZoom(newZoom);
  }, []);

  const handleMapMove = useCallback((newCenter) => {
    setCurrentMapCenter(newCenter);
  }, []);

  const handleBoundsChange = useCallback((newBounds) => {
    setCurrentMapBounds(newBounds);
  }, []);

  const centerOn = useCallback((lat, lng, zoom = null) => {
    setMapCenter([lat, lng]);
    if (zoom !== null) {
      setMapZoom(zoom);
    }
  }, []);

  return {
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    currentZoom,
    currentMapCenter,
    currentMapBounds,
    handleZoomChange,
    handleMapMove,
    handleBoundsChange,
    centerOn
  };
}

/**
 * Hook pour gérer l'état du curseur GPS
 */
export function useCursorState() {
  const [cursorPosition, setCursorPosition] = useState(null);
  const [cursorData, setCursorData] = useState(null);
  const [cursorElevation, setCursorElevation] = useState(null);
  const [gpsLiveEnabled, setGpsLiveEnabled] = useState(false);
  const elevationCacheRef = useRef(new Map());

  const updateCursor = useCallback((position, data) => {
    setCursorPosition(position);
    setCursorData(data);
  }, []);

  const clearCursor = useCallback(() => {
    setCursorPosition(null);
    setCursorData(null);
    setCursorElevation(null);
  }, []);

  const toggleGpsLive = useCallback(() => {
    setGpsLiveEnabled(prev => {
      if (prev) {
        // Désactiver - nettoyer le curseur
        setCursorPosition(null);
        setCursorData(null);
        setCursorElevation(null);
      }
      return !prev;
    });
  }, []);

  return {
    cursorPosition,
    setCursorPosition,
    cursorData,
    setCursorData,
    cursorElevation,
    setCursorElevation,
    gpsLiveEnabled,
    setGpsLiveEnabled,
    updateCursor,
    clearCursor,
    toggleGpsLive,
    elevationCacheRef
  };
}

/**
 * Hook pour gérer les dialogues/modales
 */
export function useDialogState() {
  const [dialogs, setDialogs] = useState(INITIAL_DIALOG_STATE);

  const openDialog = useCallback((dialogName) => {
    setDialogs(prev => ({ ...prev, [dialogName]: true }));
  }, []);

  const closeDialog = useCallback((dialogName) => {
    setDialogs(prev => ({ ...prev, [dialogName]: false }));
  }, []);

  const toggleDialog = useCallback((dialogName) => {
    setDialogs(prev => ({ ...prev, [dialogName]: !prev[dialogName] }));
  }, []);

  const closeAllDialogs = useCallback(() => {
    setDialogs(INITIAL_DIALOG_STATE);
  }, []);

  return {
    dialogs,
    openDialog,
    closeDialog,
    toggleDialog,
    closeAllDialogs
  };
}

/**
 * Hook pour gérer les paramètres d'affichage des zones
 */
export function useZoneDisplaySettings() {
  const [zoneDisplayMode, setZoneDisplayMode] = useState('micro');
  const [showConcentricCircles, setShowConcentricCircles] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [minPercentageFilter, setMinPercentageFilter] = useState(50);

  return {
    zoneDisplayMode,
    setZoneDisplayMode,
    showConcentricCircles,
    setShowConcentricCircles,
    showCorridors,
    setShowCorridors,
    minPercentageFilter,
    setMinPercentageFilter
  };
}

export default {
  useMapPosition,
  useCursorState,
  useDialogState,
  useZoneDisplaySettings
};
