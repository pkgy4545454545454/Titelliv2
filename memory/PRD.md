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

#### Services & Products
- ✅ CRUD operations for services/products
- ✅ Category filtering
- ✅ Search functionality
- ✅ Price management (CHF currency)
- ✅ Delivery flag support
- ✅ Add to cart buttons on all item cards

#### Client Dashboard
- ✅ Welcome message with user name
- ✅ Cashback balance display
- ✅ Order count statistics
- ✅ Recent orders list
- ✅ Navigation sidebar with all sections

#### Enterprise Dashboard (FULLY TESTED - January 22, 2026)
- ✅ Business statistics (views, orders, revenue, rating)
- ✅ Services/products management
- ✅ Order management with status updates
- ✅ Customer reviews
- ✅ Financial overview with commission calculation (5%)
- ✅ Subscription plans (Standard/Premium)
- ✅ **Mon équipe (Team Management)** - Add/remove team members
- ✅ **Agenda/Calendar** - Schedule appointments, availability, tasks
- ✅ **Gestion des stocks** - Stock management with alerts
- ✅ **Finances** - Income/expense tracking, transactions
- ✅ **Documents** - File storage by category (Legal, Financial, Contracts, Certificates)
- ✅ **Offres d'emploi** - Job postings with full details
- ✅ **Formations** - Training/courses offered
- ✅ **Immobilier** - Real estate listings
- ✅ **Investissements** - Investment opportunities
- ✅ **Publicités** - Advertising campaigns with stats
- ✅ **Offres & Promotions** - Special offers and discounts
- ✅ **Commandes permanentes** - Recurring orders
- ✅ **Développement** - Training resources for business development

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
- ✅ Modal dialogs
- ✅ Category badges (Certified, Labeled, Premium)
- ✅ Playfair Display font for headings

## Files Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI application (1600+ lines)
│   ├── requirements.txt       # Python dependencies
│   ├── tests/
│   │   └── test_enterprise_dashboard.py  # 27 tests
│   └── .env                   # Environment config
└── frontend/
    ├── src/
    │   ├── App.js             # Main app with routes
    │   ├── context/
    │   │   ├── AuthContext.js # Authentication state
    │   │   └── CartContext.js # Shopping cart state
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── AuthPage.js
    │   │   ├── ServicesPage.js
    │   │   ├── ProductsPage.js
    │   │   ├── EnterprisesPage.js
    │   │   ├── EnterprisePage.js
    │   │   ├── CartPage.js
    │   │   ├── OrdersPage.js
    │   │   ├── ClientDashboard.js
    │   │   ├── EnterpriseDashboard.js (1400+ lines)
    │   │   ├── AdminDashboard.js
    │   │   └── PaymentPages.js
    │   ├── components/
    │   │   ├── Header.js      # With cart badge
    │   │   ├── Footer.js
    │   │   ├── EnterpriseCard.js
    │   │   └── ServiceProductCard.js
    │   └── services/
    │       └── api.js         # API functions
    └── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Enterprises
- GET `/api/enterprises`
- GET `/api/enterprises/:id`
- POST `/api/enterprises`
- PUT `/api/enterprises/:id`

### Services/Products
- GET `/api/services-products`
- POST `/api/services-products`
- DELETE `/api/services-products/:id`

### Orders
- GET `/api/orders` - List user orders
- POST `/api/orders` - Create order from cart
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

### Enterprise Management (NEW - All tested)
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
https://lausanne-biz.preview.emergentagent.com

## Recent Changes (January 22, 2026)

### Bug Fixes
1. **Enterprise Dashboard Fix** - Fixed enterprise lookup to use user_id instead of email search
2. **All Enterprise Features Tested** - 27/27 API tests passed

### New Features Implemented & Tested
1. **Team Management** - Add/edit/delete team members with role and department
2. **Agenda System** - Create appointments, availability slots, blocked times
3. **Stock Management** - Track inventory with alerts for low stock
4. **Finance Tracking** - Record income/expenses, view summaries
5. **Document Storage** - Organize files by category
6. **Job Postings** - Create employment opportunities
7. **Training Courses** - Offer educational content
8. **Real Estate Listings** - Property management
9. **Investment Opportunities** - Crowdfunding features
10. **Advertising System** - Campaign management with stats
11. **Promotions/Offers** - Special deals and discounts
12. **Permanent Orders** - Recurring order management

## Testing

### Backend Tests
- Location: `/app/backend/tests/test_enterprise_dashboard.py`
- Tests: 27 passing
- Coverage: Auth, Team, Agenda, Finances, Stock, Documents, Jobs, Investments, Advertising

### Test Reports
- `/app/test_reports/iteration_3.json` - Latest test results

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Image upload for enterprises (logo, photos)
- [ ] Real-time order notifications
- [ ] Email notifications (order confirmation, etc.)
- [ ] Client agenda/booking system (request appointments)
- [ ] Client wishlist feature

### P2 - Medium Priority
- [ ] Video support for enterprise profiles
- [ ] Advanced search with location filtering
- [ ] Admin certification/labeling workflow improvements
- [ ] Analytics dashboard with charts

### P3 - Low Priority
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Loyalty/rewards program
- [ ] Client investment participation

## Notes
- Stripe Checkout requires opening the site directly (not in iframe)
- For testing payments, open: https://lausanne-biz.preview.emergentagent.com in a new tab
