/**
 * BionicForestZonesLayer.jsx
 * 
 * Couche de zones forestières BIONIC™ v3.3 - Très colorées et distinctives
 * Affiche les peuplements forestiers avec des couleurs vives et des effets visuels
 */

import React, { useMemo, useEffect, useState } from 'react';
import { 
  Circle, 
  Polygon, 
  Popup, 
  Tooltip,
  useMap 
} from 'react-leaflet';
import { COULEURS_BIONIC_SIGNATURE } from '@/services/BionicMapGenerator';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES ZONES FORESTIÈRES
// ═══════════════════════════════════════════════════════════════

const FOREST_ZONE_CONFIG = {
  resineux_dense: {
    id: 'resineux_dense',
    nom: 'Résineux dense',
    icon: '🌲',
    color: '#00ff66',
    fillOpacity: 0.35,
    strokeWidth: 2,
    score_habitat: 95,
    description: 'Forêt de conifères à haute densité - Excellent refuge'
  },
  resineux: {
    id: 'resineux',
    nom: 'Résineux',
    icon: '🌲',
    color: '#00cc44',
    fillOpacity: 0.30,
    strokeWidth: 2,
    score_habitat: 85,
    description: 'Forêt de conifères - Très bon habitat'
  },
  mixte_resineux: {
    id: 'mixte_resineux',
    nom: 'Mixte à résineux',
    icon: '🌳',
    color: '#66ff33',
    fillOpacity: 0.30,
    strokeWidth: 2,
    score_habitat: 75,
    description: 'Forêt mixte dominée par les résineux'
  },
  mixte_feuillus: {
    id: 'mixte_feuillus',
    nom: 'Mixte à feuillus',
    icon: '🌳',
    color: '#99ff00',
    fillOpacity: 0.28,
    strokeWidth: 2,
    score_habitat: 70,
    description: 'Forêt mixte dominée par les feuillus'
  },
  feuillus: {
    id: 'feuillus',
    nom: 'Feuillus',
    icon: '🍂',
    color: '#ffdd00',
    fillOpacity: 0.28,
    strokeWidth: 2,
    score_habitat: 65,
    description: 'Forêt de feuillus - Alimentation automnale'
  },
  jeune_foret: {
    id: 'jeune_foret',
    nom: 'Jeune forêt',
    icon: '🌱',
    color: '#88ffcc',
    fillOpacity: 0.25,
    strokeWidth: 1,
    score_habitat: 60,
    description: 'Régénération forestière - Zone d\'alimentation'
  },
  foret_mature: {
    id: 'foret_mature',
    nom: 'Forêt mature',
    icon: '🌳',
    color: '#009944',
    fillOpacity: 0.32,
    strokeWidth: 2,
    score_habitat: 90,
    description: 'Vieille forêt - Habitat de qualité supérieure'
  },
  milieu_humide: {
    id: 'milieu_humide',
    nom: 'Milieu humide',
    icon: '💧',
    color: '#00ffcc',
    fillOpacity: 0.35,
    strokeWidth: 2,
    score_habitat: 80,
    description: 'Zone humide - Point d\'eau et alimentation'
  },
  perturbation: {
    id: 'perturbation',
    nom: 'Perturbation récente',
    icon: '⚠️',
    color: '#ff6699',
    fillOpacity: 0.25,
    strokeWidth: 2,
    score_habitat: 40,
    description: 'Zone perturbée - Éviter pour la chasse'
  }
};

// ═══════════════════════════════════════════════════════════════
// GÉNÉRATEUR DE ZONES SIMULÉES
// ═══════════════════════════════════════════════════════════════

const generateForestZones = (center, radius = 0.02) => {
  if (!center) return [];
  
  const [lat, lng] = center;
  const zones = [];
  
  // Générer des zones autour du centre avec des types variés
  const zoneTypes = Object.keys(FOREST_ZONE_CONFIG);
  
  // Zone centrale - Résineux dense
  zones.push({
    id: 'zone_central',
    type: 'resineux_dense',
    center: [lat, lng],
    radius: radius * 0.3,
    polygon: generatePolygon([lat, lng], radius * 0.3, 6)
  });
  
  // Zones périphériques
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI;
    const distance = radius * (0.5 + Math.random() * 0.4);
    const zoneLat = lat + Math.cos(angle) * distance;
    const zoneLng = lng + Math.sin(angle) * distance;
    const zoneType = zoneTypes[Math.floor(Math.random() * (zoneTypes.length - 1))]; // Éviter perturbation
    const zoneRadius = radius * (0.15 + Math.random() * 0.2);
    
    zones.push({
      id: `zone_${i}`,
      type: zoneType,
      center: [zoneLat, zoneLng],
      radius: zoneRadius,
      polygon: generatePolygon([zoneLat, zoneLng], zoneRadius, 5 + Math.floor(Math.random() * 3))
    });
  }
  
  // Ajouter quelques milieux humides
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * 2 * Math.PI + 0.5;
    const distance = radius * 0.7;
    const zoneLat = lat + Math.cos(angle) * distance;
    const zoneLng = lng + Math.sin(angle) * distance;
    
    zones.push({
      id: `wetland_${i}`,
      type: 'milieu_humide',
      center: [zoneLat, zoneLng],
      radius: radius * 0.1,
      polygon: generatePolygon([zoneLat, zoneLng], radius * 0.1, 8)
    });
  }
  
  return zones;
};

const generatePolygon = (center, radius, sides) => {
  const [lat, lng] = center;
  const points = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    // Ajouter une légère variation pour un aspect naturel
    const r = radius * (0.85 + Math.random() * 0.3);
    points.push([
      lat + Math.cos(angle) * r,
      lng + Math.sin(angle) * r * 1.3 // Correction ratio lat/lng
    ]);
  }
  
  // Fermer le polygone
  points.push(points[0]);
  
  return points;
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT ZONE FORESTIÈRE INDIVIDUELLE
// ═══════════════════════════════════════════════════════════════

const ForestZone = ({ zone, config, onClick }) => {
  const [hovered, setHovered] = useState(false);
  
  const style = useMemo(() => ({
    color: config.color,
    fillColor: config.color,
    fillOpacity: hovered ? config.fillOpacity + 0.15 : config.fillOpacity,
    weight: hovered ? config.strokeWidth + 1 : config.strokeWidth,
    dashArray: config.id === 'perturbation' ? '5, 5' : null
  }), [config, hovered]);
  
  return (
    <Polygon
      positions={zone.polygon}
      pathOptions={style}
      eventHandlers={{
        mouseover: () => setHovered(true),
        mouseout: () => setHovered(false),
        click: () => onClick && onClick(zone, config)
      }}
    >
      <Tooltip 
        sticky
        className="bionic-forest-tooltip"
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
          padding: '10px 14px',
          borderRadius: '8px',
          border: `2px solid ${config.color}`,
          boxShadow: `0 0 15px ${config.color}66`,
          color: 'white',
          minWidth: '180px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            paddingBottom: '6px',
            borderBottom: '1px solid #333'
          }}>
            <span style={{ fontSize: '20px' }}>{config.icon}</span>
            <div>
              <div style={{ fontWeight: 'bold', color: config.color }}>
                {config.nom}
              </div>
              <div style={{ fontSize: '10px', color: '#888' }}>
                Zone BIONIC™
              </div>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <span style={{ fontSize: '11px', color: '#aaa' }}>Score Habitat</span>
            <span style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: config.score_habitat >= 80 ? '#00ff88' : 
                     config.score_habitat >= 60 ? '#ffdd00' : '#ff6666'
            }}>
              {config.score_habitat}%
            </span>
          </div>
          
          <div style={{
            fontSize: '10px',
            color: '#ccc',
            padding: '6px',
            background: `${config.color}22`,
            borderRadius: '4px'
          }}>
            {config.description}
          </div>
        </div>
      </Tooltip>
      
      <Popup className="bionic-forest-popup">
        <div style={{
          minWidth: '220px',
          padding: '12px',
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderRadius: '10px',
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px',
            paddingBottom: '10px',
            borderBottom: `2px solid ${config.color}`
          }}>
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${config.color}88, ${config.color}44)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              boxShadow: `0 0 15px ${config.color}66`
            }}>
              {config.icon}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: config.color }}>
                {config.nom}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                Classification BIONIC™ v3.3
              </div>
            </div>
          </div>
          
          {/* Barre de score */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '11px', color: '#888' }}>Score Habitat</span>
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                color: config.color
              }}>
                {config.score_habitat}/100
              </span>
            </div>
            <div style={{
              height: '8px',
              background: '#333',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${config.score_habitat}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${config.color}88, ${config.color})`,
                borderRadius: '4px',
                boxShadow: `0 0 10px ${config.color}88`
              }} />
            </div>
          </div>
          
          <div style={{
            padding: '8px',
            background: '#ffffff08',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#ccc'
          }}>
            {config.description}
          </div>
          
          {config.score_habitat >= 80 && (
            <div style={{
              marginTop: '10px',
              padding: '6px 10px',
              background: 'linear-gradient(135deg, #f5a62333, #ff6b0033)',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#f5a623',
              textAlign: 'center',
              border: '1px solid #f5a62366'
            }}>
              ⭐ ZONE PRIORITAIRE BIONIC™
            </div>
          )}
        </div>
      </Popup>
    </Polygon>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const BionicForestZonesLayer = ({
  mapCenter,
  enabled = true,
  radius = 0.025,
  onZoneClick
}) => {
  const map = useMap();
  const [zones, setZones] = useState([]);
  
  // Générer les zones quand le centre change
  useEffect(() => {
    if (mapCenter && enabled) {
      const generatedZones = generateForestZones(mapCenter, radius);
      setZones(generatedZones);
    }
  }, [mapCenter, enabled, radius]);
  
  // Injecter les styles CSS
  useEffect(() => {
    const styleId = 'bionic-forest-zones-css';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .bionic-forest-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        
        .bionic-forest-tooltip::before {
          display: none !important;
        }
        
        .bionic-forest-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 10px !important;
        }
        
        .bionic-forest-popup .leaflet-popup-tip {
          background: #1a1a2e !important;
        }
        
        .bionic-forest-popup .leaflet-popup-content {
          margin: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  if (!enabled || zones.length === 0) return null;
  
  return (
    <>
      {zones.map((zone) => {
        const config = FOREST_ZONE_CONFIG[zone.type];
        if (!config) return null;
        
        return (
          <ForestZone
            key={zone.id}
            zone={zone}
            config={config}
            onClick={onZoneClick}
          />
        );
      })}
    </>
  );
};

export default BionicForestZonesLayer;
export { FOREST_ZONE_CONFIG, generateForestZones };
