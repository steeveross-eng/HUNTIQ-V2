/**
 * MapControlButtons.jsx
 * 
 * Boutons de contrôle de la carte
 * - Zoom +/-
 * - Ma position
 * - GPS LIVE toggle
 * - Écoforestier toggle
 * - Création waypoint
 * 
 * Architecture: Micro-Frontend Ready
 */

import React from 'react';
import { 
  Plus, 
  Minus, 
  Navigation, 
  MapPin, 
  Trees, 
  Crosshair,
  Satellite,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const MapControlButtons = ({
  // Zoom
  currentZoom,
  onZoomIn,
  onZoomOut,
  minZoom = 5,
  maxZoom = 18,
  
  // Position
  onLocateUser,
  userPosition,
  isLocating = false,
  
  // GPS LIVE
  gpsLiveEnabled,
  onToggleGpsLive,
  
  // Écoforestier
  onToggleEcoforestry,
  ecoforestryActive = false,
  
  // Waypoint
  mapClickMode,
  onToggleMapClickMode,
  
  // Position sur la carte
  position = 'topright' // 'topright', 'topleft', 'bottomright', 'bottomleft'
}) => {
  // Calculer les styles de position
  const positionStyles = {
    topright: 'top-4 right-4',
    topleft: 'top-4 left-4',
    bottomright: 'bottom-4 right-4',
    bottomleft: 'bottom-4 left-4'
  };
  
  return (
    <TooltipProvider>
      <div 
        className={`absolute ${positionStyles[position]} z-[1000] flex flex-col gap-2`}
        data-testid="map-controls"
      >
        {/* Zoom Controls */}
        <div className="bg-gray-900/90 rounded-lg p-1 flex flex-col gap-1 border border-gray-700">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoomIn}
                disabled={currentZoom >= maxZoom}
                className="h-8 w-8 p-0 hover:bg-gray-700"
                data-testid="zoom-in"
              >
                <Plus className="h-4 w-4 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom avant (z{currentZoom + 1})</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="text-center text-[10px] text-gray-400 py-0.5">
            z{currentZoom}
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onZoomOut}
                disabled={currentZoom <= minZoom}
                className="h-8 w-8 p-0 hover:bg-gray-700"
                data-testid="zoom-out"
              >
                <Minus className="h-4 w-4 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom arrière (z{currentZoom - 1})</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Location & GPS Controls */}
        <div className="bg-gray-900/90 rounded-lg p-1 flex flex-col gap-1 border border-gray-700">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLocateUser}
                className={`h-8 w-8 p-0 hover:bg-gray-700 ${isLocating ? 'animate-pulse' : ''}`}
                data-testid="locate-user"
              >
                <Navigation 
                  className={`h-4 w-4 ${userPosition ? 'text-blue-400' : 'text-white'}`} 
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Ma position</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleGpsLive}
                className={`h-8 w-8 p-0 hover:bg-gray-700 relative ${gpsLiveEnabled ? 'bg-green-600/30' : ''}`}
                data-testid="gps-live-toggle"
              >
                <Compass className={`h-4 w-4 ${gpsLiveEnabled ? 'text-green-400' : 'text-white'}`} />
                {gpsLiveEnabled && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-ping" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>GPS LIVE {gpsLiveEnabled ? 'ON' : 'OFF'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Feature Controls */}
        <div className="bg-gray-900/90 rounded-lg p-1 flex flex-col gap-1 border border-gray-700">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleEcoforestry}
                className={`h-8 w-8 p-0 hover:bg-gray-700 ${ecoforestryActive ? 'bg-green-600/30' : ''}`}
                data-testid="ecoforestry-toggle"
              >
                <Trees className={`h-4 w-4 ${ecoforestryActive ? 'text-green-400' : 'text-white'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Couches Écoforestières</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMapClickMode}
                className={`h-8 w-8 p-0 hover:bg-gray-700 ${mapClickMode ? 'bg-[#f5a623]/30' : ''}`}
                data-testid="add-waypoint-toggle"
              >
                <Crosshair className={`h-4 w-4 ${mapClickMode ? 'text-[#f5a623]' : 'text-white'}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{mapClickMode ? 'Annuler' : 'Ajouter waypoint'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT INDICATEUR MODE WAYPOINT
// ═══════════════════════════════════════════════════════════════

export const WaypointModeIndicator = ({
  isActive,
  onCancel
}) => {
  if (!isActive) return null;
  
  return (
    <div 
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-green-500 text-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse"
      data-testid="waypoint-mode-indicator"
    >
      <Crosshair className="h-5 w-5" />
      <span className="font-medium">Cliquez sur la carte pour placer votre waypoint</span>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onCancel}
        className="ml-2 h-6 px-2 bg-black/20 hover:bg-black/40 text-black"
      >
        Annuler
      </Button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT MINI INFO POSITION
// ═══════════════════════════════════════════════════════════════

export const PositionInfo = ({
  latitude,
  longitude,
  elevation,
  zoom,
  position = 'bottomleft'
}) => {
  const positionStyles = {
    topright: 'top-4 right-4',
    topleft: 'top-4 left-4',
    bottomright: 'bottom-4 right-4',
    bottomleft: 'bottom-4 left-4'
  };
  
  return (
    <div 
      className={`absolute ${positionStyles[position]} z-[1000] bg-gray-900/90 rounded-lg px-3 py-2 border border-gray-700 text-[10px] text-gray-400`}
      data-testid="position-info"
    >
      <div className="flex gap-4">
        <span>Lat: {latitude?.toFixed(5) || '--'}</span>
        <span>Lng: {longitude?.toFixed(5) || '--'}</span>
        {elevation !== null && <span>Alt: {elevation}m</span>}
        <span className="text-[#f5a623]">z{zoom}</span>
      </div>
    </div>
  );
};

export default MapControlButtons;
