/**
 * MapController - Composant pour centrer la carte
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

const MapController = ({ center, zoom }) => {
  const map = useMap();
  const prevCenterRef = useRef(null);
  const prevZoomRef = useRef(null);
  
  useEffect(() => {
    if (!center) return;
    
    const currentMapZoom = map.getZoom();
    
    // Détecter si le centre a changé significativement
    const centerChanged = !prevCenterRef.current || (
      Math.abs(center[0] - prevCenterRef.current[0]) > 0.0005 ||
      Math.abs(center[1] - prevCenterRef.current[1]) > 0.0005
    );
    
    // Détecter si le zoom a changé
    const zoomChanged = prevZoomRef.current !== null && zoom !== prevZoomRef.current;
    
    if (centerChanged && zoomChanged) {
      map.setView(center, zoom, { animate: true });
    } else if (centerChanged) {
      map.setView(center, currentMapZoom, { animate: true });
    } else if (zoomChanged) {
      map.setZoom(zoom, { animate: true });
    }
    
    prevCenterRef.current = center;
    prevZoomRef.current = zoom;
  }, [center, zoom, map]);
  
  return null;
};

export default MapController;
