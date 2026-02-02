# Titelli - Product Requirements Document

## Overview
Titelli is a regional social commerce marketplace platform for services and products in Switzerland (Lausanne region). It connects local businesses with customers for services like beauty, wellness, restaurants, and luxury retail.

## Core Features

### 1. Multi-User System
- **Clients**: Browse, book services, purchase products, social features
- **Enterprises**: Manage business profile, services, products, orders, team
- **Influencers**: Promote businesses, earn commissions
- **Admins**: Platform management, validation, analytics

### 2. Enterprise Registration System
- Pre-loaded database with 1,389+ Lausanne businesses (from multiple sources)
- Two-step registration: Select enterprise → Fill form
- Required documents: Commerce register ID, Identity document
- Manager referral selection
- Admin validation workflow with approve/reject buttons
- Status labels: "disponible" / "bientôt disponible"
- **SalonPro sync on approval** (NEW - Feb 1, 2026)

### 3. E-Commerce
- Product catalog with categories
- Shopping cart with full checkout form
- Stripe payment integration (LIVE keys)
- Order management for clients and enterprises

### 4. Advertising & Campaigns
- Multiple ad types: standard, premium, spotlight, video, banner
- Payment integration with Stripe for campaign activation
- Campaign management in Enterprise Dashboard

### 5. Social Features
- User profiles and activity feed
- Favorites and wishlists
- Reviews and ratings
- Friend suggestions

## Technical Architecture

### Backend (FastAPI)
- `/app/backend/server.py` - Main API (>10,000 lines - needs refactoring)
- MongoDB database
- JWT authentication
- Stripe integration (LIVE mode)

### Frontend (React)
- `/app/frontend/src/pages/` - Page components
- `/app/frontend/src/components/` - Reusable components
- Shadcn/UI component library
- TailwindCSS styling

### Key Endpoints
- `GET /api/enterprises/available` - List businesses for registration
- `GET /api/managers` - List Titelli managers
- `POST /api/auth/register-enterprise` - Submit registration request
- `GET /api/admin/registration-requests` - Admin pending requests
- `POST /api/admin/registration-requests/{id}/approve` - Approve registration
- `POST /api/admin/registration-requests/{id}/reject` - Reject registration
- `POST /api/enterprise/advertising` - Create ad campaign
- `POST /api/enterprise/advertising/{id}/pay` - Pay for campaign (FIXED)

## Database Schema

### enterprises collection
```javascript
{
  id: string,
  name: string,  // Some use 'name', some use 'business_name'
  status: "disponible" | "bientot_disponible",
  activation_status: "inactive" | "pending" | "active",
  owner_id: string | null,
  source: "ALCV" | "OpenStreetMap" | "EnjoyLausanne" | "PDF-ListeCommerces" | "Google-LocalSearch",
  // ... other fields
}
```

### Data Statistics (Feb 1, 2026 - UPDATED)
- **Total enterprises: 2,899** (was 1,389)
- **Lausanne only: 2,892** (was 1,382)
- Sources breakdown:
  - **local.ch: 1,510** (NEW - scraped via Playwright)
  - OpenStreetMap: 915
  - EnjoyLausanne: 166
  - ALCV: 128
  - PDF-ListeCommerces: 101
  - Google-LocalSearch: 70
  - Other: 9

### Top Categories
- Coiffeur: 146
- Coiffure & Beauté: 128
- Restaurant: 118
- Mode & Vêtements: 114
- Avocat: 73
- Assurance: 73
- Physiothérapie: 71
- Horlogerie: 70

## Credentials
- **Admin**: admin@titelli.com / Admin123!
- **Demo Client**: test.client@titelli.com / Test123!
- **Demo Enterprise**: test.entreprise@titelli.com / Test123!

## Completed Work (Feb 1, 2026)
- [x] ALCV business data import (128 enterprises)
- [x] OpenStreetMap data import (915 enterprises)
- [x] EnjoyLausanne scraping (166 enterprises)
- [x] PDF parsing for businesses (101 enterprises)
- [x] **local.ch scraping via Playwright (1,510 enterprises) - TOTAL: 2,899**
- [x] Enterprise registration page with form
- [x] Manager selection system
- [x] Admin registration validation section
- [x] Splash screen animation with video logo
- [x] Video logo in header navigation
- [x] Marketing video generation and merging
- [x] **FIX: Campaign payment bug** - Changed `business_name` to `name` with fallback
- [x] **FIX: SalonPro sync** - Added webhook call after registration approval
- [x] **UI: Gold color for "Produits" menu item**

## Completed Work (Feb 2, 2026) - NEW

### RDV chez Titelli (Social Booking)
- [x] **Backend router**: `/app/backend/routers/rdv_titelli.py`
- [x] **Frontend page**: `/app/frontend/src/pages/RdvTitelliPage.js`
- [x] **Chat temps réel**: `/app/frontend/src/pages/RdvChatPage.js` (WebSocket)
- [x] Offres pour 2 personnes (amical ou romantique)
- [x] Système d'invitations avec acceptation payante (2 CHF)
- [x] Abonnement romantique (200 CHF/mois) via Stripe
- [x] Chat temps réel entre participants
- [x] Statistiques utilisateur
- [x] Catégories: restaurant, sport, wellness, culture, nature, party, creative, autre

### Demandes Spécialistes
- [x] **Backend router**: `/app/backend/routers/specialists.py`
- [x] **Frontend page**: `/app/frontend/src/pages/SpecialistsPage.js`
- [x] Recherche IA de spécialistes
- [x] Création de demandes urgentes/spécifiques
- [x] Réponses des prestataires aux demandes
- [x] Acceptation de réponses par le client

### Lifestyle Passes
- [x] **Healthy Lifestyle Pass**: 99 CHF/mois (bien-être, santé)
- [x] **Better You Pass**: 149 CHF/mois (développement personnel)
- [x] **Special MVP Pass**: 299 CHF/mois (accès VIP exclusif)
- [x] Intégration Stripe pour tous les paiements

### Marketing Videos V2
- [x] Voiceover français généré
- [x] 5 vidéos produits v2 (chocolat, montre, soins, restaurant, vin)
- [x] Stockage: `/app/backend/uploads/media_titelli/v2/`
- [x] **UI: Splash screen exit animation** - Slide right + fade out

## Pending Tasks
- [ ] Refactor server.py into modules (CRITICAL - >10,000 lines)
- [ ] Email notifications for registration status
- [ ] Refactor dashboard components

## Known Issues
- SalonPro integration blocked on external frontend fixes
- server.py needs urgent refactoring (>10,000 lines)
- Some enterprises have `name`, some have `business_name` - normalized with fallback

## Bug Fixes Applied (Feb 1, 2026)

### Campaign Payment Bug
- **Problem**: Creating advertising campaigns failed with KeyError
- **Root Cause**: Code used `enterprise['business_name']` but some enterprises only have `name`
- **Fix**: Changed to `enterprise.get('business_name') or enterprise.get('name', 'Entreprise')`
- **Files Modified**: `/app/backend/server.py` (multiple occurrences)

### SalonPro Sync Missing
- **Problem**: Enterprise data not synced to SalonPro after approval
- **Fix**: Added `sync_enterprise_to_salonpro()` call in `approve_registration_request` endpoint
- **File Modified**: `/app/backend/server.py`

## UI/UX Updates (Feb 1, 2026)

### Header Navigation
- "Produits" menu item now displays in gold (#D4AF37)
- Added `.nav-link.gold` CSS class for highlighted menu items

### Splash Screen
- Exit animation now includes:
  - Logo slides to the right (translateX)
  - Fade out effect (opacity transition)
  - Smooth 0.6-0.8s transition timing

## Completed Work (Feb 2, 2026) - Session 2

### Titelli Pro++ (B2B)
- [x] **Backend**: `/app/backend/routers/titelli_pro.py`
- [x] **Frontend**: `/app/frontend/src/pages/TitelliProPage.js`
- [x] Livraisons B2B récurrentes (quotidien/hebdo/mensuel)
- [x] Liquidation de stock (surstock, fin saison, expiration)
- [x] Intégration Lifestyle Pass pour entreprises
- [x] Abonnement Pro++ (199 CHF/mois via Stripe)
- [x] Analytics B2B (placeholder pour graphiques)

### Sports & Compétitions
- [x] **Backend**: `/app/backend/routers/titelli_pro.py` (sports_router)
- [x] **Frontend**: `/app/frontend/src/pages/SportsPage.js`
- [x] Création de matchs (cherche adversaire/joueurs/équipe)
- [x] Création et gestion d'équipes
- [x] Compétitions et tournois
- [x] 11 catégories sportives (football, tennis, basketball, etc.)
- [x] Système de participation aux matchs

### Système de Notifications Push
- [x] **Backend**: `/app/backend/routers/notifications.py`
- [x] **Frontend**: `/app/frontend/src/components/NotificationsDropdown.js`
- [x] Notifications temps réel via WebSocket
- [x] Types: invitations RDV, messages chat, réponses spécialistes, sports
- [x] Marquer comme lu / Supprimer
- [x] Préférences utilisateur

### Navigation Header Améliorée
- [x] Lien "Rdv" en rose (#EC4899)
- [x] Lien "Sports" en vert (#10B981)
- [x] Tous les liens stylisés avec couleurs distinctives

## Routes API Ajoutées

### Titelli Pro++ (/api/pro)
- GET /api/pro/status - Statut abonnement
- POST /api/pro/subscribe - S'abonner
- GET/POST /api/pro/deliveries - Clients B2B
- GET/POST /api/pro/liquidations - Articles liquidation

### Sports (/api/sports)
- GET /api/sports/categories - Catégories sportives
- GET/POST /api/sports/matches - Matchs
- GET /api/sports/matches/my - Mes matchs
- POST /api/sports/matches/{id}/join - Rejoindre
- GET/POST /api/sports/teams - Équipes
- GET/POST /api/sports/competitions - Compétitions

### Notifications (/api/notifications)
- GET /api/notifications - Liste notifications
- GET /api/notifications/unread-count - Compteur non-lus
- POST /api/notifications/{id}/read - Marquer lu
- POST /api/notifications/read-all - Tout marquer lu
- DELETE /api/notifications/{id} - Supprimer
- GET/PUT /api/notifications/preferences - Préférences

## Backlog Restant
- [ ] Graphiques analytics détaillés
- [ ] Webhooks Stripe temps réel
- [ ] Interface admin médias marketing
- [ ] Algorithmes comportementaux (activation/désactivation)
- [ ] Refactoring server.py (>10,000 lignes)
