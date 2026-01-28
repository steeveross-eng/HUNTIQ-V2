/**
 * WaterMaskStats.jsx
 * Composant pour afficher les statistiques de relocalisation BIONIC™ v7
 * Module complet: Masque hydrique (5m) + Zones urbaines (2000m) + QA
 */

import React, { memo } from 'react';
import { 
  Waves, RefreshCw, CheckCircle, Building2, MapPin, 
  Shield, AlertTriangle, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Panneau de statistiques de relocalisation BIONIC v7
 * Affiche les stats pour EAU, URBAIN et QA
 */
const WaterMaskStats = memo(function WaterMaskStats({
  activeWaypoints,
  isFilteringWater,
  waterExclusionStats,
  visibleZonesCount,
  zoneDisplayMode
}) {
  const [expanded, setExpanded] = React.useState(true);
  const stats = waterExclusionStats || {};
  
  const hasWaterRelocation = (stats.fromWater || stats.relocated || 0) > 0;
  const hasUrbanRelocation = (stats.fromUrban || 0) > 0;
  const totalRelocated = (stats.fromWater || stats.relocated || 0) + (stats.fromUrban || 0);
  const isV7 = stats.ruleset === 'BIONIC_FULL_MODULE_v7';
  const hasQA = stats.qaStatus && stats.qaStatus !== 'DISABLED';
  
  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header cliquable */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#f5a623]" />
          <span className="text-sm font-medium text-white">Module BIONIC™</span>
          <Badge className="bg-[#f5a623]/20 text-[#f5a623] text-[9px]">
            {isV7 ? 'v7' : 'v6'}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {hasQA && stats.qaStatus === 'PASSED' && (
            <CheckCircle className="h-3.5 w-3.5 text-green-400" />
          )}
          {hasQA && stats.qaStatus === 'FAILED' && (
            <AlertTriangle className="h-3.5 w-3.5 text-orange-400" />
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>
      
      {/* Contenu expandable */}
      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-700/50">
          {/* Section EAU */}
          <div className="bg-cyan-500/10 rounded p-2 border border-cyan-500/20 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Waves className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-medium text-[11px]">Masque Hydrique</span>
              </div>
              <span className="text-cyan-300 text-[10px]">Buffer 5m</span>
            </div>
            {hasWaterRelocation && (
              <div className="flex items-center justify-between text-[10px] mt-1">
                <span className="text-gray-400">Relocalisées</span>
                <span className="text-cyan-400 font-medium">{stats.fromWater || stats.relocated}</span>
              </div>
            )}
            {stats.excludedWater > 0 && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Exclues</span>
                <span className="text-red-400">{stats.excludedWater}</span>
              </div>
            )}
          </div>
          
          {/* Section URBAIN - Buffer 2000m */}
          <div className="bg-purple-500/10 rounded p-2 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-purple-400" />
                <span className="text-purple-300 font-medium text-[11px]">Zones Urbaines</span>
              </div>
              <span className="text-purple-300 text-[10px]">Buffer {stats.bufferUrban || 2000}m</span>
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1">
              <span className="text-gray-400">Stratégie</span>
              <span className="text-purple-300">highest_score (5km)</span>
            </div>
            {hasUrbanRelocation && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Relocalisées</span>
                <span className="text-purple-400 font-medium">{stats.fromUrban}</span>
              </div>
            )}
            {stats.excludedUrban > 0 && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Exclues</span>
                <span className="text-red-400">{stats.excludedUrban}</span>
              </div>
            )}
          </div>
          
          {/* Section QA */}
          {hasQA && (
            <div className={`rounded p-2 border ${
              stats.qaStatus === 'PASSED' 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-orange-500/10 border-orange-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-gray-400" />
                  <span className={`font-medium text-[11px] ${
                    stats.qaStatus === 'PASSED' ? 'text-green-300' : 'text-orange-300'
                  }`}>
                    Contrôle Qualité
                  </span>
                </div>
                <Badge className={`text-[9px] ${
                  stats.qaStatus === 'PASSED' 
                    ? 'bg-green-500/30 text-green-300' 
                    : 'bg-orange-500/30 text-orange-300'
                }`}>
                  {stats.qaStatus}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-[10px] mt-1">
                <span className="text-gray-400">Zones validées</span>
                <span className={stats.qaStatus === 'PASSED' ? 'text-green-400' : 'text-orange-400'}>
                  {stats.qaPassedCount || 0}/{(stats.qaPassedCount || 0) + (stats.qaFailedCount || 0)}
                </span>
              </div>
            </div>
          )}
          
          {/* État du filtrage */}
          {activeWaypoints?.length > 0 && isFilteringWater ? (
            <div className="flex items-center gap-2 text-[10px] text-[#f5a623] pt-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Analyse BIONIC™ en cours...
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
                  <span className="text-gray-400">Zones conformes</span>
                  <span className="text-green-400">{stats.unchanged || stats.kept || 0}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Total exclues</span>
                  <span className={stats.excluded > 0 ? "text-red-400" : "text-gray-500"}>
                    {stats.excluded || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">Analysées</span>
                  <span className="text-gray-300">{stats.total}</span>
                </div>
              </div>
              
              {/* Règles actives */}
              <div className="pt-2 border-t border-gray-700">
                <div className="text-[9px] text-gray-500 mb-1">Règles actives:</div>
                <div className="flex flex-wrap gap-1">
                  <Badge className="bg-cyan-900/50 text-cyan-400 text-[8px]">
                    WATER_5M
                  </Badge>
                  <Badge className="bg-purple-900/50 text-purple-400 text-[8px]">
                    URBAN_2000M
                  </Badge>
                  {hasQA && (
                    <Badge className="bg-green-900/50 text-green-400 text-[8px]">
                      QA_CHECK
                    </Badge>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-[10px] text-green-400 flex items-center gap-1 pt-1">
              <CheckCircle className="h-3 w-3" />
              Protection active (3 règles)
            </div>
          )}
        </div>
      )}
    </div>
  );
});

WaterMaskStats.displayName = 'WaterMaskStats';

export default WaterMaskStats;
