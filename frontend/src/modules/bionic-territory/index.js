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

// Components - Controls
export { 
  default as MapControlButtons,
  WaypointModeIndicator,
  PositionInfo
} from './components/controls/MapControlButtons';

// Module metadata for micro-frontend registration
export const MODULE_INFO = {
  name: 'bionic-territory',
  version: '1.0.0',
  description: 'BIONIC Territory Management Module',
  routes: [
    { path: '/mon-territoire-bionic', component: 'BionicTerritoryPage' }
  ],
  dependencies: [
    'react-leaflet',
    'leaflet'
  ]
};
