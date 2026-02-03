/**
 * LayersPanel.jsx
 * Panneau de gestion des couches de la carte BIONIC
 */

import React, { memo } from 'react';
import { 
  Layers, Wind, Thermometer, Droplets, TrendingUp, 
  TreePine, Mountain, Eye, EyeOff, ChevronDown, ChevronUp 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Configuration des couches disponibles
const LAYER_GROUPS = [
  {
    id: 'weather',
    name: 'Météo',
    icon: Wind,
    layers: [
      { id: 'wind', name: 'Vent', icon: Wind, color: 'text-cyan-400' },
      { id: 'temperature', name: 'Température', icon: Thermometer, color: 'text-red-400' },
      { id: 'humidity', name: 'Humidité', icon: Droplets, color: 'text-blue-400' },
      { id: 'pressure', name: 'Pression', icon: TrendingUp, color: 'text-purple-400' }
    ]
  },
  {
    id: 'terrain',
    name: 'Terrain',
    icon: Mountain,
    layers: [
      { id: 'elevation', name: 'Altitude', icon: Mountain, color: 'text-amber-400' },
      { id: 'vegetation', name: 'Végétation', icon: TreePine, color: 'text-green-400' }
    ]
  }
];

const LayersPanel = memo(function LayersPanel({
  activeLayers = {},
  onLayerToggle,
  isCollapsed,
  onToggleCollapse,
  className = ''
}) {
  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className={`bg-gray-900/95 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Couches</span>
          {activeCount > 0 && (
            <Badge className="bg-purple-500/20 text-purple-300 text-xs">
              {activeCount} actives
            </Badge>
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-3 pt-0 space-y-4">
          {LAYER_GROUPS.map(group => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider">
                <group.icon className="h-3 w-3" />
                {group.name}
              </div>
              <div className="space-y-1.5">
                {group.layers.map(layer => (
                  <div 
                    key={layer.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-800/50 transition-colors"
                  >
                    <Label className={`text-xs flex items-center gap-2 cursor-pointer ${layer.color}`}>
                      <layer.icon className="h-3.5 w-3.5" />
                      {layer.name}
                    </Label>
                    <Switch 
                      checked={activeLayers[layer.id] || false}
                      onCheckedChange={(checked) => onLayerToggle(layer.id, checked)}
                      className="data-[state=checked]:bg-purple-500 scale-75"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

LayersPanel.displayName = 'LayersPanel';

export default LayersPanel;
