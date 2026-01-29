/**
 * QuebecLayersPanel.jsx
 * 
 * Panneau de contrôle pour les couches WMS Québec
 * - Carte Écoforestière (peuplements)
 * - LiDAR Dendrométrique (hauteur arbres)
 * - Indice Humidité Topographique (TWI)
 * 
 * Utilise le proxy backend pour contourner les restrictions CORS/IP
 * 
 * Architecture: Micro-Frontend Ready
 */

import React, { memo, useState } from 'react';
import { 
  TreePine, Mountain, Droplets, ChevronDown, ChevronUp,
  Loader2, AlertCircle, ExternalLink, Info
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES COUCHES
// ═══════════════════════════════════════════════════════════════

const QUEBEC_LAYERS_CONFIG = {
  ecoforestry: {
    id: 'ecoforestry',
    name: 'Carte Écoforestière',
    shortName: 'Écoforestière',
    icon: TreePine,
    color: '#22c55e',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    description: 'Peuplements forestiers officiels du MFFP',
    details: [
      'Types de couvert (résineux, feuillus, mixte)',
      'Densité et hauteur des peuplements',
      'Âge et stade de développement'
    ],
    huntingUse: 'Identifier les habitats préférés selon l\'espèce',
    source: 'MFFP Québec - Carte écoforestière à jour'
  },
  lidar: {
    id: 'lidar',
    name: 'LiDAR Dendrométrique',
    shortName: 'LiDAR',
    icon: Mountain,
    color: '#f59e0b',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    description: 'Hauteur et structure 3D de la canopée',
    details: [
      'Hauteur précise des arbres (0-35m)',
      'Structure verticale de la forêt',
      'Détection des corridors naturels'
    ],
    huntingUse: 'Repérer les passages et zones de couvert dense',
    source: 'MFFP Québec - Données LiDAR aéroporté'
  },
  twi: {
    id: 'twi',
    name: 'Indice Humidité (TWI)',
    shortName: 'Humidité',
    icon: Droplets,
    color: '#3b82f6',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    description: 'Zones humides basées sur la topographie',
    details: [
      'Accumulation d\'eau prédite',
      'Zones de drainage naturel',
      'Milieux humides potentiels'
    ],
    huntingUse: 'Localiser les points d\'eau et ravages',
    source: 'MFFP Québec - Modèle numérique de terrain'
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT COUCHE INDIVIDUELLE
// ═══════════════════════════════════════════════════════════════

const LayerControl = memo(({ 
  config, 
  enabled, 
  opacity, 
  loading,
  onToggle, 
  onOpacityChange 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const Icon = config.icon;
  
  return (
    <div className={`rounded-lg border transition-all ${
      enabled 
        ? `${config.bgColor} ${config.borderColor}` 
        : 'bg-gray-800/30 border-gray-700/50'
    } ${loading ? 'animate-pulse' : ''}`}>
      {/* Header avec toggle */}
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center relative ${
            enabled ? config.bgColor : 'bg-gray-700/50'
          }`}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: config.color }} />
                {/* Cercle de progression */}
                <div 
                  className="absolute inset-0 rounded-lg border-2 animate-ping opacity-50"
                  style={{ borderColor: config.color }}
                />
              </>
            ) : (
              <Icon className="h-4 w-4" style={{ color: enabled ? config.color : '#6b7280' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-medium truncate ${enabled ? 'text-white' : 'text-gray-400'}`}>
                {config.shortName}
              </span>
              {/* Badge de chargement */}
              {loading && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 animate-pulse">
                  Chargement...
                </span>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetails(!showDetails);
                      }}
                      className="text-gray-500 hover:text-gray-300"
                    >
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs bg-gray-900 border-gray-700">
                    <p className="text-xs">{config.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {enabled && (
              <div className="text-[9px] text-gray-500">{opacity}% opacité</div>
            )}
          </div>
        </div>
        
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          className={`data-[state=checked]:bg-[${config.color}]`}
          data-testid={`quebec-layer-${config.id}-toggle`}
        />
      </div>
      
      {/* Slider d'opacité (visible seulement si activé) */}
      {enabled && (
        <div className="px-3 pb-2">
          <Slider
            value={[opacity]}
            onValueChange={([value]) => onOpacityChange(value)}
            min={10}
            max={100}
            step={10}
            className="w-full"
            data-testid={`quebec-layer-${config.id}-opacity`}
          />
        </div>
      )}
      
      {/* Détails expandables */}
      {showDetails && (
        <div className="px-3 pb-2 border-t border-gray-700/50 mt-1 pt-2">
          <div className="space-y-1.5">
            <div className="text-[9px] text-gray-500 uppercase">Données incluses:</div>
            <ul className="space-y-0.5">
              {config.details.map((detail, i) => (
                <li key={i} className="text-[10px] text-gray-400 flex items-start gap-1">
                  <span className="text-gray-600 mt-0.5">•</span>
                  {detail}
                </li>
              ))}
            </ul>
            <div className="mt-2 pt-1.5 border-t border-gray-700/30">
              <div className="text-[9px] text-[#f5a623]">🎯 {config.huntingUse}</div>
            </div>
            <div className="text-[8px] text-gray-600 italic">{config.source}</div>
          </div>
        </div>
      )}
    </div>
  );
});

LayerControl.displayName = 'LayerControl';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const QuebecLayersPanel = ({
  layers,
  onToggleLayer,
  onSetOpacity,
  collapsed = false,
  onToggleCollapse
}) => {
  const activeCount = Object.values(layers).filter(l => l.enabled).length;
  const anyLoading = Object.values(layers).some(l => l.loading);
  
  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <Collapsible open={!collapsed} onOpenChange={() => onToggleCollapse?.()}>
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between text-[10px] text-[#f5a623] uppercase mb-2 hover:text-[#f5a623]/80 transition-colors">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🗺️</span>
              <span>Couches Données Québec</span>
              {activeCount > 0 && (
                <Badge className="bg-[#f5a623] text-black text-[8px] px-1.5 py-0">
                  {activeCount}/3
                </Badge>
              )}
              {anyLoading && (
                <Loader2 className="h-3 w-3 animate-spin text-[#f5a623]" />
              )}
            </span>
            {collapsed ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronUp className="h-3 w-3" />
            )}
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="space-y-2">
            {/* Info banner */}
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/50">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-[9px] text-gray-400">
                  <span className="text-blue-400 font-medium">Données officielles</span> du Ministère 
                  des Forêts, de la Faune et des Parcs du Québec via proxy sécurisé.
                </div>
              </div>
            </div>
            
            {/* Contrôles des couches */}
            {Object.entries(QUEBEC_LAYERS_CONFIG).map(([key, config]) => (
              <LayerControl
                key={key}
                config={config}
                enabled={layers[key]?.enabled || false}
                opacity={layers[key]?.opacity || 50}
                loading={layers[key]?.loading || false}
                onToggle={() => onToggleLayer(key)}
                onOpacityChange={(value) => onSetOpacity(key, value)}
              />
            ))}
            
            {/* Lien vers source */}
            <a 
              href="https://www.donneesquebec.ca/recherche/dataset/carte-ecoforestiere-a-jour"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-[9px] text-gray-500 hover:text-[#f5a623] transition-colors py-1"
            >
              <ExternalLink className="h-3 w-3" />
              Voir sur Données Québec
            </a>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default memo(QuebecLayersPanel);
export { QUEBEC_LAYERS_CONFIG, LayerControl };
