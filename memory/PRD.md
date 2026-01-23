# Titelli Marketplace - Product Requirements Document

## Aperçu du Projet
**Titelli** est une marketplace premium pour Lausanne, Suisse, connectant les entreprises locales avec les clients et les influenceurs.

## Stack Technique
- **Frontend** : React 18, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend** : FastAPI, Motor (async MongoDB), JWT Auth
- **Base de données** : MongoDB
- **Paiements** : Stripe (checkouts subscriptions et publicités)

---

## Fonctionnalités Implémentées

### ✅ Phase 1-9 : Foundation à Influenceur (Complété précédemment)
- Authentification JWT (client, entreprise, influenceur)
- Dashboards Admin, Entreprise, Client, Influenceur
- Services/Produits, Commandes, Paiements Stripe
- Système d'abonnement multi-tiers
- Outils IA/Marketing
- Dashboard Client complet avec système d'amis

### ✅ Phase 10 : Système de Candidature Complet (23 Jan 2026)
- Filtres emplois Homepage (Type, Ville, Entreprise)
- Bouton "Postuler" avec modal sélection CV
- Section "Postulations" dans Dashboard Entreprise
- Algorithme boost publicitaire (pubs payées en premier)

### ✅ Phase 11 : Corrections Multiples (23 Jan 2026)
- [x] **Inscription influenceur** : Redirige vers `/dashboard/influencer`
- [x] **Dashboard influenceur** : Stats, collaborations, réseaux sociaux fonctionnels
- [x] **Vidéo header Services/Produits** : Vidéos autoplay en arrière-plan
- [x] **Filtres emploi élargis** : Grid 4 colonnes (Type, Ville, Entreprise, Reset)
- [x] **Stripe checkout corrigé** : `response.url` au lieu de `response.checkout_url`
- [x] **Avis clients centrés** : Texte et avatar centrés dans les cartes
- [x] **Bouton switch compte** : Navigue vers section "particulier"

---

## APIs Clés

### Authentification
- `POST /api/auth/register` - Inscription (client, entreprise, influencer)
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Abonnements Stripe
- `GET /api/subscriptions/plans` - Liste des plans disponibles
- `POST /api/subscriptions/checkout?plan_id=X` - Créer checkout session
- `POST /api/webhook/stripe` - Webhook Stripe

### Publicités
- `GET /api/advertising/public` - Publicités boostées (triées par budget)
- `POST /api/enterprise/advertising` - Créer une pub
- `POST /api/enterprise/advertising/{id}/pay` - Payer pour une pub

### Emplois
- `GET /api/jobs` - Liste des offres (avec filtres type, location)
- `POST /api/jobs/{id}/apply` - Postuler à une offre
- `GET /api/enterprise/applications` - Candidatures reçues (entreprise)
- `PUT /api/enterprise/applications/{id}/status` - Modifier statut candidature

### Influenceur
- `GET /api/influencer/profile` - Profil influenceur
- `PUT /api/influencer/profile` - Modifier profil
- `GET /api/influencer/collaborations` - Mes collaborations

---

## Structure Fichiers Clés
```
/app/
├── backend/
│   ├── server.py (4000+ lignes - APIs complètes)
│   └── tests/
│       ├── test_p0_features.py
│       └── test_bug_fixes_iteration11.py
└── frontend/src/
    ├── pages/
    │   ├── HomePage.js (filtres emploi 4 cols + modal candidature)
    │   ├── ServicesPage.js (vidéo header)
    │   ├── ProductsPage.js (vidéo header)
    │   ├── ServiceProductDetailPage.js (avis centrés)
    │   ├── ClientDashboard.js
    │   ├── InfluencerDashboard.js
    │   ├── EnterpriseDashboard.js (section Postulations)
    │   └── AuthPage.js (inscription influenceur corrigée)
    └── services/
        └── api.js
```

---

## Tâches Restantes

### 🟡 P1 - Moyenne Priorité
1. **Responsivité mobile complète** - Audit CSS
2. **Refonte menu Dashboard Entreprise** - Structure selon maquettes
3. **Vidéo panoramique homepage** - Grande vidéo en hero
4. **Notifications en temps réel** - Alertes candidatures

### 🟢 P2 - Basse Priorité
1. Commentaires défilants prestataires
2. Mini-labels sur annonces
3. **Refactoring `server.py`** - Découper en routers FastAPI

---

## Credentials de Test
- **Admin** : admin@titelli.com / Admin123!
- **Client** : test@example.com / Test123!
- **Entreprise** : spa.luxury@titelli.com / Demo123!
- **Influenceur** : test_influencer2@example.com / Test123!

---

## Tests
- **iteration_10.json** : Système candidature (100% passé)
- **iteration_11.json** : Corrections multiples (100% passé)

---

*Dernière mise à jour : 23 Janvier 2026*
