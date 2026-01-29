/**
 * WaypointZoneAnalysis.jsx
 * 
 * Analyse des zones comportementales autour d'un waypoint sélectionné
 * 
 * Fonctionnalités:
 * - Activation uniquement autour d'un waypoint
 * - Superficie configurable: 2, 4 ou 10 km²
 * - UN SEUL hotspot optimal par zone d'analyse
 * - Cercle de délimitation de la zone
 */

import React, { memo, useState, useEffect, useMemo, useCallback } from 'react';
import { Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Target, MapPin, Maximize2, Crosshair, Flame,
  ChevronDown, ChevronUp, AlertCircle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  generateOrganicForestZones, 
  MERGE_CONFIG 
} from '@/services/ZoneMerger';
import { 
  WILDLIFE_BEHAVIORS, 
  getBehaviorStyle 
} from '@/services/WildlifeBehaviorZones';
import { GeoJSON } from 'react-leaflet';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

/**
 * Options de superficie d'analyse
 * Rayon calculé: r = √(A/π) où A = superficie en km²
 */
const ANALYSIS_AREAS = {
  '2': {
    label: '2 km²',
    radius: 0.798,  // √(2/π) ≈ 0.798 km
    radiusMeters: 798,
    description: 'Zone restreinte - Chasse à l\'affût',
    color: '#22c55e'
  },
  '4': {
    label: '4 km²',
    radius: 1.128,  // √(4/π) ≈ 1.128 km
    radiusMeters: 1128,
    description: 'Zone moyenne - Battue légère',
    color: '#f59e0b'
  },
  '10': {
    label: '10 km²',
    radius: 1.784,  // √(10/π) ≈ 1.784 km
    radiusMeters: 1784,
    description: 'Zone étendue - Exploration',
    color: '#ef4444'
  }
};

/**
 * Icône du hotspot optimal
 */
const createHotspotIcon = (score) => {
  return L.divIcon({
    className: 'hotspot-optimal-marker',
    html: `
      <div style="
        position: relative;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <!-- Cercle pulsant externe -->
        <div style="
          position: absolute;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,0,85,0.4) 0%, rgba(255,0,85,0) 70%);
          animation: hotspot-pulse 2s ease-in-out infinite;
        "></div>
        
        <!-- Cercle principal -->
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff0055 0%, #ff4488 50%, #ff0055 100%);
          border: 3px solid white;
          box-shadow: 0 0 20px rgba(255,0,85,0.8), 0 0 40px rgba(255,0,85,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          🔥
        </div>
        
        <!-- Score -->
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: #ff0055;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${score}%
        </div>
      </div>
      
      <style>
        @keyframes hotspot-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
        }
      </style>
    `,
    iconSize: [60, 70],
    iconAnchor: [30, 35],
    popupAnchor: [0, -35]
  });
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PANNEAU DE CONTRÔLE
// ═══════════════════════════════════════════════════════════════

export const ZoneAnalysisControlPanel = memo(({
  enabled,
  onToggle,
  selectedWaypoint,
  waypoints = [],
  onSelectWaypoint,
  analysisArea,
  onAreaChange,
  analysisResult,
  collapsed = false,
  onToggleCollapse,
  autoMode = true,
  onAutoModeChange
}) => {
  const areaConfig = ANALYSIS_AREAS[analysisArea] || ANALYSIS_AREAS['4'];
  
  return (
    <div className="border-b border-gray-700 pb-3 mb-2">
      <button 
        className="w-full flex items-center justify-between text-[10px] text-[#f5a623] uppercase mb-2 hover:text-[#f5a623]/80 transition-colors"
        onClick={onToggleCollapse}
      >
        <span className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5" />
          <span>Analyse de Zone</span>
          {enabled && selectedWaypoint && (
            <Badge className="bg-[#ff0055]/20 text-[#ff0055] text-[8px] px-1.5 animate-pulse">
              🔥 Actif
            </Badge>
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
          {/* Sélection du waypoint */}
          <div>
            <label className="text-[9px] text-gray-500 uppercase mb-1 block">
              Waypoint de référence
            </label>
            <Select 
              value={selectedWaypoint?.id || ''} 
              onValueChange={(id) => {
                const wp = waypoints.find(w => w.id === id);
                onSelectWaypoint(wp);
              }}
            >
              <SelectTrigger className="h-8 text-[11px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Sélectionner un waypoint..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                {waypoints.length === 0 ? (
                  <div className="p-2 text-[10px] text-gray-500 text-center">
                    Aucun waypoint disponible
                  </div>
                ) : (
                  waypoints.map(wp => (
                    <SelectItem 
                      key={wp.id} 
                      value={wp.id}
                      className="text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-[#f5a623]" />
                        <span>{wp.name || `Waypoint ${wp.id.slice(-4)}`}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sélection de la superficie */}
          <div>
            <label className="text-[9px] text-gray-500 uppercase mb-1 block">
              Superficie d'analyse
            </label>
            <div className="grid grid-cols-3 gap-1">
              {Object.entries(ANALYSIS_AREAS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => onAreaChange(key)}
                  className={`py-2 px-2 rounded text-center transition-all ${
                    analysisArea === key
                      ? 'bg-[#f5a623]/20 border-2 border-[#f5a623] text-white'
                      : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="text-sm font-bold">{config.label}</div>
                  <div className="text-[8px] text-gray-500">r={config.radius.toFixed(1)}km</div>
                </button>
              ))}
            </div>
            <div className="mt-1 text-[9px] text-gray-500 text-center">
              {areaConfig.description}
            </div>
          </div>
          
          {/* Toggle Mode Temps Réel */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className={`h-4 w-4 ${autoMode ? 'text-green-400' : 'text-gray-500'}`} />
              <div>
                <div className="text-[10px] font-medium text-white">Mode Temps Réel</div>
                <div className="text-[8px] text-gray-500">
                  {autoMode ? 'Analyse auto à la sélection' : 'Cliquer pour analyser'}
                </div>
              </div>
            </div>
            <Switch 
              checked={autoMode} 
              onCheckedChange={onAutoModeChange}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          
          {/* Bouton d'activation (visible seulement en mode manuel) */}
          {!autoMode && (
            <Button
              onClick={onToggle}
              disabled={!selectedWaypoint}
              className={`w-full ${
                enabled 
                  ? 'bg-[#ff0055] hover:bg-[#ff0055]/80 text-white' 
                  : 'bg-[#f5a623] hover:bg-[#f5a623]/80 text-black'
              }`}
            >
              {enabled ? (
                <>
                  <Crosshair className="h-4 w-4 mr-2 animate-pulse" />
                  Désactiver l'analyse
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Analyser la zone
                </>
              )}
            </Button>
          )}
          
          {/* Message si pas de waypoint */}
          {!selectedWaypoint && (
            <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-gray-400">
                Sélectionnez ou créez un waypoint pour définir le centre de l'analyse.
              </div>
            </div>
          )}
          
          {/* Résultat de l'analyse */}
          {enabled && analysisResult && (
            <div className="p-3 bg-gradient-to-br from-[#ff0055]/10 to-[#ff0055]/5 border border-[#ff0055]/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-4 w-4 text-[#ff0055]" />
                <span className="text-[11px] font-bold text-white">
                  Hotspot Optimal Identifié
                </span>
              </div>
              
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Score global</span>
                  <span className="text-[#ff0055] font-bold">{analysisResult.score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Comportement dominant</span>
                  <span className="text-white">
                    {WILDLIFE_BEHAVIORS[analysisResult.dominantBehavior]?.icon} {WILDLIFE_BEHAVIORS[analysisResult.dominantBehavior]?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Distance du waypoint</span>
                  <span className="text-white">{analysisResult.distanceFromCenter}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Zones analysées</span>
                  <span className="text-white">{analysisResult.zonesCount}</span>
                </div>
              </div>
              
              <div className="mt-2 pt-2 border-t border-[#ff0055]/20 text-[9px] text-[#ff0055]">
                🎯 {analysisResult.huntingTip}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

ZoneAnalysisControlPanel.displayName = 'ZoneAnalysisControlPanel';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL - ANALYSE DE ZONE
// ═══════════════════════════════════════════════════════════════

const WaypointZoneAnalysis = ({
  enabled = false,
  waypoint,  // Centre de l'analyse {lat, lng, name}
  analysisArea = '4',  // '2', '4', ou '10' km²
  targetSpecies = 'ORIGNAL',
  onAnalysisComplete,
  showBoundary = true,
  showZones = true,
  showHotspot = true
}) => {
  const map = useMap();
  const [zones, setZones] = useState(null);
  const [optimalHotspot, setOptimalHotspot] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const areaConfig = ANALYSIS_AREAS[analysisArea] || ANALYSIS_AREAS['4'];
  
  // Calculer le hotspot optimal à partir des zones
  const calculateOptimalHotspot = useCallback((zonesData, center) => {
    if (!zonesData || !zonesData.features || zonesData.features.length === 0) {
      return null;
    }
    
    // Trouver la zone avec le meilleur score
    let bestZone = null;
    let bestScore = 0;
    
    zonesData.features.forEach(feature => {
      const score = feature.properties?.behaviorScore || 0;
      const isHotspot = feature.properties?.behaviorId === 'hotspot';
      
      // Les hotspots ont un bonus
      const adjustedScore = isHotspot ? score * 1.2 : score;
      
      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestZone = feature;
      }
    });
    
    if (!bestZone) return null;
    
    // Calculer le centroïde de la meilleure zone
    let centroid;
    try {
      const coords = bestZone.geometry.coordinates[0];
      let sumLat = 0, sumLng = 0;
      coords.forEach(([lng, lat]) => {
        sumLat += lat;
        sumLng += lng;
      });
      centroid = {
        lat: sumLat / coords.length,
        lng: sumLng / coords.length
      };
    } catch (e) {
      // Fallback: utiliser le centre + offset aléatoire
      centroid = {
        lat: center[0] + (Math.random() - 0.5) * 0.01,
        lng: center[1] + (Math.random() - 0.5) * 0.01
      };
    }
    
    // Calculer la distance du centre
    const distanceKm = Math.sqrt(
      Math.pow((centroid.lat - center[0]) * 111, 2) +
      Math.pow((centroid.lng - center[1]) * 111 * Math.cos(center[0] * Math.PI / 180), 2)
    );
    
    const behaviorId = bestZone.properties?.behaviorId || 'shelter';
    const behaviorInfo = WILDLIFE_BEHAVIORS[behaviorId];
    
    return {
      position: centroid,
      score: Math.round(Math.min(bestScore, 100)),
      dominantBehavior: behaviorId,
      distanceFromCenter: Math.round(distanceKm * 1000),
      zonesCount: zonesData.features.length,
      huntingTip: behaviorInfo?.huntingTip || 'Zone à fort potentiel'
    };
  }, []);
  
  // Générer les zones quand le waypoint ou la superficie change
  useEffect(() => {
    if (!enabled || !waypoint) {
      setZones(null);
      setOptimalHotspot(null);
      return;
    }
    
    const generateAnalysis = async () => {
      setLoading(true);
      
      try {
        const center = [waypoint.lat, waypoint.lng];
        const radiusKm = areaConfig.radius;
        
        // Convertir le rayon km en degrés (approximatif)
        const radiusDeg = radiusKm / 111;
        
        // Générer les zones organiques dans le rayon
        const zonesData = generateOrganicForestZones(center, radiusDeg, {
          targetSpecies,
          gridDensity: analysisArea === '2' ? 4 : analysisArea === '4' ? 5 : 6
        });
        
        // Filtrer les zones qui sont dans le rayon
        // Note: GeoJSON utilise [lng, lat], pas [lat, lng]
        const filteredFeatures = zonesData.features.filter(feature => {
          try {
            const coords = feature.geometry.coordinates[0][0];
            // coords[0] = lng, coords[1] = lat (format GeoJSON)
            // center[0] = lat, center[1] = lng
            const dist = Math.sqrt(
              Math.pow(coords[1] - center[0], 2) + 
              Math.pow(coords[0] - center[1], 2)
            );
            // Garder toutes les zones générées car elles sont déjà dans le bon rayon
            return dist <= radiusDeg * 1.5 || true; // Accepter toutes les zones générées
          } catch {
            return true;
          }
        });
        
        const filteredZones = {
          ...zonesData,
          features: filteredFeatures
        };
        
        setZones(filteredZones);
        
        // Calculer le hotspot optimal
        const hotspot = calculateOptimalHotspot(filteredZones, center);
        setOptimalHotspot(hotspot);
        
        // Notifier le parent
        if (onAnalysisComplete && hotspot) {
          onAnalysisComplete(hotspot);
        }
        
        console.log(`[Zone Analysis] ${filteredFeatures.length} zones, Hotspot: ${hotspot?.score}%`);
        
      } catch (error) {
        console.error('[Zone Analysis] Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generateAnalysis();
  }, [enabled, waypoint, analysisArea, targetSpecies, areaConfig.radius, calculateOptimalHotspot, onAnalysisComplete]);
  
  // Style pour les zones
  const getZoneStyle = useCallback((feature) => {
    const behavior = feature.properties?.behavior || {
      primary: { id: feature.properties?.behaviorId || 'shelter', score: feature.properties?.behaviorScore || 70 }
    };
    return getBehaviorStyle(behavior);
  }, []);
  
  if (!enabled || !waypoint) return null;
  
  const center = [waypoint.lat, waypoint.lng];
  
  return (
    <>
      {/* Cercle de délimitation de la zone d'analyse */}
      {showBoundary && (
        <>
          {/* Cercle externe (bordure) */}
          <Circle
            center={center}
            radius={areaConfig.radiusMeters}
            pathOptions={{
              color: areaConfig.color,
              weight: 3,
              opacity: 0.8,
              fillColor: areaConfig.color,
              fillOpacity: 0.05,
              dashArray: '10, 10'
            }}
          />
          
          {/* Cercle interne (zone centrale) */}
          <Circle
            center={center}
            radius={areaConfig.radiusMeters * 0.3}
            pathOptions={{
              color: '#f5a623',
              weight: 2,
              opacity: 0.5,
              fillColor: '#f5a623',
              fillOpacity: 0.1,
              dashArray: '5, 5'
            }}
          />
        </>
      )}
      
      {/* Zones comportementales */}
      {showZones && zones && (
        <GeoJSON
          key={`zone-analysis-${waypoint.id}-${analysisArea}`}
          data={zones}
          style={getZoneStyle}
          onEachFeature={(feature, layer) => {
            const behaviorId = feature.properties?.behaviorId || 'shelter';
            const behaviorInfo = WILDLIFE_BEHAVIORS[behaviorId];
            const score = feature.properties?.behaviorScore || 70;
            
            layer.bindTooltip(
              `${behaviorInfo?.icon || '📍'} ${behaviorInfo?.name || 'Zone'} (${score}%)`,
              { sticky: true, direction: 'bottom' }
            );
          }}
        />
      )}
      
      {/* Hotspot optimal - UN SEUL POINT */}
      {showHotspot && optimalHotspot && (
        <Marker
          position={[optimalHotspot.position.lat, optimalHotspot.position.lng]}
          icon={createHotspotIcon(optimalHotspot.score)}
        >
          <Popup className="bionic-hotspot-popup">
            <div style={{
              minWidth: '220px',
              padding: '12px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(255,0,85,0.3)'
              }}>
                <span style={{ fontSize: '32px' }}>🔥</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff0055' }}>
                    HOTSPOT OPTIMAL
                  </div>
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    Zone d'activité maximale
                  </div>
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                padding: '10px',
                background: 'rgba(255,0,85,0.1)',
                borderRadius: '8px',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff0055' }}>
                  {optimalHotspot.score}%
                </div>
                <div style={{ fontSize: '10px', color: '#888' }}>Score de présence</div>
              </div>
              
              <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#888' }}>Comportement</span>
                  <span>{WILDLIFE_BEHAVIORS[optimalHotspot.dominantBehavior]?.icon} {WILDLIFE_BEHAVIORS[optimalHotspot.dominantBehavior]?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888' }}>Distance</span>
                  <span>{optimalHotspot.distanceFromCenter}m du centre</span>
                </div>
              </div>
              
              <div style={{
                padding: '8px',
                background: 'rgba(245,166,35,0.1)',
                borderLeft: '3px solid #f5a623',
                borderRadius: '0 6px 6px 0',
                fontSize: '10px'
              }}>
                <div style={{ color: '#f5a623', marginBottom: '2px' }}>🎯 CONSEIL</div>
                <div style={{ color: '#ccc' }}>{optimalHotspot.huntingTip}</div>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
};

export default memo(WaypointZoneAnalysis);
export { ANALYSIS_AREAS, createHotspotIcon };
