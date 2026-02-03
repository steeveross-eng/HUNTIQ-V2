/**
 * CursorTracker - Composant pour suivre la position du curseur sur la carte
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

import { useMapEvents } from 'react-leaflet';

const CursorTracker = ({ onCursorMove, onCursorLeave }) => {
  useMapEvents({
    mousemove: (e) => {
      if (onCursorMove) {
        onCursorMove({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          pixel: { x: e.containerPoint.x, y: e.containerPoint.y }
        });
      }
    },
    mouseout: () => {
      if (onCursorLeave) {
        onCursorLeave();
      }
    }
  });
  return null;
};

export default CursorTracker;
