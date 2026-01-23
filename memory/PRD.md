# Titelli Marketplace - Product Requirements Document

## Aperçu du Projet
**Titelli** est une marketplace premium pour Lausanne, Suisse, connectant les entreprises locales avec les clients et les influenceurs.

## Stack Technique
- **Frontend** : React 18, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend** : FastAPI, Motor (async MongoDB), JWT Auth
- **Base de données** : MongoDB
- **Paiements** : Stripe

---

## Fonctionnalités Implémentées

### ✅ Phase 1-6 : Foundation à Refactoring (Complété précédemment)
- Authentification JWT (client, entreprise, influenceur)
- Dashboards Admin, Entreprise, Client, Influenceur
- Services/Produits, Commandes, Paiements Stripe
- Système d'abonnement multi-tiers
- Outils IA/Marketing
- Refactoring des fichiers volumineux

### ✅ Phase 7 : Dashboard Client Complet (Complété)
- Profil avec photo modifiable, LinkedIn
- Système d'amis complet
- Cartes de paiement
- Documents
- Messagerie production-ready
- "Compte particulier" (ex entrepreneur)
- Section "Demandes en cours"

### ✅ Phase 8 : Système d'Offres d'Emploi (Complété)
- CRUD Jobs complet
- Toggle activation des offres
- Section HomePage avec offres publiques
- Candidatures avec CV et lettre de motivation
- Notifications aux clients pour nouvelles offres
- Date limite support

### ✅ Phase 9 : Dashboard Influenceur Restructuré (Complété)
- Tableau de bord avec stats
- Système d'amis complet
- Offres de collaboration
- Profil éditable

### ✅ Phase 10 : Système de Candidature Complet (Complété 23 Jan 2026)
- [x] **Filtres emplois Homepage** : Type contrat (CDI, CDD, Stage, Freelance) + Localisation
- [x] **Bouton "Postuler"** sur chaque carte d'emploi
- [x] **Modal de candidature** : Sélection CV + Lettre de motivation
- [x] **Section "Postulations"** dans Dashboard Entreprise
- [x] **Gestion des statuts** : En attente / En examen / Acceptée / Refusée
- [x] **Notifications candidats** sur changement de statut
- [x] **Algorithme boost publicitaire** : Pubs payées affichées en premier, triées par budget

---

## APIs Ajoutées (Phase 10)

### Publicités Boostées
- `GET /api/advertising/public` - Liste pubs actives (triées par budget)
- `POST /api/advertising/{id}/click` - Tracking clics

### Gestion Candidatures (Entreprise)
- `GET /api/enterprise/applications` - Toutes les candidatures
- `PUT /api/enterprise/applications/{id}/status` - Modifier statut

---

## Collections MongoDB

### Existantes
- `users`, `enterprises`, `services_products`, `orders`, `notifications`
- `friendships`, `payment_cards`, `client_documents`, `messages`
- `jobs`, `job_applications`, `influencer_profiles`

### Pour la publicité
- `advertising` : Campagnes pub avec champs `is_paid`, `is_active`, `budget`, `impressions`, `clicks`

---

## Tâches Restantes

### 🔴 P0 - Haute Priorité (FAIT ✅)
1. ~~Filtres offres d'emploi~~ ✅
2. ~~Bouton Postuler avec CV~~ ✅
3. ~~Section Postulations Entreprise~~ ✅
4. ~~Algorithme boost publicitaire~~ ✅

### 🟡 P1 - Moyenne Priorité
1. **Test flux Stripe end-to-end** - Vérifier paiement abonnement et publicité
2. **Responsivité mobile complète** - Audit CSS
3. **Vidéo panoramique homepage**
4. **Refonte menu Dashboard Entreprise** - Selon structure demandée

### 🟢 P2 - Basse Priorité
1. Commentaires défilants prestataires
2. Variantes d'affichage produits
3. Mini-labels sur annonces
4. **Refactoring `server.py`** - Découper en routers FastAPI

---

## Credentials de Test
- **Admin** : admin@titelli.com / Admin123!
- **Client** : test@example.com / Test123!
- **Entreprise** : spa.luxury@titelli.com / Demo123!
- **Influenceur** : (créer via inscription)

---

## Structure Fichiers Clés
```
/app/
├── backend/
│   ├── server.py (3800+ lignes - APIs complètes)
│   └── tests/
│       ├── test_p0_features.py (nouveau)
│       └── ...
└── frontend/src/
    ├── pages/
    │   ├── HomePage.js (filtres emploi + modal candidature)
    │   ├── ClientDashboard.js
    │   ├── InfluencerDashboard.js
    │   └── EnterpriseDashboard.js (section Postulations)
    └── services/
        └── api.js (nouvelles APIs advertising, applications)
```

---

*Dernière mise à jour : 23 Janvier 2026*
