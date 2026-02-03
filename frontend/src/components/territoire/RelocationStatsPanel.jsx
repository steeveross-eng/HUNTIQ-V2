/**
 * RelocationStatsPanel.jsx
 * Panneau de statistiques des relocalisations de zones BIONIC
 * Affiche les règles actives et les compteurs de relocalisation
 */

import React, { memo } from 'react';
import { 
  Waves, Building2, MapPin, RefreshCw, CheckCircle, 
  AlertTriangle, ArrowRight, Target 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RelocationStatsPanel = memo(function RelocationStatsPanel({
  stats,
  isProcessing,
  activeRules
}) {
  if (!stats) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Relocalisation BIONIC™</span>
        </div>
        <div className="text-xs text-gray-500">En attente de zones...</div>
      </div>
    );
  }

  const hasRelocations = (stats.fromWater || 0) + (stats.fromUrban || 0) > 0;

  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Relocalisation BIONIC™</span>
        </div>
        <Badge className="bg-purple-500/20 text-purple-300 text-[9px]">
          v1.0
        </Badge>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-[10px] text-purple-300">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Analyse des zones en cours...
        </div>
      )}

      {/* Stats */}
      {!isProcessing && (
        <div className="space-y-2">
          {/* Règle 1: Eau */}
          <div className="flex items-center justify-between text-[11px] p-2 bg-cyan-900/30 rounded">
            <div className="flex items-center gap-2">
              <Waves className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-cyan-300">Eau → Terre (5m)</span>
            </div>
            <div className="flex items-center gap-1">
              {stats.fromWater > 0 ? (
                <>
                  <Badge className="bg-cyan-500/30 text-cyan-300 text-[9px] px-1.5">
                    {stats.fromWater}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-cyan-500" />
                  <CheckCircle className="h-3 w-3 text-green-400" />
                </>
              ) : (
                <span className="text-gray-500">0</span>
              )}
            </div>
          </div>

          {/* Règle 2: Urbain */}
          <div className="flex items-center justify-between text-[11px] p-2 bg-orange-900/30 rounded">
            <div className="flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-orange-300">Urbain → Score max (200m)</span>
            </div>
            <div className="flex items-center gap-1">
              {stats.fromUrban > 0 ? (
                <>
                  <Badge className="bg-orange-500/30 text-orange-300 text-[9px] px-1.5">
                    {stats.fromUrban}
                  </Badge>
                  <ArrowRight className="h-3 w-3 text-orange-500" />
                  <CheckCircle className="h-3 w-3 text-green-400" />
                </>
              ) : (
                <span className="text-gray-500">0</span>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div className="pt-2 border-t border-gray-700 space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">Total zones</span>
              <span className="text-white font-medium">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">Relocalisées</span>
              <span className={hasRelocations ? "text-blue-400 font-medium" : "text-gray-500"}>
                {(stats.fromWater || 0) + (stats.fromUrban || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">Inchangées</span>
              <span className="text-green-400">{stats.unchanged || stats.kept}</span>
            </div>
            {stats.excluded > 0 && (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-400">Exclues</span>
                <span className="text-red-400">{stats.excluded}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="pt-2 flex items-center gap-2">
            {hasRelocations ? (
              <div className="flex items-center gap-1.5 text-[9px] text-green-400">
                <CheckCircle className="h-3 w-3" />
                Zones optimisées
              </div>
            ) : stats.total > 0 ? (
              <div className="flex items-center gap-1.5 text-[9px] text-green-400">
                <CheckCircle className="h-3 w-3" />
                Toutes les zones conformes
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                <MapPin className="h-3 w-3" />
                En attente de waypoints
              </div>
            )}
          </div>
        </div>
      )}

      {/* Règles actives */}
      <div className="pt-2 border-t border-gray-700">
        <div className="text-[9px] text-gray-500 mb-1">Règles actives:</div>
        <div className="flex flex-wrap gap-1">
          <Badge className="bg-cyan-900/50 text-cyan-400 text-[8px]">
            WATER_5M
          </Badge>
          <Badge className="bg-orange-900/50 text-orange-400 text-[8px]">
            URBAN_200M
          </Badge>
        </div>
      </div>
    </div>
  );
});

RelocationStatsPanel.displayName = 'RelocationStatsPanel';

export default RelocationStatsPanel;
