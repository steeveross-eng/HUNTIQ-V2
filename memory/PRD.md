# HUNTIQ / Chasse Bionic™ - PRD (Product Requirements Document)

## Project Overview
**Application**: HUNTIQ / Chasse Bionic™  
**Type**: Full-stack hunting platform with AI-powered analysis, marketplace, territory mapping, and e-commerce  
**Last Updated**: January 28, 2026

---

## Architecture

### Tech Stack
- **Frontend**: React 18 + Tailwind CSS + Shadcn UI + Leaflet Maps
- **Backend**: FastAPI (Python) + MongoDB
- **APIs**: 50+ modules including AI analysis, geospatial, e-commerce

### Key Components
```
/app/
├── backend/
│   ├── server.py              # Main FastAPI application (4500+ lines)
│   ├── backup_cloud.py        # Cloud backup system (Atlas + GCS)
│   ├── backup_manager.py      # Local backup versioning
│   ├── bionic_territory.py    # Territory analysis engine
│   └── ...
├── frontend/src/
│   ├── App.js                 # Main React app
│   ├── pages/
│   │   ├── AdminPage.jsx      # Admin panel (1000+ lines)
│   │   ├── MonTerritoireBionicPage.jsx  # Territory BIONIC page (2500+ lines)
│   │   ├── ShopPage.jsx       # E-commerce shop
│   │   └── ...
│   ├── styles/                # NEW: Styles cartographiques BIONIC
│   │   ├── BionicZoneStyles.js    # Système de styles multi-moteur
│   │   ├── BionicStyleExporter.js # Export QGIS/ArcGIS/Mapbox
│   │   └── bionic-zones.css       # CSS pour les zones
│   ├── services/
│   │   └── WaterExclusionService.js  # BIONIC water mask v5 - RELOCATION
│   └── components/
│       ├── CloudBackupManager.jsx  # Cloud backup UI
│       ├── TerritoryMap.jsx        # Interactive Quebec map
│       └── ...
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

### P1 - High Priority
- [ ] **Refactoring de MonTerritoireBionicPage.jsx** (~2700 lignes) - URGENT
  - Intégrer `ZoneControlPanel.jsx`, `MapToolbar.jsx`, `LayersPanel.jsx`
  - Intégrer `WaypointCreationMenu.jsx`, `TerritoryTabsHeader.jsx`
- [ ] Connecter le panneau Admin Urbain aux paramètres temps réel
- [ ] Test complet du système de backup avec credentials utilisateur
- [ ] Import/Export GPX/KML pour les waypoints

### P2 - Medium Priority
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

1. **Configuration Backup Cloud** (User action required)
   - Créer compte MongoDB Atlas
   - Créer bucket Google Cloud Storage
   - Entrer credentials dans Admin > BACKUP

2. **Activer Auto Backup**
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
