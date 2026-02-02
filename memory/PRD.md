# Titelli - Product Requirements Document

## Overview
Titelli est une plateforme de social commerce régionale pour les services et produits en Suisse (région de Lausanne). Elle connecte les entreprises locales avec les clients pour des services comme la beauté, le bien-être, les restaurants et le commerce de luxe.

## Core Features

### 1. Multi-User System
- **Clients**: Parcourir, réserver des services, acheter des produits, fonctionnalités sociales
- **Entreprises**: Gérer le profil d'entreprise, services, produits, commandes, équipe
- **Influenceurs**: Promouvoir les entreprises, gagner des commissions
- **Admins**: Gestion de la plateforme, validation, analytics

### 2. Enterprise Registration System
- Base de données pré-chargée avec 6,482+ entreprises de Lausanne
- Inscription en deux étapes : Sélectionner entreprise → Remplir formulaire
- Documents requis : ID registre du commerce, document d'identité
- Sélection du manager référent
- Workflow de validation admin avec boutons approuver/rejeter

### 3. E-Commerce
- Catalogue de produits avec catégories
- Panier avec formulaire de checkout complet
- Intégration paiement Stripe (clés LIVE)
- Gestion des commandes pour clients et entreprises

### 4. Advertising & Campaigns
- Types de publicités multiples : standard, premium, spotlight, vidéo, bannière
- Intégration paiement Stripe pour activation de campagne
- Gestion des campagnes dans le Dashboard Entreprise

### 5. Social Features
- Profils utilisateurs et fil d'activité
- Favoris et wishlists
- Avis et notations
- Suggestions d'amis

---

## NOUVELLES FONCTIONNALITÉS (Février 2026)

### 6. RDV chez Titelli (Social Booking) ✅ VÉRIFIÉ
**Routes Backend**: `/app/backend/routers/rdv_titelli.py` (1,135 lignes)
**Page Frontend**: `/app/frontend/src/pages/RdvTitelliPage.js`

**Fonctionnalités**:
- Offres pour 2 personnes (amical ou romantique)
- Système d'invitations avec acceptation payante (2 CHF)
- Abonnement romantique (200 CHF/mois) via Stripe
- Chat temps réel entre participants (WebSocket)
- 8 catégories: restaurant, sport, wellness, culture, nature, party, creative, autre

**API Endpoints**:
- `POST /api/rdv/offers` - Créer une offre
- `GET /api/rdv/offers` - Liste des offres
- `GET /api/rdv/categories` - 8 catégories
- `POST /api/rdv/invitations/{id}/accept` - Accepter invitation (2 CHF Stripe)
- `POST /api/rdv/subscriptions/romantic` - S'abonner romantique (200 CHF/mois)
- `WS /ws/rdv/{chat_room_id}` - Chat temps réel

### 7. Demandes Spécialistes ✅ VÉRIFIÉ
**Routes Backend**: `/app/backend/routers/specialists.py` (585 lignes)
**Page Frontend**: `/app/frontend/src/pages/SpecialistsPage.js`

**Fonctionnalités**:
- Recherche IA de spécialistes
- Création de demandes urgentes/spécifiques
- Système de réponses des prestataires
- 10 catégories de spécialistes

**API Endpoints**:
- `GET /api/specialists/categories` - 10 catégories
- `GET /api/specialists/search` - Recherche IA
- `POST /api/specialists/requests` - Créer demande
- `GET /api/specialists/requests/{id}/responses` - Voir réponses

### 8. Lifestyle Passes ✅ VÉRIFIÉ
**Intégré dans**: `/app/backend/routers/specialists.py`

| Pass | Prix | Inclus |
|------|------|--------|
| **Healthy Lifestyle** | 99 CHF/mois | Spa, wellness, nutrition, fitness |
| **Better You** | 149 CHF/mois | Coaching, développement personnel |
| **Special MVP** | 299 CHF/mois | Accès VIP, venues exclusives, concierge |

**API Endpoints**:
- `GET /api/specialists/passes` - Liste des passes
- `POST /api/lifestyle-passes/subscribe` - S'abonner

### 9. Titelli Pro++ (B2B) ✅ VÉRIFIÉ
**Routes Backend**: `/app/backend/routers/titelli_pro.py` (720 lignes)
**Page Frontend**: `/app/frontend/src/pages/TitelliProPage.js` (814 lignes)

**Fonctionnalités**:
- Livraisons B2B récurrentes (quotidien/hebdo/mensuel)
- Liquidation de stock (surstock, fin saison, expiration)
- Abonnement Pro++: 199 CHF/mois via Stripe
- Analytics B2B
- **Restriction**: Réservé aux comptes entreprise

**API Endpoints**:
- `GET /api/pro/status` - Statut abonnement
- `POST /api/pro/subscribe` - S'abonner Pro++ (199 CHF/mois)
- `GET /api/pro/deliveries` - Clients B2B
- `POST /api/pro/liquidations` - Articles liquidation

### 10. Sports & Compétitions ✅ VÉRIFIÉ
**Routes Backend**: `/app/backend/routers/titelli_pro.py` (sports_router)
**Page Frontend**: `/app/frontend/src/pages/SportsPage.js`

**Fonctionnalités**:
- Création de matchs (cherche adversaire/joueurs/équipe)
- Gestion d'équipes
- Compétitions et tournois
- 11 catégories sportives: Football, Tennis, Basketball, Volleyball, Badminton, Padel, Running, Swimming, Cycling, Fitness, Autre

**API Endpoints**:
- `GET /api/sports/categories` - 11 catégories
- `POST /api/sports/matches` - Créer match
- `GET /api/sports/matches/my` - Mes matchs
- `POST /api/sports/matches/{id}/join` - Rejoindre
- `POST /api/sports/teams` - Créer équipe
- `POST /api/sports/competitions` - Créer compétition

### 11. Notifications Push ✅ VÉRIFIÉ
**Routes Backend**: `/app/backend/routers/notifications.py` (316 lignes)
**Component Frontend**: `/app/frontend/src/components/NotificationsDropdown.js`

**Fonctionnalités**:
- Notifications temps réel
- Types: invitations RDV, messages chat, réponses spécialistes, sports
- Marquer comme lu / Supprimer
- Préférences utilisateur

### 12. Gamification ✅ VÉRIFIÉ
**Routes Backend**: `/app/backend/routers/gamification.py` (591 lignes)

**Fonctionnalités**:
- Points pour chaque action (+5 à +15 points)
- 8 niveaux (Débutant → Titan)
- Badges multiples catégories
- Intégration avec RDV et Sports

---

## Technical Architecture

### Backend (FastAPI)
```
/app/backend/
├── server.py                 (10,271 lignes) ⚠️ REFACTORING RECOMMANDÉ
├── routers/
│   ├── rdv_titelli.py        (1,135 lignes) ✅ NOUVEAU
│   ├── titelli_pro.py        (720 lignes)   ✅ NOUVEAU
│   ├── gamification.py       (591 lignes)   ✅ NOUVEAU
│   ├── specialists.py        (585 lignes)   ✅ NOUVEAU
│   ├── notifications.py      (316 lignes)   ✅ NOUVEAU
│   ├── enterprise.py         (280 lignes)   ✅ NOUVEAU (refactoré)
│   ├── admin.py              (220 lignes)   ✅ NOUVEAU (refactoré)
│   ├── orders.py             (200 lignes)   ✅ NOUVEAU (refactoré)
│   └── ...
│
└── TOTAL: ~15,000 lignes de code backend
```

### Frontend (React)
```
/app/frontend/src/pages/
├── RdvTitelliPage.js        ✅ NOUVEAU - Social booking
├── RdvChatPage.js           ✅ NOUVEAU - Chat temps réel
├── SpecialistsPage.js       ✅ NOUVEAU - Demandes spécialistes
├── TitelliProPage.js        ✅ NOUVEAU - B2B services (814 lignes complet)
├── SportsPage.js            ✅ NOUVEAU - Sports & compétitions
├── AdminDashboard.js
├── ClientDashboard.js
├── EnterpriseDashboard.js
└── ... (23+ pages au total)
```

### Base de Données (MongoDB)
```
Collections principales:
- enterprises: 6,482 documents
- users: 60+ documents
- shared_offers: Offres RDV Titelli
- chat_rooms / chat_messages: Chat temps réel
- specialist_requests: Demandes spécialistes
- lifestyle_subscriptions: Abonnements passes
- gamification_points / gamification_actions_log: Gamification
- sports_matches: Matchs sportifs
- notifications: 294+ notifications
```

---

## Stripe Configuration ✅ VÉRIFIÉ EN PRODUCTION
- **Mode**: LIVE (pas test)
- **API Key**: `sk_live_51RelvgKG28DxZ5CC...` ✅
- **Public Key**: `pk_live_51RelvgKG28DxZ5CC...` ✅

### Flux de Paiement
| Service | Type | Prix |
|---------|------|------|
| Abonnement Romantique | Récurrent | 200 CHF/mois |
| Acceptation invitation | One-time | 2 CHF |
| Abonnement Pro++ | Récurrent | 199 CHF/mois |
| Healthy Pass | Récurrent | 99 CHF/mois |
| Better You Pass | Récurrent | 149 CHF/mois |
| MVP Pass | Récurrent | 299 CHF/mois |

---

## Credentials de Test
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Admin** | admin@titelli.com | Admin123! |
| **Client** | test.client@titelli.com | Test123! |
| **Enterprise** | test.entreprise@titelli.com | Test123! |

---

## URL Application
**Production**: https://titelli-social.preview.emergentagent.com

---

## Tests Complétés (Février 2026)
- ✅ **Iteration 38**: Vérification Production Complète
  - 29/29 tests backend passés (100%)
  - Stripe LIVE mode vérifié
  - Toutes les nouvelles fonctionnalités testées

---

## Backlog Restant

### P1 - Priorité Haute
- [ ] Refactoring complet de server.py (~10,000 lignes restantes)
- [ ] Analytics comportemental (activation/désactivation algorithmes)
- [ ] Graphiques analytics détaillés

### P2 - Priorité Moyenne
- [ ] Logique avancée tournois Sports (brackets)
- [ ] Webhooks Stripe temps réel
- [ ] Interface admin médias marketing
- [ ] Assemblage vidéo finale 30s avec voiceover

### P3 - Backlog
- [ ] Refactoring dashboards frontend
- [ ] Email notifications status inscription
- [ ] Tendances et analytics charts

---

## Médias Marketing Générés
- **Images publicitaires**: 8 fichiers
- **Vidéos V1**: 10 fichiers
- **Vidéos V2 (révisées)**: 6 fichiers
- **Voiceover français**: 1 fichier audio
- **Screenshots**: 4 fichiers

**Téléchargement**: `/api/uploads/TITELLI_MEDIAS_COMPLET.zip` (35 MB)

---

*Document mis à jour: Février 2026*
*Version: 2.0 - Post-Vérification Production*
