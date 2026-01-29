# HUNTIQ - Architecture Modulaire

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SHELL APPLICATION                                  │
│                      (Routing + Auth + Layout)                               │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│   MF-BIONIC      │    MF-SHOP       │    MF-ADMIN      │    MF-NETWORK      │
│   Territory      │    E-commerce    │    Dashboard     │    Social Hub      │
│   ┌──────────┐   │   ┌──────────┐   │   ┌──────────┐   │   ┌──────────┐     │
│   │Layers    │   │   │Products  │   │   │Users     │   │   │Groups    │     │
│   │Sidebar   │   │   │Cart      │   │   │Backups   │   │   │Events    │     │
│   │MapCtrl   │   │   │Checkout  │   │   │Settings  │   │   │Messages  │     │
│   │Generator │   │   │Orders    │   │   │Analytics │   │   │Tracking  │     │
│   └──────────┘   │   └──────────┘   │   └──────────┘   │   └──────────┘     │
└──────────────────┴──────────────────┴──────────────────┴────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY                                       │
│                         (FastAPI Router)                                     │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│  MS-BIONIC       │   MS-COMMERCE    │    MS-AUTH       │   MS-ANALYTICS     │
│  Territory       │   Orders/Pay     │    Users/JWT     │   Stats/Reports    │
│  Analysis        │   Products       │    Sessions      │   Tracking         │
│  /api/bionic-    │   /api/shop/     │    /api/auth/    │   /api/analytics/  │
│  territory/      │                  │                  │                    │
└──────────────────┴──────────────────┴──────────────────┴────────────────────┘
                                      │
                                      ▼
                          ┌─────────────────────┐
                          │     DATABASES       │
                          │   MongoDB Atlas     │
                          │   (+ Redis Cache)   │
                          └─────────────────────┘
```

## Structure des Modules Frontend

### Module BIONIC Territory (`/app/frontend/src/modules/bionic-territory/`)

```
bionic-territory/
├── index.js                           # Point d'entrée du module
├── context/
│   └── BionicTerritoryContext.jsx     # State management (Reducer + Actions)
├── components/
│   ├── sidebar/
│   │   └── LayersSidebar.jsx          # Panneau latéral complet
│   ├── controls/
│   │   └── MapControlButtons.jsx      # Boutons de contrôle carte
│   ├── map/
│   │   └── (à créer)                  # Composants carte
│   └── dialogs/
│       └── (à créer)                  # Dialogues/Modals
├── hooks/
│   └── (à créer)                      # Custom hooks
├── services/
│   └── (à créer)                      # API calls
├── types/
│   └── (à créer)                      # TypeScript types
└── utils/
    └── (à créer)                      # Utilitaires
```

### Imports disponibles

```javascript
// Context & Provider
import { 
  BionicTerritoryProvider,
  useBionicTerritory,
  useBionicMap,
  useBionicLayers,
  useBionicWaypoints,
  useBionicGenerator,
  useBionicUI,
  BIONIC_ACTIONS
} from '@/modules/bionic-territory';

// Components
import { 
  LayersSidebar,
  BaseMapSelector,
  PipelineControlPanel,
  MapControlButtons,
  WaypointModeIndicator
} from '@/modules/bionic-territory';

// Constants
import { 
  BASE_MAPS,
  PIPELINE_LAYERS
} from '@/modules/bionic-territory';
```

## Structure des Services Backend

### Service BIONIC Territory (`/app/backend/services/bionic_territory/`)

```
bionic_territory/
├── __init__.py                        # Export du router
├── routes/
│   ├── __init__.py
│   └── territory_routes.py            # Endpoints REST API
├── models/
│   └── (à créer)                      # Modèles Pydantic
├── utils/
│   └── (à créer)                      # Utilitaires
└── tests/
    └── (à créer)                      # Tests unitaires
```

### Endpoints API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bionic-territory/health` | Health check du service |
| GET | `/api/bionic-territory/config` | Configuration carte |
| GET | `/api/bionic-territory/pipeline/status` | Status du pipeline |
| POST | `/api/bionic-territory/analyze` | Analyse de zone |
| GET | `/api/bionic-territory/waypoints` | Liste waypoints |
| POST | `/api/bionic-territory/waypoints` | Créer waypoint |
| DELETE | `/api/bionic-territory/waypoints/{id}` | Supprimer waypoint |

## Context State Structure

```javascript
const state = {
  // Map State
  map: {
    center: [46.8139, -71.2080],
    zoom: 12,
    currentZoom: 12,
    currentCenter: { lat: 46.8139, lng: -71.2080 },
    bounds: null,
    baseMap: 'bionic' // 'bionic', 'satellite', 'terrain'
  },
  
  // Layers State
  layers: {
    pipelineEnabled: true,
    pipelineCollapsed: false,
    activeEcoLayers: {
      baseMap: null,
      overlays: []
    },
    ecoLayerOpacities: {}
  },
  
  // Waypoints State
  waypoints: {
    items: [],
    selected: null,
    loading: false
  },
  
  // Generator State
  generator: {
    carteBionic: null,
    isGenerating: false,
    lastGenerated: null
  },
  
  // UI State
  ui: {
    layersPanelVisible: true,
    analysisPanelVisible: true,
    privacyMode: false,
    gpsLiveEnabled: false,
    mapClickMode: false
  },
  
  // Position State
  position: {
    current: null,
    watching: false,
    accuracy: null
  },
  
  // Zones State
  zones: {
    selected: null,
    microZones: [],
    filteredZones: [],
    minPercentageFilter: 50,
    displayMode: 'micro'
  }
};
```

## Prochaines étapes

### Phase 2: Isolation complète
- [ ] Extraire plus de composants de `MonTerritoireBionicPage.jsx`
- [ ] Créer hooks personnalisés pour les appels API
- [ ] Implémenter les tests unitaires

### Phase 3: State Management avancé
- [ ] Migration vers Redux Toolkit (si nécessaire)
- [ ] Implémenter le caching avec React Query
- [ ] Ajouter la persistence locale (localStorage)

### Phase 4: Micro-Frontends
- [ ] Configuration Webpack Module Federation
- [ ] Création des builds indépendants
- [ ] Déploiement des modules séparés

### Phase 5: Microservices
- [ ] Extraction des services vers containers Docker
- [ ] Configuration Kubernetes
- [ ] API Gateway avec Kong/Traefik
