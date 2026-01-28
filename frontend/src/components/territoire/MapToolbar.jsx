/**
 * MapToolbar.jsx
 * Barre d'outils de la carte BIONIC (zoom, GPS Live, couches, etc.)
 */

import React, { memo } from 'react';
import { 
  Plus, Minus, Crosshair, Layers, LocateFixed, 
  Navigation, RefreshCw, Leaf 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';

const MapToolbar = memo(function MapToolbar({
  // Zoom controls
  onZoomIn,
  onZoomOut,
  currentZoom,
  // GPS Live
  gpsLiveEnabled,
  onToggleGpsLive,
  // User location
  userPosition,
  onLocateUser,
  watchingPosition,
  // Layers
  showLayersPanel,
  onToggleLayersPanel,
  // Ecoforestry
  showEcoforestryPanel,
  onToggleEcoforestryPanel,
  // Refresh
  onRefresh,
  isRefreshing,
  // Waypoint creation
  onAddWaypoint,
  quickWaypointMode,
  onToggleQuickWaypointMode
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="bg-gray-900/90 rounded-lg border border-gray-700 overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 text-white hover:bg-gray-700 rounded-none border-b border-gray-700"
          onClick={onZoomIn}
          title="Zoom avant"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="text-center text-xs text-gray-400 py-1 border-b border-gray-700">
          {currentZoom}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 text-white hover:bg-gray-700 rounded-none"
          onClick={onZoomOut}
          title="Zoom arrière"
        >
          <Minus className="h-5 w-5" />
        </Button>
      </div>

      {/* GPS Live toggle */}
      <Button
        variant="ghost"
        size="sm"
        className={`w-10 h-10 p-0 rounded-lg border ${
          gpsLiveEnabled 
            ? 'bg-[#f5a623] text-black border-[#f5a623] hover:bg-[#f5a623]/80' 
            : 'bg-gray-900/90 text-white border-gray-700 hover:bg-gray-700'
        }`}
        onClick={onToggleGpsLive}
        title={gpsLiveEnabled ? "Désactiver GPS LIVE" : "Activer GPS LIVE"}
        data-testid="gps-live-btn"
      >
        <Crosshair className="h-5 w-5" />
      </Button>

      {/* Locate user */}
      <Button
        variant="ghost"
        size="sm"
        className={`w-10 h-10 p-0 rounded-lg border ${
          userPosition 
            ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700' 
            : 'bg-gray-900/90 text-white border-gray-700 hover:bg-gray-700'
        }`}
        onClick={onLocateUser}
        title="Ma position"
      >
        {watchingPosition ? (
          <Navigation className="h-5 w-5 animate-pulse" />
        ) : (
          <LocateFixed className="h-5 w-5" />
        )}
      </Button>

      {/* Layers panel toggle */}
      <Button
        variant="ghost"
        size="sm"
        className={`w-10 h-10 p-0 rounded-lg border ${
          showLayersPanel 
            ? 'bg-purple-600 text-white border-purple-500 hover:bg-purple-700' 
            : 'bg-gray-900/90 text-white border-gray-700 hover:bg-gray-700'
        }`}
        onClick={onToggleLayersPanel}
        title="Panneau couches"
      >
        <Layers className="h-5 w-5" />
      </Button>

      {/* Ecoforestry toggle */}
      <Button
        variant="ghost"
        size="sm"
        className={`w-10 h-10 p-0 rounded-lg border ${
          showEcoforestryPanel 
            ? 'bg-green-600 text-white border-green-500 hover:bg-green-700' 
            : 'bg-gray-900/90 text-white border-gray-700 hover:bg-gray-700'
        }`}
        onClick={onToggleEcoforestryPanel}
        title="Couches écoforestières"
      >
        <Leaf className="h-5 w-5" />
      </Button>

      {/* Refresh button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-10 h-10 p-0 bg-gray-900/90 text-white rounded-lg border border-gray-700 hover:bg-gray-700"
        onClick={onRefresh}
        disabled={isRefreshing}
        title="Rafraîchir les données"
      >
        <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>

      {/* Add waypoint dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`w-10 h-10 p-0 rounded-lg border ${
              quickWaypointMode 
                ? 'bg-[#f5a623] text-black border-[#f5a623]' 
                : 'bg-gray-900/90 text-white border-gray-700 hover:bg-gray-700'
            }`}
            title="Ajouter un waypoint"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 z-[10000]">
          <DropdownMenuItem 
            onClick={onAddWaypoint}
            className="text-white hover:bg-gray-700 cursor-pointer"
          >
            Enregistrer un Waypoint
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            onClick={onToggleQuickWaypointMode}
            className="text-white hover:bg-gray-700 cursor-pointer"
          >
            {quickWaypointMode ? '✓ Mode clic rapide actif' : 'Mode clic rapide'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

MapToolbar.displayName = 'MapToolbar';

export default MapToolbar;
