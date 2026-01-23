# Titelli Marketplace - Product Requirements Document

## Aperçu du Projet
**Titelli** est une marketplace premium pour Lausanne, Suisse, connectant les entreprises locales (bien-être, restaurants, services) avec les clients et les influenceurs.

## Utilisateurs et Rôles
- **Clients** : Découvrent et achètent services/produits locaux
- **Entreprises** : Vendent leurs services, gèrent leur activité
- **Influenceurs** : Collaborent avec les entreprises pour promouvoir leurs services
- **Administrateurs** : Gèrent la plateforme

## Stack Technique
- **Frontend** : React 18, React Router, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend** : FastAPI (Python), Motor (async MongoDB), JWT Auth
- **Base de données** : MongoDB
- **Paiements** : Stripe

---

## Fonctionnalités Implémentées

### ✅ Phase 1 : Foundation (Complété)
- [x] Authentification JWT (login/register)
- [x] Gestion des entreprises et profils
- [x] Services et produits (CRUD)
- [x] Système de commandes
- [x] Système de paiement Stripe
- [x] Dashboard Admin

### ✅ Phase 2 : Dashboard Entreprise (Complété)
- [x] Gestion des services et produits
- [x] Commandes entrantes/sortantes
- [x] Gestion du stock
- [x] Agenda et calendrier
- [x] Équipe et personnel
- [x] Documents et finances
- [x] Offres et promotions
- [x] Publicités (avec paiement Stripe)

### ✅ Phase 3 : Système d'Abonnement (Complété)
- [x] Plans de base : Standard (200 CHF), Guest (250 CHF)
- [x] Plans Premium : Premium (500 CHF), MVP (1000 CHF)
- [x] Plans d'optimisation : 2K à 50K CHF
- [x] Options à la carte

### ✅ Phase 4 : Outils IA/Marketing (Complété - 23 Jan 2026)
- [x] Ciblage clients IA (campagnes, audiences)
- [x] Gestion des influenceurs
- [x] Invitations clients (sondages, rappels)
- [x] Gestes commerciaux

### ✅ Phase 5 : Module Influenceur (Complété - 23 Jan 2026)
- [x] Inscription influenceur avec réseaux sociaux (Instagram, TikTok, Facebook)
- [x] Dashboard influenceur complet
- [x] APIs profil influenceur (GET, POST, PUT)
- [x] Gestion des collaborations côté influenceur

### ✅ Refactoring (Complété - 23 Jan 2026)
- [x] EnterpriseDashboard.js réduit de 3807 à 2699 lignes
- [x] Composants extraits dans `/app/frontend/src/components/dashboard/`:
  - IAClientsSection.js
  - InfluencersSection.js
  - InvitationsSection.js
  - SubscriptionsSection.js

---

## Tâches à Venir

### 🔴 Priorité Haute (P0)

#### 1. Refonte Menu Entreprise
Restructurer le sidebar du Dashboard Entreprise selon les nouvelles spécifications utilisateur.

#### 2. Système d'Offres d'Emploi
- CRUD backend pour les offres d'emploi
- Section "Mes offres d'emplois" dans le Dashboard Entreprise
- Affichage sur la page publique entreprise et la HomePage
- Notifications aux clients

#### 3. Statistiques "Réelles"
- Backend pour tracker les vues de profils en temps réel
- Remplacer toutes les données mockées par des données réelles
- Compteurs de vues, avis, etc.

### 🟡 Priorité Moyenne (P1)

#### 4. Améliorations Profils
- Changement de photo de couverture
- Mini-labels sur les annonces (compteurs produits, formations)

#### 5. Responsivité Complète
- Audit CSS pour mobile
- Corrections sur toutes les pages

#### 6. Test du Flux Publicitaire
- Tester end-to-end le paiement publicitaire Stripe
- Vérifier l'activation après paiement

### 🟢 Priorité Basse (P2)

#### 7. Vidéo Panoramique Homepage
Intégrer une vidéo d'accueil panoramique sur la page d'accueil.

#### 8. Commentaires Défilants
Ajouter des commentaires/avis défilants sur les pages prestataires.

#### 9. Variantes d'Affichage Produits
Créer les deux variantes d'affichage alternées pour les pages produits.

---

## Endpoints API Principaux

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription (client, entreprise, influencer)
- `GET /api/auth/me` - Profil utilisateur

### Entreprises
- `GET/POST /api/enterprises` - Liste et création
- `GET/PUT /api/enterprises/{id}` - Détail et mise à jour

### Influenceurs
- `GET /api/influencers` - Liste publique
- `GET/POST/PUT /api/influencer/profile` - Profil influenceur
- `GET /api/influencer/collaborations` - Mes collaborations
- `PUT /api/influencer/collaborations/{id}/respond` - Répondre à une demande

### IA Marketing (Entreprise)
- `GET/POST /api/enterprise/ia-campaigns` - Campagnes IA
- `GET/POST /api/enterprise/invitations` - Invitations clients
- `GET/POST /api/enterprise/influencer-collaborations` - Collaborations

---

## Structure des Fichiers

```
/app/
├── backend/
│   ├── server.py (API FastAPI principale)
│   ├── requirements.txt
│   ├── uploads/ (images)
│   └── tests/
│       ├── test_api_extended.py
│       ├── test_api_production.py
│       └── test_influencer_refactoring.py
└── frontend/
    └── src/
        ├── App.js (Router principal)
        ├── components/
        │   ├── dashboard/
        │   │   ├── index.js
        │   │   ├── IAClientsSection.js
        │   │   ├── InfluencersSection.js
        │   │   ├── InvitationsSection.js
        │   │   └── SubscriptionsSection.js
        │   └── ui/ (Shadcn components)
        ├── context/
        │   └── AuthContext.js
        ├── pages/
        │   ├── HomePage.js
        │   ├── AuthPage.js
        │   ├── EnterpriseDashboard.js
        │   ├── ClientDashboard.js
        │   ├── InfluencerDashboard.js
        │   └── ...
        └── services/
            └── api.js
```

---

## Credentials de Test
- **Admin** : admin@titelli.com / Admin123!
- **Client** : test@example.com / Test123!
- **Entreprise** : spa.luxury@titelli.com / Demo123!

---

*Dernière mise à jour : 23 Janvier 2026*
