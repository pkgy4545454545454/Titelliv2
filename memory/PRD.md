# Titelli - Product Requirements Document

## Problem Statement
Build a large-scale marketplace platform called "Titelli" to showcase local service providers in the Lausanne region. The platform connects businesses ("prestataires") and customers ("clients") with features for browsing, ordering, payments, and business management.

## Tech Stack
- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Payments**: Stripe

## What's Been Implemented ✅

### Core Features (Completed - December 2024)

#### Authentication System
- ✅ User registration (Client/Enterprise types)
- ✅ Login/Logout with JWT tokens
- ✅ Protected routes and middleware
- ✅ User type differentiation (client, enterprise, admin)

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

#### Client Features
- ✅ Client dashboard with order history
- ✅ Cashback balance tracking
- ✅ Favorites section (UI ready)
- ✅ Agenda section (UI ready)

#### Enterprise Dashboard
- ✅ Business statistics (orders, revenue, rating)
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

#### UI/UX
- ✅ Dark theme modern design
- ✅ Responsive layout (desktop + mobile)
- ✅ Toast notifications
- ✅ Loading states
- ✅ Modal dialogs
- ✅ Category badges (Certified, Labeled, Premium)

### Database Seeding
- ✅ Admin account (admin@titelli.com)
- ✅ Test client account (test@example.com)
- ✅ 6 demo enterprises with services
- ✅ Sample reviews
- ✅ Sample orders

## Files Structure

```
/app/titelli-pure/
├── README.md                    # Documentation
├── backend/
│   ├── .env                     # Environment config
│   ├── package.json             # Dependencies
│   ├── server.js                # Express API (770+ lines)
│   └── seed.js                  # Database seeding
└── frontend/
    ├── index.html               # Homepage
    ├── auth.html                # Login/Register
    ├── services.html            # Services listing
    ├── products.html            # Products listing
    ├── entreprises.html         # Enterprises listing
    ├── entreprise.html          # Enterprise profile
    ├── dashboard-client.html    # Client dashboard
    ├── dashboard-entreprise.html # Enterprise dashboard
    ├── admin.html               # Admin panel
    ├── payment-success.html     # Payment success
    ├── payment-cancel.html      # Payment cancelled
    ├── css/style.css            # All styles
    └── js/
        ├── api.js               # API functions
        └── app.js               # Main JS logic
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

## ZIP Archive
- Location: `/app/titelli-pure.zip`
- Size: ~68 KB (without node_modules)
- Contains complete project ready to deploy

## Backlog / Future Tasks (P1-P2)

### P1 - High Priority
- [ ] Image upload for enterprises (logo, photos)
- [ ] Real-time order notifications
- [ ] Full order workflow (create, pay, complete)
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
