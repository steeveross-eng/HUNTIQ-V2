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

### P1 - High Priority
- [ ] Test complet du système de backup avec credentials utilisateur
- [ ] Import/Export GPX/KML pour les waypoints
- [ ] Intégration paiement Stripe pour e-commerce
- [ ] Notifications push pour alertes chasse

### P2 - Medium Priority
- [ ] Refactoring de MonTerritoireBionicPage.jsx (fichier trop volumineux)
- [ ] Correction des warnings ESLint (apostrophes non-échappées)
- [ ] Chat en temps réel pour groupes de chasse
- [ ] Gamification avec badges chasseur

### P3 - Low Priority
- [ ] Application mobile (React Native)
- [ ] Export PDF des analyses
- [ ] Intégration calendrier Google
- [ ] Statistiques avancées chasseur

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
