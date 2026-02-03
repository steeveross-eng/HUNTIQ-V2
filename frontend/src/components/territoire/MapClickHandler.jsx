/**
 * MapClickHandler - Composant pour capturer les clics sur la carte
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

import { useMapEvents } from 'react-leaflet';

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      console.log('[MapClickHandler] Click detected at:', e.latlng.lat, e.latlng.lng);
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
};

export default MapClickHandler;
