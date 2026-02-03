/**
 * useTerritoryState.js - Hook centralisé pour l'état du territoire
 * Remplace les 61+ useState du God Component
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { toast } from 'sonner';

const INITIAL_MAP_CENTER = [46.8139, -71.2080];
const INITIAL_ZOOM = 12;

export function useTerritoryState() {
  // ═══ MAP STATE ═══
  const [mapCenter, setMapCenter] = useState(INITIAL_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(INITIAL_ZOOM);
  const [currentZoom, setCurrentZoom] = useState(INITIAL_ZOOM);
  const [currentMapCenter, setCurrentMapCenter] = useState({ lat: INITIAL_MAP_CENTER[0], lng: INITIAL_MAP_CENTER[1] });
  const [currentMapBounds, setCurrentMapBounds] = useState(null);
  const [activeBaseMap, setActiveBaseMap] = useState('bionic');
  
  // ═══ UI STATE ═══
  const [activeTab, setActiveTab] = useState('carte');
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  // ═══ ZONES STATE ═══
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedWaypointForZones, setSelectedWaypointForZones] = useState(null);
  const [zoneDisplayMode, setZoneDisplayMode] = useState('micro');
  const [showConcentricCircles, setShowConcentricCircles] = useState(true);
  const [showCorridors, setShowCorridors] = useState(true);
  const [minPercentageFilter, setMinPercentageFilter] = useState(80);
  
  // ═══ WATER EXCLUSION STATE ═══
  const [waterExclusionStats, setWaterExclusionStats] = useState(null);
  const [filteredMicroZones, setFilteredMicroZones] = useState([]);
  const [isFilteringWater, setIsFilteringWater] = useState(false);
  
  // ═══ BIONIC STATE ═══
  const [selectedEspece, setSelectedEspece] = useState('ORIGNAL');
  const [carteBionic, setCarteBionic] = useState(null);
  const [pipelineEnabled, setPipelineEnabled] = useState(true);
  const [pipelineCollapsed, setPipelineCollapsed] = useState(false);
  
  // ═══ ECO LAYERS STATE ═══
  const [activeEcoLayers, setActiveEcoLayers] = useState({
    baseMap: 'terrain',
    peuplements: false,
    essences: false,
    perturbations: false,
    densite: false,
    hauteur: false
  });
  const [ecoLayerOpacities, setEcoLayerOpacities] = useState({});
  
  // ═══ QUEBEC LAYERS STATE ═══
  const [quebecLayers, setQuebecLayers] = useState({
    ecoforestry: { enabled: false, opacity: 60, loading: false },
    lidar: { enabled: false, opacity: 50, loading: false },
    twi: { enabled: false, opacity: 50, loading: false }
  });
  
  // ═══ POSITION STATE ═══
  const [userPosition, setUserPosition] = useState(null);
  const [watchingPosition, setWatchingPosition] = useState(false);
  const watchIdRef = useRef(null);
  
  // ═══ CURSOR STATE ═══
  const [cursorPosition, setCursorPosition] = useState(null);
  const [cursorData, setCursorData] = useState(null);
  const [cursorElevation, setCursorElevation] = useState(null);
  const [gpsLiveEnabled, setGpsLiveEnabled] = useState(false);
  const elevationCacheRef = useRef({});
  
  // ═══ WAYPOINT MODE STATE ═══
  const [mapClickMode, setMapClickMode] = useState(false);
  const [quickWaypointMode, setQuickWaypointMode] = useState(false);
  const [showAddWaypointDialog, setShowAddWaypointDialog] = useState(false);
  const [newWaypoint, setNewWaypoint] = useState({ name: '', type: 'autre', lat: '', lng: '' });
  
  // ═══ PLACE STATE ═══
  const [showAddPlaceDialog, setShowAddPlaceDialog] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', type: 'autre', lat: '', lng: '', notes: '' });
  const [editingPlace, setEditingPlace] = useState(null);
  
  // ═══ GROUP STATE ═══
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [waypointToShare, setWaypointToShare] = useState(null);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showGroupDashboard, setShowGroupDashboard] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  // ═══ TOPOGRAPHIC STATE ═══
  const [topoEnabled, setTopoEnabled] = useState(false);
  const [topoHillshade, setTopoHillshade] = useState(true);
  const [topoHillshadeOpacity, setTopoHillshadeOpacity] = useState(40);
  const [topoContours, setTopoContours] = useState(true);
  
  // ═══ ZONE ANALYSIS STATE ═══
  const [zoneAnalysisEnabled, setZoneAnalysisEnabled] = useState(false);
  const [zoneAnalysisWaypoint, setZoneAnalysisWaypoint] = useState(null);
  const [zoneAnalysisArea, setZoneAnalysisArea] = useState('4');
  const [zoneAnalysisResult, setZoneAnalysisResult] = useState(null);
  const [zoneAnalysisAutoMode, setZoneAnalysisAutoMode] = useState(true);
  
  // ═══ BEHAVIOR ZONES STATE ═══
  const [showBehaviorZones, setShowBehaviorZones] = useState(true);
  const [activeBehaviors, setActiveBehaviors] = useState(null);
  
  // ═══ THEMATIC MODULES ═══
  const [thematicModules, setThematicModules] = useState([
    { id: 'habitat', name: 'Habitat Optimal', icon: '🏠', enabled: true, score: 63 },
    { id: 'meteo', name: 'Analyse Météo', icon: '🌤️', enabled: true, score: 78 },
    { id: 'approche', name: 'Approche Optimale', icon: '🎯', enabled: true, score: 96 },
    { id: 'alimentation', name: 'Zones Alimentation', icon: '🍃', enabled: false, score: 73 },
    { id: 'comportement', name: 'Comportements Gibier', icon: '🦌', enabled: true, score: 85 },
    { id: 'hotspots', name: 'Hotspots IA', icon: '🔥', enabled: false, score: 91 },
    { id: 'peuplements', name: 'Peuplements Forestiers', icon: '🌲', enabled: true, score: 88 },
    { id: 'topographie', name: 'Overlay Topographique', icon: '⛰️', enabled: false, score: 75 }
  ]);
  
  // ═══ CALLBACKS ═══
  
  const handleBaseMapChange = useCallback((mapId) => {
    setActiveBaseMap(mapId);
  }, []);
  
  const handleZoomChange = useCallback((newZoom) => {
    setCurrentZoom(newZoom);
  }, []);
  
  const handleMapMove = useCallback((newCenter) => {
    setCurrentMapCenter(newCenter);
  }, []);
  
  const handleBoundsChange = useCallback((newBounds) => {
    setCurrentMapBounds(newBounds);
  }, []);
  
  const handleEcoLayerToggle = useCallback((layerId, value) => {
    if (layerId === 'baseMap') {
      setActiveEcoLayers(prev => ({ ...prev, baseMap: value }));
    } else {
      setActiveEcoLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
    }
  }, []);
  
  const handleEcoOpacityChange = useCallback((layerId, opacity) => {
    setEcoLayerOpacities(prev => ({ ...prev, [layerId]: opacity }));
  }, []);
  
  const toggleQuebecLayer = useCallback((layerId) => {
    setQuebecLayers(prev => ({
      ...prev,
      [layerId]: { ...prev[layerId], enabled: !prev[layerId].enabled }
    }));
  }, []);
  
  const handleModuleToggle = useCallback((moduleId) => {
    setThematicModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    ));
  }, []);
  
  const selectWaypointAsTarget = useCallback((waypoint) => {
    setSelectedWaypointForZones(waypoint);
    setMapCenter([waypoint.lat || waypoint.latitude, waypoint.lng || waypoint.longitude]);
    setMapZoom(14);
    toast.success(`Zones BIONIC centrées sur ${waypoint.name}`);
  }, []);
  
  const clearWaypointTarget = useCallback(() => {
    setSelectedWaypointForZones(null);
    toast.info('Zones BIONIC en mode libre');
  }, []);
  
  const handleZoneAnalysisComplete = useCallback((result) => {
    setZoneAnalysisResult(result);
    if (result?.score) {
      toast.success(`🎯 Hotspot optimal identifié: ${result.score}%`);
    }
  }, []);
  
  const handleSelectZoneWaypoint = useCallback((wp) => {
    setZoneAnalysisWaypoint(wp);
    if (wp) {
      setMapCenter([wp.lat, wp.lng]);
      setMapZoom(14);
      if (zoneAnalysisAutoMode) {
        setZoneAnalysisEnabled(true);
        setZoneAnalysisResult(null);
        toast.info(`🔍 Analyse en cours...`);
      }
    } else {
      setZoneAnalysisEnabled(false);
      setZoneAnalysisResult(null);
    }
  }, [zoneAnalysisAutoMode]);
  
  // Geolocation
  const startWatchingPosition = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée');
      return;
    }
    setWatchingPosition(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserPosition({ lat: latitude, lng: longitude, accuracy });
      },
      (error) => {
        toast.error('Erreur de géolocalisation');
        setWatchingPosition(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
  }, []);
  
  const stopWatchingPosition = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setWatchingPosition(false);
  }, []);
  
  const centerOnUser = useCallback(() => {
    if (userPosition) {
      setMapCenter([userPosition.lat, userPosition.lng]);
      setMapZoom(14);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          setMapZoom(14);
          toast.success('Centré sur votre position');
        },
        () => toast.error('Impossible d\'obtenir votre position')
      );
    }
  }, [userPosition]);
  
  return {
    // Map
    mapCenter, setMapCenter,
    mapZoom, setMapZoom,
    currentZoom, setCurrentZoom,
    currentMapCenter, setCurrentMapCenter,
    currentMapBounds, setCurrentMapBounds,
    activeBaseMap, setActiveBaseMap,
    handleBaseMapChange,
    handleZoomChange,
    handleMapMove,
    handleBoundsChange,
    
    // UI
    activeTab, setActiveTab,
    showLayersPanel, setShowLayersPanel,
    showAnalysisPanel, setShowAnalysisPanel,
    liveMode, setLiveMode,
    privacyMode, setPrivacyMode,
    
    // Zones
    selectedZone, setSelectedZone,
    selectedWaypointForZones, setSelectedWaypointForZones,
    zoneDisplayMode, setZoneDisplayMode,
    showConcentricCircles, setShowConcentricCircles,
    showCorridors, setShowCorridors,
    minPercentageFilter, setMinPercentageFilter,
    selectWaypointAsTarget,
    clearWaypointTarget,
    
    // Water
    waterExclusionStats, setWaterExclusionStats,
    filteredMicroZones, setFilteredMicroZones,
    isFilteringWater, setIsFilteringWater,
    
    // BIONIC
    selectedEspece, setSelectedEspece,
    carteBionic, setCarteBionic,
    pipelineEnabled, setPipelineEnabled,
    pipelineCollapsed, setPipelineCollapsed,
    
    // Eco layers
    activeEcoLayers, setActiveEcoLayers,
    ecoLayerOpacities, setEcoLayerOpacities,
    handleEcoLayerToggle,
    handleEcoOpacityChange,
    
    // Quebec layers
    quebecLayers, setQuebecLayers,
    toggleQuebecLayer,
    
    // Position
    userPosition, setUserPosition,
    watchingPosition, setWatchingPosition,
    startWatchingPosition,
    stopWatchingPosition,
    centerOnUser,
    
    // Cursor
    cursorPosition, setCursorPosition,
    cursorData, setCursorData,
    cursorElevation, setCursorElevation,
    gpsLiveEnabled, setGpsLiveEnabled,
    elevationCacheRef,
    
    // Waypoint mode
    mapClickMode, setMapClickMode,
    quickWaypointMode, setQuickWaypointMode,
    showAddWaypointDialog, setShowAddWaypointDialog,
    newWaypoint, setNewWaypoint,
    
    // Place
    showAddPlaceDialog, setShowAddPlaceDialog,
    newPlace, setNewPlace,
    editingPlace, setEditingPlace,
    
    // Groups
    showShareDialog, setShowShareDialog,
    waypointToShare, setWaypointToShare,
    showCreateGroupDialog, setShowCreateGroupDialog,
    showGroupDashboard, setShowGroupDashboard,
    selectedGroup, setSelectedGroup,
    
    // Topographic
    topoEnabled, setTopoEnabled,
    topoHillshade, setTopoHillshade,
    topoHillshadeOpacity, setTopoHillshadeOpacity,
    topoContours, setTopoContours,
    
    // Zone analysis
    zoneAnalysisEnabled, setZoneAnalysisEnabled,
    zoneAnalysisWaypoint, setZoneAnalysisWaypoint,
    zoneAnalysisArea, setZoneAnalysisArea,
    zoneAnalysisResult, setZoneAnalysisResult,
    zoneAnalysisAutoMode, setZoneAnalysisAutoMode,
    handleZoneAnalysisComplete,
    handleSelectZoneWaypoint,
    
    // Behavior zones
    showBehaviorZones, setShowBehaviorZones,
    activeBehaviors, setActiveBehaviors,
    
    // Thematic modules
    thematicModules, setThematicModules,
    handleModuleToggle
  };
}

export default useTerritoryState;
