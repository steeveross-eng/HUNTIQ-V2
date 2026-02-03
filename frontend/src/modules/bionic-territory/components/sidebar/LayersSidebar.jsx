/**
 * LayersSidebar.jsx
 * 
 * Panneau latéral gauche "Couches"
 * Contient: Fond de carte, Pipeline, Filtres, Écoforestier
 * 
 * Architecture: Micro-Frontend Ready
 * - Composant isolé avec props typées
 * - Utilise le context BIONIC Territory
 * - Sous-composants internes
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Layers, Eye, EyeOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const BASE_MAPS = [
  { 
    id: 'bionic', 
    name: 'BIONIC™', 
    icon: '🎯',
    description: 'Terrain + Hydro + Score',
    color: '#f5a623'
  },
  { 
    id: 'satellite', 
    name: 'Satellite', 
    icon: '🛰️',
    description: 'Imagery ESRI',
    color: '#3b82f6'
  },
  { 
    id: 'terrain', 
    name: 'Terrain', 
    icon: '🏔️',
    description: 'OpenTopoMap',
    color: '#22c55e'
  }
];

const PIPELINE_LAYERS = [
  { id: 'topography', name: 'Topographie', icon: '⛰️', zoomRange: '5-18' },
  { id: 'geology', name: 'Géologie', icon: '🪨', zoomRange: '5-18' },
  { id: 'hydrology', name: 'Hydrologie', icon: '💧', zoomRange: '5-18' },
  { id: 'ecoforestry', name: 'Écoforestier', icon: '🌲', zoomRange: '8-18' },
  { id: 'administrative', name: 'Administratif', icon: '📍', zoomRange: '5-18' },
  { id: 'roads', name: 'Routes', icon: '🛤️', zoomRange: '8-18' },
  { id: 'urban', name: 'Urbain', icon: '🏘️', zoomRange: '8-18' },
  { id: 'wildlife_score', name: 'Score Faunique', icon: '🦌', zoomRange: '10-18' }
];

// ═══════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════════

/**
 * Sélecteur de fond de carte
 */
const BaseMapSelector = ({ 
  activeBaseMap, 
  onBaseMapChange,
  pipelineEnabled 
}) => {
  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
        <span>🗺️ Fond de carte</span>
      </div>
      <div className="space-y-1">
        {BASE_MAPS.map((baseMap) => (
          <button
            key={baseMap.id}
            onClick={() => onBaseMapChange(baseMap.id)}
            data-testid={`basemap-${baseMap.id}`}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-all ${
              activeBaseMap === baseMap.id
                ? 'bg-[#f5a623]/20 border border-[#f5a623] text-white'
                : 'hover:bg-gray-800 text-gray-300'
            }`}
          >
            <span>{baseMap.icon}</span>
            <span className="flex-1 text-left">{baseMap.name}</span>
            {activeBaseMap === baseMap.id && pipelineEnabled && (
              <Badge className="bg-[#f5a623] text-black text-[8px]">Actif</Badge>
            )}
          </button>
        ))}
      </div>
      
      {/* Description du fond actif */}
      <div className="mt-2 text-[10px] text-gray-500 px-2">
        {BASE_MAPS.find(m => m.id === activeBaseMap)?.description}
      </div>
    </div>
  );
};

/**
 * Panneau de contrôle du Pipeline BIONIC
 */
const PipelineControlPanel = ({
  pipelineEnabled,
  pipelineCollapsed,
  onTogglePipeline,
  onToggleCollapse,
  currentZoom
}) => {
  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <Collapsible open={!pipelineCollapsed} onOpenChange={() => onToggleCollapse(!pipelineCollapsed)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:bg-transparent"
              >
                {pipelineCollapsed ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            <span className="text-xs font-semibold text-[#f5a623]">
              🎯 PIPELINE v1.0
            </span>
          </div>
          
          {/* Toggle ON/OFF */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">
              {pipelineEnabled ? 'ON' : 'OFF'}
            </span>
            <Switch
              checked={pipelineEnabled}
              onCheckedChange={onTogglePipeline}
              className="data-[state=checked]:bg-[#f5a623]"
              data-testid="pipeline-toggle"
            />
          </div>
        </div>
        
        <CollapsibleContent>
          {pipelineEnabled && (
            <div className="space-y-1 pl-4">
              {PIPELINE_LAYERS.map((layer) => (
                <div
                  key={layer.id}
                  className="flex items-center justify-between text-[11px] text-gray-400 py-0.5"
                >
                  <span className="flex items-center gap-1">
                    <span>{layer.icon}</span>
                    <span>{layer.name}</span>
                  </span>
                  <span className="text-[9px] text-gray-600">
                    z{layer.zoomRange}
                  </span>
                </div>
              ))}
              
              {/* Indicateur de zoom actuel */}
              <div className="mt-2 pt-2 border-t border-gray-700/50">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500">Zoom actuel:</span>
                  <Badge variant="outline" className="text-[9px] border-[#f5a623]/50 text-[#f5a623]">
                    z{currentZoom}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

/**
 * Filtre de pourcentage minimum
 */
const PercentageFilter = ({
  minPercentage,
  onMinPercentageChange
}) => {
  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <div className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-2">
        <Settings className="h-3 w-3" />
        <span>Filtres</span>
      </div>
      
      <div className="px-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-gray-400">Score minimum</span>
          <Badge variant="outline" className="text-[10px]">
            {minPercentage}%
          </Badge>
        </div>
        <Slider
          value={[minPercentage]}
          onValueChange={([value]) => onMinPercentageChange(value)}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
      </div>
    </div>
  );
};

/**
 * Section Écoforestière (collapsible)
 */
const EcoforestrySection = ({
  showEcoforestryPanel,
  onToggleEcoforestryPanel,
  activeEcoLayers,
  onEcoLayerToggle,
  ecoLayerOpacities,
  onEcoOpacityChange
}) => {
  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <Collapsible open={showEcoforestryPanel} onOpenChange={onToggleEcoforestryPanel}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 mb-2 hover:text-gray-300 transition-colors">
            <span className="flex items-center gap-2">
              <span>🌲</span>
              <span>Cartes Écoforestières</span>
            </span>
            {showEcoforestryPanel ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="space-y-2 pl-4 text-[11px] text-gray-500">
            <p>Couches WMS du Québec disponibles.</p>
            <p className="text-[10px] text-gray-600">
              Cliquez sur le bouton Écoforestier dans la carte pour accéder aux couches.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

/**
 * Section Confidentialité
 */
const PrivacySection = ({
  privacyMode,
  onPrivacyModeChange
}) => {
  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {privacyMode ? (
            <EyeOff className="h-3 w-3 text-red-400" />
          ) : (
            <Eye className="h-3 w-3 text-green-400" />
          )}
          <span className="text-xs text-gray-400">Mode Confidentialité</span>
        </div>
        <Switch
          checked={privacyMode}
          onCheckedChange={onPrivacyModeChange}
          className="data-[state=checked]:bg-red-500"
          data-testid="privacy-toggle"
        />
      </div>
      {privacyMode && (
        <p className="mt-1 text-[10px] text-red-400/80 pl-5">
          Waypoints et zones masqués
        </p>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const LayersSidebar = ({
  // Map State
  activeBaseMap,
  onBaseMapChange,
  currentZoom,
  
  // Pipeline State
  pipelineEnabled,
  pipelineCollapsed,
  onTogglePipeline,
  onToggleCollapse,
  
  // Filters
  minPercentage,
  onMinPercentageChange,
  
  // Ecoforestry
  showEcoforestryPanel,
  onToggleEcoforestryPanel,
  activeEcoLayers,
  onEcoLayerToggle,
  ecoLayerOpacities,
  onEcoOpacityChange,
  
  // Privacy
  privacyMode,
  onPrivacyModeChange,
  
  // Visibility
  isVisible = true,
  onToggleVisibility
}) => {
  if (!isVisible) {
    return (
      <div className="w-8 bg-gray-900/95 border-r border-gray-800 flex flex-col items-center pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="p-1"
          data-testid="expand-sidebar"
        >
          <Layers className="h-4 w-4 text-gray-400" />
        </Button>
      </div>
    );
  }
  
  return (
    <div 
      className="w-64 bg-gray-900/95 border-r border-gray-800 transition-all duration-300 flex flex-col"
      data-testid="layers-sidebar"
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#f5a623]" />
          <span className="text-sm font-semibold text-white">Couches</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="p-1 h-6 w-6"
          data-testid="collapse-sidebar"
        >
          <ChevronDown className="h-3 w-3 text-gray-400 rotate-90" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Fond de carte */}
        <BaseMapSelector
          activeBaseMap={activeBaseMap}
          onBaseMapChange={onBaseMapChange}
          pipelineEnabled={pipelineEnabled}
        />
        
        {/* Pipeline BIONIC */}
        <PipelineControlPanel
          pipelineEnabled={pipelineEnabled}
          pipelineCollapsed={pipelineCollapsed}
          onTogglePipeline={onTogglePipeline}
          onToggleCollapse={onToggleCollapse}
          currentZoom={currentZoom}
        />
        
        {/* Filtres */}
        <PercentageFilter
          minPercentage={minPercentage}
          onMinPercentageChange={onMinPercentageChange}
        />
        
        {/* Écoforestier */}
        <EcoforestrySection
          showEcoforestryPanel={showEcoforestryPanel}
          onToggleEcoforestryPanel={onToggleEcoforestryPanel}
          activeEcoLayers={activeEcoLayers}
          onEcoLayerToggle={onEcoLayerToggle}
          ecoLayerOpacities={ecoLayerOpacities}
          onEcoOpacityChange={onEcoOpacityChange}
        />
        
        {/* Confidentialité */}
        <PrivacySection
          privacyMode={privacyMode}
          onPrivacyModeChange={onPrivacyModeChange}
        />
      </div>
    </div>
  );
};

export default LayersSidebar;
export { 
  BaseMapSelector, 
  PipelineControlPanel, 
  PercentageFilter, 
  EcoforestrySection,
  PrivacySection,
  BASE_MAPS,
  PIPELINE_LAYERS
};
