/**
 * BIONIC Territory Module - Index
 * 
 * Point d'entrée unique pour le module BIONIC Territory
 * Architecture: Micro-Frontend Ready
 * 
 * Usage:
 * import { BionicTerritoryPage, BionicTerritoryProvider } from '@/modules/bionic-territory';
 */

// Context & Provider
export { 
  BionicTerritoryProvider,
  useBionicTerritory,
  useBionicMap,
  useBionicLayers,
  useBionicWaypoints,
  useBionicGenerator,
  useBionicUI,
  BIONIC_ACTIONS
} from './context/BionicTerritoryContext';

// Components - Header
export { 
  default as TerritoryHeader,
  NotificationsPanel,
  WaypointCreationMenu,
  GroupsMenu,
  SpeciesSelector
} from './components/header/TerritoryHeader';

// Components - Sidebar
export { 
  default as LayersSidebar,
  BaseMapSelector,
  PipelineControlPanel,
  PercentageFilter,
  EcoforestrySection,
  PrivacySection,
  BASE_MAPS,
  PIPELINE_LAYERS
} from './components/sidebar/LayersSidebar';

export {
  default as LayersPanelContent,
  BaseMapSection,
  PipelineSection,
  BionicLayersSection,
  BASE_MAP_OPTIONS,
  PIPELINE_LAYERS_CONFIG
} from './components/sidebar/LayersPanelContent';

export {
  default as QuebecLayersPanel,
  QUEBEC_LAYERS_CONFIG,
  LayerControl
} from './components/sidebar/QuebecLayersPanel';

// Components - Controls
export { 
  default as MapControlButtons,
  WaypointModeIndicator,
  PositionInfo
} from './components/controls/MapControlButtons';

// Module metadata for micro-frontend registration
export const MODULE_INFO = {
  name: 'bionic-territory',
  version: '1.1.0',
  description: 'BIONIC Territory Management Module',
  routes: [
    { path: '/mon-territoire-bionic', component: 'BionicTerritoryPage' }
  ],
  dependencies: [
    'react-leaflet',
    'leaflet'
  ]
};
