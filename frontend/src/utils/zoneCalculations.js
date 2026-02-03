/**
 * Zone Calculations - Utilitaires pour le calcul des zones BIONIC
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

import { BIONIC_MODULES } from '@/components/territoire/BionicMicroZones';

// Constantes pour le calcul des zones
export const ZONE_CONFIG = {
  MAX_AREA_KM2: 1.0,
  MAX_RADIUS_KM: 0.564,
  MIN_RADIUS_KM: 0.05,
  EARTH_RADIUS_KM: 6371,
};

// Convertit le niveau de zoom en rayon de zone (en km)
export const getZoneRadiusForZoom = (zoom) => {
  const zoomFactor = Math.pow(2, 15 - zoom);
  const radius = Math.min(
    ZONE_CONFIG.MAX_RADIUS_KM,
    Math.max(ZONE_CONFIG.MIN_RADIUS_KM, 0.5 * zoomFactor)
  );
  return radius;
};

// Convertit km en degrés de latitude
export const kmToLatDegrees = (km) => km / 111.32;

// Convertit km en degrés de longitude (dépend de la latitude)
export const kmToLngDegrees = (km, lat) => km / (111.32 * Math.cos(lat * Math.PI / 180));

// Calcule le nombre de zones selon le zoom et l'étendue visible
export const getZoneDensityForZoom = (zoom) => {
  if (zoom >= 16) return { gridSize: 12, subdivisions: 3 };
  if (zoom >= 14) return { gridSize: 10, subdivisions: 2 };
  if (zoom >= 12) return { gridSize: 8, subdivisions: 1 };
  if (zoom >= 10) return { gridSize: 6, subdivisions: 1 };
  return { gridSize: 4, subdivisions: 1 };
};

// Génère un hexagone autour d'un point central
export const generateHexagon = (centerLat, centerLng, radiusKm) => {
  const points = [];
  const latRadius = kmToLatDegrees(radiusKm);
  const lngRadius = kmToLngDegrees(radiusKm, centerLat);
  
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i - 30) * Math.PI / 180;
    points.push([
      centerLat + latRadius * Math.sin(angle) * 0.92,
      centerLng + lngRadius * Math.cos(angle) * 0.92
    ]);
  }
  return points;
};

// Calcule un score BIONIC simulé basé sur la position et le type de couche
export const calculateZoneScore = (lat, lng, layerType, baseScore = null) => {
  const noise = (x, y) => {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  };
  
  const spatialVariation = noise(lat * 100, lng * 100);
  
  const layerFactors = {
    habitats: { base: 70, variance: 25, threshold: 0.45 },
    rut: { base: 65, variance: 30, threshold: 0.50 },
    affuts: { base: 75, variance: 20, threshold: 0.55 },
    corridors: { base: 60, variance: 30, threshold: 0.40 },
    alimentation: { base: 70, variance: 25, threshold: 0.45 },
    repos: { base: 65, variance: 25, threshold: 0.50 },
    salines: { base: 55, variance: 35, threshold: 0.60 },
  };
  
  const factor = layerFactors[layerType] || { base: 60, variance: 25, threshold: 0.50 };
  
  if (spatialVariation < factor.threshold) return null;
  
  const score = Math.round(
    factor.base + (spatialVariation - factor.threshold) * factor.variance * 2
  );
  
  return Math.min(100, Math.max(0, score));
};

// Types de couches avec configuration
export const LAYER_TYPES = Object.entries(BIONIC_MODULES).map(([id, config], index) => ({
  id,
  color: config.color,
  label: config.label,
  icon: config.icon,
  priority: index + 1
}));

/**
 * Génère des zones BIONIC adaptatives au zoom
 */
export const generateAdaptiveBionicZones = (centerLat, centerLng, zoom, layersVisible, targetWaypoint = null) => {
  const zones = [];
  
  const radiusKm = getZoneRadiusForZoom(zoom);
  const { gridSize } = getZoneDensityForZoom(zoom);
  
  const effectiveCenter = targetWaypoint 
    ? { lat: targetWaypoint.lat, lng: targetWaypoint.lng }
    : { lat: centerLat, lng: centerLng };
  
  const latStep = kmToLatDegrees(radiusKm * 1.8);
  const lngStep = kmToLngDegrees(radiusKm * 1.8, effectiveCenter.lat);
  
  const halfGrid = Math.floor(gridSize / 2);
  let zoneIndex = 0;
  
  for (let row = -halfGrid; row <= halfGrid; row++) {
    for (let col = -halfGrid; col <= halfGrid; col++) {
      const hexOffset = (row % 2) * (lngStep / 2);
      
      const zoneLat = effectiveCenter.lat + row * latStep * 0.866;
      const zoneLng = effectiveCenter.lng + col * lngStep + hexOffset;
      
      const distFromCenter = Math.sqrt(
        Math.pow((zoneLat - effectiveCenter.lat) / latStep, 2) +
        Math.pow((zoneLng - effectiveCenter.lng) / lngStep, 2)
      );
      
      if (distFromCenter > halfGrid) continue;
      
      LAYER_TYPES.forEach((layerType) => {
        if (!layersVisible[layerType.id]) return;
        
        const score = calculateZoneScore(zoneLat, zoneLng, layerType.id);
        
        if (score === null || score < 55) return;
        
        const hexPoints = generateHexagon(zoneLat, zoneLng, radiusKm);
        const areaKm2 = Math.PI * radiusKm * radiusKm;
        
        zones.push({
          id: `${layerType.id}-${zoneIndex}-${row}-${col}`,
          layerId: layerType.id,
          positions: hexPoints,
          color: layerType.color,
          score,
          label: layerType.label,
          center: [zoneLat, zoneLng],
          radiusKm,
          areaKm2: Math.min(areaKm2, ZONE_CONFIG.MAX_AREA_KM2),
          zoom,
          priority: layerType.priority
        });
        
        zoneIndex++;
      });
    }
  }
  
  zones.sort((a, b) => b.score - a.score);
  
  const maxZones = zoom >= 14 ? 150 : zoom >= 12 ? 100 : 60;
  return zones.slice(0, maxZones);
};

/**
 * Génère des zones autour d'un waypoint spécifique
 */
export const generateWaypointZones = (waypoint, zoom, layersVisible) => {
  return generateAdaptiveBionicZones(
    waypoint.lat,
    waypoint.lng,
    Math.max(zoom, 13),
    layersVisible,
    waypoint
  );
};

/**
 * Génère des zones BIONIC qui couvrent TOUTE l'étendue visible de la carte
 */
export const generateAdaptiveBionicZonesForBounds = (bounds, zoom, layersVisible) => {
  const zones = [];
  
  if (!bounds) return zones;
  
  const radiusKm = getZoneRadiusForZoom(zoom);
  
  const latStep = kmToLatDegrees(radiusKm * 1.8);
  const centerLat = (bounds.north + bounds.south) / 2;
  const lngStep = kmToLngDegrees(radiusKm * 1.8, centerLat);
  
  const latRange = bounds.north - bounds.south;
  const lngRange = bounds.east - bounds.west;
  
  const numRows = Math.ceil(latRange / latStep) + 2;
  const numCols = Math.ceil(lngRange / lngStep) + 2;
  
  const maxCells = zoom >= 14 ? 20 : zoom >= 12 ? 15 : 10;
  const effectiveRows = Math.min(numRows, maxCells);
  const effectiveCols = Math.min(numCols, maxCells);
  
  let zoneIndex = 0;
  
  for (let row = 0; row < effectiveRows; row++) {
    for (let col = 0; col < effectiveCols; col++) {
      const hexOffset = (row % 2) * (lngStep / 2);
      
      const zoneLat = bounds.south + (row + 0.5) * (latRange / effectiveRows);
      const zoneLng = bounds.west + (col + 0.5) * (lngRange / effectiveCols) + hexOffset;
      
      if (zoneLat < bounds.south || zoneLat > bounds.north) continue;
      if (zoneLng < bounds.west || zoneLng > bounds.east) continue;
      
      LAYER_TYPES.forEach((layerType) => {
        if (!layersVisible[layerType.id]) return;
        
        const score = calculateZoneScore(zoneLat, zoneLng, layerType.id);
        
        if (score === null || score < 50) return;
        
        const hexPoints = generateHexagon(zoneLat, zoneLng, radiusKm);
        const areaKm2 = Math.PI * radiusKm * radiusKm;
        
        zones.push({
          id: `bounds-${layerType.id}-${zoneIndex}-${row}-${col}`,
          layerId: layerType.id,
          positions: hexPoints,
          color: layerType.color,
          score,
          label: layerType.label,
          center: [zoneLat, zoneLng],
          radiusKm,
          areaKm2: Math.min(areaKm2, ZONE_CONFIG.MAX_AREA_KM2),
          zoom,
          priority: layerType.priority
        });
        
        zoneIndex++;
      });
    }
  }
  
  zones.sort((a, b) => b.score - a.score);
  
  const maxZones = zoom >= 14 ? 200 : zoom >= 12 ? 150 : 100;
  return zones.slice(0, maxZones);
};

// Utilitaires de scoring
export const getScoreRating = (score) => {
  if (score >= 85) return { label: 'Exceptionnel', color: 'bg-green-500', textColor: 'text-green-400' };
  if (score >= 70) return { label: 'Excellent', color: 'bg-lime-500', textColor: 'text-lime-400' };
  if (score >= 55) return { label: 'Bon', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
  return { label: 'Modéré', color: 'bg-orange-500', textColor: 'text-orange-400' };
};
