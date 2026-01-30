# Titelli - Product Requirements Document

## Overview
Titelli is a regional social commerce marketplace platform for services and products in Switzerland (Lausanne region). It connects local businesses with customers for services like beauty, wellness, restaurants, and luxury retail.

## Core Features

### 1. Multi-User System
- **Clients**: Browse, book services, purchase products, social features
- **Enterprises**: Manage business profile, services, products, orders, team
- **Influencers**: Promote businesses, earn commissions
- **Admins**: Platform management, validation, analytics

### 2. Enterprise Registration System (NEW - Jan 30, 2026)
- Pre-loaded database with 128+ ALCV Lausanne businesses
- Two-step registration: Select enterprise → Fill form
- Required documents: Commerce register ID, Identity document
- Manager referral selection
- Admin validation workflow with approve/reject buttons
- Status labels: "disponible" / "bientôt disponible"

### 3. E-Commerce
- Product catalog with categories
- Shopping cart with full checkout form
- Stripe payment integration
- Order management for clients and enterprises

### 4. Booking System
- Service booking with calendar
- Enterprise agenda management
- SalonPro integration for external scheduling

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
- Stripe integration

### Frontend (React)
- `/app/frontend/src/pages/` - Page components
- `/app/frontend/src/components/` - Reusable components
- Shadcn/UI component library
- TailwindCSS styling

### Key Endpoints (New)
- `GET /api/enterprises/available` - List businesses for registration
- `GET /api/managers` - List Titelli managers
- `POST /api/auth/register-enterprise` - Submit registration request
- `GET /api/admin/registration-requests` - Admin pending requests
- `POST /api/admin/registration-requests/{id}/approve` - Approve registration
- `POST /api/admin/registration-requests/{id}/reject` - Reject registration

## Database Schema Updates

### enterprises collection
```javascript
{
  id: string,
  name: string,
  status: "disponible" | "bientot_disponible",
  activation_status: "inactive" | "pending" | "active",
  owner_id: string | null,
  source: "ALCV" | null,
  // ... other fields
}
```

### registration_requests collection (NEW)
```javascript
{
  id: string,
  user_id: string,
  enterprise_id: string,
  enterprise_name: string,
  commerce_register_id: string,
  manager_id: string,
  identity_document: string (base64),
  status: "pending" | "approved" | "rejected",
  user_info: { email, first_name, last_name, phone },
  created_at: datetime
}
```

### managers collection (NEW)
```javascript
{
  name: string,
  email: string,
  role: string,
  created_at: datetime
}
```

## Credentials
- **Admin**: admin@titelli.com / Admin123!
- **Demo Client**: demo.client@titelli.com / Demo2024!
- **Demo Enterprise**: demo.entreprise@titelli.com / Demo2024!

## Completed Work (Jan 30, 2026)
- [x] ALCV business data import (128 enterprises)
- [x] Enterprise registration page with form
- [x] Manager selection system
- [x] Admin registration validation section
- [x] Splash screen animation with video logo
- [x] Video logo in header navigation
- [x] Marketing video generation and merging

## Pending Tasks
- [ ] Test full registration flow end-to-end
- [ ] Email notifications for registration status
- [ ] SalonPro frontend integration (external project)
- [ ] Refactor server.py into modules
- [ ] Refactor dashboard components

## Known Issues
- SalonPro integration blocked on external frontend fixes
- server.py needs urgent refactoring (>10,000 lines)
