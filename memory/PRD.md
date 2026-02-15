# PRD - Titelli Platform

## Problem Statement
Titelli is a regional service/product marketplace platform for Lausanne, Switzerland. The platform connects local businesses (enterprises) with customers looking for services and products.

## User Personas
1. **Clients** - Residents looking for local services/products
2. **Enterprise Owners** - Businesses wanting to showcase their offerings
3. **Admins** - Platform administrators managing users and content

## Core Requirements
- Business discovery and search
- Service/product catalog with categories
- User authentication and profiles
- Booking system for appointments
- Job listings from enterprises
- Training/formation marketplace
- Premium/certified/labeled enterprise badges
- Real-time notifications

## What's Been Implemented

### Session - February 15, 2026
**Homepage Redesign:**
- [x] Search bar moved from navbar to under hero video
- [x] New "Les meilleurs prestataires" section with carousel
- [x] All sections converted to carousels with navigation arrows
- [x] Card format changed to "Category - Enterprise Name"
- [x] Background color changed from dark (#050505) to light white (#FAFAFA)
- [x] Enterprises sorted by profile completeness (not alphabetically)
- [x] Light theme applied across Header, Cards, Reviews

### Previous Sessions
- Business cards PDF generation (Founder & Commercial)
- Training sheets creation (4 documents)
- Document template with header/footer
- Website logo update
- Monetization brochure (in progress)

## Architecture
```
/app
├── backend/
│   ├── server.py (FastAPI)
│   ├── models/ (MongoDB schemas)
│   ├── uploads/ (Generated files, PDFs)
│   └── .env (MONGO_URL, DB_NAME)
├── frontend/
│   ├── src/
│   │   ├── pages/ (HomePage, EnterprisesPage, etc.)
│   │   ├── components/ (EnterpriseCard, Header, Footer, etc.)
│   │   ├── services/api.js
│   │   └── index.css (Global styles)
│   └── .env (REACT_APP_BACKEND_URL)
└── PDF generation scripts (root level)
```

## Prioritized Backlog

### P0 (Critical)
- None currently

### P1 (High Priority)
- [ ] Provider profile redesign (user sketches)
- [ ] Marketing flyer with custom QR code
- [ ] Fix broken image URLs in media gallery (data migration)
- [ ] Fix potential cover image duplication bug

### P2 (Medium Priority)
- [ ] "Before/After" presentation video
- [ ] Final specifications document (CDC)
- [ ] Free AI trial feature
- [ ] Multi-tag confirmation demonstration
- [ ] Monetization brochure final design

### P3 (Low Priority)
- [ ] Eye-clock logo modification (blocked - needs SVG source)
- [ ] Refactor PDF scripts to /app/scripts directory

## Tech Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI
- **Backend:** FastAPI, MongoDB
- **PDF Generation:** reportlab, pdfplumber, Pillow
- **Payments:** Stripe
- **Notifications:** WebSocket real-time

## Test Credentials
- Email: boutique.demo@titelli.com
- Password: Demo123!

## Known Issues
1. Old media gallery URLs broken (domain change)
2. Potential cover image duplication across enterprises
3. Category names in snake_case format
