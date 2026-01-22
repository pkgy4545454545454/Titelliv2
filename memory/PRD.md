# Titelli - Product Requirements Document

## Problem Statement
Build a large-scale marketplace platform called "Titelli" to showcase local service providers in the Lausanne region. The platform connects businesses ("prestataires") and customers ("clients") with features for browsing, ordering, payments, and business management.

## Tech Stack
- **Frontend**: React.js with Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe (Live keys configured)

## What's Been Implemented ✅

### Latest Updates (January 22, 2026)

#### Système d'Abonnements Complet (NEW)
- ✅ **10 forfaits principaux**: Standard (200 CHF), Guest (250 CHF), Premium (500 CHF), Premium MVP (1000 CHF), Optimisation 2K-50K CHF
- ✅ **14 options à la carte**: mensuelles et ponctuelles
- ✅ **11 features de base** incluses dans tous les forfaits
- ✅ **Interface 4 onglets**: Forfaits de base, Premium, Optimisation d'entreprise, Options à la carte
- ✅ **Paiement Stripe** intégré pour chaque forfait et option
- ✅ **API complète**: /api/subscriptions/plans, /api/subscriptions/checkout, /api/subscriptions/current

#### Outils IA & Marketing (NEW)
- ✅ **IA Ciblage Clients**: Question du jour, ciblage par audience, campagnes IA
- ✅ **Influenceurs**: Liste d'influenceurs avec filtres par catégorie, stats, tarifs
- ✅ **Invitations Clients**: Questions suggestives, invitations directes, sondages, rappels
- ✅ Note: Ces sections utilisent des données de démonstration

#### Page d'Inscription Améliorée (NEW)
- ✅ Formulaire multi-étapes (Infos personnelles → Sécurité)
- ✅ Indicateur de force du mot de passe
- ✅ Choix visuel Client/Entreprise avec icônes
- ✅ Validation à chaque étape
- ✅ Barre de progression des étapes

#### Page Profil Prestataire Améliorée (NEW)
- ✅ **Vidéo/Image panoramique** en fond
- ✅ **Photo portrait** circulaire avec badges (Certifié, Labellisé, Premium)
- ✅ **Indicateurs de performance** (Compétences, Profit, Influence, Potentiel, Performance, Évolution)
- ✅ **Commentaires défilants** avec auto-scroll et navigation
- ✅ **Variantes d'affichage**: Côte à côte / Texte dessous pour produits/services
- ✅ **Contrôles vidéo**: Play/Pause, Mute/Unmute

### Core Features (Completed - January 2026)

#### Authentication System
- ✅ User registration (Client/Enterprise types)
- ✅ Login/Logout with JWT tokens
- ✅ Protected routes and middleware
- ✅ User type differentiation (client, enterprise, admin)
- ✅ Beautiful login page with split layout

#### Notifications System
- ✅ **Real-time notifications** in header with badge counter
- ✅ **Auto-notifications** when orders are created
- ✅ **Dropdown** with notification list, time formatting
- ✅ **Mark as read** (single and all)
- ✅ **30-second polling** for new notifications

#### Shopping Cart System
- ✅ CartContext for global cart state
- ✅ Add to cart from services/products pages
- ✅ Cart page with item management
- ✅ Cart badge in header showing item count
- ✅ Cart persistence in localStorage
- ✅ Checkout process creating orders

#### Orders System
- ✅ OrdersPage showing all user orders
- ✅ Order details with items, quantities, prices
- ✅ Order status badges

#### Enterprise Management
- ✅ Enterprise profile creation and editing
- ✅ Logo upload functionality
- ✅ Certification/Labelling badges system
- ✅ Premium status management

#### Services & Products
- ✅ CRUD operations for services/products
- ✅ **Image upload** for products/services
- ✅ **FormModal with all required fields**
- ✅ Category filtering and search
- ✅ **Detail page** for services/products

#### Client Dashboard
- ✅ Welcome message with user name
- ✅ Cashback balance display
- ✅ Order count statistics
- ✅ Recent orders list

#### Enterprise Dashboard (Restructuré)
Le menu entreprise comprend les sections suivantes :

**PRINCIPAL**
- ✅ Accueil, Profil entreprise (avec upload logo), Mon fil d'actualité, Mon feed entreprises

**COMMERCIAL**
- ✅ Services & Produits (CRUD + upload image)
- ✅ Mes commandes (avec statuts et badges)
- ✅ Mes livraisons (suivi des livraisons)
- ✅ Mes activités (ventes passées, en cours, en attente)
- ✅ Gestion des stocks (alertes stock bas)
- ✅ Commandes permanentes

**MARKETING**
- ✅ Offres & Promotions
- ✅ Mes publicités (campagnes)
- ✅ Geste commercial (offres de bienvenue)
- ✅ Tendances actuelles
- ✅ Guests du moment

**RESSOURCES HUMAINES**
- ✅ Mon personnel (équipe)
- ✅ Emplois & Stages
- ✅ Formations

**FINANCES & INVESTISSEMENTS**
- ✅ Mes finances (revenus, dépenses)
- ✅ Mes cartes (paiement)
- ✅ Mes investissements
- ✅ Donations

**ACTUALITÉS & FORMATION**
- ✅ Business News (avec filtres)
- ✅ Formations métier

**COMMUNICATION**
- ✅ Messagerie
- ✅ Contacts
- ✅ Agenda

**DOCUMENTS & PARAMÈTRES**
- ✅ **Abonnements** (NOUVEAU - January 22, 2026) - Système complet de forfaits et options
- ✅ Documents
- ✅ Immobilier
- ✅ Paramètres (notifications, sécurité)

**AIDE & INFORMATIONS**
- ✅ Service client
- ✅ Partenaires (CGV, mentions légales)
- ✅ À propos

#### Admin Panel
- ✅ Global statistics
- ✅ User management
- ✅ Enterprise management
- ✅ Certification/Labelling controls

#### Payment Integration (Stripe)
- ✅ Checkout session creation
- ✅ Subscription payments
- ✅ Payment status tracking
- ✅ Success/Cancel pages
- ⚠️ Note: Stripe requires opening site in new tab (not iframe)

#### Système d'Abonnements (NOUVEAU - January 22, 2026)
Le système d'abonnements complet a été implémenté avec :

**FORFAITS DE BASE**
- ✅ Standard (200 CHF/mois) - Exposition standard, 1 pub/mois, Cash-Back, Gestion stocks
- ✅ Guest (250 CHF/mois) - Profil pro, Référencement préférentiel, Pubs illimitées

**FORFAITS PREMIUM**
- ✅ Premium (500 CHF/mois) - 4 pubs/mois, Investisseurs, Livraison 24/24, Personnel
- ✅ Premium MVP (1'000 CHF/mois) - 5 pubs + 1 vidéo, Fournisseurs, Local 24/24

**OPTIMISATION D'ENTREPRISE**
- ✅ Starter 2K (2'000 CHF/mois) - 8 pubs, Formations, Immobilier, Expert
- ✅ Starter+ 3K (3'000 CHF/mois) - 15 pubs, 5h prestations OU 2 déjeuners
- ✅ Opti 5K (5'000 CHF/mois) - 10h prestations, 3'000 CHF liquidés
- ✅ Opti 10K (10'000 CHF/mois) - 20h prestations, 7'000 CHF liquidés, Fiscaliste
- ✅ Opti 20K (20'000 CHF/mois) - 25 pubs, 40h prestations, 15'000 CHF liquidés
- ✅ Opti 50K (50'000 CHF/mois) - 80h prestations, 40'000 CHF liquidés

**OPTIONS À LA CARTE**
- ✅ Options mensuelles : Pubs extra (200 CHF), Investisseurs (300 CHF), Livraison 24/24 (300 CHF), Local (300 CHF), Fournisseurs (500 CHF), Formations (200 CHF), Recrutement (200 CHF), Immobilier (200 CHF), Expert conseil (1'000 CHF), Fiscaliste (4'000 CHF), Prestations liquidées (1'000 CHF)
- ✅ Options ponctuelles : Expert labellisation (400 CHF), 20h Prestations (1'000 CHF), 20 déjeuners équipe (2'000 CHF)

**FEATURES INCLUSES DANS TOUS LES FORFAITS**
- Fiches exigences clients
- Calendrier client
- Agenda interne
- Espace de formation, documents, finance
- Accès aux publicités spontanées
- Messagerie
- Fil d'actualités clients
- Feed des entreprises régionales
- Gestion des contacts

#### UI/UX
- ✅ Dark theme modern design
- ✅ Responsive layout (desktop + mobile)
- ✅ Toast notifications (sonner)
- ✅ Loading states and spinners
- ✅ Modal dialogs with proper forms
- ✅ Category badges (Certified, Labeled, Premium)
- ✅ Playfair Display font for headings
- ✅ Notification bell with red badge counter

## API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Notifications (NEW)
- GET `/api/notifications` - List notifications with unread_count
- GET `/api/notifications?unread_only=true` - Get unread only
- PUT `/api/notifications/{id}/read` - Mark single as read
- PUT `/api/notifications/read-all` - Mark all as read
- DELETE `/api/notifications/{id}` - Delete notification

### Enterprises
- GET `/api/enterprises`
- GET `/api/enterprises/:id`
- POST `/api/enterprises`
- PUT `/api/enterprises/:id`

### Services/Products
- GET `/api/services-products`
- GET `/api/services-products/:id`
- POST `/api/services-products`
- PUT `/api/services-products/:id`
- DELETE `/api/services-products/:id`

### Orders
- GET `/api/orders` - List user orders
- POST `/api/orders` - Create order from cart (auto-creates notification)
- PUT `/api/orders/:id/status` - Update order status

### Reviews
- GET `/api/reviews/:enterprise_id`
- POST `/api/reviews`

### Payments
- POST `/api/payments/checkout`
- GET `/api/payments/status/:session_id`

### Admin
- GET `/api/admin/stats`
- GET `/api/admin/users`
- PUT `/api/admin/users/:id/verify`

### Enterprise Management
- `/api/enterprise/team` - Team management (GET, POST, PUT, DELETE)
- `/api/enterprise/agenda` - Calendar/agenda (GET, POST, PUT, DELETE)
- `/api/enterprise/finances` - Finance tracking (GET, POST transactions)
- `/api/enterprise/stock` - Stock management (GET, POST, movement)
- `/api/enterprise/documents` - Document storage (GET, POST, DELETE)
- `/api/enterprise/jobs` - Job postings (GET, POST, DELETE)
- `/api/enterprise/trainings` - Training courses (GET, POST, DELETE)
- `/api/enterprise/real-estate` - Real estate (GET, POST, DELETE)
- `/api/enterprise/investments` - Investments (GET, POST, DELETE)
- `/api/enterprise/advertising` - Ad campaigns (GET, POST, toggle, DELETE)
- `/api/enterprise/offers` - Promotions (GET, POST, DELETE)
- `/api/enterprise/permanent-orders` - Recurring orders (GET, POST, toggle, DELETE)

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@titelli.com | Admin123! |
| Client | test@example.com | Test123! |
| Enterprise | spa.luxury@titelli.com | Demo123! |

## Live URL
https://marketplace-revamp-2.preview.emergentagent.com

## Recent Changes (January 22, 2026)

### New Features
1. **Notifications System** - Real-time notifications with auto-creation on orders
2. **Improved Forms** - All modal forms now have proper labels, validation, and category dropdowns

### Bug Fixes
1. **Enterprise Dashboard Fix** - Fixed enterprise lookup to use user_id instead of email search
2. **Form Validation** - Added client-side validation for all required fields
3. **Category Selection** - Services/products now properly save category

### Test Results
- Backend: 24/24 tests passed (notifications_and_forms.py)
- Backend: 27/27 tests passed (enterprise_dashboard.py)
- Frontend: All tests passed

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Image upload for enterprises (logo, photos)
- [ ] Client agenda/booking system (request appointments)
- [ ] Client wishlist feature
- [ ] Real-time WebSocket notifications (replace polling)

### P2 - Medium Priority
- [ ] Video support for enterprise profiles
- [ ] Advanced search with location filtering
- [ ] Admin certification/labeling workflow improvements
- [ ] Analytics dashboard with charts
- [ ] Email notifications (order confirmation, etc.)

### P3 - Low Priority
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Loyalty/rewards program
- [ ] Client investment participation

## Notes
- Stripe Checkout requires opening the site directly (not in iframe)
- For testing payments, open: https://marketplace-revamp-2.preview.emergentagent.com in a new tab
- Notifications auto-refresh every 30 seconds
