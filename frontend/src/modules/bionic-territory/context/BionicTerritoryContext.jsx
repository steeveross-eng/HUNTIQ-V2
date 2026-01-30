/**
 * BionicTerritoryContext.jsx
 * 
 * Context global pour le module BIONIC Territory
 * Gère l'état partagé entre tous les composants du module
 * 
 * Architecture: Micro-Frontend Ready
 * - État isolé par domaine
 * - Actions typées
 * - Selectors mémoïsés
 */

import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// TYPES D'ACTIONS
// ═══════════════════════════════════════════════════════════════

export const BIONIC_ACTIONS = {
  // Map State
  SET_MAP_CENTER: 'SET_MAP_CENTER',
  SET_MAP_ZOOM: 'SET_MAP_ZOOM',
  SET_MAP_BOUNDS: 'SET_MAP_BOUNDS',
  SET_BASE_MAP: 'SET_BASE_MAP',
  
  // Layers State
  SET_PIPELINE_ENABLED: 'SET_PIPELINE_ENABLED',
  SET_PIPELINE_COLLAPSED: 'SET_PIPELINE_COLLAPSED',
  TOGGLE_ECO_LAYER: 'TOGGLE_ECO_LAYER',
  SET_ECO_LAYER_OPACITY: 'SET_ECO_LAYER_OPACITY',
  SET_ACTIVE_ECO_LAYERS: 'SET_ACTIVE_ECO_LAYERS',
  
  // Thematic Modules State
  SET_THEMATIC_MODULES: 'SET_THEMATIC_MODULES',
  TOGGLE_THEMATIC_MODULE: 'TOGGLE_THEMATIC_MODULE',
  SET_SHOW_BEHAVIOR_ZONES: 'SET_SHOW_BEHAVIOR_ZONES',
  SET_TOPO_ENABLED: 'SET_TOPO_ENABLED',
  SET_QUEBEC_LAYERS: 'SET_QUEBEC_LAYERS',
  
  // Waypoints State
  SET_WAYPOINTS: 'SET_WAYPOINTS',
  ADD_WAYPOINT: 'ADD_WAYPOINT',
  UPDATE_WAYPOINT: 'UPDATE_WAYPOINT',
  DELETE_WAYPOINT: 'DELETE_WAYPOINT',
  SET_SELECTED_WAYPOINT: 'SET_SELECTED_WAYPOINT',
  
  // BIONIC Generator State
  SET_CARTE_BIONIC: 'SET_CARTE_BIONIC',
  SET_GENERATING: 'SET_GENERATING',
  
  // UI State
  SET_LAYERS_PANEL_VISIBLE: 'SET_LAYERS_PANEL_VISIBLE',
  SET_ANALYSIS_PANEL_VISIBLE: 'SET_ANALYSIS_PANEL_VISIBLE',
  SET_PRIVACY_MODE: 'SET_PRIVACY_MODE',
  SET_GPS_LIVE_ENABLED: 'SET_GPS_LIVE_ENABLED',
  SET_MAP_CLICK_MODE: 'SET_MAP_CLICK_MODE',
  
  // User Position
  SET_USER_POSITION: 'SET_USER_POSITION',
  SET_WATCHING_POSITION: 'SET_WATCHING_POSITION',
  
  // Zones
  SET_SELECTED_ZONE: 'SET_SELECTED_ZONE',
  SET_MICRO_ZONES: 'SET_MICRO_ZONES',
  SET_FILTERED_ZONES: 'SET_FILTERED_ZONES',
  SET_MIN_PERCENTAGE_FILTER: 'SET_MIN_PERCENTAGE_FILTER'
};

// ═══════════════════════════════════════════════════════════════
// ÉTAT INITIAL
// ═══════════════════════════════════════════════════════════════

const initialState = {
  // Map State
  map: {
    center: [46.8139, -71.2080],
    zoom: 12,
    currentZoom: 12,
    currentCenter: { lat: 46.8139, lng: -71.2080 },
    bounds: null,
    baseMap: 'bionic' // 'bionic', 'satellite', 'terrain'
  },
  
  // Layers State
  layers: {
    pipelineEnabled: true,
    pipelineCollapsed: false,
    activeEcoLayers: {
      baseMap: null,
      overlays: []
    },
    ecoLayerOpacities: {},
    // Couches comportementales
    showBehaviorZones: true,
    // Overlay topographique
    topoEnabled: false,
    // Couches Québec WMS
    quebecLayers: {
      ecoforestry: { enabled: false, opacity: 60 },
      lidar: { enabled: false, opacity: 50 },
      twi: { enabled: false, opacity: 50 }
    }
  },
  
  // Thematic Modules State (Habitat Score dropdown)
  thematicModules: [
    { id: 'habitat', name: 'Habitat Optimal', enabled: true, score: 63 },
    { id: 'meteo', name: 'Analyse Météo', enabled: true, score: 78 },
    { id: 'approche', name: 'Approche Optimale', enabled: true, score: 96 },
    { id: 'alimentation', name: 'Zones Alimentation', enabled: false, score: 73 },
    { id: 'comportement', name: 'Comportements Gibier', enabled: true, score: 85 },
    { id: 'hotspots', name: 'Hotspots IA', enabled: false, score: 91 },
    { id: 'peuplements', name: 'Peuplements Forestiers', enabled: true, score: 88 },
    { id: 'topographie', name: 'Overlay Topographique', enabled: false, score: 75 }
  ],
  
  // Waypoints State
  waypoints: {
    items: [],
    selected: null,
    loading: false
  },
  
  // BIONIC Generator State
  generator: {
    carteBionic: null,
    isGenerating: false,
    lastGenerated: null
  },
  
  // UI State
  ui: {
    layersPanelVisible: true,
    analysisPanelVisible: true,
    privacyMode: false,
    gpsLiveEnabled: false,
    mapClickMode: false,
    showGroupDashboard: false
  },
  
  // User Position
  position: {
    current: null,
    watching: false,
    accuracy: null
  },
  
  // Zones State
  zones: {
    selected: null,
    microZones: [],
    filteredZones: [],
    minPercentageFilter: 50,
    displayMode: 'micro'
  }
};

// ═══════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════

function bionicTerritoryReducer(state, action) {
  switch (action.type) {
    // Map Actions
    case BIONIC_ACTIONS.SET_MAP_CENTER:
      return {
        ...state,
        map: { ...state.map, center: action.payload, currentCenter: { lat: action.payload[0], lng: action.payload[1] } }
      };
    
    case BIONIC_ACTIONS.SET_MAP_ZOOM:
      return {
        ...state,
        map: { ...state.map, zoom: action.payload, currentZoom: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_MAP_BOUNDS:
      return {
        ...state,
        map: { ...state.map, bounds: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_BASE_MAP:
      return {
        ...state,
        map: { ...state.map, baseMap: action.payload }
      };
    
    // Layers Actions
    case BIONIC_ACTIONS.SET_PIPELINE_ENABLED:
      return {
        ...state,
        layers: { ...state.layers, pipelineEnabled: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_PIPELINE_COLLAPSED:
      return {
        ...state,
        layers: { ...state.layers, pipelineCollapsed: action.payload }
      };
    
    case BIONIC_ACTIONS.TOGGLE_ECO_LAYER:
      const { layerId, value } = action.payload;
      const currentOverlays = state.layers.activeEcoLayers.overlays || [];
      const newOverlays = value
        ? [...currentOverlays, layerId]
        : currentOverlays.filter(id => id !== layerId);
      return {
        ...state,
        layers: {
          ...state.layers,
          activeEcoLayers: {
            ...state.layers.activeEcoLayers,
            overlays: newOverlays
          }
        }
      };
    
    case BIONIC_ACTIONS.SET_ECO_LAYER_OPACITY:
      return {
        ...state,
        layers: {
          ...state.layers,
          ecoLayerOpacities: {
            ...state.layers.ecoLayerOpacities,
            [action.payload.layerId]: action.payload.opacity
          }
        }
      };
    
    case BIONIC_ACTIONS.SET_ACTIVE_ECO_LAYERS:
      return {
        ...state,
        layers: { ...state.layers, activeEcoLayers: action.payload }
      };
    
    // Thematic Modules Actions
    case BIONIC_ACTIONS.SET_THEMATIC_MODULES:
      return {
        ...state,
        thematicModules: action.payload
      };
    
    case BIONIC_ACTIONS.TOGGLE_THEMATIC_MODULE:
      return {
        ...state,
        thematicModules: state.thematicModules.map(m =>
          m.id === action.payload ? { ...m, enabled: !m.enabled } : m
        )
      };
    
    case BIONIC_ACTIONS.SET_SHOW_BEHAVIOR_ZONES:
      return {
        ...state,
        layers: { ...state.layers, showBehaviorZones: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_TOPO_ENABLED:
      return {
        ...state,
        layers: { ...state.layers, topoEnabled: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_QUEBEC_LAYERS:
      return {
        ...state,
        layers: { ...state.layers, quebecLayers: action.payload }
      };
    
    // Waypoints Actions
    case BIONIC_ACTIONS.SET_WAYPOINTS:
      return {
        ...state,
        waypoints: { ...state.waypoints, items: action.payload, loading: false }
      };
    
    case BIONIC_ACTIONS.ADD_WAYPOINT:
      return {
        ...state,
        waypoints: { ...state.waypoints, items: [...state.waypoints.items, action.payload] }
      };
    
    case BIONIC_ACTIONS.UPDATE_WAYPOINT:
      return {
        ...state,
        waypoints: {
          ...state.waypoints,
          items: state.waypoints.items.map(wp =>
            wp.id === action.payload.id ? { ...wp, ...action.payload } : wp
          )
        }
      };
    
    case BIONIC_ACTIONS.DELETE_WAYPOINT:
      return {
        ...state,
        waypoints: {
          ...state.waypoints,
          items: state.waypoints.items.filter(wp => wp.id !== action.payload)
        }
      };
    
    case BIONIC_ACTIONS.SET_SELECTED_WAYPOINT:
      return {
        ...state,
        waypoints: { ...state.waypoints, selected: action.payload }
      };
    
    // Generator Actions
    case BIONIC_ACTIONS.SET_CARTE_BIONIC:
      return {
        ...state,
        generator: { 
          ...state.generator, 
          carteBionic: action.payload,
          lastGenerated: action.payload ? new Date().toISOString() : null
        }
      };
    
    case BIONIC_ACTIONS.SET_GENERATING:
      return {
        ...state,
        generator: { ...state.generator, isGenerating: action.payload }
      };
    
    // UI Actions
    case BIONIC_ACTIONS.SET_LAYERS_PANEL_VISIBLE:
      return {
        ...state,
        ui: { ...state.ui, layersPanelVisible: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_ANALYSIS_PANEL_VISIBLE:
      return {
        ...state,
        ui: { ...state.ui, analysisPanelVisible: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_PRIVACY_MODE:
      return {
        ...state,
        ui: { ...state.ui, privacyMode: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_GPS_LIVE_ENABLED:
      return {
        ...state,
        ui: { ...state.ui, gpsLiveEnabled: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_MAP_CLICK_MODE:
      return {
        ...state,
        ui: { ...state.ui, mapClickMode: action.payload }
      };
    
    // Position Actions
    case BIONIC_ACTIONS.SET_USER_POSITION:
      return {
        ...state,
        position: { ...state.position, current: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_WATCHING_POSITION:
      return {
        ...state,
        position: { ...state.position, watching: action.payload }
      };
    
    // Zones Actions
    case BIONIC_ACTIONS.SET_SELECTED_ZONE:
      return {
        ...state,
        zones: { ...state.zones, selected: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_MICRO_ZONES:
      return {
        ...state,
        zones: { ...state.zones, microZones: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_FILTERED_ZONES:
      return {
        ...state,
        zones: { ...state.zones, filteredZones: action.payload }
      };
    
    case BIONIC_ACTIONS.SET_MIN_PERCENTAGE_FILTER:
      return {
        ...state,
        zones: { ...state.zones, minPercentageFilter: action.payload }
      };
    
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const BionicTerritoryContext = createContext(null);

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

export function BionicTerritoryProvider({ children, initialOverrides = {} }) {
  const [state, dispatch] = useReducer(
    bionicTerritoryReducer,
    { ...initialState, ...initialOverrides }
  );
  
  // ─────────────────────────────────────────────────────────────
  // ACTIONS MÉMOÏSÉES
  // ─────────────────────────────────────────────────────────────
  
  const actions = useMemo(() => ({
    // Map Actions
    setMapCenter: (center) => dispatch({ type: BIONIC_ACTIONS.SET_MAP_CENTER, payload: center }),
    setMapZoom: (zoom) => dispatch({ type: BIONIC_ACTIONS.SET_MAP_ZOOM, payload: zoom }),
    setMapBounds: (bounds) => dispatch({ type: BIONIC_ACTIONS.SET_MAP_BOUNDS, payload: bounds }),
    setBaseMap: (baseMap) => dispatch({ type: BIONIC_ACTIONS.SET_BASE_MAP, payload: baseMap }),
    
    // Layers Actions
    setPipelineEnabled: (enabled) => dispatch({ type: BIONIC_ACTIONS.SET_PIPELINE_ENABLED, payload: enabled }),
    setPipelineCollapsed: (collapsed) => dispatch({ type: BIONIC_ACTIONS.SET_PIPELINE_COLLAPSED, payload: collapsed }),
    toggleEcoLayer: (layerId, value) => dispatch({ type: BIONIC_ACTIONS.TOGGLE_ECO_LAYER, payload: { layerId, value } }),
    setEcoLayerOpacity: (layerId, opacity) => dispatch({ type: BIONIC_ACTIONS.SET_ECO_LAYER_OPACITY, payload: { layerId, opacity } }),
    setActiveEcoLayers: (layers) => dispatch({ type: BIONIC_ACTIONS.SET_ACTIVE_ECO_LAYERS, payload: layers }),
    setShowBehaviorZones: (show) => dispatch({ type: BIONIC_ACTIONS.SET_SHOW_BEHAVIOR_ZONES, payload: show }),
    setTopoEnabled: (enabled) => dispatch({ type: BIONIC_ACTIONS.SET_TOPO_ENABLED, payload: enabled }),
    setQuebecLayers: (layers) => dispatch({ type: BIONIC_ACTIONS.SET_QUEBEC_LAYERS, payload: layers }),
    
    // Thematic Modules Actions
    setThematicModules: (modules) => dispatch({ type: BIONIC_ACTIONS.SET_THEMATIC_MODULES, payload: modules }),
    toggleThematicModule: (moduleId) => dispatch({ type: BIONIC_ACTIONS.TOGGLE_THEMATIC_MODULE, payload: moduleId }),
    
    // Waypoints Actions
    setWaypoints: (waypoints) => dispatch({ type: BIONIC_ACTIONS.SET_WAYPOINTS, payload: waypoints }),
    addWaypoint: (waypoint) => dispatch({ type: BIONIC_ACTIONS.ADD_WAYPOINT, payload: waypoint }),
    updateWaypoint: (waypoint) => dispatch({ type: BIONIC_ACTIONS.UPDATE_WAYPOINT, payload: waypoint }),
    deleteWaypoint: (id) => dispatch({ type: BIONIC_ACTIONS.DELETE_WAYPOINT, payload: id }),
    setSelectedWaypoint: (waypoint) => dispatch({ type: BIONIC_ACTIONS.SET_SELECTED_WAYPOINT, payload: waypoint }),
    
    // Generator Actions
    setCarteBionic: (carte) => dispatch({ type: BIONIC_ACTIONS.SET_CARTE_BIONIC, payload: carte }),
    setGenerating: (generating) => dispatch({ type: BIONIC_ACTIONS.SET_GENERATING, payload: generating }),
    
    // UI Actions
    setLayersPanelVisible: (visible) => dispatch({ type: BIONIC_ACTIONS.SET_LAYERS_PANEL_VISIBLE, payload: visible }),
    setAnalysisPanelVisible: (visible) => dispatch({ type: BIONIC_ACTIONS.SET_ANALYSIS_PANEL_VISIBLE, payload: visible }),
    setPrivacyMode: (mode) => dispatch({ type: BIONIC_ACTIONS.SET_PRIVACY_MODE, payload: mode }),
    setGpsLiveEnabled: (enabled) => dispatch({ type: BIONIC_ACTIONS.SET_GPS_LIVE_ENABLED, payload: enabled }),
    setMapClickMode: (mode) => dispatch({ type: BIONIC_ACTIONS.SET_MAP_CLICK_MODE, payload: mode }),
    
    // Position Actions
    setUserPosition: (position) => dispatch({ type: BIONIC_ACTIONS.SET_USER_POSITION, payload: position }),
    setWatchingPosition: (watching) => dispatch({ type: BIONIC_ACTIONS.SET_WATCHING_POSITION, payload: watching }),
    
    // Zones Actions
    setSelectedZone: (zone) => dispatch({ type: BIONIC_ACTIONS.SET_SELECTED_ZONE, payload: zone }),
    setMicroZones: (zones) => dispatch({ type: BIONIC_ACTIONS.SET_MICRO_ZONES, payload: zones }),
    setFilteredZones: (zones) => dispatch({ type: BIONIC_ACTIONS.SET_FILTERED_ZONES, payload: zones }),
    setMinPercentageFilter: (min) => dispatch({ type: BIONIC_ACTIONS.SET_MIN_PERCENTAGE_FILTER, payload: min })
  }), []);
  
  // ─────────────────────────────────────────────────────────────
  // SELECTORS MÉMOÏSÉS
  // ─────────────────────────────────────────────────────────────
  
  const selectors = useMemo(() => ({
    // Map Selectors
    getMapCenter: () => state.map.center,
    getMapZoom: () => state.map.zoom,
    getBaseMap: () => state.map.baseMap,
    isBionicMapActive: () => state.map.baseMap === 'bionic',
    
    // Layers Selectors
    isPipelineEnabled: () => state.layers.pipelineEnabled,
    isPipelineCollapsed: () => state.layers.pipelineCollapsed,
    getActiveOverlays: () => state.layers.activeEcoLayers.overlays || [],
    getEcoLayerOpacity: (layerId) => state.layers.ecoLayerOpacities[layerId] ?? 1,
    isShowBehaviorZones: () => state.layers.showBehaviorZones,
    isTopoEnabled: () => state.layers.topoEnabled,
    getQuebecLayers: () => state.layers.quebecLayers,
    
    // Thematic Modules Selectors
    getThematicModules: () => state.thematicModules,
    isModuleEnabled: (moduleId) => state.thematicModules.find(m => m.id === moduleId)?.enabled ?? false,
    getActiveModulesCount: () => state.thematicModules.filter(m => m.enabled).length,
    
    // Waypoints Selectors
    getWaypoints: () => state.waypoints.items,
    getSelectedWaypoint: () => state.waypoints.selected,
    getWaypointCount: () => state.waypoints.items.length,
    
    // Generator Selectors
    getCarteBionic: () => state.generator.carteBionic,
    isGenerating: () => state.generator.isGenerating,
    hasGeneratedData: () => !!state.generator.carteBionic,
    
    // UI Selectors
    isLayersPanelVisible: () => state.ui.layersPanelVisible,
    isPrivacyMode: () => state.ui.privacyMode,
    isGpsLiveEnabled: () => state.ui.gpsLiveEnabled,
    isMapClickMode: () => state.ui.mapClickMode,
    
    // Position Selectors
    getUserPosition: () => state.position.current,
    isWatchingPosition: () => state.position.watching,
    
    // Zones Selectors
    getSelectedZone: () => state.zones.selected,
    getMicroZones: () => state.zones.microZones,
    getFilteredZones: () => state.zones.filteredZones,
    getMinPercentageFilter: () => state.zones.minPercentageFilter
  }), [state]);
  
  const value = useMemo(() => ({
    state,
    actions,
    selectors,
    dispatch
  }), [state, actions, selectors]);
  
  return (
    <BionicTerritoryContext.Provider value={value}>
      {children}
    </BionicTerritoryContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════

export function useBionicTerritory() {
  const context = useContext(BionicTerritoryContext);
  if (!context) {
    throw new Error('useBionicTerritory must be used within a BionicTerritoryProvider');
  }
  return context;
}

// Hooks spécialisés pour accès granulaire
export function useBionicMap() {
  const { state, actions } = useBionicTerritory();
  return {
    ...state.map,
    setCenter: actions.setMapCenter,
    setZoom: actions.setMapZoom,
    setBounds: actions.setMapBounds,
    setBaseMap: actions.setBaseMap
  };
}

export function useBionicLayers() {
  const { state, actions } = useBionicTerritory();
  return {
    ...state.layers,
    setPipelineEnabled: actions.setPipelineEnabled,
    setPipelineCollapsed: actions.setPipelineCollapsed,
    toggleEcoLayer: actions.toggleEcoLayer,
    setEcoLayerOpacity: actions.setEcoLayerOpacity
  };
}

export function useBionicWaypoints() {
  const { state, actions } = useBionicTerritory();
  return {
    ...state.waypoints,
    add: actions.addWaypoint,
    update: actions.updateWaypoint,
    remove: actions.deleteWaypoint,
    select: actions.setSelectedWaypoint,
    setAll: actions.setWaypoints
  };
}

export function useBionicGenerator() {
  const { state, actions } = useBionicTerritory();
  return {
    ...state.generator,
    setCarte: actions.setCarteBionic,
    setGenerating: actions.setGenerating
  };
}

export function useBionicUI() {
  const { state, actions } = useBionicTerritory();
  return {
    ...state.ui,
    setLayersPanelVisible: actions.setLayersPanelVisible,
    setAnalysisPanelVisible: actions.setAnalysisPanelVisible,
    setPrivacyMode: actions.setPrivacyMode,
    setGpsLiveEnabled: actions.setGpsLiveEnabled,
    setMapClickMode: actions.setMapClickMode
  };
}

export default BionicTerritoryContext;
