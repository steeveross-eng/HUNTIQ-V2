/**
 * WildlifeBehaviorLayer.jsx
 * 
 * Couche de visualisation des zones comportementales du gibier
 * Affiche les zones de: Circulation, Cache, Alimentation, Repos, Points d'eau
 * 
 * VERSION 2.0 - Zones FUSIONNÉES et ORGANIQUES
 * - Utilise Turf.js pour fusionner les polygones adjacents
 * - Génère des formes organiques au lieu de cercles
 * - Suit la topographie naturelle
 * 
 * Visuel PUISSANT avec effets de glow, animations et légende interactive
 */

import React, { useMemo, useEffect, useState, memo } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { 
  WILDLIFE_BEHAVIORS, 
  classifyZoneBehavior, 
  getBehaviorStyle,
  generateBehaviorLegend
} from '@/services/WildlifeBehaviorZones';
import { generateDemoForestData, FOREST_CLASSIFICATION } from '@/services/QuebecEcoforestryService';
import { 
  generateOrganicForestZones, 
  mergeZonesByBehavior 
} from '@/services/ZoneMerger';

// ═══════════════════════════════════════════════════════════════
// STYLES CSS DYNAMIQUES
// ═══════════════════════════════════════════════════════════════

const injectBehaviorStyles = () => {
  const styleId = 'bionic-wildlife-behavior-styles';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    /* ═══════════════════════════════════════════════════════════
       ANIMATIONS BIONIC - ZONES COMPORTEMENTALES
       VERSION PUISSANTE - EFFETS GLOW MAXIMAUX
    ═══════════════════════════════════════════════════════════ */
    
    /* Pulsation INTENSE pour les hotspots */
    @keyframes bionic-hotspot-pulse {
      0%, 100% { 
        filter: drop-shadow(0 0 15px #ff0055) drop-shadow(0 0 30px #ff0055) brightness(1.1);
        transform: scale(1);
      }
      50% { 
        filter: drop-shadow(0 0 25px #ff4488) drop-shadow(0 0 50px #ff0055) brightness(1.4);
        transform: scale(1.03);
      }
    }
    
    /* Glow animé pour les corridors */
    @keyframes bionic-corridor-flow {
      0% { stroke-dashoffset: 0; filter: drop-shadow(0 0 8px #ff5500); }
      50% { filter: drop-shadow(0 0 15px #ff7733); }
      100% { stroke-dashoffset: 30; filter: drop-shadow(0 0 8px #ff5500); }
    }
    
    /* Respiration pour cache/abri */
    @keyframes bionic-shelter-glow {
      0%, 100% { 
        filter: drop-shadow(0 0 10px #00ff44) brightness(1); 
      }
      50% { 
        filter: drop-shadow(0 0 20px #44ff77) brightness(1.2); 
      }
    }
    
    /* Scintillement pour alimentation */
    @keyframes bionic-feeding-shimmer {
      0%, 100% { 
        opacity: 0.7; 
        filter: drop-shadow(0 0 8px #ffcc00);
      }
      50% { 
        opacity: 0.95; 
        filter: drop-shadow(0 0 18px #ffdd44);
      }
    }
    
    /* Respiration lente pour zones de repos */
    @keyframes bionic-bedding-breathe {
      0%, 100% { 
        filter: drop-shadow(0 0 8px #aa44ff) brightness(1); 
      }
      50% { 
        filter: drop-shadow(0 0 16px #cc77ff) brightness(1.15); 
      }
    }
    
    /* Ondulation pour points d'eau */
    @keyframes bionic-water-ripple {
      0% { 
        stroke-width: 2px; 
        filter: drop-shadow(0 0 8px #00ccff);
      }
      50% { 
        stroke-width: 4px; 
        filter: drop-shadow(0 0 20px #44ddff);
      }
      100% { 
        stroke-width: 2px; 
        filter: drop-shadow(0 0 8px #00ccff);
      }
    }
    
    /* ═══════════════════════════════════════════════════════════
       CLASSES DE ZONES - STYLES PUISSANTS
    ═══════════════════════════════════════════════════════════ */
    
    .bionic-hotspot-zone {
      animation: bionic-hotspot-pulse 1.5s ease-in-out infinite;
      filter: drop-shadow(0 0 20px #ff0055);
      stroke-width: 4px !important;
    }
    
    .bionic-corridor-zone {
      stroke-dasharray: 15 8;
      animation: bionic-corridor-flow 2s linear infinite;
      filter: drop-shadow(0 0 12px #ff5500);
      stroke-width: 3px !important;
    }
    
    .bionic-shelter-zone {
      animation: bionic-shelter-glow 3s ease-in-out infinite;
      filter: drop-shadow(0 0 15px #00ff44);
      stroke-width: 2px !important;
    }
    
    .bionic-feeding-zone {
      animation: bionic-feeding-shimmer 2.5s ease-in-out infinite;
      filter: drop-shadow(0 0 12px #ffcc00);
      stroke-width: 2px !important;
    }
    
    .bionic-bedding-zone {
      animation: bionic-bedding-breathe 4s ease-in-out infinite;
      filter: drop-shadow(0 0 12px #aa44ff);
      stroke-width: 2px !important;
    }
    
    .bionic-water-zone {
      animation: bionic-water-ripple 2s ease-in-out infinite;
      filter: drop-shadow(0 0 15px #00ccff);
      stroke-width: 3px !important;
    }
    
    /* Hover effects PUISSANTS */
    .bionic-behavior-zone:hover {
      filter: brightness(1.5) saturate(1.3) !important;
      cursor: pointer;
      stroke-width: 5px !important;
    }
    
    /* Légende comportementale */
    .bionic-behavior-legend {
      position: absolute;
      bottom: 20px;
      left: 20px;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(12px);
      border: 2px solid #f5a623;
      border-radius: 12px;
      padding: 12px;
      max-width: 280px;
      box-shadow: 0 4px 30px rgba(245, 166, 35, 0.4), 0 0 60px rgba(245, 166, 35, 0.2);
    }
    
    .bionic-behavior-legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      margin: 4px 0;
      border-radius: 6px;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    
    .bionic-behavior-legend-item:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateX(4px);
      box-shadow: 0 0 10px rgba(245, 166, 35, 0.3);
    }
    
    .bionic-behavior-legend-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 12px currentColor, 0 0 24px currentColor;
      border: 2px solid rgba(255,255,255,0.3);
    }
    
    .bionic-behavior-legend-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
    
    .bionic-behavior-legend-text {
      flex: 1;
      font-size: 11px;
      color: white;
    }
    
    .bionic-behavior-legend-score {
      font-size: 11px;
      color: #f5a623;
      font-weight: bold;
      text-shadow: 0 0 8px #f5a623;
    }
    
    /* Tooltip amélioré - Position en bas pour éviter le header */
    .bionic-behavior-tooltip {
      background: rgba(0,0,0,0.95) !important;
      border: 2px solid #f5a623 !important;
      color: white !important;
      font-size: 12px !important;
      font-weight: bold !important;
      box-shadow: 0 0 20px rgba(245, 166, 35, 0.6) !important;
      padding: 8px 12px !important;
      border-radius: 8px !important;
      z-index: 10000 !important;
    }
    
    /* Popup comportemental - Éviter le header */
    .bionic-behavior-popup {
      z-index: 10000 !important;
    }
    
    .bionic-behavior-popup .leaflet-popup-content-wrapper {
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
      border-radius: 12px !important;
      overflow: hidden !important;
    }
    
    .bionic-behavior-popup .leaflet-popup-content {
      margin: 0 !important;
      width: auto !important;
    }
    
    .bionic-behavior-popup .leaflet-popup-tip-container {
      display: none !important;
    }
    
    .bionic-behavior-popup .leaflet-popup-close-button {
      color: #f5a623 !important;
      font-size: 20px !important;
      font-weight: bold !important;
      top: 8px !important;
      right: 8px !important;
      z-index: 1 !important;
    }
    
    .bionic-behavior-popup .leaflet-popup-close-button:hover {
      color: #ff0055 !important;
    }
  `;
  document.head.appendChild(style);
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT LÉGENDE COMPORTEMENTALE
// ═══════════════════════════════════════════════════════════════

const BehaviorLegend = memo(({ 
  behaviors, 
  stats, 
  onBehaviorClick,
  activeBehaviors 
}) => {
  const legend = generateBehaviorLegend();
  
  return (
    <div className="bionic-behavior-legend">
      <div className="text-[10px] text-[#f5a623] uppercase font-bold mb-2 flex items-center gap-2">
        <span>🎯</span>
        <span>Comportements Gibier</span>
      </div>
      
      {legend.map(item => {
        const count = stats[item.id] || 0;
        const isActive = activeBehaviors?.includes(item.id) ?? true;
        
        return (
          <div 
            key={item.id}
            className={`bionic-behavior-legend-item ${!isActive ? 'opacity-40' : ''}`}
            onClick={() => onBehaviorClick?.(item.id)}
            title={item.huntingTip}
          >
            <div 
              className="bionic-behavior-legend-dot"
              style={{ backgroundColor: item.color, color: item.color }}
            />
            <span className="bionic-behavior-legend-icon">{item.icon}</span>
            <div className="bionic-behavior-legend-text">
              <div className="font-medium">{item.name}</div>
              <div className="text-[9px] text-gray-400">{item.description}</div>
            </div>
            {count > 0 && (
              <span className="bionic-behavior-legend-score">{count}</span>
            )}
          </div>
        );
      })}
      
      {/* Astuce chasse */}
      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="text-[9px] text-gray-500">
          💡 Cliquez sur une zone pour voir les conseils de chasse
        </div>
      </div>
    </div>
  );
});

BehaviorLegend.displayName = 'BehaviorLegend';

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════

const WildlifeBehaviorLayer = ({
  mapCenter,
  enabled = true,
  targetSpecies = 'ORIGNAL',
  showLegend = true,
  minScore = 60,
  onZoneClick,
  activeBehaviors = null // null = tous actifs
}) => {
  const map = useMap();
  const [behaviorData, setBehaviorData] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Injecter les styles CSS
  useEffect(() => {
    injectBehaviorStyles();
  }, []);
  
  // Générer les données comportementales avec zones FUSIONNÉES
  useEffect(() => {
    if (!enabled || !mapCenter) return;
    
    const generateBehaviorZones = async () => {
      setLoading(true);
      
      try {
        // NOUVELLE MÉTHODE: Générer des zones organiques fusionnées
        // au lieu de cercles individuels
        const organicData = generateOrganicForestZones(mapCenter, 0.035, {
          targetSpecies,
          gridDensity: 6  // Moins de zones, plus grandes
        });
        
        // Enrichir avec les données de comportement
        const behaviorStats = {};
        const enrichedFeatures = organicData.features.map(feature => {
          const behaviorId = feature.properties.behaviorId || 'shelter';
          const behaviorScore = feature.properties.behaviorScore || 70;
          
          // Compter les statistiques
          behaviorStats[behaviorId] = (behaviorStats[behaviorId] || 0) + 1;
          
          // Créer le résultat de comportement pour le style
          const behaviorResult = {
            primary: {
              id: behaviorId,
              score: behaviorScore,
              ...WILDLIFE_BEHAVIORS[behaviorId]
            },
            isHotspot: behaviorId === 'hotspot',
            hotspotScore: behaviorId === 'hotspot' ? behaviorScore : 0
          };
          
          return {
            ...feature,
            properties: {
              ...feature.properties,
              behavior: behaviorResult,
              behaviorId,
              behaviorScore,
              bionic_name: WILDLIFE_BEHAVIORS[behaviorId]?.name || 'Zone',
              merged: feature.properties.merged || false,
              mergedCount: feature.properties.mergedCount || 1
            }
          };
        }).filter(f => f.properties.behaviorScore >= minScore);
        
        // Fusionner les zones adjacentes du même type
        const mergedData = mergeZonesByBehavior({
          type: 'FeatureCollection',
          features: enrichedFeatures
        });
        
        // Recalculer les stats après fusion
        const finalStats = {};
        mergedData.features.forEach(f => {
          const id = f.properties.behaviorId;
          finalStats[id] = (finalStats[id] || 0) + 1;
        });
        
        setBehaviorData(mergedData);
        setStats(finalStats);
        
        console.log(`[BIONIC Behavior] ${mergedData.features.length} zones organiques générées`);
        
      } catch (error) {
        console.error('[BIONIC Behavior] Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generateBehaviorZones();
  }, [enabled, mapCenter, targetSpecies, minScore]);
  
  // Style GeoJSON dynamique
  const getFeatureStyle = useMemo(() => (feature) => {
    const { behavior, behaviorId } = feature.properties;
    
    // Filtrer si comportement non actif
    if (activeBehaviors && !activeBehaviors.includes(behaviorId)) {
      return { fillOpacity: 0, opacity: 0 };
    }
    
    return getBehaviorStyle(behavior);
  }, [activeBehaviors]);
  
  // Gestionnaire de clic sur zone
  const onEachFeature = useMemo(() => (feature, layer) => {
    const { behavior, bionic_name, behaviorScore } = feature.properties;
    const primary = behavior.primary;
    const behaviorInfo = WILDLIFE_BEHAVIORS[primary.id];
    
    // Popup riche
    const popupContent = `
      <div style="
        min-width: 250px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 12px;
        padding: 16px;
        color: white;
        font-family: system-ui;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(245, 166, 35, 0.3);
        ">
          <span style="font-size: 28px;">${behaviorInfo.icon}</span>
          <div>
            <div style="font-size: 14px; font-weight: bold; color: ${behaviorInfo.color};">
              ${behaviorInfo.name}
            </div>
            <div style="font-size: 11px; color: #888;">
              ${bionic_name}
            </div>
          </div>
          <div style="
            margin-left: auto;
            background: ${behaviorInfo.color}22;
            border: 1px solid ${behaviorInfo.color};
            border-radius: 8px;
            padding: 4px 10px;
          ">
            <span style="font-size: 18px; font-weight: bold; color: ${behaviorInfo.color};">
              ${behaviorScore}%
            </span>
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <div style="font-size: 10px; color: #f5a623; text-transform: uppercase; margin-bottom: 4px;">
            Description
          </div>
          <div style="font-size: 12px; color: #ccc;">
            ${behaviorInfo.description}
          </div>
        </div>
        
        <div style="
          background: rgba(245, 166, 35, 0.1);
          border-left: 3px solid #f5a623;
          padding: 10px;
          border-radius: 0 8px 8px 0;
        ">
          <div style="font-size: 10px; color: #f5a623; margin-bottom: 4px;">
            🎯 CONSEIL DE CHASSE
          </div>
          <div style="font-size: 11px; color: white;">
            ${behaviorInfo.huntingTip}
          </div>
        </div>
        
        ${behavior.isHotspot ? `
          <div style="
            margin-top: 12px;
            text-align: center;
            padding: 8px;
            background: linear-gradient(90deg, #ff006622, #ff006644, #ff006622);
            border-radius: 8px;
            border: 1px solid #ff0066;
          ">
            <span style="font-size: 12px; color: #ff0066; font-weight: bold;">
              🔥 HOTSPOT OPTIMAL - PRÉSENCE TRÈS PROBABLE
            </span>
          </div>
        ` : ''}
      </div>
    `;
    
    layer.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'bionic-behavior-popup',
      autoPan: true,
      autoPanPadding: [50, 180], // [horizontal, vertical] - 180px pour éviter le header
      autoPanPaddingTopLeft: [50, 180], // Padding spécifique en haut à gauche
      autoPanPaddingBottomRight: [50, 50],
      keepInView: true
    });
    
    // Tooltip rapide - direction 'bottom' pour éviter le header
    layer.bindTooltip(
      `${behaviorInfo.icon} ${behaviorInfo.name} (${behaviorScore}%)`,
      { 
        sticky: true, 
        className: 'bionic-behavior-tooltip',
        direction: 'bottom',
        offset: [0, 10]
      }
    );
    
    // Classe CSS pour animations
    layer.options.className = `bionic-behavior-zone bionic-${primary.id}-zone`;
    
    // Event handlers
    layer.on({
      click: () => onZoneClick?.(feature.properties),
      mouseover: (e) => {
        e.target.setStyle({
          fillOpacity: 0.9,
          weight: 3
        });
      },
      mouseout: (e) => {
        e.target.setStyle(getFeatureStyle(feature));
      }
    });
  }, [onZoneClick, getFeatureStyle]);
  
  if (!enabled || !behaviorData) return null;
  
  return (
    <>
      {/* Couche GeoJSON des zones comportementales */}
      <GeoJSON
        key={`behavior-${targetSpecies}-${mapCenter.join('-')}`}
        data={behaviorData}
        style={getFeatureStyle}
        onEachFeature={onEachFeature}
      />
      
      {/* Légende */}
      {showLegend && (
        <BehaviorLegend
          behaviors={WILDLIFE_BEHAVIORS}
          stats={stats}
          activeBehaviors={activeBehaviors}
        />
      )}
    </>
  );
};

export default memo(WildlifeBehaviorLayer);
export { BehaviorLegend, WILDLIFE_BEHAVIORS };
