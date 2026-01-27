# HUNTIQ / Chasse Bionic™ - PRD (Product Requirements Document)

## Project Overview
**Application**: HUNTIQ / Chasse Bionic™  
**Type**: Full-stack hunting platform with AI-powered analysis, marketplace, territory mapping, and e-commerce  
**Last Updated**: January 27, 2026

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
│   │   ├── ShopPage.jsx       # E-commerce shop
│   │   └── ...
│   └── components/
│       ├── CloudBackupManager.jsx  # NEW: Cloud backup UI
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

### P0 - Critical (Next)
- [ ] Configurer MongoDB Atlas avec credentials utilisateur
- [ ] Configurer Google Cloud Storage avec credentials utilisateur
- [ ] Activer backup automatique

### P1 - High Priority
- [ ] Intégration paiement Stripe pour e-commerce
- [ ] Notifications push pour alertes chasse
- [ ] Chat en temps réel pour groupes de chasse

### P2 - Medium Priority
- [ ] Gamification avec badges chasseur
- [ ] Application mobile (React Native)
- [ ] Intégration météo en temps réel

### P3 - Low Priority
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
