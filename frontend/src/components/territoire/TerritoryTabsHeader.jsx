/**
 * TerritoryTabsHeader.jsx
 * En-tête avec tabs pour la page Mon Territoire BIONIC
 * Extrait de MonTerritoireBionicPage.jsx pour le refactoring
 */

import React, { memo } from 'react';
import { Map, MapPin, BookMarked } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WaypointCreationMenu from './WaypointCreationMenu';

/**
 * Header avec tabs et menu de création de waypoints
 */
const TerritoryTabsHeader = memo(function TerritoryTabsHeader({
  activeTab,
  onTabChange,
  activeWaypointsCount = 0,
  savedPlacesCount = 0,
  // Props pour le menu de création
  mapClickMode,
  quickWaypointMode,
  onQuickWaypointFromGPS,
  onEnableMapClickMode,
  onManualCoordinates,
  waypointLimit = 2
}) {
  return (
    <div className="flex items-center gap-3">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="bg-gray-900/50 border border-gray-800">
          {/* Tab Carte BIONIC */}
          <TabsTrigger 
            value="carte" 
            className="data-[state=active]:bg-[#f5a623]/20 data-[state=active]:text-[#f5a623]"
          >
            <Map className="h-4 w-4 mr-2" />
            Carte BIONIC™
          </TabsTrigger>
          
          {/* Tab Waypoints actifs */}
          <TabsTrigger 
            value="waypoints" 
            className="data-[state=active]:bg-[#f5a623]/20 data-[state=active]:text-[#f5a623]"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Waypoints actifs
            {activeWaypointsCount > 0 && (
              <Badge className="ml-2 bg-[#f5a623] text-black text-[10px]">
                {activeWaypointsCount}
              </Badge>
            )}
          </TabsTrigger>
          
          {/* Tab Lieux enregistrés */}
          <TabsTrigger 
            value="lieux" 
            className="data-[state=active]:bg-[#f5a623]/20 data-[state=active]:text-[#f5a623]"
          >
            <BookMarked className="h-4 w-4 mr-2" />
            Lieux enregistrés
            {savedPlacesCount > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white text-[10px]">
                {savedPlacesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Menu de création de waypoint */}
      <WaypointCreationMenu
        mapClickMode={mapClickMode}
        quickWaypointMode={quickWaypointMode}
        onQuickWaypointFromGPS={onQuickWaypointFromGPS}
        onEnableMapClickMode={onEnableMapClickMode}
        onManualCoordinates={onManualCoordinates}
        waypointLimit={waypointLimit}
        currentWaypointCount={activeWaypointsCount}
      />
    </div>
  );
});

TerritoryTabsHeader.displayName = 'TerritoryTabsHeader';

export default TerritoryTabsHeader;
