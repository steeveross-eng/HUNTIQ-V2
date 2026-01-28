/**
 * ZoneControlPanel.jsx
 * Panneau de contrôle pour les paramètres d'affichage des zones BIONIC
 */

import React, { memo } from 'react';
import { Target, Eye, EyeOff, Activity } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ZoneControlPanel = memo(function ZoneControlPanel({
  zoneDisplayMode,
  setZoneDisplayMode,
  showConcentricCircles,
  setShowConcentricCircles,
  showCorridors,
  setShowCorridors,
  minPercentageFilter,
  setMinPercentageFilter,
  visibleZonesCount,
  totalZonesCount
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-[#f5a623]" />
        <span className="text-sm font-medium text-white">Zones BIONIC</span>
        <span className="text-xs px-2 py-0.5 bg-[#f5a623]/20 text-[#f5a623] rounded-full ml-auto">
          {visibleZonesCount || 0} zones
        </span>
      </div>
      
      <div className="space-y-3">
        {/* Mode d'affichage */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-400">Mode</Label>
          <Select value={zoneDisplayMode} onValueChange={setZoneDisplayMode}>
            <SelectTrigger className="w-28 h-7 text-xs bg-gray-700 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="micro">Micro-zones</SelectItem>
              <SelectItem value="classic">Classique</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Cercles concentriques */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-400 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Cercles
          </Label>
          <Switch 
            checked={showConcentricCircles} 
            onCheckedChange={setShowConcentricCircles}
            className="data-[state=checked]:bg-[#f5a623] scale-75"
          />
        </div>
        
        {/* Corridors */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-400 flex items-center gap-1">
            {showCorridors ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            Corridors
          </Label>
          <Switch 
            checked={showCorridors} 
            onCheckedChange={setShowCorridors}
            className="data-[state=checked]:bg-[#f5a623] scale-75"
          />
        </div>
        
        {/* Filtre pourcentage minimum */}
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gray-400">Seuil min</Label>
          <Select 
            value={String(minPercentageFilter)} 
            onValueChange={(v) => setMinPercentageFilter(Number(v))}
          >
            <SelectTrigger className="w-20 h-7 text-xs bg-gray-700 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Tout</SelectItem>
              <SelectItem value="30">30%+</SelectItem>
              <SelectItem value="50">50%+</SelectItem>
              <SelectItem value="70">70%+</SelectItem>
              <SelectItem value="85">85%+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
});

ZoneControlPanel.displayName = 'ZoneControlPanel';

export default ZoneControlPanel;
