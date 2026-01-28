/**
 * GPSLiveDisplay.jsx
 * Composant optimisé pour l'affichage GPS LIVE
 * Extrait de MonTerritoireBionicPage pour réduire la taille du fichier principal
 */

import React, { memo } from 'react';
import { Mountain } from 'lucide-react';

/**
 * Affichage GPS LIVE avec flèche pointant vers le bas
 * Mémorisé pour éviter les re-renders inutiles
 */
const GPSLiveDisplay = memo(function GPSLiveDisplay({ 
  cursorPosition, 
  cursorData, 
  cursorElevation 
}) {
  if (!cursorPosition || !cursorData) {
    return null;
  }

  return (
    <div 
      className="fixed pointer-events-none"
      style={{
        left: `${(cursorPosition.pixel?.x || 0) + 230}px`,
        top: `${(cursorPosition.pixel?.y || 0) + 80}px`,
        transform: 'translateX(-50%)',
        zIndex: 99999
      }}
    >
      {/* Conteneur principal */}
      <div className="flex flex-col items-center">
        {/* Bulle d'info */}
        <div className="bg-black/95 backdrop-blur-sm px-3 py-2 border-2 border-[#f5a623] shadow-2xl rounded-lg relative">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[#f5a623] text-xs font-bold tracking-wider">GPS LIVE</span>
          </div>
          <div className="text-white font-mono text-sm">
            {cursorData.lat.toFixed(5)}°N
          </div>
          <div className="text-white font-mono text-sm">
            {Math.abs(cursorData.lng).toFixed(5)}°O
          </div>
          {cursorElevation !== null && (
            <div className="text-green-400 font-mono text-sm flex items-center gap-1">
              <Mountain className="h-3 w-3" />
              {cursorElevation} m
            </div>
          )}
          {cursorData.distanceFromUser && (
            <div className="text-blue-400 text-xs mt-1 border-t border-gray-700 pt-1">
              📍 {cursorData.distanceFromUser < 1 
                ? `${(cursorData.distanceFromUser * 1000).toFixed(0)} m` 
                : `${cursorData.distanceFromUser.toFixed(2)} km`}
            </div>
          )}
          
          {/* Triangle attaché au bas de la bulle */}
          <div 
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: '-14px',
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '14px solid #f5a623'
            }}
          />
        </div>
        
        {/* Tige verticale */}
        <div 
          className="bg-gradient-to-b from-[#f5a623] to-[#f5a623]/60"
          style={{ width: '3px', height: '30px', marginTop: '-1px' }}
        />
        
        {/* Point GPS avec animation */}
        <div className="relative">
          <div 
            className="absolute w-5 h-5 bg-[#f5a623] rounded-full animate-ping opacity-30" 
            style={{ left: '-4px', top: '-4px' }} 
          />
          <div className="w-3 h-3 bg-white rounded-full border-3 border-[#f5a623] shadow-lg" />
        </div>
      </div>
    </div>
  );
});

GPSLiveDisplay.displayName = 'GPSLiveDisplay';

export default GPSLiveDisplay;
