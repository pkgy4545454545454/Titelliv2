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
- [x] Animation intro: logo au lieu de vidéo
- [x] Vidéos catégories générées avec Sora 2 (7/9 complétées)

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

## Last Completed (March 4, 2026)

### Vidéos catégories générées avec Sora 2:
| Catégorie | Status | Fichier |
|-----------|--------|---------|
| Restaurant | ✅ Fourni par user | restaurant.mp4 |
| Personnel de maison | ✅ Généré | personnel_maison.mp4 |
| Soins esthétiques | ✅ Généré | soins_esthetiques.mp4 |
| Coiffeurs | ✅ Généré | coiffeurs.mp4 |
| Cours de sport | ✅ Généré | cours_sport.mp4 |
| Activités | ✅ Généré | activites.mp4 |
| Professionnels de santé | ✅ Généré | professionnels_sante.mp4 |
| Agent immobilier | ❌ Balance insuffisante | - |
| Sécurité | ❌ Balance insuffisante | - |

### Mapping catégories → vidéos:
- Restaurant, Coiffeur, Spa, Fitness, Beauté & Santé mappés aux vidéos correspondantes
- Fallback automatique sur image si vidéo non disponible

## Pending Tasks

### P0 - Urgent
- [ ] Générer vidéos manquantes (agent_immobilier, securite) - nécessite recharge balance Emergent LLM Key

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
GET  /api/uploads/category_videos/{filename}.mp4
```

## Files Created This Session
- `/app/backend/scripts/generate_category_videos.py` - Script Sora 2 pour générer vidéos
- `/app/backend/uploads/category_videos/*.mp4` - 7 vidéos catégories générées

## Test Credentials
- **Client**: test.client@titelli.com / Test123!
