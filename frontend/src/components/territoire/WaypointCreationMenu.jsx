/**
 * WaypointCreationMenu.jsx
 * Menu déroulant pour la création de waypoints
 * Extrait de MonTerritoireBionicPage.jsx pour le refactoring
 */

import React, { memo } from 'react';
import { 
  Plus, ChevronDown, Navigation, Crosshair, MapPin, 
  Keyboard, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

/**
 * Menu de création de waypoints avec plusieurs options
 */
const WaypointCreationMenu = memo(function WaypointCreationMenu({
  mapClickMode,
  quickWaypointMode,
  onQuickWaypointFromGPS,
  onEnableMapClickMode,
  onManualCoordinates,
  waypointLimit,
  currentWaypointCount,
  disabled = false
}) {
  const isLimitReached = currentWaypointCount >= waypointLimit;
  const isActive = mapClickMode || quickWaypointMode;
  
  // Handler pour activer le mode clic carte
  const handleEnableMapClick = () => {
    if (isLimitReached) {
      toast.error(`Limite de ${waypointLimit} waypoints actifs atteinte`, {
        description: 'Désactivez un waypoint existant pour en créer un nouveau'
      });
      return;
    }
    onEnableMapClickMode?.();
    toast.info('Mode création activé', {
      description: 'Cliquez sur la carte pour placer votre waypoint'
    });
  };
  
  // Handler pour GPS rapide
  const handleGPSWaypoint = () => {
    if (isLimitReached) {
      toast.error(`Limite de ${waypointLimit} waypoints actifs atteinte`, {
        description: 'Désactivez un waypoint existant pour en créer un nouveau'
      });
      return;
    }
    onQuickWaypointFromGPS?.();
  };
  
  // Handler pour coordonnées manuelles
  const handleManualCoords = () => {
    if (isLimitReached) {
      toast.error(`Limite de ${waypointLimit} waypoints actifs atteinte`, {
        description: 'Désactivez un waypoint existant pour en créer un nouveau'
      });
      return;
    }
    onManualCoordinates?.();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`${
            isActive 
              ? 'bg-green-500 hover:bg-green-600 animate-pulse' 
              : 'bg-[#f5a623] hover:bg-[#f5a623]/80'
          } text-black font-medium px-4`}
          data-testid="add-waypoint-quick-btn"
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isActive ? 'Cliquez sur la carte...' : 'Enregistrer un Waypoint'}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="bg-gray-900 border-gray-700 w-64 z-[9999]">
        {/* Alerte limite atteinte */}
        {isLimitReached && (
          <>
            <div className="p-3 bg-orange-900/30 border-b border-orange-500/30">
              <div className="flex items-center gap-2 text-orange-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Limite de {waypointLimit} waypoints actifs</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Désactivez un waypoint pour en créer un nouveau
              </p>
            </div>
            <DropdownMenuSeparator className="bg-gray-700" />
          </>
        )}
        
        {/* Enregistrement GPS instantané */}
        <DropdownMenuItem 
          onClick={handleGPSWaypoint}
          className={`text-white hover:bg-gray-800 cursor-pointer py-3 ${isLimitReached ? 'opacity-50' : ''}`}
          disabled={isLimitReached}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Navigation className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <div className="font-medium">Ma position GPS</div>
              <div className="text-xs text-gray-400">Enregistrement instantané</div>
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {/* Mode clic sur la carte */}
        <DropdownMenuItem 
          onClick={handleEnableMapClick}
          className={`text-white hover:bg-gray-800 cursor-pointer py-3 ${isLimitReached ? 'opacity-50' : ''}`}
          disabled={isLimitReached}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Crosshair className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <div className="font-medium">Cliquer sur la carte</div>
              <div className="text-xs text-gray-400">Pointez la position exacte</div>
            </div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-700" />
        
        {/* Coordonnées manuelles */}
        <DropdownMenuItem 
          onClick={handleManualCoords}
          className={`text-white hover:bg-gray-800 cursor-pointer py-3 ${isLimitReached ? 'opacity-50' : ''}`}
          disabled={isLimitReached}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Keyboard className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <div className="font-medium">Coordonnées manuelles</div>
              <div className="text-xs text-gray-400">Entrez lat/lng précises</div>
            </div>
          </div>
        </DropdownMenuItem>
        
        {/* Info limite */}
        <DropdownMenuSeparator className="bg-gray-700" />
        <div className="p-2 text-center">
          <span className={`text-xs ${isLimitReached ? 'text-orange-400' : 'text-gray-500'}`}>
            {currentWaypointCount}/{waypointLimit} waypoints actifs
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

WaypointCreationMenu.displayName = 'WaypointCreationMenu';

export default WaypointCreationMenu;
