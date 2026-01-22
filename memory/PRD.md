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

#### Shopping Cart System (NEW)
- ✅ CartContext for global cart state
- ✅ Add to cart from services/products pages
- ✅ Add to cart from enterprise profile page
- ✅ Cart page with item management (+/- quantity, remove)
- ✅ Cart badge in header showing item count
- ✅ Cart persistence in localStorage
- ✅ Checkout process creating orders

#### Orders System (NEW)
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

#### Enterprise Dashboard
- ✅ Business statistics (views, orders, revenue, rating)
- ✅ Services/products management
- ✅ Order management
- ✅ Customer reviews
- ✅ Financial overview with commission calculation
- ✅ Subscription plans (Standard/Premium)

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
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment config
└── frontend/
    ├── src/
    │   ├── App.js             # Main app with routes
    │   ├── context/
    │   │   ├── AuthContext.js # Authentication state
    │   │   └── CartContext.js # Shopping cart state (NEW)
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── AuthPage.js
    │   │   ├── ServicesPage.js
    │   │   ├── ProductsPage.js
    │   │   ├── EnterprisesPage.js
    │   │   ├── EnterprisePage.js
    │   │   ├── CartPage.js    # (NEW)
    │   │   ├── OrdersPage.js  # (NEW)
    │   │   ├── ClientDashboard.js
    │   │   ├── EnterpriseDashboard.js
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

### Orders (NEW)
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

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@titelli.com | Admin123! |
| Client | test@example.com | Test123! |
| Enterprise | spa.luxury@titelli.com | Demo123! |

## Live URL
https://lausanne-biz.preview.emergentagent.com

## Recent Changes (January 21, 2026)

### Bug Fixes
1. **Cart System** - Implemented complete shopping cart:
   - Created CartContext.js for global cart state
   - Created CartPage.js with full cart management
   - Created OrdersPage.js for order history
   - Added cart functionality to Header.js
   - Added onAddToCart to ServiceProductCard.js
   - Updated ServicesPage.js and ProductsPage.js
   - Updated EnterprisePage.js with add to cart buttons
   - Updated App.js with CartProvider and new routes

2. **Cart Badge** - Shows item count in header

3. **Order Creation** - Cart checkout creates real orders in database

## Backlog / Future Tasks

### P1 - High Priority
- [ ] Image upload for enterprises (logo, photos)
- [ ] Real-time order notifications
- [ ] Email notifications (order confirmation, etc.)

### P2 - Medium Priority
- [ ] Video support for enterprise profiles
- [ ] Advanced search with location
- [ ] Client investment feature
- [ ] Staff management for enterprises
- [ ] Advertising platform
- [ ] Stock management

### P3 - Low Priority
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Loyalty program

## Notes
- Stripe Checkout requires opening the site directly (not in iframe)
- For testing payments, open: https://lausanne-biz.preview.emergentagent.com in a new tab
