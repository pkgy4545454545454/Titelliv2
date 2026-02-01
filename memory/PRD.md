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

### Data Statistics (Feb 1, 2026)
- Total enterprises: 1,389
- Lausanne only: 1,382
- Sources breakdown:
  - OpenStreetMap: 915
  - EnjoyLausanne: 166
  - ALCV: 128
  - PDF-ListeCommerces: 101
  - Google-LocalSearch: 70
  - Other: 9

## Credentials
- **Admin**: admin@titelli.com / Admin123!
- **Demo Client**: test.client@titelli.com / Test123!
- **Demo Enterprise**: test.entreprise@titelli.com / Test123!

## Completed Work (Feb 1, 2026)
- [x] ALCV business data import (128 enterprises)
- [x] OpenStreetMap data import (915 enterprises)
- [x] EnjoyLausanne scraping (166 enterprises)
- [x] PDF parsing for businesses (101 enterprises)
- [x] Enterprise registration page with form
- [x] Manager selection system
- [x] Admin registration validation section
- [x] Splash screen animation with video logo
- [x] Video logo in header navigation
- [x] Marketing video generation and merging
- [x] **FIX: Campaign payment bug** - Changed `business_name` to `name` with fallback
- [x] **FIX: SalonPro sync** - Added webhook call after registration approval
- [x] **UI: Gold color for "Produits" menu item**
- [x] **UI: Splash screen exit animation** - Slide right + fade out

## Pending Tasks
- [ ] Scrape more businesses from local.ch (41,590 available)
- [ ] Email notifications for registration status
- [ ] Refactor server.py into modules (CRITICAL)
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
