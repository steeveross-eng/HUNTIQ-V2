/**
 * BionicMapOverlay.jsx
 * 
 * Overlay visuel BIONIC™ v3.3 - Effet 10X plus distinctif
 * - Bordure orange/jaune lumineux
 * - Effet de lueur (glow)
 * - Zones de peuplements forestiers très colorées
 * - Indicateurs visuels de scoring
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION VISUELLE BIONIC™ SIGNATURE
// ═══════════════════════════════════════════════════════════════

export const BIONIC_VISUAL_CONFIG = {
  // Couleurs signature BIONIC™
  colors: {
    primary: '#f5a623',      // Orange BIONIC
    secondary: '#ff6b00',    // Orange vif
    accent: '#ffd700',       // Or
    glow: '#ff8c00',         // Lueur orange
    success: '#00ff88',      // Vert néon
    danger: '#ff3366',       // Rouge vif
    water: '#00d4ff',        // Bleu cyan
    forest: {
      dense: '#00ff66',      // Vert fluo dense
      mixed: '#88ff00',      // Vert-jaune
      deciduous: '#ffdd00',  // Jaune doré
      conifer: '#00cc44',    // Vert sapin
      young: '#99ff66',      // Vert clair
      mature: '#006633',     // Vert foncé
    }
  },
  // Effets visuels
  effects: {
    glowIntensity: 20,
    pulseSpeed: 2,
    borderWidth: 4,
    overlayOpacity: 0.15
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT OVERLAY BORDURE LUMINEUX
// ═══════════════════════════════════════════════════════════════

const BionicBorderGlow = ({ active, intensity = 'high' }) => {
  const intensityConfig = {
    low: { blur: 10, spread: 2, opacity: 0.3 },
    medium: { blur: 20, spread: 4, opacity: 0.5 },
    high: { blur: 30, spread: 6, opacity: 0.7 }
  };
  
  const config = intensityConfig[intensity] || intensityConfig.high;
  
  if (!active) return null;
  
  return (
    <div 
      className="bionic-border-glow"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1000,
        border: `${BIONIC_VISUAL_CONFIG.effects.borderWidth}px solid ${BIONIC_VISUAL_CONFIG.colors.primary}`,
        boxShadow: `
          inset 0 0 ${config.blur}px ${config.spread}px ${BIONIC_VISUAL_CONFIG.colors.glow}${Math.round(config.opacity * 255).toString(16)},
          0 0 ${config.blur}px ${config.spread}px ${BIONIC_VISUAL_CONFIG.colors.glow}${Math.round(config.opacity * 255).toString(16)}
        `,
        animation: 'bionicPulse 3s ease-in-out infinite',
        borderRadius: '0px'
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT INDICATEUR BIONIC ACTIF
// ═══════════════════════════════════════════════════════════════

const BionicActiveIndicator = ({ show, version = '3.3' }) => {
  const [visible, setVisible] = useState(show);
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    if (show) {
      // Use setTimeout to defer the state update
      timerRef.current = setTimeout(() => {
        setVisible(true);
        // Hide after 3 seconds
        timerRef.current = setTimeout(() => setVisible(false), 3000);
      }, 0);
    } else {
      timerRef.current = setTimeout(() => setVisible(false), 0);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [show]);
  
  if (!visible) return null;
  
  return (
    <div 
      className="bionic-active-indicator"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2000,
        pointerEvents: 'none',
        animation: 'bionicFadeIn 0.5s ease-out forwards'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 166, 35, 0.95), rgba(255, 107, 0, 0.95))',
        padding: '20px 40px',
        borderRadius: '16px',
        border: '3px solid #ffd700',
        boxShadow: '0 0 40px rgba(245, 166, 35, 0.8), 0 0 80px rgba(255, 107, 0, 0.4)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          marginBottom: '8px'
        }}>
          🎯 BIONIC™ v{version}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#fff8',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Intelligence Plus Activé
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT LÉGENDE PEUPLEMENTS COLORÉS
// ═══════════════════════════════════════════════════════════════

const BionicForestLegend = ({ show, position = 'bottomright' }) => {
  if (!show) return null;
  
  const forestTypes = [
    { color: BIONIC_VISUAL_CONFIG.colors.forest.dense, label: 'Résineux dense', icon: '🌲', score: '95%' },
    { color: BIONIC_VISUAL_CONFIG.colors.forest.conifer, label: 'Résineux', icon: '🌲', score: '85%' },
    { color: BIONIC_VISUAL_CONFIG.colors.forest.mixed, label: 'Mixte', icon: '🌳', score: '75%' },
    { color: BIONIC_VISUAL_CONFIG.colors.forest.deciduous, label: 'Feuillus', icon: '🍂', score: '65%' },
    { color: BIONIC_VISUAL_CONFIG.colors.forest.young, label: 'Jeune forêt', icon: '🌱', score: '55%' },
    { color: BIONIC_VISUAL_CONFIG.colors.forest.mature, label: 'Forêt mature', icon: '🌳', score: '90%' }
  ];
  
  const positionStyles = {
    bottomright: { bottom: '80px', right: '10px' },
    bottomleft: { bottom: '80px', left: '10px' },
    topright: { top: '80px', right: '10px' },
    topleft: { top: '80px', left: '10px' }
  };
  
  return (
    <div 
      className="bionic-forest-legend"
      style={{
        position: 'absolute',
        ...positionStyles[position],
        zIndex: 1000,
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
        padding: '12px',
        borderRadius: '12px',
        border: '2px solid #f5a623',
        boxShadow: '0 4px 20px rgba(245, 166, 35, 0.3)',
        minWidth: '180px'
      }}
    >
      <div style={{
        fontSize: '12px',
        fontWeight: 'bold',
        color: '#f5a623',
        marginBottom: '10px',
        textAlign: 'center',
        borderBottom: '1px solid #f5a62344',
        paddingBottom: '8px'
      }}>
        🌲 PEUPLEMENTS BIONIC™
      </div>
      
      {forestTypes.map((type, idx) => (
        <div 
          key={idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 0',
            borderBottom: idx < forestTypes.length - 1 ? '1px solid #333' : 'none'
          }}
        >
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            background: type.color,
            boxShadow: `0 0 8px ${type.color}88`,
            border: '1px solid white'
          }} />
          <span style={{ fontSize: '11px', color: 'white', flex: 1 }}>
            {type.icon} {type.label}
          </span>
          <span style={{ 
            fontSize: '10px', 
            color: type.color,
            fontWeight: 'bold'
          }}>
            {type.score}
          </span>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT SCORING VISUAL OVERLAY
// ═══════════════════════════════════════════════════════════════

const BionicScoringOverlay = ({ score, show }) => {
  if (!show || !score) return null;
  
  const getScoreColor = (s) => {
    if (s >= 85) return '#00ff88';
    if (s >= 70) return '#88ff00';
    if (s >= 55) return '#ffdd00';
    if (s >= 40) return '#ff8800';
    return '#ff3366';
  };
  
  return (
    <div 
      className="bionic-scoring-overlay"
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1500,
        display: 'flex',
        gap: '10px',
        pointerEvents: 'none'
      }}
    >
      {/* Score Principal */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
        padding: '10px 20px',
        borderRadius: '12px',
        border: `2px solid ${getScoreColor(score.habitat_optimal)}`,
        boxShadow: `0 0 20px ${getScoreColor(score.habitat_optimal)}66`,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
          HABITAT OPTIMAL
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: getScoreColor(score.habitat_optimal),
          textShadow: `0 0 10px ${getScoreColor(score.habitat_optimal)}88`
        }}>
          {score.habitat_optimal}
        </div>
      </div>
      
      {/* Score Météo */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
        padding: '10px 15px',
        borderRadius: '12px',
        border: '2px solid #00d4ff',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
          MÉTÉO
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#00d4ff'
        }}>
          {score.meteo || '--'}
        </div>
      </div>
      
      {/* Score Approche */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
        padding: '10px 15px',
        borderRadius: '12px',
        border: '2px solid #8b5cf6',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>
          APPROCHE
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#8b5cf6'
        }}>
          {score.approche || '--'}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT ZONES COLORÉES PEUPLEMENTS
// ═══════════════════════════════════════════════════════════════

export const BionicForestZonesOverlay = ({ zones, mapRef }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !zones || zones.length === 0) return;
    
    // Injecter le CSS des zones colorées
    const styleId = 'bionic-forest-zones-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .bionic-forest-zone {
          transition: all 0.3s ease;
        }
        .bionic-forest-zone:hover {
          filter: brightness(1.3);
          transform: scale(1.02);
        }
      `;
      document.head.appendChild(style);
    }
  }, [map, zones]);
  
  return null;
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL OVERLAY BIONIC
// ═══════════════════════════════════════════════════════════════

const BionicMapOverlay = ({
  active = false,
  showBorder = true,
  showLegend = true,
  showScoring = false,
  score = null,
  intensity = 'high',
  version = '3.3',
  onActivate
}) => {
  const [justActivated, setJustActivated] = useState(active);
  const activationTimerRef = useRef(null);
  
  useEffect(() => {
    // Clear any existing timer
    if (activationTimerRef.current) {
      clearTimeout(activationTimerRef.current);
    }
    
    if (active) {
      // Use setTimeout to defer the state update
      activationTimerRef.current = setTimeout(() => {
        setJustActivated(true);
        // Hide after 3.5 seconds
        activationTimerRef.current = setTimeout(() => setJustActivated(false), 3500);
      }, 0);
    } else {
      activationTimerRef.current = setTimeout(() => setJustActivated(false), 0);
    }
    
    return () => {
      if (activationTimerRef.current) {
        clearTimeout(activationTimerRef.current);
      }
    };
  }, [active]);
  
  return (
    <>
      {/* Styles CSS globaux pour BIONIC */}
      <style>{`
        @keyframes bionicPulse {
          0%, 100% {
            box-shadow: 
              inset 0 0 30px 6px rgba(245, 166, 35, 0.4),
              0 0 30px 6px rgba(245, 166, 35, 0.4);
          }
          50% {
            box-shadow: 
              inset 0 0 50px 10px rgba(255, 107, 0, 0.6),
              0 0 50px 10px rgba(255, 107, 0, 0.6);
          }
        }
        
        @keyframes bionicFadeIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes bionicGlow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(245, 166, 35, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(255, 107, 0, 0.8));
          }
        }
        
        .bionic-map-container {
          position: relative;
        }
        
        .bionic-active .leaflet-tile-pane {
          filter: saturate(1.3) contrast(1.1);
        }
        
        .bionic-forest-highlight {
          animation: bionicGlow 2s ease-in-out infinite;
        }
      `}</style>
      
      {/* Bordure lumineux */}
      {showBorder && <BionicBorderGlow active={active} intensity={intensity} />}
      
      {/* Indicateur d'activation */}
      <BionicActiveIndicator show={justActivated} version={version} />
      
      {/* Légende des peuplements */}
      {showLegend && <BionicForestLegend show={active} position="bottomright" />}
      
      {/* Overlay de scoring */}
      {showScoring && <BionicScoringOverlay score={score} show={active} />}
    </>
  );
};

export default BionicMapOverlay;
