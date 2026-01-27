# Chasse Bionic™ Laboratory / BIONIC™ - Product Requirements Document

## Original Problem Statement
Application d'analyse de territoire de chasse avec reconnaissance d'espèces par IA, cartographie interactive, recommandations de produits BIONIC™, Hunt Marketplace pour la vente d'équipements, système de marketing automatisé, écosystème de réseautage complet et système de notifications push.

## Implemented Features

### Phases 1-13 (TERMINÉ) - Voir changelog précédent

### Phase 14 - Hunt Marketplace MVP (TERMINÉ - 2026-01-21)
- ✅ Système d'authentification vendeur
- ✅ Publication d'annonces (21 catégories, 5 types d'offres)
- ✅ Moteur de recherche avancé avec filtres
- ✅ Système Freemium (3 annonces gratuites)

### Phase 15 - SEO, Analytics & Marketing IA (TERMINÉ - 2026-01-22)
- ✅ Sitemap XML dynamique, Robots.txt, Balises Meta, Schema.org
- ✅ Dashboard Analytics avec tracking d'événements
- ✅ Dépôt de Contenu avec workflow de validation

### Phase 16 - Monétisation Marketplace (TERMINÉ - 2026-01-22)
- ✅ Intégration Stripe Payment complète (11 packages)
- ✅ Frontend avec modal des packages et gestion des paiements

### Phase 17 - Contrôle d'Accès au Site (TERMINÉ - 2026-01-22)
- ✅ Module `/api/site/mode` pour gérer les modes (live/development/maintenance)
- ✅ Page de maintenance avec message personnalisable
- ✅ Onglet "Accès Site" dans l'admin

### Phase 18 - Module "Terres à Louer" (TERMINÉ - 2026-01-22)
- ✅ Backend complet avec monétisation ultra-lucrative
- ✅ Interface `/terres` avec filtres avancés
- ✅ Onglet "Terres à louer" dans l'admin

### Phase 19 - Authentification Globale (TERMINÉ - 2026-01-22)
- ✅ Module `/api/auth/*` avec auto-login par IP
- ✅ GlobalAuth.jsx avec AuthProvider et UserMenu
- ✅ Bouton "Connexion" dans le header

### Phase 20 - Écosystème de Réseautage Complet (TERMINÉ - 2026-01-22)

**Backend** (`/app/backend/networking.py`)
- ✅ **Partage de contenu** : Posts avec images, vidéos, tags, location, espèce
- ✅ **Système de commentaires** : Commentaires et réponses imbriquées
- ✅ **Système de J'aime** : Toggle like sur posts et commentaires
- ✅ **Suivi de prospects** : Leads avec statuts (new→converted), notes, valeur estimée
- ✅ **Gestion de contacts** : Contacts avec relations, tags, favoris
- ✅ **Groupes** : Création, adhésion, gestion des membres et rôles
- ✅ **Programme de parrainage** : Codes uniques, récompenses configurables
- ✅ **Portefeuille interne** : Solde crédits/CAD, transactions, transferts

### Phase 21 - Système de Notifications Push (TERMINÉ - 2026-01-22)

**Backend** (`/app/backend/notifications.py`)
- ✅ **Types de notifications** : like_post, like_comment, comment, reply, group_join, referral_signup, referral_rewarded, wallet_credit, wallet_transfer, lead_update, mention, system
- ✅ **Préférences utilisateur** : Contrôle granulaire par type de notification
- ✅ **Heures silencieuses** : Configurable (ex: 22h-8h)
- ✅ **Déclencheurs automatiques** : Notifications créées automatiquement lors des interactions (likes, commentaires, groupes, parrainages)
- ✅ **Admin** : Envoi de notifications système à plusieurs utilisateurs

**Frontend** (`/app/frontend/src/components/NotificationCenter.jsx`)
- ✅ **Cloche de notifications** dans le header avec badge rouge indiquant le nombre non lu
- ✅ **Dropdown interactif** : Liste des notifications avec icônes, timestamp, aperçu
- ✅ **Actions** : Marquer comme lu, supprimer, tout marquer comme lu
- ✅ **Navigation** : Clic sur notification redirige vers le contenu concerné
- ✅ **Préférences** : Dialog de configuration des types de notifications
- ✅ **Polling** : Mise à jour automatique toutes les 30 secondes

**API Endpoints**
- `GET /api/notifications/{user_id}` - Récupérer notifications
- `POST /api/notifications/{user_id}/mark-seen` - Marquer comme vu (badge)
- `POST /api/notifications/{user_id}/mark-read` - Marquer comme lu
- `POST /api/notifications/{user_id}/mark-all-read` - Tout marquer comme lu
- `DELETE /api/notifications/{user_id}/{id}` - Supprimer notification
- `GET /api/notifications/preferences/{user_id}` - Préférences
- `PUT /api/notifications/preferences/{user_id}` - Mettre à jour préférences
- `POST /api/notifications/admin/send-system` - Envoi admin
- `GET /api/notifications/admin/stats` - Stats admin

### Phase 22 - Notifications Email (TERMINÉ - 2026-01-22)

**Backend** (`/app/backend/email_notifications.py`)
- ✅ **Intégration Resend** : Service d'envoi d'emails professionnel
- ✅ **Templates HTML** : Emails stylés avec thème BIONIC
- ✅ **Email de bienvenue** : Envoyé automatiquement à l'inscription
- ✅ **Résumé des notifications** : Quotidien ou hebdomadaire
- ✅ **Envoi de masse** : Digest à tous les utilisateurs avec notifications non lues

**Frontend** (`/app/frontend/src/components/EmailAdmin.jsx`)
- ✅ **Onglet "Email"** dans l'admin avec :
  - Status de configuration Resend
  - Envoi d'email de test
  - Envoi de résumé de masse (quotidien/hebdomadaire)
  - Liste des types d'emails automatiques

**API Endpoints**
- `GET /api/email/config` - Status de configuration
- `POST /api/email/test` - Email de test
- `POST /api/email/send-digest` - Envoi digest à un utilisateur
- `POST /api/email/send-welcome/{user_id}` - Email de bienvenue
- `POST /api/email/send-bulk-digest` - Envoi de masse

### Phase 23 - Accès Admin sur Page Maintenance (TERMINÉ - 2026-01-22)

**Frontend** (`/app/frontend/src/components/MaintenancePage.jsx`)
- ✅ **Roue d'engrenage** ⚙️ en haut à droite de la page maintenance
- ✅ **Dialog de connexion admin** avec email/mot de passe
- ✅ **Bypass automatique** de la maintenance après connexion
- ✅ **Option "Se souvenir"** de l'appareil

### Phase 24 - Réinitialisation Mot de Passe & Titre du Site (TERMINÉ - 2026-01-22)

**Backend** (`/app/backend/user_auth.py`)
- ✅ **POST /api/auth/forgot-password** : Demande de réinitialisation avec email
- ✅ **GET /api/auth/verify-reset-token/{token}** : Vérification de validité du token
- ✅ **POST /api/auth/reset-password** : Définition du nouveau mot de passe
- ✅ **Token sécurisé** : Expire après 1 heure, usage unique

**Backend** (`/app/backend/email_notifications.py`)
- ✅ **send_password_reset_email()** : Email avec lien de réinitialisation
- ✅ **send_password_changed_email()** : Email de confirmation du changement

**Frontend** (`/app/frontend/src/components/ResetPasswordPage.jsx`)
- ✅ **Page /reset-password?token=xxx** avec :
  - Vérification automatique du token au chargement
  - Message "Lien invalide" si token manquant
  - Message "Lien expiré" si token invalide/expiré
  - Formulaire de nouveau mot de passe avec confirmation
  - Validation visuelle de correspondance des mots de passe
  - Message de succès avec bouton de connexion

**Frontend** (`/app/frontend/src/components/GlobalAuth.jsx`)
- ✅ **Lien "Mot de passe oublié?"** dans le modal de connexion
- ✅ **Mode "forgot"** avec formulaire d'email et confirmation d'envoi

**Titre du Site**
- ✅ **index.html** : `<title>Chasse Bionic TM | Bionic Hunt TM</title>`
- ✅ **SEOHead.jsx** : Titre par défaut "Chasse Bionic TM"
- ✅ **seo_analytics.py** : Toutes les métas SEO mises à jour avec "Chasse Bionic TM"
- ✅ **og:site_name** : "Chasse Bionic TM"
- ✅ **Schema.org** : name = "Chasse Bionic TM"

**Testing Status**
- **Backend**: 100% (15/15 tests passés)
- **Frontend**: 100% (tous les cas de page reset fonctionnels)

### Phase 25 - Panneau de Contrôle des Fonctionnalités (TERMINÉ - 2026-01-22)

**Backend** (`/app/backend/feature_controls.py`)
- ✅ **23 fonctionnalités contrôlables** réparties en 8 catégories
- ✅ **API GET /api/feature-controls/status** : Statut de tous les modules
- ✅ **API POST /api/feature-controls/toggle** : Toggle ON/OFF individuel
- ✅ **API POST /api/feature-controls/toggle-bulk** : Toggle multiple
- ✅ **API POST /api/feature-controls/toggle-category** : Toggle par catégorie
- ✅ **API GET /api/feature-controls/logs** : Historique des modifications
- ✅ **API GET /api/feature-controls/logs/stats** : Statistiques
- ✅ **API POST /api/feature-controls/reset-defaults** : Réinitialisation

**Frontend** (`/app/frontend/src/components/FeatureControlsAdmin.jsx`)
- ✅ **Onglet "Contrôles"** dans /admin avec :
  - Tableau de bord (Total, Activées, Désactivées)
  - 8 catégories avec boutons "Tout activer" / "Tout désactiver"
  - Switch ON/OFF pour chaque fonctionnalité
  - Recherche et filtre par catégorie
  - Onglet "Historique" avec tableau d'audit complet
  - Stats: modifications totales, dernières 24h, top feature, admin actif

**Catégories de Fonctionnalités**
- **social** (4): Publications, Commentaires, J'aime, Groupes
- **notifications** (3): Push, Email, Résumés
- **marketing** (3): Facebook, Instagram, SEO Auto
- **commerce** (3): Marketplace, Paiements, Location Terres
- **loyalty** (2): Parrainage, Portefeuille
- **users** (3): Inscriptions, Auto Login, Reset MDP
- **ai** (3): Reconnaissance Espèces, Analyse Territoire, Catégorisation Produits
- **crm** (2): Prospects, Contacts

**Testing Status**
- **Backend**: 100% (24/24 tests passés)
- **Frontend**: 100% (toutes fonctionnalités validées)

### Phase 26 - Refactorisation App.js (TERMINÉ - 2026-01-22)

**Objectif**: Réduire la dette technique en extrayant les composants monolithiques.

**Fichiers Extraits**:
- `/app/frontend/src/pages/AdminPage.jsx` - Panneau d'administration complet (~1000 lignes)
- `/app/frontend/src/components/CategoriesManager.jsx` - Gestion des catégories d'analyse (~370 lignes)
- `/app/frontend/src/components/PromptManager.jsx` - Gestion des prompts IA (~500 lignes)
- `/app/frontend/src/components/SharedComponents.jsx` - Composants partagés (SaleModeBadge, AutoCategorizeButton)

**Résultat**:
- **App.js**: 3262 lignes → 1351 lignes (**-59%**)
- Structure plus maintenable et modulaire
- Aucune régression fonctionnelle

### Phase 27 - Refonte Identité Visuelle (TERMINÉ - 2026-01-22)

**Objectif**: Transition de "Scent Science™" vers "Chasse Bionic™" (FR) / "Bionic Hunt™" (EN)

**Logos Générés**:
- `/app/frontend/public/logos/logo-chasse-bionic-fr.png` - Logo français
- `/app/frontend/public/logos/logo-bionic-hunt-en.png` - Logo anglais

**Système Bilingue** (`/app/frontend/src/contexts/LanguageContext.jsx`):
- ✅ **LanguageProvider** : Contexte global de langue
- ✅ **useLanguage hook** : Accès à la langue, traductions, marque
- ✅ **LanguageSwitcher** : Bouton 🇫🇷/🇬🇧 dans le header
- ✅ **Persistance localStorage** : Mémorisation de la préférence
- ✅ **Détection navigateur** : Langue par défaut selon navigateur

**Logo Bilingue** (`/app/frontend/src/components/BionicLogo.jsx`):
- ✅ Affiche "CHASSE BIONIC" (FR) ou "BIONIC HUNT" (EN) selon la langue
- ✅ Variantes de taille (small, default, large, xlarge)
- ✅ Mode texte pour utilisation sans image

**Admin Identité Visuelle** (`/app/frontend/src/components/BrandIdentityAdmin.jsx`):
- ✅ **Onglet "Identité"** dans /admin
- ✅ **Bibliothèque de logos** : Aperçu, téléchargement, copie URL
- ✅ **Générateur d'en-têtes** : 7 templates (Lettre, Email, Contrat, Facture, Partenaire, ZEC/Sépaq, Communiqué)
- ✅ **Historique des versions** : Suivi des modifications

**Remplacement Global**:
- ✅ Tous les "Scent Science" → "Chasse Bionic" dans le code
- ✅ Backend, frontend, emails, SEO mis à jour

### Phase 28 - Traductions Dynamiques + Refactorisation Territory (TERMINÉ - 2026-01-22)

**Objectif**: Rendre l'interface entièrement bilingue et améliorer la maintenabilité de TerritoryMap.

**Traductions Dynamiques** (`/app/frontend/src/contexts/LanguageContext.jsx`):
- ✅ **Nouvelles clés** ajoutées : hero_order, hero_description, hero_highlight, hero_subtitle
- ✅ **Nouvelles clés** ajoutées : feature_analyze_desc, feature_compare_desc, feature_order_desc
- ✅ **Nouvelles clés** ajoutées : cart_empty, cart_total, cart_checkout
- ✅ **Nouvelles clés** ajoutées : page_best_choices, page_loading, page_verifying

**Composants Traduits** (`/app/frontend/src/App.js`):
- ✅ **Navigation** : Menu mobile utilise maintenant `t(link.labelKey)`
- ✅ **HeroSection** : Utilise `brand.tagline`, `t('hero_description')`, `brand.slogan`
- ✅ **FeaturesSection** : Utilise `t()` pour titres et descriptions
- ✅ **ProductsSection** : Utilise `t('page_best_choices')` + `brand.short`
- ✅ **CartSheet** : Utilise `t('nav_cart')`, `t('cart_empty')`, `t('cart_total')`, `t('hero_order')`

**Refactorisation TerritoryMap Phase 1**:
Nouveaux composants extraits dans `/app/frontend/src/components/territory/`:
- ✅ **TerritoryHeader.jsx** (~100 lignes) : En-tête avec stats, utilisateur, panier, déconnexion
- ✅ **SpeciesFilter.jsx** (~85 lignes) : Filtres espèce + fenêtre temporelle
- ✅ **TerritoryFilter.jsx** (~120 lignes) : Filtre territoire (ZEC, Sépaq, etc.)
- ✅ **index.js** : Exports centralisés

**Résultat Refactorisation**:
- **TerritoryMap.jsx**: 4592 → 4431 lignes (**-161 lignes**)
- Structure plus modulaire avec composants réutilisables
- Aucune régression fonctionnelle

**Testing Status**:
- **Frontend**: 100% (language switcher, navigation, hero, territory page)

### Phase 29 - Nouveau Logo + Interface Améliorée (TERMINÉ - 2026-01-22)

**Objectif**: Intégrer le nouveau logo Bionic, supprimer "Laboratory" et améliorer le sélecteur de langue.

**Nouveau Logo** (`/app/frontend/public/logos/bionic-logo-main.png`):
- ✅ Logo unifié BIONIC avec orignal doré
- ✅ Utilisé pour FR et EN (logo universel)
- ✅ Cadre agrandi dans la Hero section (min-w-280px, min-h-140px)
- ✅ Option `fillContainer` pour adapter aux espaces disponibles

**Suppression "Laboratory"**:
- ✅ `LanguageContext.jsx` : hero_description FR/EN
- ✅ `AnalyzerModule.jsx` : Titre BIONIC™
- ✅ `PromptManager.jsx` : app_name
- ✅ `server.py` : Message API, emails HTML, copyright
- ✅ `territory.py` : Référence prompt_documentation

**Sélecteur de Langue Slider** (`LanguageContext.jsx`):
- ✅ Toggle glissant FR ↔ EN avec animation
- ✅ Labels FR/EN cliquables aux extrémités
- ✅ Knob avec drapeau (🇫🇷/🇬🇧) qui glisse
- ✅ Animation transition-all duration-300

### Phase 30 - Marketing IA + Textes (TERMINÉ - 2026-01-22)

**Objectif**: Implémenter l'onglet Marketing IA dans l'admin et traduire les textes demandés.

**Marketing IA** (`/app/frontend/src/components/MarketingAIAdmin.jsx`):
- ✅ **Nouvel onglet "Marketing IA"** dans le panneau admin
- ✅ **Génération de contenu** pour Facebook, Instagram, LinkedIn
- ✅ **Programmation de publications** sur les réseaux sociaux
- ✅ **Interface utilisateur** avec création de posts et historique

**Traductions**:
- ✅ "Analysez votre attractant" → "Analysez vos produits" (FR)
- ✅ "Analyze your attractant" → "Analyze your products" (EN)

### Phase 31 - Scroll Navigator + Admin Marge (TERMINÉ - 2026-01-22)

**Objectif**: Ajouter la navigation par défilement et le pourcentage de marge dans l'admin.

**ScrollNavigator** (`/app/frontend/src/components/ScrollNavigator.jsx`):
- ✅ **Flèches de navigation** haut/bas pour le défilement de page
- ✅ **Animation et style** conformes au design BIONIC
- ✅ **Logique de visibilité** : flèches apparaissent uniquement s'il y a du contenu à défiler
- ✅ **Flèche forcée** sur la page d'accueil pour indiquer le contenu en dessous

**Admin Dashboard** (`/app/frontend/src/pages/AdminPage.jsx`):
- ✅ **Pourcentage de marge** affiché à côté du montant des "Marges nettes"

### Phase 32 - Waypoints Déplaçables + Export GPX (TERMINÉ - 2026-01-22)

**Objectif**: Activer le drag-and-drop des waypoints sur la carte et implémenter l'export GPX.

**Waypoints Déplaçables** (`/app/frontend/src/components/TerritoryMap.jsx`):
- ✅ **`draggable={true}`** sur les marqueurs Leaflet (ligne 2968)
- ✅ **Event handlers** : `dragstart` (active mode flux GPS), `drag` (update coordonnées temps réel), `dragend` (sauvegarde position)
- ✅ **Mode Flux GPS** : Affiche les coordonnées en direct pendant le déplacement
- ✅ **Auto-analyse** : Déclenche automatiquement l'analyse du territoire après déplacement

**Export GPX** (`/app/frontend/src/components/TerritoryMap.jsx`):
- ✅ **`handleExportGpxLocal()`** : Export côté client utilisant `gpxUtils.js`
- ✅ **Bouton "GPX"** dans la section Waypoints (data-testid='export-gpx-quick-btn')
- ✅ **Fallback intelligent** : Si l'API backend échoue, utilise l'export local
- ✅ **Compatible** : Garmin, Avenza, GPS standard

**Utilitaire GPX** (`/app/frontend/src/components/territory/gpxUtils.js`):
- ✅ **`generateGPX()`** : Génère le XML GPX avec métadonnées
- ✅ **`downloadGPX()`** : Télécharge le fichier GPX
- ✅ **`parseGPX()`** : Parse un fichier GPX importé
- ✅ **Symboles standardisés** : Mapping des types de waypoints vers symboles GPX

**Testing Status**:
- **Frontend**: 100% (5/5 fonctionnalités testées et validées)
- **Rapport de test**: `/app/test_reports/iteration_14.json`

**Fonctionnalités Validées**:
1. ✅ Création de waypoint via l'outil waypoint (bouton drapeau vert)
2. ✅ Waypoints déplaçables (drag-and-drop sur la carte)
3. ✅ Export GPX rapide (bouton "GPX" dans section Waypoints)
4. ✅ Mode flux GPS en direct (FLUX EN DIRECT avec coordonnées temps réel)
5. ✅ Import/Export GPX (boutons dans section dédiée)

## Code Architecture
```
/app/
├── backend/
│   ├── server.py             # Serveur principal
│   ├── territory.py          # Logique carte, classements
│   ├── marketplace.py        # Hunt Marketplace
│   ├── payments.py           # Stripe integration
│   ├── seo_analytics.py      # SEO, Analytics, Content Depot
│   ├── site_access.py        # Contrôle d'accès site
│   ├── lands_rental.py       # Module terres à louer
│   ├── user_auth.py          # Authentification globale
│   ├── networking.py         # Écosystème de réseautage
│   ├── notifications.py      # Notifications push
│   ├── email_notifications.py # Notifications email
│   ├── brand_identity.py     # Génération PDF, gestion logos
│   └── feature_controls.py   # Panneau de contrôle admin
└── frontend/
    └── src/
        ├── App.js            # Refactorisé (1351 lignes)
        ├── contexts/
        │   └── LanguageContext.jsx  # Système bilingue FR/EN
        ├── pages/
        │   ├── AdminPage.jsx        # Panneau admin (extrait)
        │   └── NetworkPage.jsx
        └── components/
            ├── TerritoryMap.jsx           # 4431 lignes (en cours)
            ├── territory/                  # Sous-composants extraits
            │   ├── TerritoryHeader.jsx    # 117 lignes
            │   ├── TerritoryFilter.jsx    # 124 lignes
            │   ├── SpeciesFilter.jsx      # 89 lignes
            │   ├── GPSNavigationPanel.jsx # 290 lignes (NOUVEAU)
            │   ├── AnalysisResultsPanel.jsx # 175 lignes (NOUVEAU)
            │   ├── MapControls.jsx        # 261 lignes
            │   ├── LayersPanel.jsx        # 193 lignes
            │   └── WaypointPanel.jsx      # 261 lignes
            ├── BrandIdentityAdmin.jsx     # Upload logos, PDF generator
            ├── FeatureControlsAdmin.jsx   # Contrôle des fonctionnalités
            └── ...
```

## Collections MongoDB
- `content_posts` - Publications du réseau social
- `content_comments` - Commentaires sur les posts
- `content_likes` - J'aimes sur posts/commentaires
- `leads` - Prospects (suivi commercial)
- `contacts` - Carnet d'adresses personnel
- `groups` - Groupes de discussion
- `group_memberships` - Membres des groupes
- `referral_codes` - Codes de parrainage
- `referrals` - Utilisations des codes
- `wallets` - Portefeuilles utilisateurs
- `wallet_transactions` - Transactions

## Upcoming Tasks

### P0 (Critique)
- ✅ **Refactorisation App.js** : TERMINÉ (3262 → 1351 lignes = -59%)
- ✅ **Refactorisation TerritoryMap.jsx** : PHASE 2 TERMINÉE 
  - Nouveaux composants : GPSNavigationPanel, AnalysisResultsPanel
  - Total sous-composants : 1725 lignes extraites
  - TerritoryMap : 4431 lignes (reste à intégrer les nouveaux composants)

### P1 (Prioritaire)
- ✅ **Générateur PDF connecté** : Génération de 7 types de documents (Lettre, Email, Contrat, Facture, Partenaire, ZEC, Communiqué)
- ✅ **Upload de logos personnalisés** : Avec validation, progression et historique
- ✅ **Waypoints déplaçables** : `draggable={true}` sur les marqueurs Leaflet avec handlers dragstart/drag/dragend
- ✅ **Export GPX rapide** : Bouton "GPX" dans la section Waypoints + fallback côté client via gpxUtils.js

### P2 (À venir)
- ⬜ Logique d'analyse réelle (remplacer données simulées)
- ⬜ Popup waypoints difficile à ouvrir (fix ergonomie)
- ⬜ Intégrer GPSNavigationPanel et AnalysisResultsPanel dans le rendu (composants prêts)

### P3 (Futur)
- ⬜ Intégration GeoServer
- ⬜ Gamification des Formations
- ⬜ Extraction des composants restants de App.js (HomePage, Navigation, Footer)

## Credentials
- **Admin**: `steeve.ross@gmail.com` / `Saturn5858*`
- **Test User**: `test@chasse.ca` / `password123`
- **Stripe**: Clé de test configurée

## Last Updated
2026-01-22 - Phase 35 : Module Inventaire National des Territoires (Phase 1 & 2 TERMINÉES)

### Phase 35 - Inventaire National des Territoires (TERMINÉ - 2026-01-22)

**Objectif**: Créer un système complet d'inventaire, de scoring et d'analyse des territoires de chasse au Canada.

#### Phase 1 - Fondations (TERMINÉ)

**Backend** (`/app/backend/territories.py`):
- ✅ **Modèle de données** : Support pour ZEC, Sépaq, Pourvoirie, Club, Outfitter, Anticosti, etc.
- ✅ **Normalisation des identifiants** : ZEC-XXX, RF-XXX, PV-XXX, OUT-XXX, etc.
- ✅ **API CRUD complète** :
  - `GET /api/territories` - Liste avec filtres (type, province, espèce, score)
  - `POST /api/territories` - Création
  - `GET /api/territories/{id}` - Détails
  - `PUT /api/territories/{id}` - Mise à jour
  - `DELETE /api/territories/{id}` - Suppression
  - `GET /api/territories/stats` - Statistiques globales
- ✅ **Système de scoring BIONIC™** :
  - Indice Habitat (H) : 35%
  - Indice Succès (S) : 30%
  - Indice Accessibilité (A) : 20%
  - Indice Pression inversé (100-P) : 15%
- ✅ **48 territoires** : ZECs, Sépaq, Pourvoiries, Outfitters (QC, ON, NB, NL, AB, SK, BC)

**Frontend** (`/app/frontend/src/components/TerritoryInventory.jsx`):
- ✅ **Intégration dans l'onglet "Analysez"** sous la catégorie "Pourvoyeurs"
- ✅ **Vue statistiques** : Total, Vérifiés, Provinces, Score moyen
- ✅ **Filtres avancés** : Type, Province, Espèce, Tri par score
- ✅ **Cartes de territoires** avec score visuel, espèces, zones
- ✅ **Modal de détails** : Score BIONIC™, services, contact, description

**Collections MongoDB créées**:
- `territories` : Inventaire des territoires
- `scraping_sources` : Sources de scraping configurées

#### Phase 2 - Cartographie, Scraping & Partenariats (TERMINÉ - 2026-01-22)

**Backend** (`/app/backend/territory_ai.py`, `/app/backend/territory_scraping.py`):
- ✅ **API GeoJSON** : `GET /api/territories/ai/geojson` - Données cartographiques pour Leaflet
- ✅ **API Heatmap** : `GET /api/territories/ai/heatmap/{metric}` - 4 métriques (score, success, pressure, density)
- ✅ **API Scraping Sources** : `GET /api/territories/scraping/sources` - 5 sources configurées
- ✅ **API Run Scraping** : `POST /api/territories/scraping/run/{source}` - Lancement scraping
- ✅ **API Scraping Status** : `GET /api/territories/scraping/status` - Statut et compteurs
- ✅ **API Partenaires Potentiels** : `GET /api/territories/ai/potential-partners` - Territoires à fort score
- ✅ **API Convert to Partner** : `POST /api/territories/ai/{id}/convert-to-partner` - Conversion en partenaire

**Frontend** (`/app/frontend/src/components/TerritoryAdvanced.jsx`):
- ✅ **Onglet IA** : Recommandations par espèce/saison avec scores IA
- ✅ **Onglet Carte** : Carte Leaflet interactive avec :
  - Vue Marqueurs (48 marqueurs avec icônes par type)
  - Vue Heatmap (intensité par score/succès/pression/densité)
  - Filtres province/type/espèce
  - Légende des scores colorés
- ✅ **Onglet Scraping** : Panel admin avec :
  - Compteurs (48 territoires, 86 scrapés)
  - Liste des 5 sources avec boutons Play
  - Bouton "Sync complète"
  - Actions rapides Sépaq/ZECs/Tout scraper
- ✅ **Onglet Partenaires** : 12 partenaires potentiels avec :
  - Score de partenariat et potentiel (Élevé/Moyen)
  - Boutons Site et Convertir

**Sources de Scraping Configurées** (PARTIELLEMENT MOCKÉES):
- Association des pourvoiries du Québec (pourvoiries.com)
- CHA-ACC Pourvoiries (cha-acc.com)
- Sépaq - Réserves fauniques
- ZECs Québec
- White Hills Outfitters

**Testing Status**:
- **Backend**: 100% (26/26 tests - `/app/backend/tests/test_territory_phase2.py`)
- **Frontend**: 100% (4 onglets testés et fonctionnels)
- **Rapport**: `/app/test_reports/iteration_15.json`

### Audit des Traductions (COMPLÉTÉ - 2026-01-22)

**Système de traduction bilingue FR/EN implémenté :**
- **Fichier principal** : `/app/frontend/src/contexts/LanguageContext.jsx`
- **956 clés de traduction** disponibles (478 FR + 478 EN)
- **24 composants** utilisent le hook `useLanguage`
- **Sélecteur de langue** : Toggle FR/EN dans la navigation principale

**Composants traduits (Phase 1 - Principaux) :**
- `TerritoryInventory.jsx` - Inventaire des territoires
- `TerritoryAdvanced.jsx` - Fonctions avancées (Carte, IA, Scraping)
- `AnalyzerModule.jsx` - Module d'analyse
- `CategoriesManager.jsx` - Gestion des catégories
- `BecomePartner.jsx` - Page partenariat
- `BrandIdentityAdmin.jsx` - Identité visuelle
- `MarketingAIAdmin.jsx` - Marketing IA
- `NetworkingHub.jsx` - Réseautage
- `PartnerCalendar.jsx`, `PartnerDashboard.jsx`, `PartnerOffers.jsx` - Partenaires

**Composants traduits (Phase 2 - Admin) :**
- `PartnershipAdmin.jsx` - Gestion des partenariats
- `FeatureControlsAdmin.jsx` - Contrôle des fonctionnalités
- `SiteAccessControl.jsx` - Contrôle d'accès au site
- `GlobalAuth.jsx` - Authentification globale
- `LandsRental.jsx` - Location de terres
- `HuntMarketplace.jsx` - Marketplace de chasse
- `ContentDepot.jsx` - Dépôt de contenu
- `MaintenancePage.jsx` - Page de maintenance
- `CookieConsent.jsx` - Consentement cookies
- `NotificationCenter.jsx` - Centre de notifications
- `NetworkingAdmin.jsx` - Administration réseau
- `GpsHotspots.jsx` - Points GPS
- `ResetPasswordPage.jsx` - Réinitialisation mot de passe
- `PromptManager.jsx` - Gestionnaire de prompts

**Catégories de traductions ajoutées :**
- Analyzer Module (toasts, placeholders, étapes d'analyse)
- Brand Identity Admin (logos, documents, erreurs)
- Categories Manager (CRUD, messages)
- Territory Inventory (filtres, scores, services)
- Territory Map (carte, légende, heatmap)
- Scraping (sources, status, actions)
- Partners (potentiels, conversion)
- AI Recommendations (saisons, confiance)
- Partnership Admin (demandes, statuts, emails)
- Feature Controls (fonctionnalités, catégories)
- Site Access Control (modes, messages)
- Global Auth (connexion, inscription, erreurs)
- Lands Rental (filtres, prix, réservation)
- Hunt Marketplace (annonces, vendeurs, offres)
- Content Depot (génération, templates)
- Maintenance Page (messages, contact)
- Cookie Consent (cookies, paramètres)
- Notifications (titres, actions)
- Reset Password (réinitialisation, validation)
- Prompt Manager (CRUD)
- GPS Hotspots (points, export/import)

**Texte hardcodé restant (~35 occurrences) :**
- Principalement des toasts et messages d'erreur mineurs
- Non prioritaire pour la production

**Note Importante**: Le scraping utilise désormais des données **RÉELLES** provenant des sites officiels :
- **pourvoiries.com** : 50 pourvoiries extraites du site (le site utilise JavaScript, donc les données sont pré-extraites)
- **sepaq.com** : Pages individuelles scrapées en temps réel
- **zecquebec.com** : Données scrapées avec fallback si le site est inaccessible
- **cha-acc.com** : Scraping en temps réel des pages de détail

**Dépendance ajoutée** : `brotli==1.2.0` pour la compression Brotli utilisée par certains sites.

### Phase 34.2 - Synchronisation Maintenance/Fonctionnalités (TERMINÉ - 2026-01-22)

**Objectif**: Désactiver automatiquement toutes les fonctionnalités quand le site passe en mode maintenance pour bloquer toutes les actions, envois d'emails et accès indésirables.

**Backend** (`/app/backend/site_access.py`):
- ✅ **Backup des états** : Sauvegarde l'état de toutes les fonctionnalités avant désactivation
- ✅ **Désactivation automatique** : 23 fonctionnalités désactivées instantanément
- ✅ **Restauration automatique** : États précédents restaurés à la sortie de maintenance
- ✅ **Collection `maintenance_feature_backup`** : Stockage des états de backup
- ✅ **Logs d'audit** : Traçabilité des changements automatiques

**Frontend** (`/app/frontend/src/components/SiteAccessControl.jsx`):
- ✅ **Avertissement sur le bouton Maintenance** : "⚡ Désactive toutes les fonctionnalités"
- ✅ **Carte d'alerte orange** en mode maintenance :
  - Message explicatif complet
  - Badge "23 fonctionnalités OFF"
  - Note sur la restauration automatique
- ✅ **Toasts de notification** : Feedback visuel lors des changements de mode

**Flux de synchronisation**:
1. Live → Maintenance : Backup + Disable all (23 features OFF)
2. Maintenance → Live : Restore from backup (retour à l'état précédent)
3. Développement ↔ Maintenance : Même logique de sync

### Phase 34.1 - Contrôle des Emails Partenariat (TERMINÉ - 2026-01-22)

**Objectif**: Permettre à l'admin de contrôler manuellement l'envoi des emails automatiques du système de partenariat.

**Backend** (`/app/backend/partnership.py`):
- ✅ **Collection `partnership_settings`** : Stockage des paramètres d'emails
- ✅ **Fonction `get_email_settings()`** : Récupération des paramètres avec valeurs par défaut
- ✅ **Fonction `is_email_type_enabled()`** : Vérification si un type d'email est activé
- ✅ **Endpoint GET `/admin/email-settings`** : Récupérer les paramètres actuels
- ✅ **Endpoint PUT `/admin/email-settings`** : Modifier plusieurs paramètres à la fois
- ✅ **Endpoint POST `/admin/email-settings/toggle/{type}`** : Toggle ON/OFF individuel

**Types d'emails contrôlables**:
- `acknowledgment` : Accusé de réception au partenaire
- `admin_notification` : Notification à l'admin pour nouvelle demande
- `approval` : Email d'approbation au partenaire
- `rejection` : Email de refus au partenaire

**Frontend** (`/app/frontend/src/components/PartnershipAdmin.jsx`):
- ✅ **Nouvel onglet "Paramètres"** dans la section Partnership
- ✅ **4 switches ON/OFF** avec icônes d'état colorées
- ✅ **Descriptions claires** pour chaque type d'email
- ✅ **Résumé** affichant le nombre d'emails activés
- ✅ **Toast de confirmation** lors des modifications

### Phase 34 - Partnership Engine Phase 1 (TERMINÉ - 2026-01-22)

**Objectif**: Créer un système complet de gestion des partenariats commerciaux et institutionnels.

**Backend** (`/app/backend/partnership.py`):
- ✅ **11 types de partenaires** : Marques, Pourvoiries, Propriétaires, Guides, Boutiques, Services, Fabricants, ZEC, Clubs, Particuliers, Autres
- ✅ **API complète** : /api/partnership/* (types, request, requests, partners, admin/stats)
- ✅ **Gestion des demandes** : Soumission, révision, approbation, refus, conversion
- ✅ **Conversion automatique** : Création compte partenaire + profil + features
- ✅ **Emails automatiques** : Accusé réception, notification admin, approbation, refus

**Frontend - Formulaire Partenaire** (`/app/frontend/src/components/BecomePartner.jsx`):
- ✅ **Page `/become-partner`** : Formulaire en 3 étapes avec validation
- ✅ **Étape 1** : Nom entreprise, Type (11 options avec icônes), Contact principal
- ✅ **Étape 2** : Email, Téléphone, Site web, Langue préférée (FR/EN)
- ✅ **Étape 3** : Description, Produits/Services, Consentement légal, Récapitulatif
- ✅ **Page de succès** : Confirmation avec prochaines étapes

**Frontend - Admin Partnership** (`/app/frontend/src/components/PartnershipAdmin.jsx`):
- ✅ **Onglet "Partnership"** dans l'admin (vert actif)
- ✅ **Dashboard stats** : En attente, Approuvées, Partenaires actifs, Total, Refusées
- ✅ **Onglet Demandes** : Tableau avec filtres (statut, type, recherche)
- ✅ **Modal détails** : Toutes les infos + Notes admin + Approuver/Refuser/Convertir
- ✅ **Onglet Partenaires** : Liste des partenaires officiels avec commission, statut, actions

**Frontend - Tableau de Bord Partenaire** (`/app/frontend/src/components/PartnerDashboard.jsx`):
- ✅ **Page `/partner/dashboard`** : Interface partenaire
- ✅ **Quick Stats** : Solde, Revenus, Réservations, En attente, Vues, Note
- ✅ **Onglets** : Aperçu, Profil, Calendrier (placeholder), Offres (placeholder), Réservations (placeholder)
- ✅ **Gestion profil** : Modification des informations avec sauvegarde

**Intégration UI**:
- ✅ **Footer enrichi** : Section "Partenaires" avec bouton "Devenez Partenaire"
- ✅ **Routes** : /become-partner, /partner/dashboard

**API Endpoints**:
- `GET /api/partnership/types` - Liste des 11 types de partenaires
- `POST /api/partnership/request` - Soumettre une demande
- `GET /api/partnership/requests` - Liste des demandes (admin)
- `GET /api/partnership/requests/{id}` - Détails d'une demande
- `PUT /api/partnership/requests/{id}` - Modifier statut/notes
- `POST /api/partnership/requests/{id}/convert` - Convertir en partenaire
- `GET /api/partnership/partners` - Liste des partenaires
- `GET /api/partnership/partners/{id}` - Détails d'un partenaire
- `PUT /api/partnership/partners/{id}` - Modifier un partenaire
- `POST /api/partnership/partners/{id}/toggle-status` - Activer/Suspendre
- `GET /api/partnership/dashboard/{id}/stats` - Stats tableau de bord
- `GET /api/partnership/admin/stats` - Stats admin globales
- `GET /api/partnership/admin/email-settings` - Paramètres d'envoi d'emails
- `PUT /api/partnership/admin/email-settings` - Modifier les paramètres d'emails
- `POST /api/partnership/admin/email-settings/toggle/{type}` - Toggle ON/OFF d'un type d'email

**Testing Status**:
- **Backend**: API testée avec curl (création, approbation, conversion, toggle emails)
- **Frontend**: Screenshots validés (formulaire, admin, liste partenaires, paramètres emails)

### Phase 36 - Synchronisation Bidirectionnelle Territories/Partenaires (TERMINÉ - 2026-01-23)

**Objectif**: Finaliser la synchronisation bidirectionnelle des données entre les modules `territories` et `partners` pour maintenir la cohérence des données.

**Backend** (`/app/backend/territories.py`):
- ✅ **GET /api/territories/sync/status** : Retourne le statut de synchronisation
  - `total_territories`: 78
  - `synced_to_partnership`: 78
  - `territories_as_partners`: 2
  - `sync_percentage`: 100%
  - `last_partner_sync`: timestamp
- ✅ **POST /api/territories/sync/all-to-partnership** : Synchronise tous les territoires vers partenariats
- ✅ **POST /api/territories/sync/all-from-partnership** : Synchronise les données partenaires vers territoires
- ✅ **GET /api/territories/partnership/list** : Liste des territoires avec statut de partenariat

**Frontend** (`/app/frontend/src/components/PartnershipAdmin.jsx`):
- ✅ **Carte de Synchronisation Bidirectionnelle** dans l'onglet Pourvoyeurs :
  - Icône Database avec statut visuel
  - Compteurs: synchros (78/78), partenaires actifs (2), pourcentage (100%)
  - Badge vert/jaune selon le taux de synchronisation
  - Timestamp de dernière synchronisation
- ✅ **Boutons de synchronisation** :
  - "Terr → Part" : Synchronise territoires vers partenariats
  - "Part → Terr" : Synchronise partenariats vers territoires
- ✅ **Restructuration du composant** pour respecter les conventions React (fonctions avant useEffect)
- ✅ **Icônes ajoutées** : ArrowUpDown, Database

**Frontend** (`/app/frontend/src/contexts/LanguageContext.jsx`):
- ✅ **~60 nouvelles clés de traduction** pour les toasts/messages
- ✅ **Suppression des duplications** marketplace_* 
- ✅ **Traductions FR/EN complètes** pour tous les messages de synchronisation

**Testing Status**:
- **Backend**: 100% (16/16 tests passés)
- **Frontend**: 100% (toutes fonctionnalités validées)
- **Rapport**: `/app/test_reports/iteration_16.json`

**Fichiers modifiés**:
- `/app/frontend/src/components/PartnershipAdmin.jsx` - Ajout UI synchronisation
- `/app/frontend/src/contexts/LanguageContext.jsx` - Ajout traductions toasts
- `/app/backend/tests/test_sync_and_brand.py` - Tests créés par testing agent

---

## Prochaines Tâches (P1)

### Partnership Engine Phase 3 (Contrats & Paiements)
- ⬜ Génération automatique de contrats PDF
- ⬜ Intégration Stripe Connect pour paiements automatiques
- ⬜ Module comptabilité de base

### Intégration GeoServer
- ⬜ Connexion au serveur GeoServer
- ⬜ Affichage des couches cartographiques

### Améliorations UX
- ⬜ Popup waypoints difficile à ouvrir (fix ergonomie)
- ⬜ Cookie banner auto-dismiss ou taille réduite

---

## Last Updated
2026-01-23 - Phase 37 : Intégration BIONIC™ Territory Engine TERMINÉE

### Phase 37 - Intégration BIONIC™ Territory Engine (TERMINÉ - 2026-01-23)

**Objectif**: Intégrer le moteur d'analyse BIONIC™ dans l'interface utilisateur de la page territoire.

**Backend** (`/app/backend/bionic_engine.py` - déjà existant):
- ✅ **8 Modules thématiques** : ThermalScore, WetnessScore, FoodScore, PressureScore, AccessScore, CorridorScore, GeoFormScore, CanopyScore
- ✅ **6 Modèles fauniques** : MooseScore, DeerScore, BearScore, CaribouScore, WolfScore, TurkeyScore
- ✅ **Prédictions IA** : Forecasts 24h, 72h, 7 jours avec impact météo et prédiction de mouvement
- ✅ **Analyse temporelle** : Tendances NDVI/NDWI sur 12 mois, phénologie, détection d'anomalies
- ✅ **API complète** : /api/bionic/modules, /api/bionic/species, /api/bionic/analyze, /api/bionic/ai/*

**Frontend** (`/app/frontend/src/components/TerritoryMap.jsx`):
- ✅ **Import BionicAnalyzer** (ligne 20)
- ✅ **État showBionicAnalyzer** (ligne 380)
- ✅ **Bouton BIONIC™ Territory Engine** dans la sidebar (lignes 1955-1973)
  - Design gradient orange/doré
  - data-testid="bionic-engine-btn"
- ✅ **Modal BionicAnalyzer** (lignes 4498-4549)
  - Overlay modal avec en-tête stylé
  - Passe les coordonnées du territoire au composant
  - Bouton de fermeture data-testid="close-bionic-modal"

**Composant BionicAnalyzer** (`/app/frontend/src/components/BionicAnalyzer.jsx` - déjà existant):
- ✅ **6 onglets** : Vue d'ensemble, Modules, Espèces, IA & Prédictions, Temporel, Paramètres
- ✅ **Score Global** avec jauge circulaire et rating
- ✅ **Cartes de modules** avec scores individuels et confiance
- ✅ **Cartes d'espèces** avec métriques habitat/nourriture
- ✅ **Prédictions IA** avec forecasts et mouvement prévu
- ✅ **Analyse temporelle** avec graphiques NDVI et phénologie
- ✅ **Paramètres** pour sélection modules/espèces et toggles IA/temporel

**Testing Status**:
- **Backend**: 100% (21/21 tests passés - `/app/backend/tests/test_bionic_engine.py`)
- **Frontend**: 100% (toutes fonctionnalités testées et validées)
- **Rapport**: `/app/test_reports/iteration_17.json`

---

### Phase 38 - Intégration Données Géospatiales Réelles (TERMINÉ - 2026-01-23)

**Objectif**: Connecter le moteur BIONIC™ à des sources de données géospatiales réelles.

**Nouveau Module** (`/app/backend/geospatial_data.py` - 1100+ lignes):
- ✅ **OpenMeteoClient** : Météo temps réel (température, vent, humidité, précipitations, prévisions 7j)
- ✅ **OpenElevationClient** : Données terrain (élévation, pente, orientation)
- ✅ **NDVIDataClient** : Indices végétation avec intégration NASA AppEEARS complète
- ✅ **GeospatialDataService** : Service centralisé avec cache 5 minutes
- ✅ **Fonctions de conversion** : weather_to_bionic_factors, terrain_to_bionic_factors, vegetation_to_bionic_factors
- ✅ **Interprétation NDVI/NDWI** : interpret_ndvi(), interpret_ndwi(), interpret_vegetation()

**Nouveaux Endpoints API**:
- ✅ `GET /api/bionic/geospatial/weather` - Météo Open-Meteo
- ✅ `GET /api/bionic/geospatial/terrain` - Terrain Open-Elevation  
- ✅ `GET /api/bionic/geospatial/vegetation` - NDVI NASA MODIS/Seasonal + interprétation
- ✅ `GET /api/bionic/geospatial/complete` - Toutes les données
- ✅ `GET /api/bionic/geospatial/interpret` - **NOUVEAU** Interprétation NDVI/NDWI accessible

**Modifications API existante**:
- ✅ `POST /api/bionic/analyze` inclut maintenant:
  - `real_conditions`: {weather, terrain, vegetation}
  - `data_sources`: ["Open-Meteo", "Open-Elevation", "NASA MODIS"]
  - `data_quality`: "complete" | "partial" | "failed"

**Frontend Amélioré** (`BionicAnalyzer.jsx`):
- ✅ **Nouvelle section "Données en temps réel"** avec badge LIVE
- ✅ **3 cartes** : Météo (-12.2°C), Terrain (55m), Végétation (NDVI: 0.20)
- ✅ **Interprétation NDVI/NDWI** : Labels accessibles (🌿 Végétation moyenne, ☀️ Très sec)
- ✅ **Conclusion saisonnière** : (⚠️ Stress hydrique détecté, ✅ Conditions optimales, etc.)
- ✅ **Sources listées** en bas de la section

**Sources de Données**:
| Source | Type | Gratuit | Statut |
|--------|------|---------|--------|
| Open-Meteo | Météo temps réel | ✅ Oui | 100% RÉEL |
| Open-Elevation | Terrain/Élévation | ✅ Oui | 100% RÉEL |
| NASA AppEEARS | NDVI/NDWI satellite | ✅ Oui (inscription) | PRÊT (nécessite credentials) |

**Configuration NASA Earthdata** (pour données satellite réelles):
1. S'inscrire sur https://urs.earthdata.nasa.gov/
2. Activer API dans AppEEARS Settings
3. Ajouter dans `/app/backend/.env`:
   ```
   NASA_EARTHDATA_USERNAME=votre_username
   NASA_EARTHDATA_PASSWORD=votre_password
   ```

**Interprétation NDVI/NDWI** (nouveau système):
| NDVI | Interprétation |
|------|----------------|
| < 0.00 | 🪨 Sol nu ou eau |
| 0.00-0.20 | 🌾 Végétation faible |
| 0.20-0.40 | 🌿 Végétation moyenne |
| 0.40-0.60 | 🌳 Bonne végétation |
| > 0.60 | 🌲 Végétation dense |

| NDWI | Interprétation |
|------|----------------|
| < 0.00 | ☀️ Très sec |
| 0.00-0.10 | 🌤️ Sec |
| 0.10-0.25 | 💧 Humidité normale |
| 0.25-0.40 | 💦 Humide |
| > 0.40 | 🌊 Très humide |

**Testing Status**:
- **Backend**: 100% (24/24 tests passés - `/app/backend/tests/test_geospatial_apis.py`)
- **Frontend**: 100% (section "Données en temps réel" validée avec interprétation)
- **Rapport**: `/app/test_reports/iteration_18.json`

### Phase 38 - Visualisation BIONIC™ Micro-Délimitée (TERMINÉ - 2026-01-24)

**Objectif**: Améliorer la visualisation des zones BIONIC sur la carte avec des micro-zones transparentes et ultra-précises.

**Améliorations Implémentées** (`/app/frontend/src/components/TerritoryMap.jsx`):
- ✅ **Version 3.0 de generatePrecisionBionicZones()** (lignes 1216-1314):
  - Grille ultra-fine (résolution 25x25) pour micro-délimitation
  - Seuil de probabilité élevé (≥60%) pour zones pertinentes uniquement
  - Cellules hexagonales compactes (facteur 0.55 × taille de cellule)
  
- ✅ **Transparence Ultra-Légère**:
  - fillOpacity: 0.02 → 0.08 (terrain 100% visible)
  - Contours nets et visibles (poids de trait variable selon probabilité)
  - Zones ≥80% : traits pleins
  - Zones <80% : traits pointillés

- ✅ **Contrôles de Couches** (section "BIONIC™ Zones" dans sidebar):
  - Boutons "Tout" / "Aucun" / "Effacer"
  - 8 modules avec checkboxes individuelles
  - Statistiques par module : max%, moy%, nombre de zones
  - Score Global affiché

- ✅ **Interactions Améliorées**:
  - Survol (hover) : augmentation fillOpacity + épaississement trait
  - Tooltip : icône module, pourcentage, nom, rating
  - Popup détaillé avec recommandations

**Statistiques de Rendu**:
- **1390 micro-zones hexagonales** générées
- **6 modules actifs** sur 8 pour la zone de Québec :
  | Module | Max% | Moy% | Zones |
  |--------|------|------|-------|
  | Zone Humidité | 78% | ~60% | 292 |
  | Couvert Forestier | 78% | ~65% | 57 |
  | Corridors | 77% | ~65% | 105 |
  | Zone Accès | 73% | ~60% | 137 |
  | Zone Pression | 69% | ~62% | 738 |
  | Géomorphologie | 67% | ~60% | 61 |

**Testing Status**:
- **Frontend**: 100% (toutes fonctionnalités validées)
- **Rapport**: `/app/test_reports/iteration_19.json`

**Amélioration UX - Auto-Scroll** (2026-01-24):
- ✅ Le panneau "Couches de carte" s'ouvre automatiquement après l'analyse BIONIC
- ✅ Scroll automatique vers la section "BIONIC™ Zones" 
- ✅ Panneau scrollable avec `max-h-[70vh]` pour éviter le débordement
- ✅ Section BIONIC visible immédiatement avec statistiques des modules

**Note**: Les zones sont maintenant très transparentes comme demandé par l'utilisateur, permettant de voir parfaitement le terrain sous-jacent tout en identifiant les zones de probabilité élevée.

### Phase 39 - Mon Territoire BIONIC™ - Architecture Complète (EN COURS - 2026-01-24)

**Objectif**: Créer une nouvelle section "Mon territoire BIONIC™" sur la page d'accueil avec un moteur de scoring multi-couches ultra précis et un modèle hybride entreprise-grade.

**Phase 1 - Structure de Base (TERMINÉ)**:

**Core Modules** (`/app/frontend/src/core/bionic/`):
- ✅ `bionicConfig.js` : Configuration centrale (poids, seuils, coefficients par peuplement/topo/alimentation/repos/hydro/météo)
- ✅ `bionicScoring.js` : 16 fonctions de scoring + 6 calculs par catégorie (H/R/S/A/T/P) + score global
- ✅ `bionicWeatherEngine.js` : Météo LIVE via Open-Meteo (thermiques, fronts, conditions de chasse)
- ✅ `bionicHybridModel.js` : Modèle hybride (règles + appel IA GPT-4o)
- ✅ `bionicStrategyEngine.js` : Stratégie complète (stand, approche, gibier, risques, produits)
- ✅ `bionicDataAdapter.js` : Adaptateur de données pour tous les formats
- ✅ `index.js` : Exports centralisés + constantes BIONIC_LAYERS et SCORE_CATEGORIES

**Hooks React** (`/app/frontend/src/hooks/`):
- ✅ `useBionicLayers.js` : Gestion état couches (toggle, show/hide all, groupes)
- ✅ `useBionicScoring.js` : Calcul scores simple + hybride avec cache
- ✅ `useBionicWeather.js` : Météo LIVE avec polling auto (10min)
- ✅ `useBionicStrategy.js` : Stratégie complète + mode LIVE

**Phase 2 - Section Homepage (TERMINÉ)**:

**Composant Principal** (`/app/frontend/src/components/territoire/MonTerritoireBionic.jsx`):
- ✅ Section sur page d'accueil après HeroSection
- ✅ Carte BIONIC™ interactive avec zones hexagonales colorées
- ✅ Score Global avec rating (Excellent/Très bon/Bon/Modéré)
- ✅ Bandeau météo LIVE (température, vent, score chasse)
- ✅ Panneau d'analyse avec barres de progression par catégorie
- ✅ Prochaine fenêtre optimale de chasse
- ✅ CTA "Explorer mon territoire" → /territory
- ✅ 8 boutons toggle pour les couches

**Backend AI** (`/app/backend/bionic_engine.py`):
- ✅ `POST /api/bionic/hybrid/ai-adjust` : Ajustement IA avec GPT-4o
- ✅ Analyse contextuelle (scores, waypoint, météo, saison)
- ✅ Réponse JSON structurée (adjustment, recommendations, confidence, reasoning)
- ✅ Fallback sur règles si IA indisponible

**15 Couches BIONIC définies**:
1. Habitats optimaux (H)
2. Rut potentiel (R)
3. Salines potentielles (S)
4. Affûts potentiels (A)
5. Trajets de chasse (T)
6. Peuplements forestiers (P)
7. Ensoleillement
8. Orientation
9. Hydrographie avancée
10. Zones d'alimentation
11. Zones de repos
12. NDVI / Densité végétale
13. Pentes
14. Altitude relative
15. Corridors fauniques

**Phases Restantes**:
- Phase 3: CarteBionic.jsx complète + PanneauAnalyseBionic.jsx + LegendeBionic.jsx
- Phase 4: Météo LIVE avancée + BandeauMeteoBionic.jsx complet
- Phase 5: PopupStrategieBionic.jsx + intégration stratégie temps réel
- Phase 6: Admin "Cartes" (CartesAdmin.jsx + BionicCartesConfig.jsx)

### Phase 40 - Zones BIONIC Adaptatives au Zoom (TERMINÉ - 2026-01-25)

**Objectif**: Implémenter un système de zones d'analyse BIONIC entièrement adaptatif au zoom avec limite de taille de 1 km² par zone.

**Nouvelles Fonctionnalités** (`/app/frontend/src/pages/MonTerritoireBionicPage.jsx`):

**Système de Zones Adaptatives**:
- ✅ **Limite de taille max** : 1 km² par zone (rayon max 0.564 km)
- ✅ **Adaptation au zoom** :
  - Zoom 10 → ~60 zones (grandes, regroupées)
  - Zoom 12 → ~100 zones (taille moyenne)
  - Zoom 14 → ~120 zones (détaillées)
  - Zoom 16+ → ~150 zones (très détaillées, micro-zones)
- ✅ **Recalcul en temps réel** lors du zoom/dézoom et déplacement de carte
- ✅ **Grille hexagonale** : Zones en forme d'hexagone pour une couverture optimale

**Testing Status**:
- **Frontend**: 100% (12/12 fonctionnalités testées)
- **Rapport**: `/app/test_reports/iteration_20.json`

---

### Phase 41 - Persistance Backend Waypoints & Lieux (TERMINÉ - 2026-01-25)

**Objectif**: Remplacer le stockage localStorage par une API backend MongoDB pour permettre la synchronisation des données sur tous les appareils.

**Testing Status**:
- **Backend**: 100% (30/30 tests passés)
- **Frontend**: 100%
- **Rapport**: `/app/test_reports/iteration_21.json`

---

### Phase 42 - Système de Partage & Groupes de Chasse (TERMINÉ - 2026-01-25)

**Objectif**: Implémenter un système complet de partage de waypoints entre chasseurs BIONIC avec groupes de chasse, notifications et collecte marketing.

**Nouveau Module Backend - Partage** (`/app/backend/waypoint_sharing.py`):
- ✅ **Partage par Email** :
  - `POST /api/sharing/email/{owner_id}` - Partage avec plusieurs emails
  - Collecte automatique des emails dans `marketing_emails` collection
  - Création de notifications pour les destinataires membres
  - Permission "collaborate" par défaut (modification complète)

- ✅ **Partage par Lien Unique** :
  - `POST /api/sharing/link/{owner_id}` - Génère un lien UUID unique
  - `GET /api/sharing/link/{link_id}/info` - Infos sur le lien
  - `POST /api/sharing/link/{link_id}/accept` - Accepter (membres BIONIC uniquement)
  - `DELETE /api/sharing/link/{owner_id}/{link_id}` - Révoquer un lien
  - Expiration configurable (30 jours par défaut)

- ✅ **Gestion des Partages** :
  - `GET /api/sharing/received/{user_id}` - Partages reçus
  - `GET /api/sharing/sent/{user_id}` - Partages envoyés (emails + liens)

- ✅ **Notifications** :
  - `GET /api/sharing/notifications/{user_id}` - Liste avec compteur non lu
  - `PATCH /api/sharing/notifications/{user_id}/{id}/read` - Marquer lu
  - `PATCH /api/sharing/notifications/{user_id}/read-all` - Tout marquer lu
  - Types: `waypoint_shared`, `share_accessed`, `group_invite`, `member_joined`

- ✅ **Admin Marketing** :
  - `GET /api/sharing/admin/marketing-emails` - Liste emails collectés (paginé)
  - `GET /api/sharing/admin/marketing-stats` - Stats par source

**Nouveau Module Backend - Groupes** (`/app/backend/hunting_groups.py`):
- ✅ **CRUD Groupes** :
  - `POST /api/groups/{owner_id}` - Créer un groupe (max 5 par user)
  - `GET /api/groups/{user_id}/my-groups` - Mes groupes (owned + member)
  - `GET /api/groups/{group_id}/details` - Détails avec membres
  - `PUT /api/groups/{group_id}` - Modifier (owner only)
  - `DELETE /api/groups/{group_id}` - Supprimer (owner only)

- ✅ **Gestion des Membres** :
  - `POST /api/groups/{group_id}/invite` - Inviter par email
  - `POST /api/groups/{group_id}/join` - Rejoindre (public ou code)
  - `DELETE /api/groups/{group_id}/members/{member_id}` - Retirer/Quitter
  - Code d'invitation unique par groupe
  - Max 20 membres par défaut

- ✅ **Partage avec Groupe** :
  - `POST /api/groups/{group_id}/share-waypoint` - Partager avec tous les membres
  - `GET /api/groups/{group_id}/shared-waypoints` - Waypoints partagés
  - Notification à tous les membres

- ✅ **Découverte** :
  - `GET /api/groups/discover/public` - Groupes publics
  - `GET /api/groups/join-by-code/{invite_code}` - Info par code

**Nouveau Hook React** (`/app/frontend/src/hooks/useSharing.js`):
- ✅ `useWaypointSharing(userId)` - Partage par email et lien
- ✅ `useHuntingGroups(userId)` - Gestion des groupes
- ✅ `useNotifications(userId)` - Polling notifications (30s)

**Nouveaux Composants UI** (`/app/frontend/src/components/territoire/ShareComponents.jsx`):
- ✅ `ShareWaypointDialog` - Dialog avec 3 onglets (Email, Lien, Groupe)
- ✅ `CreateGroupDialog` - Création de groupe (public/privé)
- ✅ `NotificationBell` - Icône avec badge compteur

**Intégration Frontend** (`MonTerritoireBionicPage.jsx`):
- ✅ Bouton "Groupe" dans le header
- ✅ Icône notification avec badge non lu
- ✅ Bouton partage (Share2) sur chaque waypoint
- ✅ Panel de notifications dropdown

**Collections MongoDB Créées**:
- `waypoint_shares` - Partages par email
- `share_links` - Liens de partage
- `marketing_emails` - Emails collectés pour campagnes
- `notifications` - Notifications utilisateur
- `hunting_groups` - Groupes de chasse
- `group_invites` - Invitations en attente

**Testing Status**:
- **Backend**: 100% (29/29 tests passés)
- **Frontend**: 100%
- **Rapport**: `/app/test_reports/iteration_22.json`
- **Fichier de test**: `/app/backend/tests/test_sharing_groups_api.py`

**Bugs Corrigés par Testing Agent**:
- `hunting_groups.py` L410: NoneType.lower() dans invite_members
- `hunting_groups.py` L499: NoneType.lower() dans join_group

---

## Prochaines Tâches (P1)

### Météo LIVE + Bandeau
- ⬜ Intégrer useBionicWeather avec rafraîchissement auto
- ⬜ Compléter BandeauMeteoBionic avec tous les indicateurs

### Popup Stratégie + IA
- ⬜ Implémenter PopupStrategieBionic avec appel /api/bionic/hybrid/ai-adjust
- ⬜ Afficher recommandations stratégiques en temps réel

---

## Last Updated
2026-01-25 - Phase 42 : Système de Partage & Groupes de Chasse TERMINÉ

---

### Phase 43 - Tracking Live & Chat Groupe (TERMINÉ - 2026-01-25)

**Objectif**: Implémenter un tableau de bord de groupe avec tracking en temps réel des chasseurs et chat avec alertes.

**Nouveau Module Backend - Tracking** (`/app/backend/live_tracking.py`):
- ✅ **Gestion des Sessions** :
  - `POST /api/tracking/session/start/{user_id}` - Démarrer tracking (ON)
  - `POST /api/tracking/session/stop/{user_id}` - Arrêter tracking (OFF)
  - `GET /api/tracking/session/status/{user_id}` - Statut session
  - Toggle ON/OFF avec mode auto (30s) ou manuel

- ✅ **Positions en Temps Réel** :
  - `POST /api/tracking/position/{user_id}` - Update position (lat/lng/accuracy/heading/speed)
  - `GET /api/tracking/group/{group_id}/positions` - Positions tous les membres
  - Calcul automatique de la distance entre membres

- ✅ **Historique des Trajets** :
  - `GET /api/tracking/history/{user_id}` - Historique positions
  - Calcul de la distance totale parcourue
  - Stockage dans `position_history` collection

- ✅ **Paramètres** :
  - `PUT /api/tracking/settings/{user_id}` - Modifier paramètres
  - `mode`: "auto" (30s) ou "manual" (bouton)
  - `share_exact_position`: true (précise) ou false (~100m)
  - `update_interval`: 10-300 secondes

- ✅ **WebSocket** :
  - `WS /api/tracking/ws/{group_id}/{user_id}` - Temps réel

**Nouveau Module Backend - Chat** (`/app/backend/group_chat.py`):
- ✅ **Messages** :
  - `POST /api/chat/{group_id}/message/{user_id}` - Envoyer message (text/location)
  - `GET /api/chat/{group_id}/messages` - Récupérer messages (paginé)
  - `PATCH /api/chat/{group_id}/messages/read/{user_id}` - Marquer lu
  - `GET /api/chat/{group_id}/unread-count/{user_id}` - Compteur non lu

- ✅ **Alertes avec Vibration** :
  - `POST /api/chat/{group_id}/alert/{user_id}` - Envoyer alerte
  - `GET /api/chat/alert-types` - Types disponibles

**8 Types d'Alertes BIONIC**:
| Type | Emoji | Vibration | Priorité |
|------|-------|-----------|----------|
| animal_spotted | 🦌 | ✅ | high |
| need_help | 🆘 | ✅ | urgent |
| shot_fired | 🎯 | ✅ | high |
| silence | 🤫 | ✅ | high |
| meeting_point | 🤝 | ✅ | normal |
| position_marked | 📍 | ❌ | normal |
| returning | 🏠 | ❌ | normal |
| break_time | ☕ | ❌ | low |

**Nouveau Hook React** (`/app/frontend/src/hooks/useLiveTracking.js`):
- ✅ `useLiveTracking(userId, groupId)` - Tracking avec géolocalisation
- ✅ `useGroupChat(userId, groupId)` - Chat avec WebSocket

**Nouveau Composant UI** (`/app/frontend/src/components/territoire/GroupDashboard.jsx`):
- ✅ **Onglet Carte** : Positions des membres avec icônes colorées, trajets
- ✅ **Onglet Membres** : Liste avec statut online/offline et distance
- ✅ **Onglet Chat** : Messages, alertes rapides, compteur non lu
- ✅ **Toggle ON/OFF** dans le header
- ✅ **Paramètres** : Mode et confidentialité

**Collections MongoDB Créées**:
- `tracking_sessions` - Sessions de tracking actives
- `position_history` - Historique des positions (trajets)
- `chat_messages` - Messages du chat de groupe

**Testing Status**:
- **Backend**: 100% (25/25 tests passés)
- **Rapport**: `/app/test_reports/iteration_23.json`
- **Fichier de test**: `/app/backend/tests/test_live_tracking_chat.py`

---

### Phase 44 - Intégration UI GroupDashboard & UX Scroll (TERMINÉ - 2026-01-25)

**Objectif**: Intégrer le composant GroupDashboard dans l'interface utilisateur et améliorer l'expérience utilisateur.

**Modifications Frontend** (`/app/frontend/src/pages/MonTerritoireBionicPage.jsx`):
- ✅ **Import GroupDashboard** et hook `useHuntingGroups`
- ✅ **Menu Groupe Dropdown** : Remplacé le bouton simple par un DropdownMenu avec :
  - "Créer un groupe" pour ouvrir le dialog de création
  - "Mes groupes" listant tous les groupes de l'utilisateur
  - Badge compteur du nombre de groupes
- ✅ **GroupDashboard Modal** : Dialog s'ouvrant quand on clique sur un groupe
  - Onglets Carte/Membres/Chat
  - Toggle vibration ON/OFF dans le Chat
  - Tracking live des membres
- ✅ **Correction bugs** :
  - `refresh: refreshGroups` - Le hook retourne `refresh`, pas `refreshGroups`
  - `allGroups: myGroups` - Le hook retourne `allGroups` comme tableau combiné

**Toggle Vibration** (`/app/frontend/src/components/territoire/GroupDashboard.jsx`):
- ✅ **Bouton ON/OFF** dans la section alertes du Chat (lignes 541-568)
- ✅ **Persistance localStorage** : `bionic_vibration_enabled`
- ✅ **Feedback visuel** : Couleur verte (ON) ou grise (OFF)
- ✅ **Toast de confirmation** lors du changement

**Vitesse de Défilement Réduite** :
- ✅ **JavaScript** (`/app/frontend/src/App.js` lignes 1254-1288) :
  - `SCROLL_STEP = 40px` (réduit de ~100px par défaut)
  - ArrowUp/ArrowDown : 40px de défilement
  - PageUp/PageDown : 40% de la hauteur viewport (au lieu de 100%)
- ✅ **CSS** (`/app/frontend/src/index.css` lignes 126-164) :
  - `scroll-behavior: smooth` global
  - Classes utilitaires `.smooth-scroll`

**Testing Status**:
- **Frontend**: 100% (6/6 fonctionnalités testées)
- **Rapport**: `/app/test_reports/iteration_24.json`

---

### Phase 45 - Zones BIONIC Micro-délimitées (TERMINÉ - 2026-01-25)

**Objectif**: Implémenter des zones d'analyse ultra-précises avec cercles fins, transparence élevée et pourcentages dynamiques.

**Nouveau Composant** (`/app/frontend/src/components/territoire/BionicMicroZones.jsx`):
- ✅ **Cercles micro-délimités** avec contours nets (2-3.5px)
- ✅ **Transparence élevée** (fillOpacity 0.02-0.15) - terrain visible
- ✅ **Ombres portées légères** pour lisibilité
- ✅ **Cercles concentriques** pour zones ≥70% (pointillés)
- ✅ **Tooltips enrichies** au survol avec:
  - Module thématique + icône
  - Pourcentage de probabilité
  - Interprétation contextuelle (Fort/Moyen/Faible)
  - Rayon en km
- ✅ **Corridors pointillés** (lignes épaisses dashArray 12,8)
- ✅ **Zones tampons** pour transitions
- ✅ **9 modules thématiques**: habitats, rut, affûts, corridors, alimentation, repos, fraîcheur, salines, transition

**Contrôles UI** (`/app/frontend/src/pages/MonTerritoireBionicPage.jsx`):
- ✅ **Mode Micro/Classique** : Basculement entre cercles et hexagones
- ✅ **Toggle Cercles concentriques** : Affiche/masque cercles internes
- ✅ **Toggle Corridors & Tampons** : Affiche/masque lignes pointillées
- ✅ **Slider Seuil minimum** : Filtre zones < X% (30-80%)
- ✅ **Badge compteur zones** : "50 Micro" ou "100 Classique"

**Mode Confidentialité**:
- ✅ **Toggle Mode Privé** : Masque waypoints et lieux enregistrés
- ✅ **Feedback visuel** : "Données personnelles masquées" / "Waypoints et lieux visibles"
- ✅ **Icône Lock/Unlock** selon état

**Priorisation par pourcentage**:
- ✅ Zones ≥50% toujours affichées
- ✅ Zones <50% masquées sauf si chevauchement
- ✅ Cumul de pourcentages si chevauchement

**Styles CSS** (`/app/frontend/src/index.css` lignes 166-260):
- ✅ `.bionic-zone-circle` avec drop-shadow
- ✅ Animation pulse pour cercles concentriques
- ✅ Tooltip personnalisé transparent
- ✅ Indicateurs de priorité

**Testing Status**:
- **Frontend**: 100% (9/9 fonctionnalités testées)
- **Rapport**: `/app/test_reports/iteration_25.json`

---

### Phase 46 - Zones Favorites & Alertes Conditions Optimales (TERMINÉ - 2026-01-25)

**Objectif**: Système de favoris de zones avec alertes 3 jours à l'avance pour conditions optimales de chasse.

**Backend** (`/app/backend/zone_favorites.py`):
- ✅ **CRUD Zones Favorites**: POST/GET/DELETE avec calcul automatique des conditions
- ✅ **Calcul Conditions Optimales** basé sur:
  - **Météo** (Open-Meteo API 7 jours): température, précipitations, vent
  - **Phase Lunaire**: calcul algorithmique avec score de chasse
  - **Activité Thermique**: différentiel jour/nuit, humidité
  - **Vent Favorable**: vitesse et direction selon type de zone
- ✅ **Score Composite** (0-100) avec interprétation:
  - 85%+ : "🎯 Conditions exceptionnelles"
  - 75%+ : "✅ Très bonnes conditions"
  - 65%+ : "👍 Conditions favorables"
  - <65% : "⚠️ Conditions moyennes"
- ✅ **Alertes Automatiques**: Génération pour jours avec score ≥75% dans les X jours configurés
- ✅ **APIs**:
  - `POST /api/zones/favorites` - Ajouter zone
  - `GET /api/zones/favorites` - Lister zones
  - `DELETE /api/zones/favorites/{id}` - Supprimer zone
  - `GET /api/zones/alerts` - Alertes avec compteur non lues
  - `PUT /api/zones/alerts/{id}/read` - Marquer comme lue
  - `GET /api/zones/favorites/{id}/conditions` - Prévisions 7 jours
  - `POST /api/zones/check-optimal-conditions` - Vérifier toutes les zones

**Frontend** (`/app/frontend/src/components/territoire/ZoneFavorites.jsx`):
- ✅ **Hook useZoneFavorites**: Gestion état et appels API
- ✅ **AlertsPanel**: Panneau alertes avec:
  - Icône cloche animée si alertes non lues
  - Badge compteur non lues
  - Bouton "Tout lire"
  - Interprétation des conditions
- ✅ **FavoritesList**: Liste zones favorites avec:
  - Prochaine fenêtre optimale
  - Dialog détails avec prévisions 7 jours
  - Graphique de progression par jour
- ✅ **AddToFavoritesButton**: Bouton étoile dans tooltips zones

**Intégration** (`MonTerritoireBionicPage.jsx`):
- ✅ Panneau d'analyse réorganisé avec: Alertes → Favoris → Score Global
- ✅ Bouton ⭐ dans tooltip des zones micro pour ajouter/retirer
- ✅ Indicateur étoile sur zones favorites

**Collections MongoDB**:
- `favorite_zones`: Zones favorites avec paramètres alerte
- `zone_alerts`: Alertes générées avec conditions détaillées

**Testing Status**:
- **Backend**: 100% (22/22 tests)
- **Frontend**: 100% (9/9 composants)
- **Rapport**: `/app/test_reports/iteration_26.json`

---

### Phase 47 - Style Visuel "Dany Lavoie" (TERMINÉ - 2026-01-25)

**Objectif**: Reproduire fidèlement le style des cercles de la carte de référence "Dany Lavoie".

**Caractéristiques du style**:
- ✅ **Contours ÉPAIS** : 4-6px selon la probabilité (6px au survol)
- ✅ **Remplissage SEMI-TRANSPARENT** : 20-35% opacity, terrain toujours visible
- ✅ **Couleurs VIVES et SATURÉES** :
  - Vert vif : `#00CC00` (habitats, alimentation)
  - Orange vif : `#FF9900` (corridors)
  - Jaune vif : `#FFFF00` (salines)
  - Cyan vif : `#00CCFF` (fraîcheur)
  - Magenta : `#FF0066` (rut)
  - Violet : `#9900FF` (affûts)
- ✅ **PAS d'ombre ni de glow** : Rendu net et propre
- ✅ **Cercles concentriques SOLIDES** : Pas de pointillés, lignes pleines
- ✅ **Lignes de corridors ÉPAISSES** : dashArray='15, 10', width=5

**Modifications** (`/app/frontend/src/components/territoire/BionicMicroZones.jsx`):
- `getStrokeWeight()` : Retourne 4-6px selon pourcentage
- `getFillOpacity()` : Retourne 20-35% pour semi-transparence
- `getStrokeOpacity()` : Retourne 85-100% pour contours nets
- `BIONIC_MODULES` : Couleurs saturées style Dany Lavoie
- Cercles concentriques sans dashArray

**CSS** (`/app/frontend/src/index.css`):
- Suppression des `filter: drop-shadow()` et `box-shadow`
- Style `.bionic-zone-circle` minimaliste

**Testing Status**:
- **Frontend**: 100% (8/8 fonctionnalités style)
- **Rapport**: `/app/test_reports/iteration_27.json`

---

### Phase 48 - Analyse Globale sur Toute la Carte (TERMINÉ - 2026-01-25)

**Objectif**: L'analyse BIONIC couvre désormais toute l'étendue visible de la carte, pas seulement autour de la position utilisateur.

**Problème résolu**:
- Avant : ~50 zones générées autour d'un point central
- Après : ~900-1700 zones couvrant TOUTE la zone visible

**Modifications** (`/app/frontend/src/pages/MonTerritoireBionicPage.jsx`):
- ✅ **ZoomHandler étendu** : Nouveau callback `onBoundsChange` transmettant `{north, south, east, west}`
- ✅ **État `currentMapBounds`** : Stocke les limites visibles de la carte
- ✅ **`handleBoundsChange`** : Callback déclenchant la régénération des zones
- ✅ **`bionicZonesData` useMemo** : Priorise les bounds quand disponibles
- ✅ **`generateAdaptiveBionicZonesForBounds()`** : Génère hexagones sur toute la zone

**Nouveau** (`/app/frontend/src/components/territoire/BionicMicroZones.jsx`):
- ✅ **`generateMicroZonesForBounds(bounds, zoom, layersVisible)`** :
  - Calcule une grille couvrant toute la zone visible
  - Génère des cercles pour chaque module actif
  - Limite adaptive : maxCells 12-25 selon zoom
  - Corridors et zones tampons inclus

**Comptage des zones par zoom**:
| Zoom | Zones | Rayon |
|------|-------|-------|
| 10 | ~400 | 400m |
| 12 | ~900 | 200m |
| 14 | ~1700 | 100m |
| 16 | ~2000 | 50m |

**Performance**:
- ~5000 SVG paths rendus sans lag
- Mise à jour fluide au pan/zoom
- Optimisation via limitation du nombre de cellules

**Testing Status**:
- **Frontend**: 100% (6/6 fonctionnalités couverture globale)
- **Rapport**: `/app/test_reports/iteration_28.json`

---

### Phase 49 - Épaisseur Adaptative des Bordures au Zoom (TERMINÉ - 2026-01-25)

**Objectif**: Ajuster automatiquement l'épaisseur des bordures selon le niveau de zoom pour une lisibilité optimale.

**Comportement**:
| Zoom | Épaisseur | Usage |
|------|-----------|-------|
| ≤10 | ~1.5-2px | Vue globale, lisibilité maximale |
| 11-13 | ~4-5px | Vue régionale |
| ≥14 | ~5.5-7px | Analyse détaillée, zones bien marquées |

**Implémentation** (`/app/frontend/src/components/territoire/BionicMicroZones.jsx`):
- ✅ **`getStrokeWeight(percentage, isHovered, zoom)`** :
  - `zoomFactor` : 0.4 (z<10), 0.6 (z10), 1.0 (z12), 1.2 (z14), 1.4 (z16+)
  - Limites : min 1.5px, max 7px
- ✅ **`getConcentricStrokeWeight(zoom, index)`** :
  - Cercles internes avec épaisseur graduée
  - Adaptatif au zoom
- ✅ **CorridorLine adaptatif** :
  - `getCorridorWeight()` : 2-7px selon zoom
  - `getDashArray()` : '8,5' à '18,12' selon zoom
- ✅ **useEffect zoomend** : Mise à jour réactive au changement de zoom
- ✅ **currentZoom prop** : Passé à MicroZone pour épaisseur correcte

**Résultats mesurés**:
- Zoom 3 : avg 1.99px (1.6-2px)
- Zoom 12 : avg 4.96px (4-5px)
- Zoom 18 : avg 6.91px (5.6-7px)

**Testing Status**:
- **Frontend**: 100% (6/6 fonctionnalités épaisseur adaptative)
- **Rapport**: `/app/test_reports/iteration_29.json`

---

### Phase 50 - Exclusion Automatique des Zones Aquatiques (TERMINÉ - 2026-01-26)

**Objectif**: Empêcher les zones d'analyse BIONIC d'apparaître sur les surfaces d'eau (fleuves, lacs, rivières) en utilisant des sources hydrographiques officielles.

**Sources Hydrographiques Officielles** (par priorité):
| Source | Type | Couverture | Priorité |
|--------|------|------------|----------|
| Québec MRNF/MSP | WFS | Province du Québec | 1 |
| Canada CanVec (NRCan) | WFS | Tout le Canada | 2 |
| USA USGS NHD | ArcGIS REST | États-Unis continental | 3 |
| OpenStreetMap | Overpass API | Monde entier (fallback) | 99 |

**Backend** (`/app/backend/hydrography_service.py`):
- ✅ **`detect_region(lat, lng)`** : Détecte les sources disponibles pour une position
- ✅ **`fetch_water_features_multi_source(lat, lng, radius)`** : Récupère les surfaces d'eau depuis les sources officielles
- ✅ **`fetch_water_features_quebec()`** : Requête WFS MRNF
- ✅ **`fetch_water_features_canada()`** : Requête WFS CanVec NRCan
- ✅ **`fetch_water_features_usa()`** : Requête ArcGIS REST USGS NHD
- ✅ **`fetch_water_features_osm()`** : Fallback OpenStreetMap Overpass API
- ✅ **`filter_zones_exclude_water(zones, bounds, tolerance)`** : Filtre les zones sur l'eau
- ✅ **`is_point_in_water(lat, lng, features, tolerance)`** : Vérifie si un point est dans l'eau
- ✅ **Cache hydrographique** : 1 heure de durée
- ✅ **Tolérance de 5 mètres** du rivage par défaut

**Backend Router** (`/app/backend/hydrography_router.py`):
- ✅ `GET /api/hydro/sources` : Liste des sources disponibles
- ✅ `GET /api/hydro/sources/detect?lat=X&lng=Y` : Détection des sources pour une position
- ✅ `GET /api/hydro/water-features?lat=X&lng=Y&radius=Z` : Surfaces d'eau d'une zone
- ✅ `POST /api/hydro/check-point` : Vérifie si un point est dans l'eau
- ✅ `POST /api/hydro/filter-zones` : Filtre les zones BIONIC
- ✅ `GET /api/hydro/water-types` : Types de surfaces d'eau supportés

**Types d'Eau Exclus**: lake, river, stream, pond, reservoir, canal, wetland, marsh, swamp, bay, strait, fjord, ocean, sea, lagoon, estuary, basin, waterway

**Frontend Hook** (`/app/frontend/src/hooks/useWaterExclusion.js`):
- ✅ **`filterZones(zones, bounds)`** : Filtre les zones via l'API
- ✅ **`checkPoint(lat, lng)`** : Vérifie un point spécifique
- ✅ **Cache côté client** : 1 minute de durée
- ✅ **Debounce** : 500ms pour éviter les appels excessifs

**Frontend UI** (`/app/frontend/src/pages/MonTerritoireBionicPage.jsx`):
- ✅ **Panneau "Exclusion Eau"** dans le panneau d'analyse (cyan)
- ✅ **Toggle ON/OFF** pour activer/désactiver
- ✅ **Affichage tolérance** : "Tolérance rivage: 5m"
- ✅ **Indicateur de chargement** : "Analyse hydrographique..."
- ✅ **Statistiques** : "Zones exclues: X / Y"
- ✅ **Sources utilisées** affichées après filtrage

**Testing Status**:
- **Backend**: 100% (15/15 tests passés)
- **Frontend**: 100% (toutes fonctionnalités UI validées)
- **Rapport**: `/app/test_reports/iteration_31.json`
- **Test file**: `/app/backend/tests/test_hydrography_api.py`

**Bug corrigé (Session 2)**: 
- `detect_region()` excluait incorrectement USA NHD pour certaines positions du Québec est (ex: Rimouski). 
- Corrigé en simplifiant la condition: toute position au nord du 45e parallèle et à l'est de -80° est considérée comme canadienne.

---

### Phase 51 - Exclusion Permanente et Universelle des Zones Aquatiques (TERMINÉ - 2026-01-26)

**Objectif**: Rendre l'exclusion des zones aquatiques PERMANENTE, AUTOMATIQUE et UNIVERSELLE sur toutes les cartes et toutes les couches de l'application.

**Principes appliqués**:
1. **Toujours active** - Impossible à désactiver, pas de toggle ON/OFF
2. **Universelle** - S'applique à toutes les couches (habitats, rut, salines, affûts, trajets, etc.)
3. **Multi-cartes** - Active sur Mon Territoire BIONIC ET Territoire
4. **Persistante** - Appliquée à chaque rafraîchissement, zoom, déplacement
5. **Waypoints protégés** - Impossible de créer un waypoint dans l'eau

**Service Frontend** (`/app/frontend/src/services/WaterExclusionService.js`):
- ✅ `CONFIG.ENABLED` verrouillé à `true` (Object.freeze)
- ✅ `filterZonesFromWater()` - Filtrage côté client avec cache
- ✅ `filterZonesViaAPI()` - Filtrage via API backend (plus précis)
- ✅ `checkPointInWater()` - Vérification ponctuelle (waypoints)
- ✅ Cache intelligent avec durée de 5 minutes

**Intégration MonTerritoireBionicPage** (`/app/frontend/src/pages/MonTerritoireBionicPage.jsx`):
- ✅ Import dynamique du service (lazy loading)
- ✅ useEffect avec filtrage automatique (sans condition toggle)
- ✅ Panneau UI avec badge "PERMANENT" (pas de Switch)
- ✅ Statistiques de filtrage affichées en temps réel

**Intégration TerritoryMap** (`/app/frontend/src/components/TerritoryMap.jsx`):
- ✅ `handleBionicAnalysisComplete()` applique l'exclusion aux zones générées
- ✅ `addWaypoint()` bloque les créations dans l'eau avec message d'erreur

**Testing Status**:
- **Backend**: 100% (23/23 tests passés)
- **Frontend**: 100% (toutes fonctionnalités UI validées)
- **Rapport**: `/app/test_reports/iteration_32.json`

---

### Phase 52 - Analyse BIONIC Conditionnée par Waypoints (TERMINÉ - 2026-01-26)

**Objectif**: Optimiser les performances en conditionnant la génération des zones BIONIC à la présence de waypoints actifs, et supprimer l'option de carte "Écoforestier" qui posait des problèmes d'accessibilité.

**Problème résolu - Boucle infinie React**:
- **Bug**: "Maximum update depth exceeded" sur la page Mon Territoire BIONIC
- **Cause**: `activeWaypoints` était recalculé à chaque render sans mémorisation
- **Solution**: Ajout de `useMemo` dans `/app/frontend/src/hooks/useUserData.js` pour mémoriser `activeWaypoints` et `stats`

**Changements apportés**:

1. **Génération conditionnelle des zones** (`/app/frontend/src/pages/MonTerritoireBionicPage.jsx`):
   - ✅ `bionicZonesData` retourne des tableaux vides si aucun waypoint actif
   - ✅ Message "Analyse inactive" avec instruction d'ajouter des waypoints
   - ✅ Génération ciblée autour des waypoints actifs uniquement

2. **Suppression de l'option "Écoforestier"** (`/app/frontend/src/components/territoire/EcoforestryLayers.jsx`):
   - ✅ Entrée `ecoforestry` supprimée de `BASE_MAPS`
   - ✅ Seules options disponibles: "Satellite" et "Terrain"
   - ✅ "Terrain" (OpenTopoMap) utilisé par défaut

3. **Optimisation des hooks** (`/app/frontend/src/hooks/useUserData.js`):
   - ✅ `activeWaypoints` mémorisé avec `useMemo`
   - ✅ `stats` mémorisé avec `useMemo`
   - ✅ Dépendances optimisées pour éviter les re-renders

4. **Bouton "Enregistrer un Waypoint"** (`/app/frontend/src/pages/MonTerritoireBionicPage.jsx`):
   - ✅ Nouveau bouton dropdown à droite de l'onglet "Carte BIONIC™"
   - ✅ **Option 1** : "Saisir les coordonnées" - Ouvre le dialog avec champs vides
   - ✅ **Option 2** : "Cliquer sur la carte" - Active le mode création par clic
   - ✅ Mode clic : Bandeau vert sur la carte + curseur crosshair + toast de confirmation
   - ✅ Clic sur la carte → Dialog pré-rempli avec les coordonnées exactes
   - ✅ Dialog complet avec nom, type (10 options), latitude/longitude
   - ✅ Option "Utiliser ma position actuelle"
   - ✅ Message d'astuce sur les zones BIONIC
   - ✅ Création instantanée avec toast de confirmation et synchronisation backend

**Testing Status**:
- **Frontend**: 100% (5/5 tests passés)
- **Rapport**: `/app/test_reports/iteration_33.json`

---

## Prochaines Tâches (P1)

### Messages Audio en Chasse (Suggéré par l'utilisateur)
- ⬜ Ajouter messages vocaux dans le chat de groupe
- ⬜ Enregistrement audio depuis le navigateur
- ⬜ Lecture audio dans le chat

### Phase 5 Blueprint : Admin "Cartes"
- ⬜ Page d'administration pour configurer les poids du moteur de scoring BIONIC
- ⬜ Interface de configuration des modules

### Notifications Push
- ⬜ Envoyer des notifications push pour les alertes de conditions de chasse optimales

### Visualisation Heatmap
- ⬜ Mode de visualisation "heatmap" pour les zones à forte probabilité

---

## Problèmes Connus (P2)

### NASA AppEEARS API Timeout
- **Problème**: La première requête à l'API NASA expire systématiquement
- **Impact**: Utilisation d'estimations saisonnières au lieu de données satellite réelles
- **Solution**: Implémenter système de polling et cache

### Ergonomie Popup Waypoint
- **Problème**: Le popup d'un waypoint nécessite parfois plusieurs clics pour s'afficher
- **Impact**: UX mineure
- **Solution**: Revoir gestionnaire d'événements onClick sur les marqueurs

---

## Backlog (P3)

- ⬜ Partnership Engine - Phase 3 : Contrats & Paiements
- ⬜ Personnalisation utilisateur : Épaisseur des bordures des zones
- ⬜ Intégration GeoServer

---

## Last Updated
2026-01-26 - Phase 52 : Analyse BIONIC Conditionnée par Waypoints TERMINÉ

# SCENT SCIENCE™ Laboratory - PRD

## Problème Original
Application web de laboratoire d'analyse d'attractants pour la chasse. Plateforme permettant d'analyser, comparer et acheter des attractants avec un système hybride dropshipping/affiliation.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Pydantic + Motor (MongoDB async)
- **Database**: MongoDB
- **AI Integration**: Emergent LLM Key (GPT-4.1)
- **Email**: Resend (en attente de configuration)

## Fonctionnalités Implémentées

### Core Features
- ✅ Page d'accueil avec navigation
- ✅ Module "Click & Analyse" avec IA
- ✅ Page de comparaison de produits
- ✅ Boutique avec panier
- ✅ Système hybride Dropshipping/Affiliation
- ✅ Panel administrateur protégé par mot de passe

### Admin Panel (mot de passe: Saturn5858*)
- ✅ Tableau de bord avec statistiques
- ✅ Gestion des produits (CRUD)
- ✅ Gestion des partenaires/fournisseurs
- ✅ Suivi des ventes
- ✅ Bouton d'annulation de commande
- ✅ Suivi des commissions
- ✅ Suivi des clients
- ✅ Mode Veille pour le site

### Analyse IA - SYSTÈME INTELLIGENT
- ✅ Détection automatique du produit
- ✅ Catégorisation intelligente avec mots-clés évolutifs
- ✅ Apprentissage évolutif
- ✅ Boutons ANALYSER/COMPARER sticky à droite
- ✅ Affichage des 3 meilleurs produits + BIONIC™

### SYSTÈME DE DÉCOUVERTE AUTOMATIQUE DE PRODUITS
- ✅ Détection continue des sources prioritaires
- ✅ Ingestion automatique des données produits
- ✅ Traduction auto FR/EN via IA
- ✅ Classification automatique
- ✅ Scoring sur 100 points
- ✅ Interface admin "Boîte aux lettres IA"
- ✅ Workflow d'approbation des produits

### SYSTÈME DE PARRAINAGE COMPLET (Janvier 2026)

#### Backend - `/app/backend/referral_system.py`
- ✅ **Génération de liens uniques** : Code et lien traçables par utilisateur
- ✅ **Tracking complet** : Clics, inscriptions, achats, revenus générés
- ✅ **Rabais escalatoires** configurables :
  - Bronze (0-2 acheteurs): 5%
  - Argent (3-4 acheteurs): 10%
  - Or (5-9 acheteurs): 15%
  - Platine (10-19 acheteurs): 25%
  - Diamant (20+ acheteurs): 40%
  - Partenaire Privilégié: 50%
- ✅ **Promotions saisonnières** : Pré-saison, Rut, Post-rut, Black Friday, etc.
- ✅ **Rabais par produit/catégorie/marque**
- ✅ **Niveau Partenaire Privilégié** avec commissions
- ✅ **Attribution automatique des récompenses**

#### Frontend Utilisateur - `/app/frontend/src/components/ReferralModule.jsx`
- ✅ **Page /referral** avec formulaire d'inscription
- ✅ **Tableau de bord utilisateur** :
  - Stats : Invités, Acheteurs, Revenus, Rabais actuel
  - Niveau actuel avec badge coloré
  - Progression vers le prochain niveau
  - Lien de parrainage copiable
- ✅ **Partage multi-plateformes** en 1 clic :
  - Facebook, Messenger, Instagram, TikTok
  - WhatsApp, SMS, Courriel, Copier
- ✅ **Messages préformatés** optimisés par plateforme (FR/EN)
- ✅ **CTA Partenaire Privilégié** pour utilisateurs éligibles

#### Frontend Admin - `/app/frontend/src/components/ReferralAdminPanel.jsx`
- ✅ **Tableau de bord global** :
  - Total parrains, partenaires, invités, acheteurs, revenus
  - Distribution par niveau (badges colorés)
  - Top parrains avec stats
- ✅ **Onglet "Niveaux de rabais"** :
  - Configuration éditable de chaque niveau
  - Min/Max acheteurs, % rabais, Label
  - Bouton sauvegarder
- ✅ **Onglet "Promotions saisonnières"** :
  - Créer des promotions avec dates et % rabais
  - Types : Pré-saison, Rut, Black Friday, etc.
  - Activer/désactiver en temps réel
- ✅ **Onglet "Partenaires"** :
  - Demandes en attente avec approbation/rejet
  - Liste des partenaires actifs avec commissions
  - Gestion des taux de commission

#### Endpoints API Parrainage
- `POST /api/referral/register` - Créer compte parrainage
- `GET /api/referral/user/{email}` - Récupérer compte par email
- `GET /api/referral/code/{code}` - Valider un code
- `GET /api/referral/dashboard/{user_id}` - Tableau de bord utilisateur
- `POST /api/referral/track-click` - Tracker un clic
- `POST /api/referral/register-invitee` - Enregistrer un invité
- `POST /api/referral/record-purchase` - Enregistrer un achat
- `GET /api/referral/share-messages/{user_id}` - Messages de partage
- `POST /api/referral/calculate-discount` - Calculer rabais final
- `GET/PUT /api/referral/admin/tiers` - Config niveaux
- `GET/POST/DELETE /api/referral/admin/promotions` - Promotions
- `GET/POST /api/referral/admin/partners` - Partenaires
- `GET /api/referral/admin/dashboard` - Stats admin

## Collections MongoDB
- `referral_users` - Utilisateurs du programme
- `referral_clicks` - Tracking des clics
- `referral_invites` - Invités par parrain
- `referral_rewards` - Historique des récompenses
- `referral_config` - Configuration des niveaux
- `seasonal_promotions` - Promotions saisonnières
- `product_discounts` - Rabais par produit
- `partner_applications` - Demandes de partenariat

### WIDGET FLOTTANT DE PARRAINAGE DYNAMIQUE (Janvier 2026)

#### `/app/frontend/src/components/DynamicReferralWidget.jsx`
- ✅ **Logo central** : Utilise le logo SCENT SCIENCE™ comme élément visuel principal
- ✅ **Compteur animé en temps réel** : Affiche les récompenses avec animation fluide
- ✅ **Synchronisation automatique** : Mise à jour toutes les 30 secondes sans rechargement
- ✅ **Animation lors de l'augmentation** : Effet de pulse et scale quand les valeurs changent
- ✅ **Thème adaptatif** selon la page :
  - Accueil/Magasin : Or (#f5a623)
  - Analysez : Vert émeraude
  - Comparez : Violet
  - Parrainage : Rose
- ✅ **Responsive** : Mobile (390px), Tablette (768px), Desktop (1920px)
- ✅ **États contextuels** :
  - Non connecté : Bouton "Gagnez des rabais!" + modal d'inscription
  - Connecté : Bouton "X% rabais" + panneau de statistiques extensible
- ✅ **Panneau extensible** avec :
  - Avatar/logo + nom utilisateur + badge de niveau
  - Statistiques : Acheteurs, Revenus générés, % Rabais
  - Progression vers le niveau suivant
  - Boutons de partage rapide (5 plateformes)
  - Lien de parrainage copiable
  - Accès au tableau de bord complet
- ✅ **Ne s'affiche pas** sur la page /admin
- ✅ **Intégration simple** : Un seul import dans App.js

## En Attente

### Email Service (Resend)
- ⏳ Clé API Resend à configurer
- Mode simulation actif en l'absence de clé

## Tâches Futures (Backlog)

### P2
- Rapports automatisés admin (hebdomadaire/mensuel) - Infrastructure prête
- Système d'alertes (ruptures de stock)
- Notifications push pour les parrains

## Fonctionnalités Implémentées (Janvier 2026)

### FILTRES AVANCÉS - Shop et Compare ✅
- ✅ **Composant AdvancedFilters** (`/app/frontend/src/components/filters/AdvancedFilters.jsx`)
  - Barre de recherche
  - Tri par (Classement, Score, Prix, Nom)
  - Panneau de filtres latéral avec accordéons
  - Filtres: Catégorie, Animal, Saison, Marque, Prix (range), Score (slider), Caractéristiques
  - Filtres actifs avec chips cliquables
  - Boutons Réinitialiser et Appliquer
- ✅ **Page Shop refactorisée** (`/app/frontend/src/pages/ShopPage.jsx`)
  - Filtres intégrés
  - Compteur de résultats
  - Grille responsive (1-4 colonnes)
- ✅ **Page Compare refactorisée** (`/app/frontend/src/pages/ComparePage.jsx`)
  - Sélection jusqu'à 4 produits
  - Tableau de comparaison détaillé
  - 7 critères comparés avec mise en évidence du meilleur
  - Boutons d'action (Commander/Partenaire)
- ✅ **Endpoint API** `/api/products/filter` avec tous les filtres

### SCANNER AUTOMATIQUE (Cron Job) ✅
- ✅ **Service Scheduler** (`/app/backend/services/scheduler_service.py`)
  - Planification des tâches avec APScheduler
  - Fréquences: hourly, daily, weekly, twice_daily, manual
  - Scan automatique à 3h00 par défaut
- ✅ **Endpoints API**:
  - `POST /api/scheduler/scan/schedule` - Configurer le scanner
  - `POST /api/scheduler/scan/stop` - Arrêter le scanner
  - `POST /api/scheduler/scan/run-now` - Forcer un scan immédiat
  - `GET /api/scheduler/status` - Statut du scheduler
  - `GET /api/scheduler/scan/history` - Historique des scans
  - `POST /api/scheduler/report/schedule` - Planifier rapports
- ✅ **Fonctionnalités**:
  - Initialisation automatique au démarrage
  - Sauvegarde config dans MongoDB
  - Logs des scans
  - Notifications admin lors de découvertes

### REFACTORING ARCHITECTURE ✅
- ✅ **Backend Models** (`/app/backend/models/`)
  - `product.py` - Product, ProductCreate, ProductUpdate, ProductFilter
  - `supplier.py` - Supplier, SupplierCreate
  - `order.py` - Order, OrderCreate, OrderItem
  - `analytics.py` - AnalyticsEvent
- ✅ **Backend Services** (`/app/backend/services/`)
  - `scheduler_service.py` - SchedulerService avec singleton
- ✅ **Frontend Pages** (`/app/frontend/src/pages/`)
  - `ShopPage.jsx` - Page magasin extraite
  - `ComparePage.jsx` - Page comparaison extraite
- ✅ **Frontend Components** (`/app/frontend/src/components/filters/`)
  - `AdvancedFilters.jsx` - Composant de filtres réutilisable
- ✅ **App.js allégé** - 500 lignes supprimées (ComparePage, ShopPage)

## Credentials
- Admin: `Saturn5858*`
- MongoDB: via `MONGO_URL` dans `.env`
- LLM: `EMERGENT_LLM_KEY` dans `.env`

## Fichiers Clés
- `/app/backend/server.py` - API principale (~3400 lignes)
- `/app/backend/models/` - Modèles Pydantic refactorisés
- `/app/backend/services/scheduler_service.py` - Service de planification
- `/app/backend/referral_system.py` - Service de parrainage
- `/app/backend/product_discovery.py` - Découverte auto
- `/app/frontend/src/App.js` - App principale (~1600 lignes)
- `/app/frontend/src/pages/ShopPage.jsx` - Page magasin avec filtres
- `/app/frontend/src/pages/ComparePage.jsx` - Page comparaison avec filtres
- `/app/frontend/src/components/filters/AdvancedFilters.jsx` - Filtres avancés
- `/app/frontend/src/components/DynamicReferralWidget.jsx` - Widget flottant dynamique
- `/app/frontend/src/components/ReferralModule.jsx` - Page parrainage
- `/app/frontend/src/components/ReferralAdminPanel.jsx` - Admin parrainage
- `/app/frontend/src/components/ProductDiscoveryAdmin.jsx` - Admin découverte
- `/app/frontend/src/components/AnalyzerModule.jsx` - Click & Analyse

## Changelog

### 15 Janvier 2026
- ✅ Widget flottant de parrainage dynamique (DynamicReferralWidget.jsx)
  - Compteur animé en temps réel
  - Synchronisation automatique toutes les 30 secondes
  - Thème adaptatif selon la page
  - Responsive mobile/tablette/desktop
  - Intégration du logo SCENT SCIENCE™
