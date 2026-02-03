/**
 * WaypointsTab.jsx - Onglet Waypoints actifs
 * Extrait de MonTerritoireBionicPage.jsx pour réduire le God Component
 */

import React, { memo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin, Plus, Navigation2, Trash2, Target, LocateFixed, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import MapController from './MapController';
import { createCustomIcon } from './CustomMarkerIcons';
import { PLACE_TYPES } from './PlaceTypes';

const MAX_ACTIVE_WAYPOINTS = 2;

const WaypointsTab = memo(({
  waypoints,
  activeWaypoints,
  userPosition,
  mapCenter,
  mapZoom,
  setMapCenter,
  setMapZoom,
  toggleWaypointActive,
  deleteWaypoint,
  selectWaypointAsTarget,
  selectedWaypointForZones,
  clearWaypointTarget,
  onShowAddWaypointDialog,
  onShareWaypoint
}) => {
  const activeCount = activeWaypoints.length;
  
  const handleToggleActive = useCallback((waypointId, currentActive) => {
    if (!currentActive && activeCount >= MAX_ACTIVE_WAYPOINTS) {
      toast.warning(`Maximum ${MAX_ACTIVE_WAYPOINTS} waypoints actifs`, {
        description: 'Désactivez un waypoint avant d\'en activer un autre'
      });
      return;
    }
    toggleWaypointActive(waypointId);
  }, [activeCount, toggleWaypointActive]);
  
  return (
    <div className="h-full flex" data-testid="waypoints-tab">
      {/* Liste des waypoints */}
      <div className="w-80 border-r border-gray-800 flex flex-col bg-black">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-semibold">Waypoints</h3>
              <Badge className="bg-[#f5a623] text-black text-xs">
                {activeCount}/{MAX_ACTIVE_WAYPOINTS} actifs
              </Badge>
            </div>
            <Button size="sm" className="bg-[#f5a623] hover:bg-[#e09612] text-black" onClick={onShowAddWaypointDialog}>
              <Plus className="h-4 w-4 mr-1" /> Ajouter
            </Button>
          </div>
          
          {activeCount >= MAX_ACTIVE_WAYPOINTS && (
            <div className="bg-amber-500/20 border border-amber-500/50 rounded p-2 text-xs text-amber-400">
              ⚠️ Limite atteinte. Désactivez un waypoint pour en activer un autre.
            </div>
          )}
        </div>
        
        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {waypoints.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Aucun waypoint</p>
              <p className="text-xs mt-1">Créez des points d'intérêt pour l'analyse BIONIC™</p>
            </div>
          ) : (
            waypoints.map(wp => {
              const typeInfo = PLACE_TYPES.find(t => t.id === wp.type);
              const isActive = wp.active;
              const isTarget = selectedWaypointForZones?.id === wp.id;
              
              return (
                <div 
                  key={wp.id} 
                  className={`rounded-lg p-3 border transition-all ${
                    isActive 
                      ? 'bg-[#f5a623]/10 border-[#f5a623]/50' 
                      : 'bg-gray-800/50 border-gray-700'
                  } ${isTarget ? 'ring-2 ring-[#f5a623]' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${typeInfo?.color || '#f5a623'}20` }}
                      >
                        {typeInfo?.icon || '📍'}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium flex items-center gap-2">
                          {wp.name}
                          {isTarget && <Badge className="bg-[#f5a623] text-black text-[8px]">CIBLE</Badge>}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{typeInfo?.name || wp.type}</div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {(wp.lat || wp.latitude)?.toFixed(4)}, {(wp.lng || wp.longitude)?.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch 
                        checked={isActive}
                        onCheckedChange={() => handleToggleActive(wp.id, isActive)}
                        disabled={!isActive && activeCount >= MAX_ACTIVE_WAYPOINTS}
                        className="scale-75"
                      />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-700/50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setMapCenter([wp.lat || wp.latitude, wp.lng || wp.longitude]); setMapZoom(14); }}
                      className="text-gray-400 hover:text-white h-7 text-[10px]"
                    >
                      <Navigation2 className="h-3 w-3 mr-1" /> Centrer
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => isTarget ? clearWaypointTarget() : selectWaypointAsTarget(wp)}
                      className={`h-7 text-[10px] ${isTarget ? 'text-[#f5a623]' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Target className="h-3 w-3 mr-1" /> {isTarget ? 'Libérer' : 'Cibler'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onShareWaypoint(wp)}
                      className="text-blue-400 hover:text-blue-300 h-7 text-[10px]"
                    >
                      <Share2 className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteWaypoint(wp.id)}
                      className="text-red-400 hover:text-red-300 h-7 text-[10px]"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Carte des waypoints */}
      <div className="flex-1 relative">
        <MapContainer center={mapCenter} zoom={10} className="h-full w-full" zoomControl={false}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {userPosition && (
            <Marker position={[userPosition.lat, userPosition.lng]} icon={createCustomIcon('#3b82f6', 'user')}>
              <Popup><b>Ma position</b></Popup>
            </Marker>
          )}
          
          {waypoints.map(wp => {
            const isActive = wp.active;
            const isTarget = selectedWaypointForZones?.id === wp.id;
            const lat = wp.lat || wp.latitude;
            const lng = wp.lng || wp.longitude;
            
            return (
              <React.Fragment key={wp.id}>
                <Marker 
                  position={[lat, lng]} 
                  icon={createCustomIcon(isActive ? '#f5a623' : '#6b7280', 'waypoint')}
                >
                  <Popup>
                    <div className="text-center min-w-[120px]">
                      <div className="font-bold">{wp.name}</div>
                      <div className="text-xs text-gray-500">{wp.type}</div>
                      {isActive && <Badge className="mt-1 bg-green-500 text-white text-[8px]">Actif</Badge>}
                    </div>
                  </Popup>
                </Marker>
                
                {isTarget && (
                  <Circle 
                    center={[lat, lng]} 
                    radius={2000} 
                    pathOptions={{ color: '#f5a623', fillColor: '#f5a623', fillOpacity: 0.1, weight: 2, dashArray: '5,5' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
        
        {/* Légende */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-black/90 backdrop-blur-sm rounded-lg border border-gray-700 p-3">
          <div className="text-[10px] text-gray-400 uppercase mb-2">État des waypoints</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#f5a623]" />
              <span className="text-gray-300">Actif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-gray-300">Inactif</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-[#f5a623] border-dashed" />
              <span className="text-gray-300">Zone cible</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

WaypointsTab.displayName = 'WaypointsTab';

export default WaypointsTab;
