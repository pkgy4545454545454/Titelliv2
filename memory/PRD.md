# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services. Plateforme complète avec:
- Gestion des entreprises avec système de catégories/sous-catégories
- Services et produits marketplace
- Système de réservation
- Génération IA (images/vidéos publicitaires)
- Programme de fidélité cashback
- Système de paiement Stripe

## User Personas
1. **Clients** - Utilisateurs recherchant des prestataires locaux
2. **Entreprises/Prestataires** - Professionnels offrant leurs services
3. **Administrateurs** - Gestion de la plateforme

## Core Requirements

### Implemented Features ✅
- [x] Homepage avec hero vidéo, grille 5 colonnes enterprise cards
- [x] Système catégories/sous-catégories avec filtres
- [x] Page CategoryEnterprisesPage redesignée (thème blanc)
- [x] Authentification JWT (client + entreprise)
- [x] Dashboard client complet
- [x] Système de paiement Stripe
- [x] Programme cashback
- [x] Génération IA images (Media Pub) - 34 templates
- [x] Génération IA vidéos (Video Pub) - 13 templates
- [x] Offres d'emploi (12 actives)
- [x] Formations (8 actives)
- [x] Profils entreprises avec indicateurs performance

### Database Stats
- 8,251 entreprises
- 1,331 services
- 405 produits
- 515 catégories d'entreprises
- 25 catégories services
- 22 catégories produits

## Tech Stack
- **Frontend**: React 18 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB Atlas
- **Payment**: Stripe
- **AI Generation**: Sora 2 (vidéos), GPT Image (images)
- **Storage**: Cloudinary

## Last Completed (March 2, 2026)
1. ✅ Animation intro: vidéo remplacée par logo statique
2. ✅ HomePage: 5 colonnes, largeur max-w-7xl alignée header
3. ✅ Hero collé à navbar (suppression espace blanc)
4. ✅ CategoryEnterprisesPage: redesign complet thème blanc
5. ✅ Contrôle complet du site: 100% opérationnel

## Pending Tasks

### P1 - Priority High
- [ ] Réorganiser les produits sur la homepage
- [ ] Régénérer vidéo #107 sans personnes (Sora 2)

### P2 - Priority Medium
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation
- [ ] Redesign profils prestataires (sketches fournis)

### P3 - Priority Low
- [ ] Créer flyer marketing avec QR code
- [ ] Démontrer fonctionnalité multi-tags
- [ ] Créer document CDC final
- [ ] Implémenter essai gratuit IA

## API Endpoints Reference
```
GET  /api/health
GET  /api/enterprises
GET  /api/enterprise-categories
GET  /api/services-products
GET  /api/categories/services
GET  /api/categories/products
GET  /api/jobs
GET  /api/trainings
POST /api/auth/login
GET  /api/auth/me
GET  /api/media-pub/templates
GET  /api/video-pub/templates
POST /api/payments/checkout
GET  /api/cashback/balance
```

## Test Credentials
- **Client**: test.client@titelli.com / Test123!
