/**
 * ZoomHandler - Composant pour détecter les changements de zoom et position
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const ZoomHandler = ({ onZoomChange, onMapMove, onBoundsChange }) => {
  const map = useMap();
  
  useEffect(() => {
    const handleZoomEnd = () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      onZoomChange(map.getZoom());
      if (onMapMove) {
        onMapMove({ lat: center.lat, lng: center.lng });
      }
      if (onBoundsChange) {
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
    };
    
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      if (onMapMove) {
        onMapMove({ lat: center.lat, lng: center.lng });
      }
      if (onBoundsChange) {
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
    };
    
    map.on('zoomend', handleZoomEnd);
    map.on('moveend', handleMoveEnd);
    
    // Initial call
    handleZoomEnd();
    
    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onZoomChange, onMapMove, onBoundsChange]);
  
  return null;
};

export default ZoomHandler;
