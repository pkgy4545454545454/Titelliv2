# Titelli - Product Requirements Document

## Problem Statement
Build a large-scale marketplace platform called "Titelli" to showcase local service providers in the Lausanne region. The platform connects businesses ("prestataires") and customers ("clients") with features for browsing, ordering, payments, and business management.

## Tech Stack
- **Frontend**: React.js with Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Payments**: Stripe (Live keys configured)

## What's Been Implemented ✅

### Core Features (Completed - January 2026)

#### Authentication System
- ✅ User registration (Client/Enterprise types)
- ✅ Login/Logout with JWT tokens
- ✅ Protected routes and middleware
- ✅ User type differentiation (client, enterprise, admin)
- ✅ Beautiful login page with split layout

#### Notifications System (NEW - January 22, 2026)
- ✅ **Real-time notifications** in header with badge counter
- ✅ **Auto-notifications** when orders are created (enterprise receives notification)
- ✅ **Dropdown** with notification list, time formatting ("À l'instant", "Il y a X min")
- ✅ **Mark as read** (single and all)
- ✅ **Notification types**: order, alert, promotion, info
- ✅ **30-second polling** for new notifications

#### Shopping Cart System
- ✅ CartContext for global cart state
- ✅ Add to cart from services/products pages
- ✅ Add to cart from enterprise profile page
- ✅ Cart page with item management (+/- quantity, remove)
- ✅ Cart badge in header showing item count
- ✅ Cart persistence in localStorage
- ✅ Checkout process creating orders

#### Orders System
- ✅ OrdersPage showing all user orders
- ✅ Order details with items, quantities, prices
- ✅ Order status badges (En attente, Confirmée, Terminée, Annulée)
- ✅ Order notes display
- ✅ Link to enterprise from order

#### Enterprise Management
- ✅ Enterprise profile creation
- ✅ Profile editing (business name, slogan, description, contact info)
- ✅ Category assignment
- ✅ Certification/Labelling badges system
- ✅ Premium status management

#### Services & Products (Forms Fixed - January 22, 2026)
- ✅ CRUD operations for services/products
- ✅ **FormModal with all required fields**: Name, Description, Type, Category, Price, Delivery
- ✅ **Category dropdown** with 13 service categories and 7 product categories
- ✅ **Validation** for required fields (name, description, price, category)
- ✅ Category filtering
- ✅ Search functionality
- ✅ Add to cart buttons on all item cards
- ✅ **Detail page** for services/products with full info, quantity selector, add to cart (NEW)

#### Client Dashboard
- ✅ Welcome message with user name
- ✅ Cashback balance display
- ✅ Order count statistics
- ✅ Recent orders list
- ✅ Navigation sidebar with all sections

#### Enterprise Dashboard (RESTRUCTURÉ - January 22, 2026)
Le menu entreprise a été entièrement restructuré avec les sections suivantes :

**PRINCIPAL**
- ✅ Accueil (Tableau de bord avec stats)
- ✅ Profil entreprise (avec upload logo)
- ✅ Mon fil d'actualité (avis clients)
- ✅ Mon feed entreprises

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
- ✅ Documents
- ✅ Immobilier
- ✅ Paramètres (abonnements)

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
