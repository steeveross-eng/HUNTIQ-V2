/**
 * BionicForestZonesLayer.jsx
 * 
 * COUCHES ÉCOFORESTIÈRES RÉELLES - WMS Québec et Canada
 * 
 * Affiche les vraies données écoforestières depuis les services WMS officiels:
 * - Québec: MFFP/MERN - Inventaire écoforestier
 * - Canada: National Forest Inventory (NFI)
 * 
 * Les zones affichées représentent les VRAIES formes des peuplements forestiers
 * selon les données cartographiques officielles du gouvernement.
 */

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { WMSTileLayer, useMap } from 'react-leaflet';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION WMS ÉCOFORESTIÈRE - SERVICES OFFICIELS
// ═══════════════════════════════════════════════════════════════

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

/**
 * Services WMS officiels du Québec (MFFP/MERN)
 */
const QUEBEC_WMS_CONFIG = {
  // Carte écoforestière principale
  carte_ecoforestiere: {
    id: 'carte_ecoforestiere',
    name: 'Carte Écoforestière',
    url: 'https://servicescarto.mffp.gouv.qc.ca/pes/services/Inventaire/CarteEcoforestiere/MapServer/WMSServer',
    layers: '0,1,2,3,4,5,6,7,8',
    format: 'image/png',
    transparent: true,
    attribution: '© MFFP Québec - Inventaire écoforestier'
  },
  // Peuplements forestiers
  peuplements: {
    id: 'peuplements',
    name: 'Peuplements forestiers',
    url: 'https://servicescarto.mffp.gouv.qc.ca/pes/services/Inventaire/CarteEcoforestiere/MapServer/WMSServer',
    layers: 'peuplement_ecoforestier',
    format: 'image/png',
    transparent: true,
    attribution: '© MFFP Québec'
  },
  // Essences principales
  essences: {
    id: 'essences',
    name: 'Essences principales',
    url: 'https://servicescarto.mffp.gouv.qc.ca/pes/services/Inventaire/CarteEcoforestiere/MapServer/WMSServer',
    layers: 'essence_principale',
    format: 'image/png',
    transparent: true,
    attribution: '© MFFP Québec'
  },
  // Perturbations
  perturbations: {
    id: 'perturbations',
    name: 'Perturbations',
    url: 'https://servicescarto.mffp.gouv.qc.ca/pes/services/Inventaire/CarteEcoforestiere/MapServer/WMSServer',
    layers: 'perturbation',
    format: 'image/png',
    transparent: true,
    attribution: '© MFFP Québec'
  },
  // Densité du couvert
  densite: {
    id: 'densite',
    name: 'Densité du couvert',
    url: 'https://servicescarto.mffp.gouv.qc.ca/pes/services/Inventaire/CarteEcoforestiere/MapServer/WMSServer',
    layers: 'densite_couvert',
    format: 'image/png',
    transparent: true,
    attribution: '© MFFP Québec'
  },
  // Hydrographie
  hydrographie: {
    id: 'hydrographie',
    name: 'Hydrographie',
    url: 'https://servicescarto.mern.gouv.qc.ca/pes/services/Territoire/SDA_WMS/MapServer/WMSServer',
    layers: '7,8,9',
    format: 'image/png',
    transparent: true,
    attribution: '© MERN Québec'
  }
};

/**
 * Services WMS pancanadiens (NFI - National Forest Inventory)
 */
const CANADA_WMS_CONFIG = {
  // Couverture forestière nationale
  forest_cover: {
    id: 'nfi_forest_cover',
    name: 'Couverture forestière Canada',
    url: 'https://opendata.nfis.org/mapserver/cgi-bin/wms_nfi',
    layers: 'forest_cover',
    format: 'image/png',
    transparent: true,
    attribution: '© Natural Resources Canada - NFI'
  },
  // Classification du couvert
  land_cover: {
    id: 'nfi_land_cover',
    name: 'Classification du couvert',
    url: 'https://opendata.nfis.org/mapserver/cgi-bin/wms_nfi',
    layers: 'land_cover',
    format: 'image/png',
    transparent: true,
    attribution: '© Natural Resources Canada'
  }
};

/**
 * Styles BIONIC pour les couches WMS
 * Ces styles sont appliqués via SLD ou CSS filters
 */
const BIONIC_WMS_STYLES = {
  // Style haute visibilité pour zones forestières
  forest_highlight: {
    filter: 'saturate(1.5) contrast(1.2) brightness(1.1)',
    opacity: 0.85
  },
  // Style pour hydrographie
  hydro_highlight: {
    filter: 'saturate(2) hue-rotate(180deg)',
    opacity: 0.9
  },
  // Style BIONIC signature
  bionic_signature: {
    filter: 'saturate(1.8) contrast(1.3)',
    opacity: 0.75
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT COUCHE WMS INDIVIDUELLE
// ═══════════════════════════════════════════════════════════════

const BionicWMSLayer = ({ 
  config, 
  opacity = 0.75, 
  visible = true,
  zIndex = 400,
  style = 'bionic_signature',
  useProxy = true
}) => {
  const map = useMap();
  
  if (!visible || !config) return null;
  
  // Construire l'URL (avec ou sans proxy)
  const wmsUrl = useProxy 
    ? `${API_BASE}/api/wms-proxy/tile`
    : config.url;
  
  // Paramètres WMS
  const wmsParams = useProxy 
    ? {
        url: config.url,
        layers: config.layers,
        format: config.format || 'image/png',
        transparent: true,
        version: '1.1.1'
      }
    : {
        layers: config.layers,
        format: config.format || 'image/png',
        transparent: true,
        version: '1.1.1'
      };
  
  // Appliquer le style BIONIC via CSS
  const layerStyle = BIONIC_WMS_STYLES[style] || BIONIC_WMS_STYLES.bionic_signature;
  
  return (
    <WMSTileLayer
      url={wmsUrl}
      params={wmsParams}
      opacity={opacity * (layerStyle.opacity || 1)}
      zIndex={zIndex}
      attribution={config.attribution}
      className={`bionic-wms-layer bionic-wms-${config.id}`}
    />
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT LÉGENDE WMS
// ═══════════════════════════════════════════════════════════════

const WMSLegend = ({ activeLayers, position = 'bottomright' }) => {
  const positionStyles = {
    bottomright: { bottom: '80px', right: '10px' },
    bottomleft: { bottom: '80px', left: '10px' },
    topright: { top: '80px', right: '10px' },
    topleft: { top: '80px', left: '10px' }
  };
  
  if (!activeLayers || activeLayers.length === 0) return null;
  
  return (
    <div 
      className="bionic-wms-legend"
      style={{
        position: 'absolute',
        ...positionStyles[position],
        zIndex: 1000,
        background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(22, 33, 62, 0.95))',
        padding: '12px',
        borderRadius: '12px',
        border: '2px solid #f5a623',
        boxShadow: '0 4px 20px rgba(245, 166, 35, 0.3)',
        minWidth: '200px',
        maxWidth: '280px'
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
        🗺️ COUCHES ÉCOFORESTIÈRES WMS
      </div>
      
      {activeLayers.map((layer, idx) => (
        <div 
          key={layer.id || idx}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 0',
            borderBottom: idx < activeLayers.length - 1 ? '1px solid #333' : 'none'
          }}
        >
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '3px',
            background: layer.active ? '#00ff66' : '#666',
            boxShadow: layer.active ? '0 0 6px #00ff66' : 'none'
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: 'white' }}>
              {layer.name}
            </div>
            <div style={{ fontSize: '9px', color: '#888' }}>
              {layer.source || 'WMS Officiel'}
            </div>
          </div>
        </div>
      ))}
      
      <div style={{
        marginTop: '10px',
        paddingTop: '8px',
        borderTop: '1px solid #333',
        fontSize: '9px',
        color: '#666',
        textAlign: 'center'
      }}>
        Données officielles MFFP/MERN Québec
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL - COUCHES ÉCOFORESTIÈRES BIONIC
// ═══════════════════════════════════════════════════════════════

const BionicForestZonesLayer = ({
  mapCenter,
  enabled = true,
  showCarteEcoforestiere = true,
  showPeuplements = false,
  showEssences = false,
  showPerturbations = false,
  showDensite = false,
  showHydrographie = true,
  showCanadaForest = true,  // Activé par défaut comme fallback
  opacity = 0.75,
  showLegend = true,
  onLayerLoad,
  onLayerError
}) => {
  const map = useMap();
  const [layersStatus, setLayersStatus] = useState({});
  const [wmsAvailable, setWmsAvailable] = useState(null); // null = en vérification
  const [useCanadaFallback, setUseCanadaFallback] = useState(false);
  
  // Vérifier la disponibilité des services WMS
  useEffect(() => {
    const checkWMSAvailability = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/wms-proxy/check?url=${encodeURIComponent(QUEBEC_WMS_CONFIG.carte_ecoforestiere.url)}`, {
          timeout: 5000
        });
        const data = await response.json();
        const available = data.available !== false;
        setWmsAvailable(available);
        
        // Si WMS Québec non disponible, activer le fallback Canada
        if (!available) {
          console.log('[BIONIC WMS] WMS Québec non disponible, activation fallback Canada NFI');
          setUseCanadaFallback(true);
        }
      } catch (error) {
        console.warn('[BIONIC WMS] Erreur vérification WMS, activation fallback:', error);
        setWmsAvailable(false);
        setUseCanadaFallback(true);
      }
    };
    
    if (enabled) {
      checkWMSAvailability();
    }
  }, [enabled]);
  
  // Injecter les styles CSS pour les couches WMS
  useEffect(() => {
    const styleId = 'bionic-wms-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Styles BIONIC pour couches WMS écoforestières */
        .bionic-wms-layer {
          filter: saturate(1.5) contrast(1.2);
        }
        
        .bionic-wms-carte_ecoforestiere {
          filter: saturate(1.8) contrast(1.3) brightness(1.05);
        }
        
        .bionic-wms-peuplements {
          filter: saturate(2) contrast(1.4) hue-rotate(20deg);
        }
        
        .bionic-wms-essences {
          filter: saturate(1.6) contrast(1.2);
        }
        
        .bionic-wms-hydrographie {
          filter: saturate(2.5) brightness(1.2) hue-rotate(-10deg);
        }
        
        .bionic-wms-nfi_forest_cover {
          filter: saturate(1.4) contrast(1.1);
        }
        
        /* Animation de chargement */
        .bionic-wms-loading {
          animation: bionicWmsLoad 1.5s ease-in-out infinite;
        }
        
        @keyframes bionicWmsLoad {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  // Liste des couches actives pour la légende
  const activeLayers = useMemo(() => {
    const layers = [];
    
    if (showCarteEcoforestiere) {
      layers.push({ 
        id: 'carte_ecoforestiere', 
        name: 'Carte Écoforestière', 
        source: 'MFFP Québec',
        active: wmsAvailable 
      });
    }
    if (showPeuplements) {
      layers.push({ 
        id: 'peuplements', 
        name: 'Peuplements forestiers', 
        source: 'MFFP Québec',
        active: wmsAvailable 
      });
    }
    if (showEssences) {
      layers.push({ 
        id: 'essences', 
        name: 'Essences principales', 
        source: 'MFFP Québec',
        active: wmsAvailable 
      });
    }
    if (showPerturbations) {
      layers.push({ 
        id: 'perturbations', 
        name: 'Perturbations', 
        source: 'MFFP Québec',
        active: wmsAvailable 
      });
    }
    if (showDensite) {
      layers.push({ 
        id: 'densite', 
        name: 'Densité du couvert', 
        source: 'MFFP Québec',
        active: wmsAvailable 
      });
    }
    if (showHydrographie) {
      layers.push({ 
        id: 'hydrographie', 
        name: 'Hydrographie', 
        source: 'MERN Québec',
        active: wmsAvailable 
      });
    }
    if (showCanadaForest) {
      layers.push({ 
        id: 'nfi_forest_cover', 
        name: 'Couverture forestière Canada', 
        source: 'RNCan NFI',
        active: true 
      });
    }
    
    return layers;
  }, [showCarteEcoforestiere, showPeuplements, showEssences, showPerturbations, showDensite, showHydrographie, showCanadaForest, wmsAvailable]);
  
  if (!enabled) return null;
  
  // Message si WMS non disponible
  if (!wmsAvailable && !showCanadaForest) {
    return (
      <>
        <WMSLegend 
          activeLayers={[{ 
            id: 'unavailable', 
            name: 'Service WMS temporairement indisponible', 
            source: 'Réessayer plus tard',
            active: false 
          }]} 
          position="bottomright" 
        />
      </>
    );
  }
  
  return (
    <>
      {/* Couches WMS Québec */}
      {showCarteEcoforestiere && wmsAvailable && (
        <BionicWMSLayer
          config={QUEBEC_WMS_CONFIG.carte_ecoforestiere}
          opacity={opacity}
          zIndex={400}
          style="bionic_signature"
        />
      )}
      
      {showPeuplements && wmsAvailable && (
        <BionicWMSLayer
          config={QUEBEC_WMS_CONFIG.peuplements}
          opacity={opacity * 0.9}
          zIndex={401}
          style="forest_highlight"
        />
      )}
      
      {showEssences && wmsAvailable && (
        <BionicWMSLayer
          config={QUEBEC_WMS_CONFIG.essences}
          opacity={opacity * 0.85}
          zIndex={402}
          style="forest_highlight"
        />
      )}
      
      {showPerturbations && wmsAvailable && (
        <BionicWMSLayer
          config={QUEBEC_WMS_CONFIG.perturbations}
          opacity={opacity * 0.8}
          zIndex={403}
          style="bionic_signature"
        />
      )}
      
      {showDensite && wmsAvailable && (
        <BionicWMSLayer
          config={QUEBEC_WMS_CONFIG.densite}
          opacity={opacity * 0.85}
          zIndex={404}
          style="forest_highlight"
        />
      )}
      
      {showHydrographie && wmsAvailable && (
        <BionicWMSLayer
          config={QUEBEC_WMS_CONFIG.hydrographie}
          opacity={opacity}
          zIndex={405}
          style="hydro_highlight"
        />
      )}
      
      {/* Couches WMS Canada */}
      {showCanadaForest && (
        <BionicWMSLayer
          config={CANADA_WMS_CONFIG.forest_cover}
          opacity={opacity * 0.7}
          zIndex={399}
          style="bionic_signature"
          useProxy={false}
        />
      )}
      
      {/* Légende */}
      {showLegend && activeLayers.length > 0 && (
        <WMSLegend 
          activeLayers={activeLayers} 
          position="bottomright" 
        />
      )}
    </>
  );
};

// Exports
export default BionicForestZonesLayer;
export { 
  QUEBEC_WMS_CONFIG, 
  CANADA_WMS_CONFIG, 
  BIONIC_WMS_STYLES,
  BionicWMSLayer,
  WMSLegend
};
