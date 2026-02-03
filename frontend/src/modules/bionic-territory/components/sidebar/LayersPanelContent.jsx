/**
 * LayersPanelContent.jsx
 * 
 * Contenu du panneau des couches BIONIC
 * Version allégée pour intégration dans MonTerritoireBionicPage
 * 
 * Architecture: Micro-Frontend Ready
 */

import React, { memo } from 'react';
import { 
  ChevronDown, ChevronUp, Layers, Settings, Eye, EyeOff,
  TreePine, Lock, Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const BASE_MAP_OPTIONS = [
  { id: 'bionic', name: 'BIONIC™', icon: '🎯', description: 'Terrain + Hydro + Score' },
  { id: 'satellite', name: 'Satellite', icon: '🛰️', description: 'Imagery ESRI' },
  { id: 'terrain', name: 'Terrain', icon: '🏔️', description: 'OpenTopoMap' }
];

const PIPELINE_LAYERS_CONFIG = [
  { id: 'topography', name: 'Topographie', icon: '⛰️', opacity: '50%', color: 'text-amber-400' },
  { id: 'geology', name: 'Géologie', icon: '🪨', opacity: 'OFF', color: 'text-gray-400' },
  { id: 'hydrology', name: 'Hydrologie', icon: '💧', opacity: '70%', color: 'text-blue-400' },
  { id: 'ecoforestry', name: 'Écoforestier', icon: '🌲', opacity: '60%', color: 'text-green-400' },
  { id: 'administrative', name: 'Administratif', icon: '🏛️', opacity: '80%', color: 'text-purple-400' },
  { id: 'roads', name: 'Routes', icon: '🛣️', opacity: '90%', color: 'text-gray-300' },
  { id: 'urban', name: 'Urbain', icon: '🏙️', opacity: '40%', color: 'text-red-400' },
  { id: 'wildlife', name: 'Score Faunique', icon: '🎯', opacity: '80%', color: 'text-[#f5a623]' }
];

const ZOOM_LEVELS = [
  { range: '0-4', label: 'Global' },
  { range: '5-7', label: 'Région' },
  { range: '8-10', label: 'Local' },
  { range: '11-14', label: 'Détail', highlight: true },
  { range: '15-18', label: 'Précis', highlight: true, color: 'green' }
];

// ═══════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS MÉMORISÉS
// ═══════════════════════════════════════════════════════════════

/**
 * Sélecteur de fond de carte
 */
const BaseMapSection = memo(({ activeBaseMap, onBaseMapChange }) => (
  <div className="border-b border-gray-700 pb-3 mb-2">
    <div className="text-[10px] text-[#f5a623] uppercase mb-2 flex items-center gap-1">
      🗺️ Fond de carte
    </div>
    <div className="space-y-1">
      {BASE_MAP_OPTIONS.map(option => (
        <button
          key={option.id}
          onClick={() => onBaseMapChange(option.id)}
          data-testid={`basemap-${option.id}`}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded text-[11px] transition-all ${
            activeBaseMap === option.id 
              ? 'bg-[#f5a623]/20 text-white border border-[#f5a623]/50' 
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          <span>{option.icon}</span>
          <div className="flex-1 text-left">
            <div className="font-medium">{option.name}</div>
            {activeBaseMap === option.id && (
              <div className="text-[9px] text-gray-500">{option.description}</div>
            )}
          </div>
          {activeBaseMap === option.id && (
            <Badge className="bg-[#f5a623] text-black text-[8px]">Actif</Badge>
          )}
        </button>
      ))}
    </div>
  </div>
));

BaseMapSection.displayName = 'BaseMapSection';

/**
 * Pipeline BIONIC avec toggle et détails
 */
const PipelineSection = memo(({ 
  activeBaseMap,
  pipelineEnabled, 
  pipelineCollapsed, 
  onTogglePipeline, 
  onToggleCollapse 
}) => {
  if (activeBaseMap !== 'bionic') return null;
  
  return (
    <div className={`mt-2 rounded border transition-all ${
      pipelineEnabled 
        ? 'bg-[#f5a623]/10 border-[#f5a623]/30' 
        : 'bg-gray-800/30 border-gray-700/30 opacity-60'
    }`}>
      {/* Header avec toggle */}
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
            <span className="text-[8px] text-gray-500 ml-1">(8 couches)</span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePipeline();
          }}
          className={`px-2 py-0.5 rounded text-[8px] font-bold transition-all ${
            pipelineEnabled 
              ? 'bg-[#f5a623] text-black shadow-lg shadow-[#f5a623]/30' 
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          {pipelineEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      {/* Contenu détaillé */}
      {!pipelineCollapsed && pipelineEnabled && (
        <div className="px-2 pb-2">
          <div className="space-y-1 text-[9px]">
            {PIPELINE_LAYERS_CONFIG.map(layer => (
              <div key={layer.id} className="flex items-center justify-between">
                <span className={layer.color}>{layer.icon} {layer.name}</span>
                <span className={layer.opacity === 'OFF' ? 'text-gray-500' : layer.color}>
                  {layer.opacity}
                </span>
              </div>
            ))}
          </div>
          
          {/* Niveaux de zoom */}
          <div className="mt-2 pt-2 border-t border-[#f5a623]/30">
            <div className="text-[8px] text-gray-500 mb-1">Niveaux de zoom adaptatifs</div>
            <div className="grid grid-cols-5 gap-0.5 text-[7px]">
              {ZOOM_LEVELS.map(level => (
                <div 
                  key={level.range}
                  className={`text-center p-0.5 rounded ${
                    level.highlight 
                      ? level.color === 'green' 
                        ? 'bg-green-700/50 text-green-300' 
                        : 'bg-blue-700/50 text-blue-300'
                      : 'bg-gray-700/50 text-gray-400'
                  }`}
                >
                  {level.range}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Message si désactivé */}
      {!pipelineCollapsed && !pipelineEnabled && (
        <div className="px-2 pb-2">
          <div className="text-[9px] text-gray-500 text-center py-2">
            Pipeline désactivé - Hotspots et simulation masqués
          </div>
        </div>
      )}
    </div>
  );
});

PipelineSection.displayName = 'PipelineSection';

/**
 * Couches BIONIC avec toggle individuel
 */
const BionicLayersSection = memo(({ 
  layersVisible, 
  allLayers,
  activeCount,
  onToggleLayer, 
  onShowAll, 
  onHideAll 
}) => (
  <div className="border-b border-gray-700 pb-3 mb-2">
    <div className="flex gap-1 mb-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onShowAll} 
        className="flex-1 text-[10px] h-7 border-gray-700"
      >
        Tout
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onHideAll} 
        className="flex-1 text-[10px] h-7 border-gray-700"
      >
        Aucun
      </Button>
    </div>
    <div className="text-[10px] text-gray-500 mb-2">
      {activeCount}/{allLayers.length} actives
    </div>
    <div className="space-y-1">
      {allLayers.slice(0, 10).map(layer => (
        <button
          key={layer.id}
          onClick={() => onToggleLayer(layer.id)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] transition-all ${
            layersVisible[layer.id] 
              ? 'bg-[#f5a623]/10 text-white border border-[#f5a623]/30' 
              : 'bg-gray-800/50 text-gray-400'
          }`}
        >
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: layersVisible[layer.id] ? layer.color : '#4b5563' }} 
          />
          <span className="flex-1 text-left truncate">{layer.name}</span>
        </button>
      ))}
    </div>
  </div>
));

BionicLayersSection.displayName = 'BionicLayersSection';

/**
 * Section cartes écoforestières
 */
const EcoforestrySection = memo(({ 
  showEcoforestryPanel, 
  onToggleEcoforestryPanel 
}) => (
  <div className="border-b border-gray-700 pb-3 mb-2">
    <Collapsible open={showEcoforestryPanel} onOpenChange={onToggleEcoforestryPanel}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between text-[10px] text-[#f5a623] uppercase mb-2 hover:text-[#f5a623]/80">
          <span className="flex items-center gap-1">
            <TreePine className="h-3 w-3" />
            Cartes Écoforestières
          </span>
          {showEcoforestryPanel ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 text-[10px] text-gray-400">
          <p>Couches WMS du Québec disponibles.</p>
          <p className="text-[9px] text-gray-500">
            Cliquez sur le bouton Écoforestier dans la carte pour accéder aux couches.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>
));

EcoforestrySection.displayName = 'EcoforestrySection';

/**
 * Section mode confidentialité
 */
const PrivacySection = memo(({ privacyMode, onPrivacyModeChange }) => (
  <div className="border-b border-gray-700 pb-3 mb-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[10px]">
        {privacyMode ? (
          <>
            <Lock className="h-3 w-3 text-red-400" />
            <span className="text-red-400">Mode Confidentialité</span>
          </>
        ) : (
          <>
            <Unlock className="h-3 w-3 text-green-400" />
            <span className="text-gray-400">Mode Confidentialité</span>
          </>
        )}
      </div>
      <Switch
        checked={privacyMode}
        onCheckedChange={onPrivacyModeChange}
        className="data-[state=checked]:bg-red-500"
        data-testid="privacy-toggle"
      />
    </div>
    {privacyMode && (
      <p className="mt-1 text-[9px] text-red-400/80 pl-5">
        Waypoints et zones masqués
      </p>
    )}
  </div>
));

PrivacySection.displayName = 'PrivacySection';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const LayersPanelContent = ({
  // Base Map
  activeBaseMap,
  onBaseMapChange,
  
  // Pipeline
  pipelineEnabled,
  pipelineCollapsed,
  onTogglePipeline,
  onToggleCollapse,
  
  // Layers
  layersVisible,
  allLayers,
  activeCount,
  onToggleLayer,
  onShowAll,
  onHideAll,
  
  // Ecoforestry
  showEcoforestryPanel,
  onToggleEcoforestryPanel,
  
  // Privacy
  privacyMode,
  onPrivacyModeChange
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {/* Section Fond de carte */}
      <BaseMapSection
        activeBaseMap={activeBaseMap}
        onBaseMapChange={onBaseMapChange}
      />
      
      {/* Pipeline BIONIC (visible seulement si BIONIC sélectionné) */}
      <PipelineSection
        activeBaseMap={activeBaseMap}
        pipelineEnabled={pipelineEnabled}
        pipelineCollapsed={pipelineCollapsed}
        onTogglePipeline={onTogglePipeline}
        onToggleCollapse={onToggleCollapse}
      />
      
      {/* Couches BIONIC */}
      <BionicLayersSection
        layersVisible={layersVisible}
        allLayers={allLayers}
        activeCount={activeCount}
        onToggleLayer={onToggleLayer}
        onShowAll={onShowAll}
        onHideAll={onHideAll}
      />
      
      {/* Cartes Écoforestières */}
      <EcoforestrySection
        showEcoforestryPanel={showEcoforestryPanel}
        onToggleEcoforestryPanel={onToggleEcoforestryPanel}
      />
      
      {/* Mode Confidentialité */}
      <PrivacySection
        privacyMode={privacyMode}
        onPrivacyModeChange={onPrivacyModeChange}
      />
    </div>
  );
};

export default memo(LayersPanelContent);
export { 
  BaseMapSection, 
  PipelineSection, 
  BionicLayersSection, 
  EcoforestrySection, 
  PrivacySection,
  BASE_MAP_OPTIONS,
  PIPELINE_LAYERS_CONFIG
};
