/**
 * WaterMaskStats.jsx
 * Composant pour afficher les statistiques du masque hydrique
 */

import React, { memo } from 'react';
import { Waves, RefreshCw, CheckCircle } from 'lucide-react';

/**
 * Panneau de statistiques du masque hydrique BIONIC
 */
const WaterMaskStats = memo(function WaterMaskStats({
  activeWaypoints,
  isFilteringWater,
  waterExclusionStats,
  visibleZonesCount,
  zoneDisplayMode
}) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Waves className="h-4 w-4 text-cyan-400" />
        <span className="text-sm font-medium text-white">Masque Hydrique</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">v5 ACTIF</span>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Buffer sécurité</span>
          <span className="text-cyan-300">5m</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Seuil chevauchement</span>
          <span className="text-cyan-300">&gt;1%</span>
        </div>
        
        {activeWaypoints?.length > 0 && isFilteringWater ? (
          <div className="flex items-center gap-2 text-[10px] text-cyan-300">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Analyse multi-sources...
          </div>
        ) : activeWaypoints?.length > 0 && waterExclusionStats ? (
          <>
            {waterExclusionStats.relocated > 0 && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Relocalisées</span>
                <span className="text-blue-400">
                  {waterExclusionStats.relocated}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">Exclues</span>
              <span className={waterExclusionStats.excluded > 0 ? "text-orange-400" : "text-green-400"}>
                {waterExclusionStats.excluded} / {waterExclusionStats.total}
              </span>
            </div>
            <div className="text-[9px] text-gray-500 mt-1">
              {waterExclusionStats.ruleset || 'BIONIC_water_mask_v5'}
            </div>
          </>
        ) : (
          <div className="text-[10px] text-green-400 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Protection active
          </div>
        )}
      </div>
    </div>
  );
});

WaterMaskStats.displayName = 'WaterMaskStats';

export default WaterMaskStats;
