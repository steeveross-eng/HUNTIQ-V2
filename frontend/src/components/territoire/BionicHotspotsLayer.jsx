/**
 * BionicHotspotsLayer.jsx
 * 
 * Rendu visuel des hotspots et trajets d'approche sur la carte Leaflet
 * Intégré avec le GENERATEUR_CARTE_BIONIC v3.1
 */

import React, { useMemo } from 'react';
import { 
  Circle, 
  Marker, 
  Polyline, 
  Polygon, 
  Popup, 
  Tooltip,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES STYLES
// ═══════════════════════════════════════════════════════════════

const HOTSPOT_STYLES = {
  haute: {
    color: '#f5a623',
    fillColor: '#f5a623',
    fillOpacity: 0.4,
    weight: 3,
    dashArray: null,
    pulseColor: '#f5a623'
  },
  moyenne: {
    color: '#22c55e',
    fillColor: '#22c55e',
    fillOpacity: 0.3,
    weight: 2,
    dashArray: '5, 5',
    pulseColor: '#22c55e'
  },
  basse: {
    color: '#3b82f6',
    fillColor: '#3b82f6',
    fillOpacity: 0.2,
    weight: 1,
    dashArray: '3, 3',
    pulseColor: '#3b82f6'
  }
};

const APPROACH_STYLES = {
  trajet: {
    color: '#8b5cf6',
    weight: 4,
    opacity: 0.8,
    dashArray: '10, 5',
    lineCap: 'round',
    lineJoin: 'round'
  },
  entree: {
    color: '#22c55e',
    fillColor: '#22c55e',
    fillOpacity: 0.6,
    radius: 15
  },
  affut: {
    color: '#ef4444',
    fillColor: '#ef4444',
    fillOpacity: 0.7,
    radius: 12
  },
  vent: {
    color: '#06b6d4',
    weight: 2,
    opacity: 0.6,
    dashArray: '2, 4'
  }
};

// ═══════════════════════════════════════════════════════════════
// ICÔNES PERSONNALISÉES
// ═══════════════════════════════════════════════════════════════

const createHotspotIcon = (priorite, score, icon) => {
  const style = HOTSPOT_STYLES[priorite] || HOTSPOT_STYLES.moyenne;
  
  return L.divIcon({
    className: 'bionic-hotspot-marker',
    html: `
      <div class="hotspot-container" style="
        position: relative;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div class="hotspot-pulse" style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: ${style.pulseColor};
          opacity: 0.3;
          animation: pulse 2s infinite;
        "></div>
        <div class="hotspot-inner" style="
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${style.fillColor}ee, ${style.fillColor}88);
          border: 3px solid ${style.color};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px ${style.fillColor}66;
          cursor: pointer;
        ">
          <span style="font-size: 14px; line-height: 1;">${icon}</span>
          <span style="font-size: 9px; font-weight: bold; color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${score}</span>
        </div>
      </div>
    `,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
  });
};

const createApproachIcon = (type) => {
  const icons = {
    entree: { emoji: '🚶', color: '#22c55e', label: 'Entrée' },
    affut: { emoji: '🎯', color: '#ef4444', label: 'Affût' },
    waypoint: { emoji: '📍', color: '#8b5cf6', label: 'Point' }
  };
  
  const config = icons[type] || icons.waypoint;
  
  return L.divIcon({
    className: 'bionic-approach-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${config.color};
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        <span style="font-size: 16px;">${config.emoji}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT HOTSPOT INDIVIDUEL
// ═══════════════════════════════════════════════════════════════

const HotspotMarker = ({ hotspot, position, onClick }) => {
  const icon = useMemo(() => 
    createHotspotIcon(hotspot.priorite, hotspot.score, hotspot.icon),
    [hotspot.priorite, hotspot.score, hotspot.icon]
  );
  
  const style = HOTSPOT_STYLES[hotspot.priorite] || HOTSPOT_STYLES.moyenne;
  
  return (
    <>
      {/* Cercle de zone */}
      <Circle
        center={position}
        radius={150}
        pathOptions={{
          color: style.color,
          fillColor: style.fillColor,
          fillOpacity: style.fillOpacity * 0.5,
          weight: style.weight,
          dashArray: style.dashArray
        }}
      />
      
      {/* Marqueur central */}
      <Marker 
        position={position} 
        icon={icon}
        eventHandlers={{
          click: () => onClick && onClick(hotspot)
        }}
      >
        <Popup className="bionic-hotspot-popup">
          <div style={{
            minWidth: '200px',
            padding: '8px',
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              borderBottom: '1px solid #333',
              paddingBottom: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>{hotspot.icon}</span>
              <div>
                <div style={{ fontWeight: 'bold', color: style.color }}>
                  {hotspot.recommandation || hotspot.nom}
                </div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                  {hotspot.type}
                </div>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ color: '#888', fontSize: '12px' }}>Score</span>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '18px',
                color: style.color
              }}>
                {hotspot.score}/100
              </span>
            </div>
            
            <div style={{
              padding: '6px',
              background: `${style.color}22`,
              borderRadius: '4px',
              fontSize: '11px',
              color: '#ccc'
            }}>
              {hotspot.description}
            </div>
            
            {hotspot.priorite === 'haute' && (
              <div style={{
                marginTop: '8px',
                padding: '4px 8px',
                background: '#f5a62333',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#f5a623',
                textAlign: 'center'
              }}>
                ⭐ POINT PRIORITAIRE
              </div>
            )}
          </div>
        </Popup>
        
        <Tooltip 
          direction="top" 
          offset={[0, -20]} 
          opacity={0.9}
          className="bionic-tooltip"
        >
          <div style={{
            background: '#1a1a2e',
            padding: '4px 8px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '11px'
          }}>
            {hotspot.icon} {hotspot.nom} - {hotspot.score}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT TRAJET D'APPROCHE
// ═══════════════════════════════════════════════════════════════

const ApproachPath = ({ approche, targetPosition, mapCenter }) => {
  const map = useMap();
  
  // Calculer les positions basées sur la direction d'approche
  const positions = useMemo(() => {
    if (!targetPosition || !approche) return null;
    
    const [targetLat, targetLng] = targetPosition;
    const distance = 0.005; // ~500m en degrés
    
    // Directions en degrés
    const directions = {
      'N': 0, 'NE': 45, 'E': 90, 'SE': 135,
      'S': 180, 'SO': 225, 'O': 270, 'NO': 315
    };
    
    const angle = (directions[approche.direction_approche] || 0) * (Math.PI / 180);
    
    // Point d'entrée (à 500m dans la direction d'approche)
    const entryLat = targetLat + Math.cos(angle) * distance;
    const entryLng = targetLng + Math.sin(angle) * distance;
    
    // Points intermédiaires pour un trajet naturel
    const midLat1 = targetLat + Math.cos(angle) * distance * 0.7;
    const midLng1 = targetLng + Math.sin(angle) * distance * 0.7 + 0.001;
    
    const midLat2 = targetLat + Math.cos(angle) * distance * 0.4;
    const midLng2 = targetLng + Math.sin(angle) * distance * 0.4 - 0.0005;
    
    return {
      entry: [entryLat, entryLng],
      waypoints: [
        [entryLat, entryLng],
        [midLat1, midLng1],
        [midLat2, midLng2],
        targetPosition
      ],
      target: targetPosition
    };
  }, [targetPosition, approche]);
  
  if (!positions) return null;
  
  return (
    <>
      {/* Ligne de trajet d'approche */}
      <Polyline
        positions={positions.waypoints}
        pathOptions={APPROACH_STYLES.trajet}
      >
        <Tooltip sticky>
          <div style={{
            background: '#1a1a2e',
            padding: '6px 10px',
            borderRadius: '4px',
            color: 'white',
            fontSize: '11px'
          }}>
            🧭 Trajet d&apos;approche recommandé
            <br />
            <span style={{ color: '#8b5cf6' }}>
              Direction: {approche.direction_approche}
            </span>
          </div>
        </Tooltip>
      </Polyline>
      
      {/* Marqueur point d'entrée */}
      <Marker
        position={positions.entry}
        icon={createApproachIcon('entree')}
      >
        <Popup>
          <div style={{
            minWidth: '180px',
            padding: '8px',
            background: '#1a1a2e',
            borderRadius: '8px',
            color: 'white'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: '#22c55e',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🚶 Point d&apos;entrée
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
              {approche.point_entree_recommande?.description}
            </div>
            <div style={{
              padding: '6px',
              background: '#22c55e22',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#22c55e'
            }}>
              Approcher depuis le {approche.direction_approche}
            </div>
          </div>
        </Popup>
        <Tooltip direction="right" offset={[10, 0]}>
          🚶 Entrée recommandée
        </Tooltip>
      </Marker>
      
      {/* Marqueur position d'affût */}
      <Marker
        position={positions.target}
        icon={createApproachIcon('affut')}
      >
        <Popup>
          <div style={{
            minWidth: '180px',
            padding: '8px',
            background: '#1a1a2e',
            borderRadius: '8px',
            color: 'white'
          }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: '#ef4444',
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🎯 Position d&apos;affût
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
              {approche.position_affut_optimale?.description}
            </div>
            <div style={{ 
              display: 'flex', 
              gap: '8px',
              marginBottom: '8px'
            }}>
              <div style={{
                flex: 1,
                padding: '4px',
                background: '#333',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#888' }}>Hauteur</div>
                <div style={{ fontWeight: 'bold' }}>
                  {approche.position_affut_optimale?.hauteur_m}m
                </div>
              </div>
              <div style={{
                flex: 1,
                padding: '4px',
                background: '#333',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '10px', color: '#888' }}>Score</div>
                <div style={{ fontWeight: 'bold', color: '#f5a623' }}>
                  {approche.score_approche}
                </div>
              </div>
            </div>
            <div style={{
              padding: '6px',
              background: '#ef444422',
              borderRadius: '4px',
              fontSize: '10px',
              color: '#ef4444'
            }}>
              🕐 Heure optimale: {approche.heure_optimale}
            </div>
          </div>
        </Popup>
        <Tooltip direction="left" offset={[-10, 0]}>
          🎯 Position d&apos;affût optimale
        </Tooltip>
      </Marker>
      
      {/* Indicateur de direction du vent */}
      <WindIndicator 
        position={positions.target}
        direction={approche.vent?.direction}
        force={approche.vent?.force}
      />
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// INDICATEUR DE VENT
// ═══════════════════════════════════════════════════════════════

const WindIndicator = ({ position, direction, force }) => {
  const windPath = useMemo(() => {
    if (!position || !direction) return null;
    
    const [lat, lng] = position;
    const length = 0.003; // Longueur de la flèche
    
    const directions = {
      'N': 180, 'NE': 225, 'E': 270, 'SE': 315,
      'S': 0, 'SO': 45, 'O': 90, 'NO': 135
    };
    
    const angle = (directions[direction] || 0) * (Math.PI / 180);
    
    const endLat = lat + Math.cos(angle) * length;
    const endLng = lng + Math.sin(angle) * length;
    
    return [[lat, lng], [endLat, endLng]];
  }, [position, direction]);
  
  if (!windPath) return null;
  
  return (
    <Polyline
      positions={windPath}
      pathOptions={{
        ...APPROACH_STYLES.vent,
        weight: Math.min(4, 1 + (force || 10) / 10)
      }}
    >
      <Tooltip sticky>
        <div style={{
          background: '#1a1a2e',
          padding: '4px 8px',
          borderRadius: '4px',
          color: 'white',
          fontSize: '11px'
        }}>
          💨 Vent {direction} - {force} km/h
        </div>
      </Tooltip>
    </Polyline>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT HEATMAP SIMULATION
// ═══════════════════════════════════════════════════════════════

const SimulationHeatmap = ({ simulation, center }) => {
  const zones = useMemo(() => {
    if (!simulation || !simulation.simulation_active || !center) return [];
    
    const [centerLat, centerLng] = center;
    const zonesArray = [];
    
    // Générer des zones de concentration basées sur la simulation
    simulation.zones_concentration?.forEach((zone, idx) => {
      const offset = (idx + 1) * 0.002;
      zonesArray.push({
        position: [centerLat + offset, centerLng + offset * 0.5],
        radius: 200 + zone.probabilite * 2,
        opacity: zone.probabilite / 100 * 0.4,
        type: zone.type,
        description: zone.description
      });
    });
    
    return zonesArray;
  }, [center, simulation]);
  
  if (zones.length === 0) return null;
  
  return (
    <>
      {zones.map((zone, idx) => (
        <Circle
          key={idx}
          center={zone.position}
          radius={zone.radius}
          pathOptions={{
            color: zone.type === 'alimentation' ? '#22c55e' : '#f5a623',
            fillColor: zone.type === 'alimentation' ? '#22c55e' : '#f5a623',
            fillOpacity: zone.opacity,
            weight: 1,
            dashArray: '3, 3'
          }}
        >
          <Tooltip>
            <div style={{
              background: '#1a1a2e',
              padding: '4px 8px',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px'
            }}>
              {zone.type === 'alimentation' ? '🌿' : '🛤️'} {zone.description}
              <br />
              <span style={{ color: '#f5a623' }}>
                Probabilité: {Math.round(zone.opacity * 250)}%
              </span>
            </div>
          </Tooltip>
        </Circle>
      ))}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const BionicHotspotsLayer = ({
  generatorResults,
  mapCenter,
  showHotspots = true,
  showApproach = true,
  showSimulation = true,
  onHotspotClick
}) => {
  const map = useMap();
  
  // Extraire les données du générateur
  const { hotspots, approche_optimale, simulation_ia } = generatorResults || {};
  
  // Générer des positions aléatoires pour les hotspots (basées sur le centre de la carte)
  const hotspotPositions = useMemo(() => {
    if (!hotspots?.meilleurs_points_chasse || !mapCenter) return [];
    
    const [centerLat, centerLng] = mapCenter;
    
    return hotspots.meilleurs_points_chasse.map((hotspot, idx) => {
      // Distribuer les hotspots autour du centre
      const angle = (idx / hotspots.meilleurs_points_chasse.length) * 2 * Math.PI;
      const distance = 0.01 + (hotspot.score / 100) * 0.005;
      
      return {
        ...hotspot,
        position: [
          centerLat + Math.cos(angle) * distance,
          centerLng + Math.sin(angle) * distance
        ]
      };
    });
  }, [hotspots, mapCenter]);
  
  // Position cible pour l'approche (meilleur hotspot)
  const targetPosition = useMemo(() => {
    if (hotspotPositions.length === 0) return mapCenter;
    return hotspotPositions[0]?.position || mapCenter;
  }, [hotspotPositions, mapCenter]);
  
  if (!generatorResults) return null;
  
  return (
    <>
      {/* Heatmap de simulation */}
      {showSimulation && simulation_ia && (
        <SimulationHeatmap 
          simulation={simulation_ia}
          center={mapCenter}
        />
      )}
      
      {/* Trajet d'approche */}
      {showApproach && approche_optimale && targetPosition && (
        <ApproachPath
          approche={approche_optimale}
          targetPosition={targetPosition}
          mapCenter={mapCenter}
        />
      )}
      
      {/* Hotspots */}
      {showHotspots && hotspotPositions.map((hotspot, idx) => (
        <HotspotMarker
          key={hotspot.id || idx}
          hotspot={hotspot}
          position={hotspot.position}
          onClick={onHotspotClick}
        />
      ))}
      
      {/* Style CSS injecté */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        
        .bionic-hotspot-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .bionic-hotspot-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        
        .bionic-hotspot-popup .leaflet-popup-tip {
          background: #1a1a2e !important;
        }
        
        .bionic-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        .bionic-approach-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </>
  );
};

export default BionicHotspotsLayer;
