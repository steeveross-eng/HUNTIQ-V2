/**
 * WaterMaskStats.jsx
 * Composant pour afficher les statistiques de relocalisation BIONIC
 * Inclut: Masque hydrique + Zones urbaines
 */

import React, { memo } from 'react';
import { Waves, RefreshCw, CheckCircle, Building2, MapPin } from 'lucide-react';

/**
 * Panneau de statistiques de relocalisation BIONIC v6
 * Affiche les stats pour EAU et URBAIN
 */
const WaterMaskStats = memo(function WaterMaskStats({
  activeWaypoints,
  isFilteringWater,
  waterExclusionStats,
  visibleZonesCount,
  zoneDisplayMode
}) {
  const stats = waterExclusionStats || {};
  const hasWaterRelocation = stats.fromWater > 0 || stats.relocated > 0;
  const hasUrbanRelocation = stats.fromUrban > 0;
  const totalRelocated = (stats.fromWater || stats.relocated || 0) + (stats.fromUrban || 0);
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-[#f5a623]" />
        <span className="text-sm font-medium text-white">Relocalisation BIONIC</span>
        <span className="text-[10px] px-1.5 py-0.5 bg-[#f5a623]/20 text-[#f5a623] rounded">v6</span>
      </div>
      
      <div className="space-y-2 text-xs">
        {/* Section EAU */}
        <div className="bg-cyan-500/10 rounded p-2 border border-cyan-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Waves className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-cyan-300 font-medium text-[11px]">Masque Hydrique</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Distance relocalisation</span>
            <span className="text-cyan-300">5m vers terre</span>
          </div>
          {hasWaterRelocation && (
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-gray-400">Zones relocalisées</span>
              <span className="text-cyan-400 font-medium">{stats.fromWater || stats.relocated}</span>
            </div>
          )}
        </div>
        
        {/* Section URBAIN */}
        <div className="bg-purple-500/10 rounded p-2 border border-purple-500/20">
          <div className="flex items-center gap-1.5 mb-1">
            <Building2 className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-purple-300 font-medium text-[11px]">Zones Urbaines</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400">Distance relocalisation</span>
            <span className="text-purple-300">200m → meilleur score</span>
          </div>
          {hasUrbanRelocation && (
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-gray-400">Zones relocalisées</span>
              <span className="text-purple-400 font-medium">{stats.fromUrban}</span>
            </div>
          )}
        </div>
        
        {/* État du filtrage */}
        {activeWaypoints?.length > 0 && isFilteringWater ? (
          <div className="flex items-center gap-2 text-[10px] text-[#f5a623]">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Analyse multi-sources...
          </div>
        ) : activeWaypoints?.length > 0 && stats.total > 0 ? (
          <>
            {/* Résumé */}
            <div className="pt-2 border-t border-gray-700 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Total relocalisées</span>
                <span className={totalRelocated > 0 ? "text-blue-400 font-medium" : "text-gray-500"}>
                  {totalRelocated}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Exclues (impossible)</span>
                <span className={stats.excluded > 0 ? "text-orange-400" : "text-green-400"}>
                  {stats.excluded || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Total analysées</span>
                <span className="text-gray-300">{stats.total}</span>
              </div>
            </div>
            <div className="text-[9px] text-gray-500 mt-1">
              {stats.ruleset || 'BIONIC_relocation_v6'}
            </div>
          </>
        ) : (
          <div className="text-[10px] text-green-400 flex items-center gap-1 pt-1">
            <CheckCircle className="h-3 w-3" />
            Protection active (2 règles)
          </div>
        )}
      </div>
    </div>
  );
});

WaterMaskStats.displayName = 'WaterMaskStats';

export default WaterMaskStats;
