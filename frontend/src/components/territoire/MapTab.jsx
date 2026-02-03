/**
 * MapTab.jsx - Onglet Carte BIONIC principal
 * Extrait de MonTerritoireBionicPage.jsx pour réduire le God Component
 */

import React, { memo, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import { Layers, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Composants carte
import MapController from './MapController';
import ZoomHandler from './ZoomHandler';
import MapClickHandler from './MapClickHandler';
import CursorTracker from './CursorTracker';
import GPSLiveDisplay from './GPSLiveDisplay';
import WaterMaskStats from './WaterMaskStats';
import BionicMicroZones from './BionicMicroZones';
import BionicHotspotsLayer from './BionicHotspotsLayer';
import BionicMapOverlay from './BionicMapOverlay';
import BionicForestZonesLayer from './BionicForestZonesLayer';
import WildlifeBehaviorLayer from './WildlifeBehaviorLayer';
import TopographicOverlay from './TopographicOverlay';
import WaypointZoneAnalysis from './WaypointZoneAnalysis';
import { createCustomIcon } from './CustomMarkerIcons';

const BASE_MAP_URLS = {
  bionic: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
};

const LayersPanel = memo(({ 
  showLayersPanel, 
  setShowLayersPanel,
  activeBaseMap,
  handleBaseMapChange,
  pipelineEnabled,
  setPipelineEnabled,
  pipelineCollapsed,
  setPipelineCollapsed,
  layersVisible,
  toggleLayer,
  showAllLayers,
  hideAllLayers,
  activeCount,
  allLayers,
  zoneDisplayMode,
  setZoneDisplayMode,
  showConcentricCircles,
  setShowConcentricCircles,
  showCorridors,
  setShowCorridors,
  minPercentageFilter,
  setMinPercentageFilter
}) => (
  <div className={`${showLayersPanel ? 'w-64' : 'w-10'} bg-gray-900/95 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
    <button 
      onClick={() => setShowLayersPanel(!showLayersPanel)} 
      className="p-2 border-b border-gray-800 flex items-center justify-between hover:bg-gray-800/50"
    >
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-[#f5a623]" />
        {showLayersPanel && <span className="text-white text-sm">Couches</span>}
      </div>
    </button>
    
    {showLayersPanel && (
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Fond de carte */}
        <div className="border-b border-gray-700 pb-3 mb-2">
          <div className="text-[10px] text-[#f5a623] uppercase mb-2 flex items-center gap-1">
            🗺️ Fond de carte
          </div>
          <div className="space-y-1">
            {['bionic', 'satellite', 'terrain'].map((mapType) => (
              <button
                key={mapType}
                onClick={() => handleBaseMapChange(mapType)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] transition-all ${
                  activeBaseMap === mapType 
                    ? 'bg-[#f5a623]/20 text-white border border-[#f5a623]/50' 
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                }`}
              >
                <span>{mapType === 'bionic' ? '🎯' : mapType === 'satellite' ? '🛰️' : '🏔️'}</span>
                <span className="flex-1 text-left capitalize">{mapType === 'bionic' ? 'BIONIC™' : mapType}</span>
                {activeBaseMap === mapType && <Badge className="bg-[#f5a623] text-black text-[8px]">Actif</Badge>}
              </button>
            ))}
          </div>
          
          {/* Pipeline BIONIC */}
          {activeBaseMap === 'bionic' && (
            <div className={`mt-2 rounded border transition-all ${
              pipelineEnabled ? 'bg-[#f5a623]/10 border-[#f5a623]/30' : 'bg-gray-800/30 border-gray-700/30 opacity-60'
            }`}>
              <div 
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/5"
                onClick={() => setPipelineCollapsed(!pipelineCollapsed)}
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown className={`h-3 w-3 transition-transform ${pipelineCollapsed ? '-rotate-90' : ''} ${pipelineEnabled ? 'text-[#f5a623]' : 'text-gray-500'}`} />
                  <span className={`text-[9px] uppercase ${pipelineEnabled ? 'text-[#f5a623]' : 'text-gray-500'}`}>Pipeline v1.0</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setPipelineEnabled(!pipelineEnabled); }}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold ${pipelineEnabled ? 'bg-[#f5a623] text-black' : 'bg-gray-700 text-gray-400'}`}
                >
                  {pipelineEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Couches BIONIC */}
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={showAllLayers} className="flex-1 text-[10px] h-7 border-gray-700">Tout</Button>
          <Button size="sm" variant="outline" onClick={hideAllLayers} className="flex-1 text-[10px] h-7 border-gray-700">Aucun</Button>
        </div>
        <div className="text-[10px] text-gray-500">{activeCount}/{allLayers.length} actives</div>
        <div className="space-y-1">
          {allLayers.slice(0, 10).map(layer => (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] transition-all ${
                layersVisible[layer.id] ? 'bg-[#f5a623]/10 text-white border border-[#f5a623]/30' : 'bg-gray-800/50 text-gray-400'
              }`}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: layersVisible[layer.id] ? layer.color : '#4b5563' }} />
              <span className="flex-1 text-left truncate">{layer.name}</span>
            </button>
          ))}
        </div>
        
        {/* Mode d'affichage */}
        <div className="border-t border-gray-700 pt-2 mt-3">
          <div className="text-[10px] text-[#f5a623] uppercase mb-2 flex items-center gap-1">
            <Settings className="h-3 w-3" /> Affichage zones
          </div>
          <div className="flex gap-1 mb-2">
            <Button 
              size="sm" 
              variant={zoneDisplayMode === 'micro' ? 'default' : 'outline'} 
              onClick={() => setZoneDisplayMode('micro')} 
              className={`flex-1 text-[9px] h-6 ${zoneDisplayMode === 'micro' ? 'bg-[#f5a623] text-black' : 'border-gray-700'}`}
            >
              Micro
            </Button>
            <Button 
              size="sm" 
              variant={zoneDisplayMode === 'classic' ? 'default' : 'outline'} 
              onClick={() => setZoneDisplayMode('classic')} 
              className={`flex-1 text-[9px] h-6 ${zoneDisplayMode === 'classic' ? 'bg-[#f5a623] text-black' : 'border-gray-700'}`}
            >
              Classique
            </Button>
          </div>
          {zoneDisplayMode === 'micro' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Cercles concentriques</span>
                <Switch checked={showConcentricCircles} onCheckedChange={setShowConcentricCircles} className="scale-75" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Corridors & Tampons</span>
                <Switch checked={showCorridors} onCheckedChange={setShowCorridors} className="scale-75" />
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
));

LayersPanel.displayName = 'LayersPanel';

const MapTab = memo(({
  // Map state
  mapCenter,
  mapZoom,
  currentZoom,
  activeBaseMap,
  handleBaseMapChange,
  onZoomChange,
  onMapMove,
  onBoundsChange,
  // Layers
  showLayersPanel,
  setShowLayersPanel,
  pipelineEnabled,
  setPipelineEnabled,
  pipelineCollapsed,
  setPipelineCollapsed,
  layersVisible,
  toggleLayer,
  showAllLayers,
  hideAllLayers,
  activeCount,
  allLayers,
  // Zones
  zoneDisplayMode,
  setZoneDisplayMode,
  showConcentricCircles,
  setShowConcentricCircles,
  showCorridors,
  setShowCorridors,
  minPercentageFilter,
  setMinPercentageFilter,
  microZones,
  selectedEspece,
  // User
  userPosition,
  gpsLiveEnabled,
  cursorPosition,
  cursorElevation,
  // Waypoints
  activeWaypoints,
  mapClickMode,
  onMapClick,
  onCursorMove,
  onCursorLeave,
  // Water stats
  waterExclusionStats,
  // Carte BIONIC
  carteBionic,
  // Overlays
  topoEnabled,
  showBehaviorZones,
  // Analysis
  zoneAnalysisEnabled,
  zoneAnalysisWaypoint,
  zoneAnalysisArea,
  onZoneAnalysisComplete
}) => {
  const tileUrl = BASE_MAP_URLS[activeBaseMap] || BASE_MAP_URLS.bionic;
  
  return (
    <div className="flex h-full" data-testid="map-tab">
      <LayersPanel
        showLayersPanel={showLayersPanel}
        setShowLayersPanel={setShowLayersPanel}
        activeBaseMap={activeBaseMap}
        handleBaseMapChange={handleBaseMapChange}
        pipelineEnabled={pipelineEnabled}
        setPipelineEnabled={setPipelineEnabled}
        pipelineCollapsed={pipelineCollapsed}
        setPipelineCollapsed={setPipelineCollapsed}
        layersVisible={layersVisible}
        toggleLayer={toggleLayer}
        showAllLayers={showAllLayers}
        hideAllLayers={hideAllLayers}
        activeCount={activeCount}
        allLayers={allLayers}
        zoneDisplayMode={zoneDisplayMode}
        setZoneDisplayMode={setZoneDisplayMode}
        showConcentricCircles={showConcentricCircles}
        setShowConcentricCircles={setShowConcentricCircles}
        showCorridors={showCorridors}
        setShowCorridors={setShowCorridors}
        minPercentageFilter={minPercentageFilter}
        setMinPercentageFilter={setMinPercentageFilter}
      />
      
      {/* Carte principale */}
      <div className="flex-1 relative">
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          className="h-full w-full" 
          zoomControl={false}
        >
          <TileLayer url={tileUrl} />
          <MapController center={mapCenter} zoom={mapZoom} />
          <ZoomHandler onZoomChange={onZoomChange} onMapMove={onMapMove} onBoundsChange={onBoundsChange} />
          {mapClickMode && <MapClickHandler onMapClick={onMapClick} />}
          <CursorTracker onCursorMove={onCursorMove} onCursorLeave={onCursorLeave} />
          
          {/* User position */}
          {userPosition && (
            <Marker position={[userPosition.lat, userPosition.lng]} icon={createCustomIcon('#3b82f6', 'user')}>
              <Popup><b>Ma position</b></Popup>
            </Marker>
          )}
          
          {/* Waypoints actifs */}
          {activeWaypoints.map(wp => (
            <Marker 
              key={wp.id} 
              position={[wp.lat || wp.latitude, wp.lng || wp.longitude]} 
              icon={createCustomIcon('#f5a623', 'waypoint')}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-bold">{wp.name}</div>
                  <div className="text-xs text-gray-500">{wp.type}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Micro zones BIONIC */}
          {zoneDisplayMode === 'micro' && microZones.length > 0 && (
            <BionicMicroZones 
              zones={microZones} 
              minPercentage={minPercentageFilter}
              selectedEspece={selectedEspece}
            />
          )}
          
          {/* Hotspots BIONIC */}
          {pipelineEnabled && carteBionic?.hotspots && (
            <BionicHotspotsLayer hotspots={carteBionic.hotspots} />
          )}
          
          {/* Zone analysis */}
          {zoneAnalysisEnabled && zoneAnalysisWaypoint && (
            <WaypointZoneAnalysis
              waypoint={zoneAnalysisWaypoint}
              areaSize={zoneAnalysisArea}
              onAnalysisComplete={onZoneAnalysisComplete}
            />
          )}
        </MapContainer>
        
        {/* Overlay BIONIC */}
        {activeBaseMap === 'bionic' && pipelineEnabled && <BionicMapOverlay />}
        
        {/* GPS Live Display */}
        {gpsLiveEnabled && cursorPosition && (
          <GPSLiveDisplay position={cursorPosition} elevation={cursorElevation} />
        )}
        
        {/* Water stats */}
        {waterExclusionStats && <WaterMaskStats stats={waterExclusionStats} />}
      </div>
    </div>
  );
});

MapTab.displayName = 'MapTab';

export default MapTab;
