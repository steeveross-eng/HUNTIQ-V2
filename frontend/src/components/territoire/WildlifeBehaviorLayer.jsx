/**
 * WildlifeBehaviorLayer.jsx
 * 
 * Couche de visualisation des zones comportementales du gibier
 * Affiche les zones de: Circulation, Cache, Alimentation, Repos, Points d'eau
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
    ═══════════════════════════════════════════════════════════ */
    
    /* Pulsation pour les hotspots */
    @keyframes bionic-hotspot-pulse {
      0%, 100% { 
        filter: drop-shadow(0 0 8px #ff0066) brightness(1);
        transform: scale(1);
      }
      50% { 
        filter: drop-shadow(0 0 20px #ff3385) brightness(1.2);
        transform: scale(1.02);
      }
    }
    
    /* Glow animé pour les corridors */
    @keyframes bionic-corridor-flow {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: 30; }
    }
    
    /* Scintillement pour alimentation */
    @keyframes bionic-feeding-shimmer {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 0.85; }
    }
    
    /* Respiration pour zones de repos */
    @keyframes bionic-bedding-breathe {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.15); }
    }
    
    /* Ondulation pour points d'eau */
    @keyframes bionic-water-ripple {
      0% { stroke-width: 1px; }
      50% { stroke-width: 3px; }
      100% { stroke-width: 1px; }
    }
    
    /* ═══════════════════════════════════════════════════════════
       CLASSES DE ZONES
    ═══════════════════════════════════════════════════════════ */
    
    .bionic-hotspot-zone {
      animation: bionic-hotspot-pulse 2s ease-in-out infinite;
      filter: drop-shadow(0 0 12px #ff0066);
    }
    
    .bionic-corridor-zone {
      stroke-dasharray: 10 5;
      animation: bionic-corridor-flow 2s linear infinite;
      filter: drop-shadow(0 0 6px #ff6b35);
    }
    
    .bionic-shelter-zone {
      filter: drop-shadow(0 0 8px #00ff88);
    }
    
    .bionic-feeding-zone {
      animation: bionic-feeding-shimmer 3s ease-in-out infinite;
      filter: drop-shadow(0 0 6px #ffd93d);
    }
    
    .bionic-bedding-zone {
      animation: bionic-bedding-breathe 4s ease-in-out infinite;
      filter: drop-shadow(0 0 6px #c084fc);
    }
    
    .bionic-water-zone {
      animation: bionic-water-ripple 3s ease-in-out infinite;
      filter: drop-shadow(0 0 8px #00d4ff);
    }
    
    /* Hover effects */
    .bionic-behavior-zone:hover {
      filter: brightness(1.3) !important;
      cursor: pointer;
    }
    
    /* Légende comportementale */
    .bionic-behavior-legend {
      position: absolute;
      bottom: 20px;
      left: 20px;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(12px);
      border: 2px solid #f5a623;
      border-radius: 12px;
      padding: 12px;
      max-width: 280px;
      box-shadow: 0 4px 20px rgba(245, 166, 35, 0.3);
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
      background: rgba(255, 255, 255, 0.1);
      transform: translateX(4px);
    }
    
    .bionic-behavior-legend-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      flex-shrink: 0;
      box-shadow: 0 0 8px currentColor;
    }
    
    .bionic-behavior-legend-icon {
      font-size: 16px;
      flex-shrink: 0;
    }
    
    .bionic-behavior-legend-text {
      flex: 1;
      font-size: 11px;
      color: white;
    }
    
    .bionic-behavior-legend-score {
      font-size: 10px;
      color: #f5a623;
      font-weight: bold;
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
  
  // Générer les données comportementales
  useEffect(() => {
    if (!enabled || !mapCenter) return;
    
    const generateBehaviorZones = async () => {
      setLoading(true);
      
      try {
        // Récupérer les données forestières de base
        const forestData = generateDemoForestData(mapCenter, 0.03);
        
        // Classifier chaque zone par comportement
        const behaviorStats = {};
        const enrichedFeatures = forestData.features
          .map(feature => {
            const behaviorResult = classifyZoneBehavior(
              {
                ...feature.properties,
                DENSITE: 50 + Math.random() * 50,
                HAUTEUR: 10 + Math.random() * 20,
                PENTE: Math.random() * 20
              },
              { targetSpecies }
            );
            
            // Compter les statistiques
            const primaryId = behaviorResult.primary.id;
            behaviorStats[primaryId] = (behaviorStats[primaryId] || 0) + 1;
            
            if (behaviorResult.isHotspot) {
              behaviorStats['hotspot'] = (behaviorStats['hotspot'] || 0) + 1;
            }
            
            return {
              ...feature,
              properties: {
                ...feature.properties,
                behavior: behaviorResult,
                behaviorId: behaviorResult.isHotspot ? 'hotspot' : primaryId,
                behaviorScore: behaviorResult.isHotspot 
                  ? behaviorResult.hotspotScore 
                  : behaviorResult.primary.score
              }
            };
          })
          .filter(f => f.properties.behaviorScore >= minScore);
        
        setBehaviorData({
          ...forestData,
          features: enrichedFeatures
        });
        setStats(behaviorStats);
        
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
      className: 'bionic-behavior-popup'
    });
    
    // Tooltip rapide
    layer.bindTooltip(
      `${behaviorInfo.icon} ${behaviorInfo.name} (${behaviorScore}%)`,
      { 
        sticky: true, 
        className: 'bionic-behavior-tooltip',
        direction: 'top'
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
