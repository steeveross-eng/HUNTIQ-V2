# HUNTIQ / Chasse Bionic™ - PRD (Product Requirements Document)

## Project Overview
**Application**: HUNTIQ / Chasse Bionic™  
**Type**: Full-stack hunting platform with AI-powered analysis, marketplace, territory mapping, and e-commerce  
**Last Updated**: January 30, 2026 (Session 3)  
**Architecture Version**: 2.2 - Modular (Micro-Frontends + Microservices + WMS Proxy + Professional UI)

---

## Architecture

### Tech Stack
- **Frontend**: React 18 + Tailwind CSS + Shadcn UI + Leaflet Maps
- **Backend**: FastAPI (Python) + MongoDB + httpx (WMS Proxy)
- **APIs**: 50+ modules including AI analysis, geospatial, e-commerce
- **Architecture**: Modular (Micro-Frontends + Microservices Ready) ⭐ v2.1

### Modular Architecture v2.1
```
┌───────────────────────────────────────────────────────────┐
│                    SHELL APPLICATION                       │
│                  (Routing + Auth + Layout)                 │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ MF-BIONIC   │  MF-SHOP    │  MF-ADMIN   │  MF-NETWORK     │
│ Territory   │  E-commerce │  Dashboard  │  Social Hub     │
└─────────────┴─────────────┴─────────────┴─────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────┐
│                      API GATEWAY                           │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ MS-BIONIC   │ MS-COMMERCE │  MS-AUTH    │ MS-ANALYTICS    │
│ Territory   │ Orders/Pay  │  Users/JWT  │ Stats/Reports   │
│ + WMS Proxy │             │             │                 │
└─────────────┴─────────────┴─────────────┴─────────────────┘
```

### Key Components
```
/app/
├── backend/
│   ├── server.py                    # Main FastAPI (4500+ lines)
│   ├── services/                    # ⭐ Microservice modules
│   │   └── bionic_territory/        # BIONIC Territory Service v1.1
│   │       ├── routes/
│   │       │   └── territory_routes.py  # + WMS Proxy endpoints
│   │       └── __init__.py
│   └── ...
├── frontend/src/
│   ├── modules/                     # ⭐ Micro-Frontend modules
│   │   └── bionic-territory/        # BIONIC Territory Module v1.1
│   │       ├── context/
│   │       │   └── BionicTerritoryContext.jsx
│   │       ├── components/
│   │       │   ├── header/TerritoryHeader.jsx  # NEW
│   │       │   ├── sidebar/LayersSidebar.jsx
│   │       │   ├── sidebar/LayersPanelContent.jsx  # NEW
│   │       │   └── controls/MapControlButtons.jsx
│   │       └── index.js
│   ├── pages/
│   │   └── MonTerritoireBionicPage.jsx  # (En cours de refactoring)
│   └── ...
├── docs/
│   └── ARCHITECTURE.md              # Documentation architecture
└── memory/PRD.md
```

---

## User Personas

1. **Chasseur Amateur** - Découvre la chasse, cherche des conseils et équipements
2. **Chasseur Expérimenté** - Utilise l'analyse de territoire et les attractants scientifiques
3. **Gestionnaire de Pourvoirie** - Gère des territoires, locations, partenariats
4. **Administrateur** - Gère produits, commissions, backups, site

---

## Core Requirements (Static)

### Must Have
- [x] Homepage avec hero section et navigation
- [x] Analyse de produits avec IA (Click & Analyse)
- [x] Boutique e-commerce (dropshipping + affiliation)
- [x] Carte interactive du Québec (BIONIC™ Territory Engine)
- [x] Système d'administration complet
- [x] Système de parrainage

### Should Have
- [x] Marketplace peer-to-peer
- [x] Formations FédéCP & BIONIC Academy
- [x] Networking Hub pour chasseurs
- [x] Export ZIP automatique
- [x] Backup MongoDB Atlas
- [x] Backup Google Cloud Storage

---

## What's Been Implemented

### Phase 52r (January 30, 2026 - Session 3) - Refonte UI Professionnelle ✅ **NOUVEAU**

**Refonte visuelle professionnelle et scientifique du module Mon Territoire BIONIC™**

#### 🎨 UI Professionnelle Complétée
- ✅ **SpeciesSelector avec photos réalistes**
  - 4 espèces avec photos de haute qualité (Pexels/Unsplash)
  - Orignal (Alces alces) - Photo de mâle mature avec panache
  - Chevreuil (Odocoileus virginianus) - Buck mature avec bois
  - Ours Noir (Ursus americanus) - Mâle adulte en forêt boréale
  - Dindon Sauvage (Meleagris gallopavo) - Tom en parade
  - Noms latins scientifiques en italique
  - Descriptions professionnelles pour chaque espèce
  - Thumbnail circulaire avec bordure orange
  - Footer "BIONIC™ Species Database v3.3"

- ✅ **HabitatScoreDropdown avec icônes Lucide**
  - Remplacement de tous les emojis par icônes Lucide
  - 8 modules thématiques avec icônes: Home, CloudSun, Crosshair, Sprout, Activity, Flame, TreePine, Mountain
  - Cercle de progression SVG pour le score
  - Badge compteur "X/8 ACTIFS"
  - Noms scientifiques pour chaque module (ex: "Habitat Suitability Index")
  - Indicateurs ON/OFF verticaux avec effet glow
  - Footer "BIONIC™ v3.3"

- ✅ **Configuration centralisée**
  - `/app/frontend/src/config/ProfessionalAssets.js` mis à jour
  - `SPECIES_IMAGES` avec thumbnails, fullSize, portraits
  - `THEMATIC_MODULES_CONFIG` avec icônes et couleurs
  - `getScoreRatingScientific()` pour les ratings dynamiques
  - `RATING_ICONS` mapping pour TrendingUp, ThumbsUp, etc.

#### ✅ Tests Validés (100% succès)
- 12/12 tests frontend passés
- Sélecteur d'espèce fonctionnel avec changement de sélection
- Dropdown Habitat Score avec icônes Lucide
- Cercle de progression SVG
- Navigation vers /mon-territoire-bionic

### Phase 52q (January 29, 2026 - Session 3) - Refactoring Architectural + Analyse Zone ✅

**Migration vers architecture modulaire + Fonctionnalité Analyse par Waypoint**

#### 🏗️ Refactoring Complété
- ✅ **Intégration de TerritoryHeader** dans `MonTerritoireBionicPage.jsx`
  - Header inline de ~350 lignes remplacé par le composant modulaire
  - Réduction de 3192 → 2934 lignes (-258 lignes, -8%)
  - Props passées: tabs, LIVE mode, sync, notifications, groupes, waypoints, espèce
- ✅ **Variables d'état nettoyées**
  - `showNotificationsPanel` supprimé (géré dans TerritoryHeader)

#### 🎯 Analyse par Waypoint (ZoneAnalysisControlPanel) ✅
- ✅ **ZoneAnalysisControlPanel intégré** dans le sidebar sous OVERLAY TOPOGRAPHIQUE
  - Sélecteur de waypoint avec dropdown (4 waypoints disponibles)
  - Sélection de zone d'analyse: 2 km² (restreinte), 4 km² (moyenne), 10 km² (étendue)
  - Bouton "Analyser la zone" avec feedback visuel
  - Message d'avertissement UX si pas de waypoint sélectionné
- ✅ **WaypointZoneAnalysis** intégré dans le MapContainer
  - Affichage de la zone d'analyse circulaire
  - Identification du hotspot optimal
  - Toast de notification avec score et distance
- ✅ **MODE TEMPS RÉEL ACTIVÉ** 🔥
  - Toggle "Mode Temps Réel" avec Switch (activé par défaut)
  - Sélection d'un waypoint → Analyse automatique instantanée
  - Carte centrée automatiquement (zoom 14)
  - Toast: "🔍 Analyse en cours..." puis "🎯 Hotspot optimal identifié: XX%"
  - Changement de zone (2/4/10 km²) → Re-analyse automatique

#### 🛰️ Backend WMS Connecté (Données Réelles Québec) ✅ **NOUVEAU**
- ✅ **Nouvel endpoint `/api/bionic-territory/analyze/advanced`** créé
  - Interrogation des sources WMS gouvernementales:
    - Carte Écoforestière (peuplements, densité, hauteur)
    - LiDAR Dendrométrique (canopée)
    - Indice d'Humidité TWI (zones humides)
    - Hydrographie (cours d'eau)
  - Génération de zones comportementales basée sur les données réelles
  - Calcul du hotspot optimal avec score et distance
  - Recommandations de chasse personnalisées
- ✅ **Frontend connecté au backend**
  - Appel API automatique à la sélection du waypoint
  - Fallback vers simulation si API indisponible
  - Affichage enrichi: heure optimale, stratégie d'approche, source des données
- ✅ **Types de comportement unifiés** (backend + frontend)
  - cover/shelter, feeding/browse, travel/corridor, water, rest/bedding, hotspot

#### 📊 États ajoutés pour l'analyse
- `zoneAnalysisEnabled` - Activation/désactivation de l'analyse
- `zoneAnalysisWaypoint` - Waypoint sélectionné pour l'analyse
- `zoneAnalysisArea` - Zone sélectionnée ('2', '4', '10' km²)
- `zoneAnalysisResult` - Résultat de l'analyse (hotspot)
- `zoneAnalysisCollapsed` - État du panneau (replié/déplié)

#### ✅ Tests Validés (100% succès)
- 22/22 tests frontend passés
- ZoneAnalysisControlPanel visible et fonctionnel
- Légendes COMPORTEMENTS GIBIER et PEUPLEMENTS FORESTIERS visibles
- Scores BIONIC: HABITAT 63, METEO 50, APPROCHE 96

### Phase 52p (January 29, 2026 - Session 2) - Architecture Modulaire + WMS Proxy ✅

**Refactoring architectural + Proxy WMS pour données Québec**

Nouvelles fonctionnalités implémentées:

#### 🔧 Backend - WMS Proxy Service
- ✅ **WMS Proxy Endpoints** dans `territory_routes.py`
  - `GET /api/bionic-territory/wms/sources` - Liste des sources WMS disponibles
  - `GET /api/bionic-territory/wms/tile` - Proxy pour récupérer les tuiles WMS
  - `GET /api/bionic-territory/wms/capabilities/{source}` - Capacités WMS d'une source
- ✅ **4 sources WMS configurées** :
  - `quebec_eco` - Carte écoforestière du Québec (peuplements)
  - `quebec_lidar` - Données LiDAR dendrométriques
  - `quebec_terrain` - Indices topographiques (TWI)
  - `canada_nfi` - National Forest Inventory (fallback)
- ✅ **Contournement CORS/IP** - Le proxy backend fait les requêtes serveur-à-serveur

#### 🎨 Frontend - Nouveaux composants modulaires
- ✅ **TerritoryHeader.jsx** (400+ lignes)
  - Header complet avec navigation, tabs, notifications, groupes
  - Sous-composants: `NotificationsPanel`, `WaypointCreationMenu`, `GroupsMenu`, `SpeciesSelector`
- ✅ **LayersPanelContent.jsx** (350+ lignes)
  - Contenu du panneau latéral modulaire
  - Sous-composants: `BaseMapSection`, `PipelineSection`, `BionicLayersSection`, `EcoforestrySection`, `PrivacySection`
- ✅ **BionicForestZonesLayer.jsx** v2.0
  - Support des couches WMS Québec via proxy
  - Props: `showQuebecEco`, `showQuebecLidar`, `showQuebecTWI`
  - Export de `WMS_PROXY_CONFIG`

#### 📦 Module bionic-territory v1.1
- ✅ **index.js** mis à jour avec nouveaux exports
- ✅ Nouveaux composants disponibles via le module

**API Endpoints ajoutés:**
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/bionic-territory/wms/sources` | Liste des sources WMS |
| GET | `/api/bionic-territory/wms/tile` | Proxy tuile WMS |
| GET | `/api/bionic-territory/wms/capabilities/{source}` | GetCapabilities XML |
| GET | `/api/bionic-territory/health` | Health check v1.1 |

**Tests réussis:**
- ✅ Proxy WMS fonctionne (code 200)
- ✅ Build frontend réussi
- ✅ Page Mon Territoire charge correctement

### Phase 52o (January 29, 2026) - BIONIC™ v3.3 Intelligence Plus + Visuel 10X ✅

**Carte BIONIC™ avec effet visuel 10X plus distinctif**

Nouvelles fonctionnalités implémentées:
- ✅ **BionicMapOverlay.jsx** - Overlay visuel avec bordure orange pulsante
  - Bordure lumineux orange/jaune animée autour de la carte
  - Effet de lueur (glow) pulsant 3s
  - Scores HABITAT OPTIMAL / MÉTÉO / APPROCHE en haut de carte
  - Légende PEUPLEMENTS BIONIC™ avec couleurs vives
- ✅ **BionicForestZonesLayer.jsx** - Zones de peuplements forestiers très colorées
  - 9 types de peuplements avec couleurs néon distinctives
  - Résineux dense (#00ff66), Résineux (#00cc44), Mixte (#66ff33)
  - Feuillus (#ffdd00), Jeune forêt (#88ffcc), Forêt mature (#009944)
  - Milieu humide (#00ffcc), Perturbation (#ff6699)
  - Tooltips avec score habitat et description
  - Popups détaillés au clic
- ✅ **BionicMapGenerator.js** mis à jour vers v3.3_BIONIC_INTELLIGENCE_PLUS_SCORING_TOTAL
  - Variables universelles V1-V11 avec scoring détaillé
  - COULEURS_BIONIC_SIGNATURE exportées pour tout le système
  - Scoring par variable, module, espèce, météo, approche, simulation

**Différences visuelles majeures BIONIC vs autres fonds:**
| Élément | BIONIC™ Actif | Satellite/Terrain |
|---------|---------------|-------------------|
| Bordure | Orange pulsante | Aucune |
| Scores | Affichés en haut | Cachés |
| Légende peuplements | Visible à droite | Cachée |
| Zones forestières | Colorées sur carte | Cachées |
| Hotspots | Visibles | Cachés |

**Fichiers créés:**
- `/app/frontend/src/components/territoire/BionicMapOverlay.jsx` (500+ lignes)
- `/app/frontend/src/components/territoire/BionicForestZonesLayer.jsx` (450+ lignes)

**Fichiers modifiés:**
- `/app/frontend/src/services/BionicMapGenerator.js` - Upgrade v3.3
- `/app/frontend/src/pages/MonTerritoireBionicPage.jsx` - Intégration overlay et zones

### Phase 52n (January 29, 2026) - GENERATEUR_CARTE_BIONIC v3.1 + Rendu Visuel + Toggle ON-OFF ✅

**Intelligence BIONIC™ Plus - Génération complète de carte avec analyse IA + Visualisation + Contrôle**

Nouvelles fonctionnalités implémentées:
- ✅ **Service BionicMapGenerator.js** (600+ lignes) - Moteur de génération complet
- ✅ **11 Modules Thématiques** : Refuge, Fraîcheur, Alimentation, Déplacements, Dortoir, Rut, Salines, Affûts, Hydrographie, Ensoleillement, Peuplements
- ✅ **Module Météo/Saison** - Analyse température, vent, pression, précipitations avec facteurs d'ajustement
- ✅ **Module Habitat Optimal** - Calcul pondéré avec convergence, rareté, cohérence spatiale
- ✅ **Analyse Alimentaire 200%** - Qualité alimentaire, adéquation espèce, carences nutritionnelles
- ✅ **Module Approche Optimale** - Direction d'approche, position affût, conseils tactiques
- ✅ **Moteur Simulation IA** - Probabilité présence, fenêtres de tir, zones de concentration
- ✅ **Extraction Hotspots** - Identification automatique des meilleurs points de chasse
- ✅ **Recommandations IA** - Affût, salines, nutrition, déplacement, saison, approche, fenêtres tir
- ✅ **Recommandations Produits BIONIC™** - Catalogue avec suggestions basées sur carences
- ✅ **BionicGeneratorPanel.jsx** - Interface utilisateur avec sections collapsibles
- ✅ **BionicHotspotsLayer.jsx** - Rendu visuel sur carte Leaflet
- ✅ **Toggle ON-OFF Pipeline** - Bouton pour activer/désactiver le pipeline et les hotspots
  - Hotspots avec cercles colorés (haute/moyenne/basse priorité)
  - Marqueurs animés avec score et icône
  - Trajet d'approche avec ligne pointillée violette
  - Point d'entrée (🚶 vert) et position d'affût (🎯 rouge)
  - Indicateur de direction du vent
  - Zones de concentration de la simulation IA
  - Popups détaillés au clic sur chaque hotspot

**Architecture du générateur v3.1:**
```
GENERATEUR_CARTE_BIONIC v3.1_BIONIC_INTELLIGENCE_PLUS
├── ÉTAPE 1: Normalisation données (résolution 10m)
├── ÉTAPE 2: Calcul modules thématiques (11 modules)
├── ÉTAPE 3: Module météo/saison (facteurs habitat + mouvement)
├── ÉTAPE 4: Module maître habitat optimal + Analyse 200%
├── ÉTAPE 5: Module approche optimale (vent, couvert, relief)
├── ÉTAPE 6: Moteur simulation IA (déplacements gibier)
├── ÉTAPE 7: Extraction hotspots (seuil 80)
├── ÉTAPE 8: Rendu cartographique (hotspots + trajets)
├── ÉTAPE 9: Recommandations IA
├── ÉTAPE 10: Recommandations produits
└── ÉTAPE 11: Sortie utilisateur (carte interactive)
```

**Fichiers créés:**
- `/app/frontend/src/services/BionicMapGenerator.js` - Service générateur complet
- `/app/frontend/src/components/territoire/BionicGeneratorPanel.jsx` - UI panneau
- `/app/frontend/src/components/territoire/BionicHotspotsLayer.jsx` - **NOUVEAU** - Rendu visuel carte

**Fichiers modifiés:**
- `/app/frontend/src/pages/MonTerritoireBionicPage.jsx` - Intégration panneau + hotspots sur carte

### Phase 52m (January 29, 2026) - BIONIC™ Pan-Canadien Fusionné v1.0 ✅

**Carte BIONIC™ unifiée avec pipeline BIONIC_VECTOR_TILES_CANADA intégré**

Changements:
- ✅ **Fusion complète** des cartes "BIONIC™" et "BIONIC™ Canada" en une seule option
- ✅ **Suppression** de l'option "BIONIC™ Canada" séparée
- ✅ **8 couches de données** intégrées dans BIONIC™ : Topographie, Géologie, Hydrologie, Écoforestier, Administratif, Routes, Urbain, Score Faunique
- ✅ **5 niveaux de zoom adaptatifs** avec simplification géométrique progressive
- ✅ **Tuiles vectorielles** activées automatiquement pour BIONIC™
- ✅ **Interface simplifiée** - 3 options de fond de carte seulement (BIONIC™, Satellite, Terrain)

**Architecture finale BIONIC™:**
```
BIONIC™ (fusionné avec BIONIC_VECTOR_TILES_CANADA v1.0.0)
├── Couverture: Canada [-141.0, 41.7] à [-52.6, 83.1]
├── Projection: EPSG:3857 (Web Mercator)
├── Format: Vector tiles (.pbf)
├── Source: Mapbox Vector Tiles
├── Zoom levels:
│   ├── [0-4] Global - Simplification aggressive
│   ├── [5-7] Régional - Simplification moderate
│   ├── [8-10] Local - Simplification light
│   ├── [11-14] Détaillé - Simplification minimal
│   └── [15-18] Précision - Aucune simplification
└── Couches:
    ├── Topographie (50%) - RNCan CanVec + USGS SRTM
    ├── Géologie (OFF) - RNCan Bedrock + Surficial
    ├── Hydrologie (70%) - RNCan NHN + MFFP
    ├── Écoforestier (60%) - MFFP + NRCan EOSD
    ├── Administratif (80%) - StatCan + RNCan Atlas
    ├── Routes (90%) - StatCan + OSM
    ├── Urbain (40%) - StatCan Population Centres
    └── Score Faunique (80%) - BIONIC™ Engine
```

**Fichiers modifiés:**
- `/app/frontend/src/components/territoire/EcoforestryLayers.jsx` - Fusion BASE_MAPS, suppression bionic_canada
- `/app/frontend/src/pages/MonTerritoireBionicPage.jsx` - Suppression bouton BIONIC Canada, sous-couches fusionnées

### Phase 52l (January 29, 2026) - HABITAT_OPTIMAL_SYNTHESE Visualisation Temps Réel ✅

**Connexion complète du module Habitat Synthèse à la carte BIONIC™**

Nouvelles fonctionnalités:
- ✅ **Score Habitat Dynamique** - Les zones recalculent leur score selon l'espèce sélectionnée
- ✅ **Tooltip enrichi** - Affiche le score Habitat Optimal avec niveau (EXCELLENT/TRÈS BON/BON/MOYEN/FAIBLE)
- ✅ **Poids du module** - Chaque zone affiche son poids dans le calcul pour l'espèce cible
- ✅ **Tri par priorité habitat** - Les zones à fort score habitat sont rendues au premier plan
- ✅ **Endpoint auth/login** - Authentification utilisateur implémentée (manquait)
- ✅ **Endpoint auth/register** - Inscription utilisateur implémentée
- ✅ **Endpoint auth/verify** - Vérification de token

**Fichiers modifiés:**
- `/app/frontend/src/pages/MonTerritoireBionicPage.jsx` - Passage `selectedEspece` à BionicMicroZones
- `/app/frontend/src/components/territoire/BionicMicroZones.jsx` - Intégration score habitat:
  - Ajout prop `selectedEspece`
  - Calcul `adjustedScore` avec `calculateAdjustedScore()`
  - Calcul `moduleWeight` avec `getModuleWeight()`
  - Nouveau bloc tooltip "🎯 Habitat Optimal" avec couleur dynamique
  - Tri des zones par `habitatScore` au lieu de `percentage`
- `/app/backend/server.py` - Ajout endpoints auth (login, register, verify, logout, etc.)

**Flux de données:**
```
1. User sélectionne espèce → HabitatSynthesePanel.onEspeceChange()
2. MonTerritoireBionicPage.setSelectedEspece(espece)
3. BionicMicroZones reçoit selectedEspece
4. useMemo recalcule zones avec calculateAdjustedScore(zone, espece)
5. MicroZone affiche habitatScore dans tooltip
6. Zones triées par renderPriority = habitatScore
```

### Phase 52k (January 29, 2026) - MODULE_HABITAT_OPTIMAL_SYNTHESE v2.0 ✅

**Module de synthèse habitat optimal intégré à Mon Territoire BIONIC™**

Nouvelles fonctionnalités:
- ✅ **12 modules thématiques** combinés avec pondérations
- ✅ **4 espèces supportées** : Orignal, Chevreuil, Ours Noir, Dindon
- ✅ **Pondérations spécifiques** par espèce (ex: Orignal = 20% refuge, 20% alimentation)
- ✅ **Analyse Alimentaire 200%** avec évaluation des carences nutritionnelles
- ✅ **Convergence** : renforce zones où plusieurs modules convergent
- ✅ **Rareté** : valorise zones rares mais critiques (+15% bonus)
- ✅ **Cohérence spatiale** : moyenne des voisins 3x3
- ✅ **Identification Top 10** des meilleurs points de chasse
- ✅ **Panneau UI** avec sélecteur d'espèce et statistiques

**Modules entrants:**
| Module | Description |
|--------|-------------|
| ZONES_DE_REFUGE | Couvert dense pour protection |
| ZONES_DE_FRAICHEUR | Points d'eau et zones humides |
| ZONES_D_ALIMENTATION | Ressources alimentaires |
| ZONES_DE_DEPLACEMENTS | Corridors de circulation |
| ZONES_DORTOIR | Aires de repos |
| RUT_POTENTIEL | Zones de reproduction |
| SALINES_POTENTIELLES | Sources de minéraux |
| AFFUTS_POTENTIELS | Points d'observation |
| HYDROGRAPHIE_AVANCEE | Réseau hydrique |
| ENSOLEILLEMENT | Exposition solaire |
| ORIENTATION | Exposition des pentes |
| PEUPLEMENTS_FORESTIERS | Types de forêts |

**Pondérations Orignal (exemple):**
- Zones de refuge: 20%
- Zones d'alimentation: 20%
- Analyse alimentaire 200%: 20%
- Zones de déplacements: 15%
- Hydrographie: 10%
- Fraîcheur: 10%
- Dortoir: 10%

**Nouveaux fichiers:**
- `/app/frontend/src/services/HabitatOptimalService.js` (600+ lignes)
- `/app/frontend/src/components/territoire/HabitatSynthesePanel.jsx` (400+ lignes)

**Intégration:**
- Ajouté dans `MonTerritoireBionicPage.jsx` après WaterMaskStats
- Sélecteur d'espèce avec calcul automatique
- Affichage pondérations, statistiques et Top 10

### Phase 52j (January 28, 2026) - Panneau Admin Module Urbain ✅

**Panneau d'administration complet pour le module urbain BIONIC™**

Nouvelles fonctionnalités:
- ✅ **Nouveau tab Admin** "Module Urbain" avec badge v7
- ✅ **Paramètres configurables** via sliders interactifs :
  - Buffer urbain (500m - 5000m, défaut 2000m)
  - Rayon de recherche (1000m - 10000m, défaut 5000m)
  - Distance minimale (500m - 5000m, défaut 2000m)
  - Points candidats (8 - 72, défaut 36)
- ✅ **Toggle Contrôle QA** - Activer/désactiver la validation
- ✅ **Toggle Mode debug** - Logs détaillés console
- ✅ **Section Rapport QA Urbain** - Visualisation des contrôles avec export JSON
- ✅ **Section Statistiques** - Zones analysées, relocalisées, conformes, exclues
- ✅ **Section Zones Urbaines** - Liste des 7 couches avec toggle individuel
- ✅ **Bouton Réinitialiser** - Restaure les valeurs par défaut

**Nouveau fichier:**
- `/app/frontend/src/components/admin/UrbanModuleAdminPanel.jsx` (500+ lignes)

**Fichier modifié:**
- `/app/frontend/src/pages/AdminPage.jsx` - Intégration du nouveau tab

### Phase 52i (January 28, 2026) - BIONIC_URBAN_MODULE Complet v7 ✅

**Module urbain autonome BIONIC™ avec buffer 2000m, relocalisation intelligente et QA complet**

Nouvelles fonctionnalités:
- ✅ **Buffer 2000m** - Exclusion stricte dans un rayon de 2000m autour des zones urbaines
- ✅ **Relocalisation 5000m** - Rayon de recherche étendu pour trouver le meilleur score
- ✅ **7 couches urbaines** - U_VILLES, U_VILLAGES, U_RESIDENTIEL, U_COMMERCIAL, U_INDUSTRIEL, U_DENSE, U_MUNICIPAL
- ✅ **URBAIN_FULL** - Union de toutes les couches urbaines
- ✅ **URBAIN_FULL_BUFFER_2000M** - Buffer géométrique automatique
- ✅ **QA_URBAN_REPORT** - Contrôle qualité avec 5 vérifications strictes
- ✅ **Compatible hydrographie** - Évite WATER_FULL et WATER_BUF_5M si disponibles

**Règles d'exclusion urbaines:**
| ID | Type | Action |
|----|------|--------|
| EXCL_INTERSECTS_URBAIN | Intersecte URBAIN_FULL | Flag |
| EXCL_INTERSECTS_URBAIN_BUFFER | Intersecte buffer 2000m | Flag |
| EXCL_CENTROID_IN_URBAIN | Centroïde dans URBAIN_FULL | Flag |
| EXCL_CENTROID_IN_URBAIN_BUFFER | Centroïde dans buffer | Flag |

**Relocalisation RELOCATE_FROM_URBAN_2000M:**
```
search_radius: 5000m
avoid_layers: [URBAIN_FULL, URBAIN_FULL_BUFFER_2000M, WATER_FULL, WATER_BUF_5M]
strategy: highest_score
constraints: distance >= 2000m de URBAIN_FULL
```

**Contrôle Qualité QA_URBAN_2000M:**
| Check | Description |
|-------|-------------|
| QA_URBAN_INTERSECT | Vérifie non-intersection avec URBAIN_FULL |
| QA_URBAN_INTERSECT_BUFFER | Vérifie non-intersection avec buffer |
| QA_URBAN_CENTROID | Centroïde hors URBAIN_FULL |
| QA_URBAN_CENTROID_BUFFER | Centroïde hors buffer |
| QA_URBAN_DISTANCE | Distance >= 2000m de l'urbain |

**Nouveaux fichiers:**
- `/app/frontend/src/services/UrbanExclusionService.js` - Module urbain complet (600+ lignes)

**Fichiers modifiés:**
- `/app/frontend/src/services/WaterExclusionService.js` - Intégration module v7
- `/app/frontend/src/components/territoire/WaterMaskStats.jsx` - Affichage QA et buffer 2000m
- `/app/frontend/src/pages/MonTerritoireBionicPage.jsx` - Utilisation module v7

**Villes et zones urbaines couvertes:**
- Québec (centre, Limoilou, Montcalm, Sainte-Foy, Beauport, Charlesbourg, Cap-Rouge)
- Lévis (centre)
- Montréal (centre-ville)
- Trois-Rivières
- Sherbrooke
- Gatineau
- Saguenay

### Phase 52h (January 28, 2026) - Règle de Relocalisation Urbaine ✅

**RELOCATE_FROM_URBAN_200M - Relocalisation automatique des zones en milieu urbain**

Nouvelles fonctionnalités:
- ✅ **Détection zones urbaines** - Polygones définis pour Québec, Lévis, Montréal
- ✅ **Relocalisation 200m** - Vers la position avec le meilleur score d'attractivité
- ✅ **Stratégie highest_score** - Évaluation des positions candidates par score pondéré
- ✅ **Validation multiple** - Point non-urbain ET non-aquatique
- ✅ **Service unifié v6** - `filterAndRelocateZones()` applique EAU puis URBAIN
- ✅ **Statistiques détaillées** - `fromWater`, `fromUrban`, `unchanged`, `excluded`

**Règles de relocalisation actives:**
| Règle | Condition | Action |
|-------|-----------|--------|
| RELOCATE_FROM_WATER_5M | Zone sur eau | → 5m vers terre la plus proche |
| RELOCATE_FROM_URBAN_200M | Zone en milieu urbain | → 200m vers meilleur score |

**Fichiers modifiés:**
- `/app/frontend/src/services/WaterExclusionService.js` - Ajout de `filterAndRelocateZones()`
- `/app/frontend/src/pages/MonTerritoireBionicPage.jsx` - Utilisation de la nouvelle fonction
- `/app/frontend/src/components/territoire/WaterMaskStats.jsx` - Affichage stats urbain

**Zones urbaines définies:**
- Québec (Vieux-Québec, Sainte-Foy, Beauport)
- Lévis
- Montréal (centre-ville et environs)

### Phase 52g (January 28, 2026) - Styles Cartographiques BIONIC™ Universels ✅

**Système de styles cartographiques multi-moteur pour les zones BIONIC™**

Nouvelles fonctionnalités:
- ✅ **Couleurs officielles** définies pour 10 catégories de zones
- ✅ **Cercles avec intérieur transparent** - Seul le halo coloré est visible
- ✅ **Halo adaptatif au zoom** - Épaisseur variant de 1px (zoom 5) à 16px (zoom 18)
- ✅ **Compatibilité Leaflet** - Fonctions `getLeafletCircleStyle()` et `getLeafletHaloStyle()`
- ✅ **Compatibilité Mapbox GL** - Configuration complète avec interpolation de zoom
- ✅ **Compatibilité QGIS** - Génération de fichiers QML avec variables de zoom
- ✅ **Compatibilité ArcGIS** - Symboles CIM avec expressions Arcade
- ✅ **Styles panneau latéral** - Icônes, pastilles et textes colorés automatiquement

**Couleurs officielles par catégorie:**
| Zone | Couleur |
|------|---------|
| Habitats optimaux | #2ECC71 (Vert) |
| Rut potentiel | #C0392B (Rouge) |
| Salines potentielles | #3498DB (Bleu) |
| Affûts potentiels | #E67E22 (Orange) |
| Trajets de chasse | #8E44AD (Violet) |
| Peuplements forestiers | #6E2C00 (Brun) |
| Ensoleillement | #F1C40F (Jaune) |
| Orientation | #A04000 (Terre cuite) |
| Hydrographie avancée | #5DADE2 (Bleu clair) |
| Zones d'alimentation | #A3E635 (Vert lime) |

**Nouveaux fichiers créés:**
- `/app/frontend/src/styles/BionicZoneStyles.js` - Configuration des styles multi-moteur
- `/app/frontend/src/styles/BionicStyleExporter.js` - Export vers QGIS/ArcGIS/Mapbox
- `/app/frontend/src/styles/bionic-zones.css` - CSS pour les zones et le panneau

**Intégration:**
- Import du CSS dans `App.js`
- `BionicMicroZones.jsx` mis à jour avec les couleurs officielles
- Hook `useBionicZoneStyles(zoom)` pour accéder aux styles dynamiques

### Phase 52f (January 28, 2026) - Collapse/Expand Arrow for Auto-Optimization ✅

**Flèche collapse/expand ajoutée au module Auto-Optimisation**

Nouvelles fonctionnalités:
- ✅ **Flèche collapse/expand** dans le header du module (ChevronDown/ChevronUp)
- ✅ **Header cliquable** pour replier/déplier tout le contenu du module
- ✅ **Animation fluide** avec transition entre les états
- ✅ **Icône avec effet hover** (gris -> blanc au survol)
- ✅ **Boutons header non affectés** par le clic (toggle ON/OFF, Paramètres)

**Comportement:**
- État déplié par défaut (contenu visible)
- Clic sur header → replie tout le contenu (tabs, boutons, propositions)
- Flèche change de direction selon l'état

### Phase 52e (January 28, 2026) - Email Notifications & Toggle Control ✅

**Notifications par email et contrôle ON/OFF ajoutés**

Nouvelles fonctionnalités:
- ✅ **Toggle ON/OFF** du module visible dans le header (badge ACTIF/INACTIF)
- ✅ **Panneau de configuration** accessible via bouton "Paramètres"
- ✅ **Notifications email** configurables avec adresse email personnalisée
- ✅ **Désactivation complète** du module possible (boutons grisés)
- ✅ **Email automatique** lors de nouvelles propositions d'optimisation
- ✅ **Email automatique** lors de création de backup

**API Endpoints ajoutés:**
- `GET /api/admin/optimization/config` - Récupérer la configuration
- `POST /api/admin/optimization/config` - Sauvegarder la configuration
- `POST /api/admin/optimization/toggle` - Toggle rapide ON/OFF

### Phase 52d (January 28, 2026) - Auto-Optimization Module BIONIC™ ✅

**Module d'Auto-Optimisation avec approbation administrateur**

Fonctionnalités implémentées:
- ✅ Génération automatique de propositions d'optimisation
- ✅ Résumé des modifications proposées pour chaque suggestion
- ✅ Bouton **"Accepter les changements"** pour approbation admin
- ✅ Bouton **"Rejeter"** pour refuser les propositions
- ✅ Création automatique de backup avant application des changements
- ✅ Historique des versions avec possibilité de restauration
- ✅ Auto-analyse du système avec suggestions intelligentes

**Nouveaux fichiers créés:**
- `/app/frontend/src/services/AutoOptimizationService.js` - Service frontend
- `/app/frontend/src/components/admin/AutoOptimizationPanel.jsx` - UI Admin
- `/app/backend/auto_optimization.py` - API Backend complète

**API Endpoints:**
- `POST /api/admin/optimization/analyze` - Lancer l'auto-analyse
- `GET /api/admin/optimization/proposals` - Liste des propositions
- `POST /api/admin/optimization/proposals/{id}/approve` - Approuver
- `POST /api/admin/optimization/proposals/{id}/reject` - Rejeter
- `GET /api/admin/optimization/versions` - Historique versions
- `POST /api/admin/optimization/versions` - Créer backup
- `POST /api/admin/optimization/versions/{id}/restore` - Restaurer

### Phase 52c (January 28, 2026) - Modular Refactoring ✅

**Découpage progressif de MonTerritoireBionicPage.jsx**
- Fichier principal réduit de 2793 → 2718 lignes
- Création de composants modulaires mémorisés (React.memo)

**Nouveaux composants créés:**
- `GPSLiveDisplay.jsx` (96 lignes) - Affichage GPS LIVE avec flèche
- `WaterMaskStats.jsx` (75 lignes) - Panneau statistiques masque hydrique
- `ZoneControlPanel.jsx` (101 lignes) - Contrôles d'affichage des zones
- `MapToolbar.jsx` (188 lignes) - Barre d'outils de la carte
- `LayersPanel.jsx` - Panneau de gestion des couches

**Nouveaux hooks:**
- `useMapState.js` (185 lignes) - Hooks pour état de carte, curseur, dialogues

**Optimisations mémoire:**
- Composants mémorisés avec React.memo
- Cache des résultats de filtrage des zones (60 sec)
- Limite de 2 waypoints actifs

### Phase 52b (January 28, 2026) - Waypoint Limit & Memory Optimization ✅

**Limite de 2 waypoints actifs pour optimisation mémoire**
- Maximum 2 waypoints peuvent être actifs simultanément
- Message d'avertissement toast quand limite atteinte
- Conseil de performance affiché lors de la première activation
- Badge visuel "X/2" dans l'interface waypoints
- Avertissement permanent visible dans le panneau waypoints
- Switches désactivés visuellement quand limite atteinte

**Files Modified:**
- `/app/frontend/src/hooks/useUserData.js` (logique de limite)
- `/app/frontend/src/pages/MonTerritoireBionicPage.jsx` (UI avertissement)

### Phase 52 (January 28, 2026) - Water Exclusion & GPS LIVE ✅

**CRITICAL FIX: BIONIC Water Mask v5 - Zone Relocation**
- Zones d'attraction dans l'eau sont maintenant **RELOCALISÉES** à 5m à l'intérieur des terres
- Aucune zone n'est plus exclue - toutes sont relocalisées vers la terre la plus proche
- Polygone complet de l'Île d'Orléans pour une détection précise
- Algorithme de recherche en 72 directions pour trouver la terre la plus proche
- Statistiques affichées: "Relocalisées: X" au lieu de "Exclues: X"

**GPS LIVE Enhancement**
- Design amélioré avec flèche triangulaire pointant vers le bas
- Bulle d'info avec bordure orange
- Animation du point GPS

**Files Modified:**
- `/app/frontend/src/services/WaterExclusionService.js` (REFACTORED - v5)
- `/app/frontend/src/pages/MonTerritoireBionicPage.jsx` (GPS LIVE design)

### Phase 51+ (January 27, 2026) - Cloud Backup System ✅

**NEW Features:**
1. **MongoDB Atlas Replication**
   - Configuration via Admin > BACKUP > MongoDB Atlas
   - Guide de configuration intégré
   - Synchronisation manuelle et automatique
   - API: `/api/backup-cloud/atlas/*`

2. **Google Cloud Storage Backup**
   - Configuration via Admin > BACKUP > Google Cloud
   - Guide de configuration intégré
   - Upload automatique vers GCS
   - API: `/api/backup-cloud/gcs/*`

3. **ZIP Export Automatique**
   - Fichier `HUNTIQ_BACKUP.zip` mis à jour automatiquement
   - Intervalle configurable (par défaut: 1 minute)
   - Téléchargement direct depuis l'admin
   - Instructions pour placement sur Bureau > BIONIC APPS

4. **Interface Admin Améliorée**
   - Onglet BACKUP avec 5 sous-onglets:
     - Vue d'ensemble
     - MongoDB Atlas
     - Google Cloud
     - ZIP Export
     - Auto Backup
   - Statistiques en temps réel
   - Logs d'activité

**Files Created/Modified:**
- `/app/backend/backup_cloud.py` (NEW - 750+ lines)
- `/app/frontend/src/components/CloudBackupManager.jsx` (NEW - 700+ lines)
- `/app/frontend/src/pages/AdminPage.jsx` (MODIFIED)
- `/app/frontend/src/pages/FormationsPage.jsx` (NEW - fixed)

### Previous Phases (1-50)
- Homepage BIONIC™ avec design premium
- Module d'analyse IA avec détection automatique
- E-commerce complet (dropshipping + affiliation)
- Carte interactive du Québec avec heatmaps
- Marketplace de chasse
- Système de parrainage
- Gestion des partenaires
- 50+ autres fonctionnalités

---

## Prioritized Backlog

### P0 - Critical (Completed) ✅
- [x] Relocalisation des zones BIONIC hors de l'eau (BIONIC_water_mask_v5)
- [x] GPS LIVE avec flèche pointant vers le bas
- [x] MODULE_HABITAT_OPTIMAL_SYNTHESE intégré
- [x] Visualisation temps réel des scores habitat par espèce
- [x] **WMS Proxy Backend** - Contournement CORS/IP pour données Québec ✅
- [x] **Composants modulaires créés** - TerritoryHeader, LayersPanelContent ✅
- [x] **Panneau Couches Données Québec** - UI complète avec toggles et sliders ✅
- [x] **Intégration TerritoryHeader** - Header modulaire intégré (Phase 52q) ✅
- [x] **Refonte UI Professionnelle** - Photos réalistes + Icônes Lucide (Phase 52r) ✅

### P1 - High Priority (EN COURS)
- [~] **Refactoring de MonTerritoireBionicPage.jsx** (2934 lignes restantes) - EN COURS
  - ✅ TerritoryHeader.jsx intégré dans la page
  - ✅ LayersPanelContent.jsx créé
  - ✅ QuebecLayersPanel.jsx créé et intégré
  - ✅ ZoneAnalysisControlPanel intégré dans le sidebar
  - ✅ WaypointZoneAnalysis intégré dans MapContainer
  - ✅ SpeciesSelector avec photos réalistes (Phase 52r)
  - ✅ HabitatScoreDropdown avec icônes Lucide (Phase 52r)
  - [ ] Migrer les 61 useState vers BionicTerritoryContext (P1 futur)
  - [ ] Intégrer LayersPanelContent modulaire dans le sidebar
  - [ ] Réduire sous 2000 lignes (cible: 1500)
- [x] **Analyse par Waypoint (ZoneAnalysisControlPanel)** ✅
  - ✅ Sélecteur de waypoint
  - ✅ Zones d'analyse 2, 4, 10 km²
  - ✅ Bouton "Analyser la zone"
  - ✅ Affichage du hotspot optimal
- [x] **Couches Québec activables via UI** ✅
  - ✅ Carte Écoforestière (peuplements)
  - ✅ LiDAR Dendrométrique (hauteur arbres)  
  - ✅ Indice d'Humidité TWI
- [ ] Connecter les toggles des modules thématiques aux couches de la carte
- [ ] Connecter le panneau Admin Urbain aux paramètres temps réel
- [ ] Test complet du système de backup avec credentials utilisateur

### P2 - Medium Priority
- [ ] Import/Export GPX/KML pour les waypoints
- [ ] Bouton "Exporter Styles" (QGIS/ArcGIS) via BionicStyleExporter.js
- [ ] Correction de la flèche GPS LIVE (stem non visible)
- [ ] Correction des warnings ESLint (apostrophes non-échappées)
- [ ] Chat en temps réel pour groupes de chasse

### P3 - Low Priority
- [ ] Dashboard statistiques des backups dans Admin
- [ ] Application mobile (React Native)
- [ ] Export PDF des analyses
- [ ] Intégration calendrier Google

---

## Next Tasks List

1. **Connecter les modules thématiques** (Prochaine session - P1)
   - Les toggles du dropdown Habitat Score doivent activer/désactiver les couches correspondantes
   - Implémenter la logique dans handleModuleToggle

2. **Poursuivre le refactoring** (P1)
   - Intégrer LayersPanelContent modulaire dans le panneau latéral
   - Migrer les 61 useState vers BionicTerritoryContext
   - Réduire la taille de MonTerritoireBionicPage sous 2000 lignes

3. **Améliorer l'analyse par Waypoint** (P2)
   - Persister les résultats d'analyse
   - Export des résultats (PDF/GPX)

4. **Configuration Backup Cloud** (Action utilisateur requise)
   - Créer compte MongoDB Atlas
   - Créer bucket Google Cloud Storage
   - Entrer credentials dans Admin > BACKUP

4. **Activer Auto Backup**
   - Aller dans Admin > BACKUP > Auto Backup
   - Activer le switch
   - Vérifier les mises à jour automatiques

3. **Créer dossier Bureau**
   - Créer: `Bureau/BIONIC APPS/Backup HUNTIQ`
   - Télécharger `HUNTIQ_BACKUP.zip` depuis l'admin
   - Placer dans le dossier

---

## Test Results

**Iteration 35 - Dropdown Bug Fix (27 Jan 2026)**
- Bug: Le dropdown "Enregistrer un Waypoint" ne s'ouvrait pas visuellement
- Cause: Conflit de z-index avec les éléments Leaflet (carte)
- Fix: Ajout de `z-[9999]` au DropdownMenuContent dans MonTerritoireBionicPage.jsx
- Status: ✅ Corrigé et testé

**Iteration 34 - Cloud Backup System**
- Backend: 100% (12/12 APIs working)
- Frontend: 100% (All UI components working)
- Status: ✅ All tests passed

---

## Credentials & Access

- **Admin Password**: `Saturn5858*`
- **Admin URL**: `/admin`
- **API Base**: `/api`

---

## Notes

- Le système de backup est prêt mais nécessite la configuration par l'utilisateur
- MongoDB Atlas offre 512MB gratuit (tier M0)
- Google Cloud offre 300$ de crédits gratuits
