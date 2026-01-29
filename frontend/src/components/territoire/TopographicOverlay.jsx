/**
 * TopographicOverlay.jsx
 * 
 * Overlay topographique avec courbes de niveau et ombrage du relief
 * Permet de visualiser comment les zones comportementales s'alignent
 * avec le terrain réel (vallées, crêtes, pentes)
 * 
 * Fonctionnalités:
 * - Courbes de niveau (contours)
 * - Ombrage du relief (hillshade)
 * - Points d'élévation
 * - Indicateur de pente
 */

import React, { memo, useState, useEffect } from 'react';
import { TileLayer, WMSTileLayer, useMap, useMapEvents } from 'react-leaflet';
import { 
  Mountain, Layers, Eye, EyeOff, ChevronDown, ChevronUp,
  TrendingUp, Droplets
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES SOURCES TOPOGRAPHIQUES
// ═══════════════════════════════════════════════════════════════

const TOPO_SOURCES = {
  // OpenTopoMap - Excellent pour les courbes de niveau
  openTopoMap: {
    id: 'openTopoMap',
    name: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap (CC-BY-SA)',
    type: 'tile',
    hasContours: true
  },
  
  // Hillshade ESRI - Ombrage du relief
  hillshade: {
    id: 'hillshade',
    name: 'Relief ombré',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri',
    type: 'tile',
    hasContours: false
  },
  
  // Terrain RGB pour calculs d'élévation
  terrainRGB: {
    id: 'terrainRGB',
    name: 'Terrain RGB',
    url: 'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw',
    type: 'tile',
    hasContours: false
  },
  
  // Stamen Terrain - Style artistique avec relief
  stamenTerrain: {
    id: 'stamenTerrain',
    name: 'Terrain artistique',
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    attribution: '© Stadia Maps, © Stamen Design',
    type: 'tile',
    hasContours: true
  }
};

// Styles des courbes de niveau
const CONTOUR_STYLES = {
  standard: {
    name: 'Standard',
    majorColor: '#8B4513',
    minorColor: '#D2691E',
    majorWidth: 2,
    minorWidth: 1,
    interval: 50 // mètres
  },
  highContrast: {
    name: 'Contraste élevé',
    majorColor: '#FF6600',
    minorColor: '#FFAA00',
    majorWidth: 3,
    minorWidth: 1.5,
    interval: 25
  },
  subtle: {
    name: 'Subtil',
    majorColor: '#666666',
    minorColor: '#999999',
    majorWidth: 1.5,
    minorWidth: 0.5,
    interval: 100
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT INDICATEUR D'ÉLÉVATION
// ═══════════════════════════════════════════════════════════════

const ElevationIndicator = memo(({ elevation, slope, aspect }) => {
  const getSlopeClass = (slope) => {
    if (slope < 5) return { label: 'Plat', color: '#22c55e' };
    if (slope < 15) return { label: 'Léger', color: '#84cc16' };
    if (slope < 25) return { label: 'Modéré', color: '#eab308' };
    if (slope < 35) return { label: 'Raide', color: '#f97316' };
    return { label: 'Très raide', color: '#ef4444' };
  };
  
  const getAspectDirection = (aspect) => {
    if (aspect === null) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(aspect / 45) % 8;
    return directions[index];
  };
  
  const slopeInfo = getSlopeClass(slope);
  
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-[#f5a623]/50 shadow-lg min-w-[180px]">
      <div className="text-[10px] text-[#f5a623] uppercase font-bold mb-2 flex items-center gap-1.5">
        <Mountain className="h-3.5 w-3.5" />
        Topographie
      </div>
      
      <div className="space-y-2">
        {/* Élévation */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Altitude</span>
          <span className="text-sm font-bold text-white">
            {elevation !== null ? `${Math.round(elevation)} m` : '--'}
          </span>
        </div>
        
        {/* Pente */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Pente</span>
          <div className="flex items-center gap-1.5">
            <span 
              className="text-xs font-medium"
              style={{ color: slopeInfo.color }}
            >
              {slopeInfo.label}
            </span>
            <span className="text-[10px] text-gray-500">
              ({slope !== null ? `${Math.round(slope)}°` : '--'})
            </span>
          </div>
        </div>
        
        {/* Orientation */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Orientation</span>
          <span className="text-xs text-white">
            {getAspectDirection(aspect)}
          </span>
        </div>
      </div>
      
      {/* Barre de pente visuelle */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min((slope || 0) / 45 * 100, 100)}%`,
              backgroundColor: slopeInfo.color
            }}
          />
        </div>
      </div>
    </div>
  );
});

ElevationIndicator.displayName = 'ElevationIndicator';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT LÉGENDE TOPOGRAPHIQUE
// ═══════════════════════════════════════════════════════════════

const TopographicLegend = memo(({ contourStyle, visible }) => {
  if (!visible) return null;
  
  const style = CONTOUR_STYLES[contourStyle] || CONTOUR_STYLES.standard;
  
  return (
    <div className="absolute bottom-24 right-4 z-[1000] bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
      <div className="text-[10px] text-gray-400 uppercase mb-2">Courbes de niveau</div>
      
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-0.5 rounded"
            style={{ 
              backgroundColor: style.majorColor,
              height: `${style.majorWidth}px`
            }}
          />
          <span className="text-[10px] text-white">Principales ({style.interval}m)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-0.5 rounded"
            style={{ 
              backgroundColor: style.minorColor,
              height: `${style.minorWidth}px`
            }}
          />
          <span className="text-[10px] text-gray-400">Secondaires ({style.interval / 5}m)</span>
        </div>
      </div>
      
      {/* Indicateurs de terrain */}
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="text-[9px] text-gray-500 mb-1">Éléments clés</div>
        <div className="grid grid-cols-2 gap-1 text-[9px]">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-amber-400" />
            <span className="text-gray-400">Crête</span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3 text-blue-400" />
            <span className="text-gray-400">Vallée</span>
          </div>
        </div>
      </div>
    </div>
  );
});

TopographicLegend.displayName = 'TopographicLegend';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PANNEAU DE CONTRÔLE
// ═══════════════════════════════════════════════════════════════

export const TopographicControlPanel = memo(({
  enabled,
  onToggle,
  showHillshade,
  onHillshadeToggle,
  hillshadeOpacity,
  onHillshadeOpacityChange,
  showContours,
  onContoursToggle,
  contourStyle,
  onContourStyleChange,
  collapsed = false,
  onToggleCollapse
}) => {
  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <button 
        className="w-full flex items-center justify-between text-[10px] text-[#f5a623] uppercase mb-2 hover:text-[#f5a623]/80 transition-colors"
        onClick={onToggleCollapse}
      >
        <span className="flex items-center gap-1.5">
          <Mountain className="h-3.5 w-3.5" />
          <span>Overlay Topographique</span>
          {enabled && (
            <Badge className="bg-green-500/20 text-green-400 text-[8px] px-1.5">Actif</Badge>
          )}
        </span>
        {collapsed ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronUp className="h-3 w-3" />
        )}
      </button>
      
      {!collapsed && (
        <div className="space-y-3">
          {/* Toggle principal */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">Activer l'overlay</span>
            <Switch
              checked={enabled}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-[#f5a623]"
            />
          </div>
          
          {enabled && (
            <>
              {/* Hillshade */}
              <div className="bg-gray-800/50 rounded-lg p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-300 flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    Relief ombré
                  </span>
                  <Switch
                    checked={showHillshade}
                    onCheckedChange={onHillshadeToggle}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>
                
                {showHillshade && (
                  <div className="pt-1">
                    <div className="text-[9px] text-gray-500 mb-1">Opacité: {hillshadeOpacity}%</div>
                    <Slider
                      value={[hillshadeOpacity]}
                      onValueChange={([v]) => onHillshadeOpacityChange(v)}
                      min={10}
                      max={80}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              {/* Courbes de niveau */}
              <div className="bg-gray-800/50 rounded-lg p-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-300 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Courbes de niveau
                  </span>
                  <Switch
                    checked={showContours}
                    onCheckedChange={onContoursToggle}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </div>
                
                {showContours && (
                  <div className="pt-1 space-y-1">
                    <div className="text-[9px] text-gray-500">Style</div>
                    <div className="flex gap-1">
                      {Object.entries(CONTOUR_STYLES).map(([key, style]) => (
                        <button
                          key={key}
                          onClick={() => onContourStyleChange(key)}
                          className={`flex-1 py-1 px-2 rounded text-[9px] transition-all ${
                            contourStyle === key
                              ? 'bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/50'
                              : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                          }`}
                        >
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="text-[9px] text-gray-500 text-center">
                💡 Les zones comportementales s'alignent avec les vallées et crêtes
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

TopographicControlPanel.displayName = 'TopographicControlPanel';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL - OVERLAY TOPOGRAPHIQUE
// ═══════════════════════════════════════════════════════════════

const TopographicOverlay = ({
  enabled = false,
  showHillshade = true,
  hillshadeOpacity = 40,
  showContours = true,
  contourStyle = 'standard',
  showElevationIndicator = true,
  showLegend = true
}) => {
  const map = useMap();
  const [cursorElevation, setCursorElevation] = useState(null);
  const [cursorSlope, setCursorSlope] = useState(null);
  const [cursorAspect, setCursorAspect] = useState(null);
  
  // Simuler l'élévation basée sur la position (en production, utiliser une API d'élévation)
  const simulateElevation = (lat, lng) => {
    // Simulation basée sur les coordonnées
    // En production, utiliser Open-Elevation API ou similaire
    const baseElevation = 100;
    const variation = Math.sin(lat * 100) * 50 + Math.cos(lng * 100) * 30;
    return Math.max(0, baseElevation + variation + Math.random() * 20);
  };
  
  const simulateSlope = (lat, lng) => {
    return Math.abs(Math.sin(lat * 200) * 25 + Math.cos(lng * 150) * 10);
  };
  
  const simulateAspect = (lat, lng) => {
    return (Math.atan2(Math.sin(lng * 100), Math.cos(lat * 100)) * 180 / Math.PI + 360) % 360;
  };
  
  // Écouter les mouvements de souris pour afficher l'élévation
  useMapEvents({
    mousemove: (e) => {
      if (!enabled || !showElevationIndicator) return;
      
      const { lat, lng } = e.latlng;
      setCursorElevation(simulateElevation(lat, lng));
      setCursorSlope(simulateSlope(lat, lng));
      setCursorAspect(simulateAspect(lat, lng));
    }
  });
  
  if (!enabled) return null;
  
  return (
    <>
      {/* Couche Hillshade (ombrage du relief) */}
      {showHillshade && (
        <TileLayer
          url={TOPO_SOURCES.hillshade.url}
          attribution={TOPO_SOURCES.hillshade.attribution}
          opacity={hillshadeOpacity / 100}
          zIndex={200}
        />
      )}
      
      {/* Couche OpenTopoMap avec courbes de niveau */}
      {showContours && (
        <TileLayer
          url={TOPO_SOURCES.openTopoMap.url}
          attribution={TOPO_SOURCES.openTopoMap.attribution}
          opacity={0.5}
          zIndex={210}
        />
      )}
      
      {/* Indicateur d'élévation */}
      {showElevationIndicator && (
        <ElevationIndicator
          elevation={cursorElevation}
          slope={cursorSlope}
          aspect={cursorAspect}
        />
      )}
      
      {/* Légende */}
      {showLegend && showContours && (
        <TopographicLegend
          contourStyle={contourStyle}
          visible={true}
        />
      )}
    </>
  );
};

export default memo(TopographicOverlay);
export { 
  ElevationIndicator, 
  TopographicLegend, 
  TOPO_SOURCES, 
  CONTOUR_STYLES 
};
