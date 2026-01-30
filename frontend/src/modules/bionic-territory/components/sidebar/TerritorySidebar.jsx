/**
 * TerritorySidebar.jsx
 * 
 * Panneau latéral modulaire pour Mon Territoire BIONIC™
 * Extrait de MonTerritoireBionicPage.jsx pour réduire la complexité
 * 
 * Contient:
 * - Sélecteur de fond de carte (BIONIC™, Satellite, Terrain)
 * - Pipeline BIONIC™ avec sous-couches
 * - Couches Données Québec (Écoforestière, LiDAR, Humidité)
 * - Zones Comportementales (Corridor, Alimentation, Cache)
 * - Overlay Topographique
 * - Analyse Zone par Waypoint
 * - Générateur BIONIC
 * - Mode confidentialité
 * 
 * @version 1.0.0
 */

import React, { memo, useCallback } from 'react';
import { 
  Layers, ChevronDown, Lock, Unlock, Eye, EyeOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Import des sous-composants de couches
import QuebecLayersPanel from '@/modules/bionic-territory/components/sidebar/QuebecLayersPanel';
import { TopographicControlPanel } from '@/components/territoire/TopographicOverlay';
import { ZoneAnalysisControlPanel } from '@/components/territoire/WaypointZoneAnalysis';
import BionicGeneratorPanel from '@/components/territoire/BionicGeneratorPanel';

/**
 * Composant de sélection du fond de carte
 */
const BaseMapSelector = memo(function BaseMapSelector({
  activeBaseMap,
  onBaseMapChange
}) {
  const baseMaps = [
    { id: 'bionic', label: 'BIONIC™', icon: '🎯', description: 'Terrain + Hydro + Score' },
    { id: 'satellite', label: 'Satellite', icon: '🛰️' },
    { id: 'terrain', label: 'Terrain', icon: '🏔️' }
  ];

  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <div className="text-[10px] text-[#f5a623] uppercase mb-2 flex items-center gap-1">
        🗺️ Fond de carte
      </div>
      <div className="space-y-1">
        {baseMaps.map(map => (
          <button
            key={map.id}
            onClick={() => onBaseMapChange(map.id)}
            className={`w-full flex items-center gap-2 px-2 py-${map.id === 'bionic' ? '2' : '1.5'} rounded text-[11px] transition-all ${
              activeBaseMap === map.id 
                ? 'bg-[#f5a623]/20 text-white border border-[#f5a623]/50' 
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <span>{map.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{map.label}</div>
              {map.description && (
                <div className="text-[9px] text-gray-500">{map.description}</div>
              )}
            </div>
            {activeBaseMap === map.id && (
              <Badge className="bg-[#f5a623] text-black text-[8px]">Actif</Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});

/**
 * Composant de contrôle du Pipeline BIONIC™
 */
const BionicPipelineControl = memo(function BionicPipelineControl({
  pipelineEnabled,
  pipelineCollapsed,
  onTogglePipeline,
  onToggleCollapse,
  activeEcoLayers,
  onToggleEcoLayer
}) {
  const pipelineLayers = [
    { id: 'peuplements', label: 'Peuplements', icon: '🌲', description: 'Types forestiers' },
    { id: 'essences', label: 'Essences', icon: '🍁', description: 'Espèces dominantes' },
    { id: 'perturbations', label: 'Perturbations', icon: '🔥', description: 'Coupes, feux' },
    { id: 'densite', label: 'Densité', icon: '📊', description: 'Couvert forestier' },
    { id: 'hauteur', label: 'Hauteur', icon: '📏', description: 'Hauteur canopée' },
    { id: 'lidar_chm', label: 'LiDAR CHM', icon: '📡', description: 'Modèle hauteur' },
    { id: 'lidar_volume', label: 'LiDAR Volume', icon: '📦', description: 'Volume bois' },
    { id: 'lidar_st', label: 'LiDAR ST', icon: '🎯', description: 'Surface terrière' }
  ];

  const activeLayerCount = pipelineLayers.filter(l => activeEcoLayers[l.id]).length;

  return (
    <div className={`mt-2 rounded border transition-all ${
      pipelineEnabled 
        ? 'bg-[#f5a623]/10 border-[#f5a623]/30' 
        : 'bg-gray-800/30 border-gray-700/30 opacity-60'
    }`}>
      {/* Header avec toggle ON-OFF et bouton réduire */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/5 rounded-t transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-1.5">
          <ChevronDown 
            className={`h-3 w-3 transition-transform duration-200 ${
              pipelineCollapsed ? '-rotate-90' : 'rotate-0'
            } ${pipelineEnabled ? 'text-[#f5a623]' : 'text-gray-500'}`}
          />
          <span className={pipelineEnabled ? 'text-[#f5a623]' : 'text-gray-500'}>🎯</span>
          <span className={`text-[9px] uppercase ${pipelineEnabled ? 'text-[#f5a623]' : 'text-gray-500'}`}>
            Pipeline v1.0
          </span>
          {pipelineCollapsed && pipelineEnabled && (
            <span className="text-[8px] text-gray-500 ml-1">
              ({activeLayerCount} couches)
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePipeline();
          }}
          className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${
            pipelineEnabled 
              ? 'bg-green-500 text-black hover:bg-green-400' 
              : 'bg-gray-600 text-white hover:bg-gray-500'
          }`}
        >
          {pipelineEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      {/* Liste des couches (collapsible) */}
      {!pipelineCollapsed && pipelineEnabled && (
        <div className="px-2 pb-2 space-y-0.5">
          {pipelineLayers.map(layer => (
            <button
              key={layer.id}
              onClick={() => onToggleEcoLayer(layer.id)}
              className={`w-full flex items-center gap-1.5 px-1.5 py-1 rounded text-[10px] transition-all ${
                activeEcoLayers[layer.id]
                  ? 'bg-[#f5a623]/20 text-white'
                  : 'text-gray-500 hover:bg-gray-700/30'
              }`}
            >
              <span className="text-[10px]">{layer.icon}</span>
              <div className="flex-1 text-left">
                <span>{layer.label}</span>
              </div>
              {activeEcoLayers[layer.id] ? (
                <Eye className="h-3 w-3 text-green-400" />
              ) : (
                <EyeOff className="h-3 w-3 text-gray-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * Composant de contrôle des Zones Comportementales
 */
const BehaviorZonesControl = memo(function BehaviorZonesControl({
  showBehaviorZones,
  activeBehaviors,
  onToggleBehaviorZones,
  onToggleBehavior
}) {
  const behaviors = [
    { id: 'corridor', label: 'Corridor', color: 'bg-yellow-500', icon: '→' },
    { id: 'alimentation', label: 'Alimentation', color: 'bg-green-500', icon: '●' },
    { id: 'cache', label: 'Cache/Repos', color: 'bg-blue-500', icon: '◆' }
  ];

  return (
    <div className="border-t border-gray-700 pt-2">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] text-cyan-400 uppercase flex items-center gap-1">
          🦌 Zones comportementales
        </div>
        <Switch 
          checked={showBehaviorZones} 
          onCheckedChange={onToggleBehaviorZones}
          className="scale-75 data-[state=checked]:bg-cyan-500"
        />
      </div>
      
      {showBehaviorZones && (
        <div className="space-y-1 ml-2">
          {behaviors.map(behavior => (
            <button
              key={behavior.id}
              onClick={() => onToggleBehavior(behavior.id)}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[10px] transition-all ${
                !activeBehaviors || activeBehaviors[behavior.id] !== false
                  ? 'bg-gray-800/50 text-white'
                  : 'text-gray-500'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${behavior.color}`}></span>
              <span className="flex-1 text-left">{behavior.label}</span>
              {(!activeBehaviors || activeBehaviors[behavior.id] !== false) ? (
                <Eye className="h-3 w-3 text-green-400" />
              ) : (
                <EyeOff className="h-3 w-3 text-gray-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * Composant de mode confidentialité
 */
const PrivacyModeControl = memo(function PrivacyModeControl({
  privacyMode,
  onTogglePrivacy
}) {
  return (
    <div className="border-t border-gray-700 pt-2 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {privacyMode ? (
            <Lock className="h-3 w-3 text-red-400" />
          ) : (
            <Unlock className="h-3 w-3 text-green-400" />
          )}
          <span className="text-[10px] text-gray-400">Mode privé</span>
        </div>
        <Switch 
          checked={privacyMode} 
          onCheckedChange={onTogglePrivacy}
          className="scale-75"
        />
      </div>
      <div className="text-[9px] text-gray-500 mt-1">
        {privacyMode ? 'Données personnelles masquées' : 'Waypoints et lieux visibles'}
      </div>
    </div>
  );
});

/**
 * Composant principal du Sidebar
 */
const TerritorySidebar = memo(function TerritorySidebar({
  // Visibilité
  isVisible,
  onToggleVisibility,
  
  // Fond de carte
  activeBaseMap,
  onBaseMapChange,
  
  // Pipeline BIONIC™
  pipelineEnabled,
  pipelineCollapsed,
  onTogglePipeline,
  onTogglePipelineCollapse,
  activeEcoLayers,
  onToggleEcoLayer,
  
  // Couches Québec
  quebecLayers,
  onUpdateQuebecLayers,
  
  // Zones comportementales
  showBehaviorZones,
  activeBehaviors,
  onToggleBehaviorZones,
  onToggleBehavior,
  
  // Topographie
  topoEnabled,
  topoHillshade,
  topoHillshadeOpacity,
  topoContours,
  topoContourStyle,
  topoCollapsed,
  onToggleTopo,
  onToggleTopoHillshade,
  onSetTopoHillshadeOpacity,
  onToggleTopoContours,
  onSetTopoContourStyle,
  onToggleTopoCollapsed,
  
  // Analyse Zone
  zoneAnalysisEnabled,
  zoneAnalysisWaypoint,
  zoneAnalysisArea,
  zoneAnalysisCollapsed,
  zoneAnalysisAutoMode,
  waypoints,
  onToggleZoneAnalysis,
  onSetZoneAnalysisWaypoint,
  onSetZoneAnalysisArea,
  onToggleZoneAnalysisCollapsed,
  onToggleZoneAnalysisAutoMode,
  onAnalyzeZone,
  
  // Générateur BIONIC
  selectedEspece,
  selectedWaypointForZones,
  onGenerateBionic,
  
  // Confidentialité
  privacyMode,
  onTogglePrivacy
}) {
  return (
    <div className={`${isVisible ? 'w-64' : 'w-10'} bg-gray-900/95 border-r border-gray-800 transition-all duration-300 flex flex-col`}>
      {/* Header du sidebar avec toggle */}
      <button 
        onClick={onToggleVisibility} 
        className="p-2 border-b border-gray-800 flex items-center justify-between hover:bg-gray-800/50"
        data-testid="sidebar-toggle"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#f5a623]" />
          {isVisible && <span className="text-white text-sm">Couches</span>}
        </div>
      </button>
      
      {/* Contenu du sidebar */}
      {isVisible && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          
          {/* ═══════════════════════════════════════════════════════════
              SECTION FOND DE CARTE BIONIC™
          ═══════════════════════════════════════════════════════════ */}
          <BaseMapSelector 
            activeBaseMap={activeBaseMap}
            onBaseMapChange={onBaseMapChange}
          />
          
          {/* Sous-couches BIONIC™ */}
          {activeBaseMap === 'bionic' && (
            <BionicPipelineControl
              pipelineEnabled={pipelineEnabled}
              pipelineCollapsed={pipelineCollapsed}
              onTogglePipeline={onTogglePipeline}
              onToggleCollapse={onTogglePipelineCollapse}
              activeEcoLayers={activeEcoLayers}
              onToggleEcoLayer={onToggleEcoLayer}
            />
          )}
          
          {/* ═══════════════════════════════════════════════════════════
              COUCHES DONNÉES QUÉBEC
          ═══════════════════════════════════════════════════════════ */}
          <QuebecLayersPanel
            layers={quebecLayers}
            onUpdate={onUpdateQuebecLayers}
          />
          
          {/* ═══════════════════════════════════════════════════════════
              ZONES COMPORTEMENTALES
          ═══════════════════════════════════════════════════════════ */}
          <BehaviorZonesControl
            showBehaviorZones={showBehaviorZones}
            activeBehaviors={activeBehaviors}
            onToggleBehaviorZones={onToggleBehaviorZones}
            onToggleBehavior={onToggleBehavior}
          />
          
          {/* ═══════════════════════════════════════════════════════════
              OVERLAY TOPOGRAPHIQUE
          ═══════════════════════════════════════════════════════════ */}
          <TopographicControlPanel
            enabled={topoEnabled}
            onToggle={onToggleTopo}
            showHillshade={topoHillshade}
            onToggleHillshade={onToggleTopoHillshade}
            hillshadeOpacity={topoHillshadeOpacity}
            onHillshadeOpacityChange={onSetTopoHillshadeOpacity}
            showContours={topoContours}
            onToggleContours={onToggleTopoContours}
            contourStyle={topoContourStyle}
            onContourStyleChange={onSetTopoContourStyle}
            collapsed={topoCollapsed}
            onToggleCollapsed={onToggleTopoCollapsed}
          />
          
          {/* ═══════════════════════════════════════════════════════════
              ANALYSE ZONE PAR WAYPOINT
          ═══════════════════════════════════════════════════════════ */}
          <ZoneAnalysisControlPanel
            enabled={zoneAnalysisEnabled}
            onToggle={onToggleZoneAnalysis}
            waypoints={waypoints}
            selectedWaypoint={zoneAnalysisWaypoint}
            onWaypointSelect={onSetZoneAnalysisWaypoint}
            selectedArea={zoneAnalysisArea}
            onAreaSelect={onSetZoneAnalysisArea}
            onAnalyze={onAnalyzeZone}
            collapsed={zoneAnalysisCollapsed}
            onToggleCollapsed={onToggleZoneAnalysisCollapsed}
            autoMode={zoneAnalysisAutoMode}
            onToggleAutoMode={onToggleZoneAnalysisAutoMode}
          />
          
          {/* ═══════════════════════════════════════════════════════════
              GÉNÉRATEUR BIONIC
          ═══════════════════════════════════════════════════════════ */}
          <div className="border-t border-gray-700 pt-2 mt-2">
            <BionicGeneratorPanel 
              selectedEspece={selectedEspece}
              selectedWaypoint={selectedWaypointForZones}
              waypoints={waypoints}
              onGenerate={onGenerateBionic}
            />
          </div>
          
          {/* ═══════════════════════════════════════════════════════════
              MODE CONFIDENTIALITÉ
          ═══════════════════════════════════════════════════════════ */}
          <PrivacyModeControl
            privacyMode={privacyMode}
            onTogglePrivacy={onTogglePrivacy}
          />
        </div>
      )}
    </div>
  );
});

TerritorySidebar.displayName = 'TerritorySidebar';

export default TerritorySidebar;

// Export des sous-composants pour utilisation individuelle
export { 
  BaseMapSelector, 
  BionicPipelineControl, 
  BehaviorZonesControl, 
  PrivacyModeControl 
};
