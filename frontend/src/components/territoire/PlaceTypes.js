/**
 * PlaceTypes - Types de lieux disponibles pour BIONIC
 * Extrait de MonTerritoireBionicPage.jsx pour modularité
 */

export const PLACE_TYPES = [
  { id: 'zec', name: 'ZEC', icon: '🏕️', color: '#22c55e' },
  { id: 'pourvoirie', name: 'Pourvoirie', icon: '🏠', color: '#3b82f6' },
  { id: 'prive', name: 'Territoire privé', icon: '🔒', color: '#f59e0b' },
  { id: 'sepaq', name: 'Réserve faunique (Sépaq)', icon: '🦌', color: '#8b5cf6' },
  { id: 'affut', name: 'Affût / Cache', icon: '🎯', color: '#ef4444' },
  { id: 'saline', name: 'Saline', icon: '🧂', color: '#06b6d4' },
  { id: 'observation', name: "Point d'observation", icon: '👁️', color: '#ec4899' },
  { id: 'stationnement', name: 'Stationnement', icon: '🅿️', color: '#6b7280' },
  { id: 'camp', name: 'Camp de chasse', icon: '🏕️', color: '#84cc16' },
  { id: 'autre', name: 'Autre lieu', icon: '📌', color: '#a855f7' },
];

export const getPlaceTypeById = (id) => PLACE_TYPES.find(t => t.id === id);

export default PLACE_TYPES;
