# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services.

## User Language: **Français**

## Last Completed (March 16, 2026)

### ✅ Fix Render Deployment - Category Videos
- Moved videos from `/backend/uploads/category_videos/` to `/frontend/public/videos/`
- Updated paths in `EnterpriseCard.js`: `/api/uploads/category_videos/` → `/videos/`
- 12 videos now included in frontend build for production deployment
- **No additional action required** on Render - videos bundled with frontend

### ✅ GitHub Changes Integrated
- Header.js simplified with navigation
- HomePage.js with "Les meilleurs prestataires de ta région" title

### ✅ Professional Marketing Flyer
- Page at `/flyer` with minimalist design
- QR code, contact info, slogans

### ✅ Essai IA Gratuit à l'inscription entreprise
- 1 crédit d'image IA offert automatiquement
- Validité 90 jours après activation
- Collection MongoDB: `ai_credits`

### ✅ 15 Catégories principales avec vidéos
| # | Catégorie | Vidéo |
|---|-----------|-------|
| 1 | Restauration | ✅ |
| 2 | Personnel de maison | ✅ |
| 3 | Soins esthétiques | ✅ |
| 4 | Coiffeurs | ✅ |
| 5 | Cours de sport | ✅ |
| 6 | Activités | ✅ |
| 7 | Professionnels de santé | ✅ |
| 8 | Agent immobilier | ✅ |
| 9 | Sécurité | ✅ |
| 10-15 | Autres | Images |

## Files Modified This Session
- `/app/frontend/src/components/Header.js` - Navigation simplifiée
- `/app/frontend/src/pages/FlyerPage.js` - Flyer professionnel
- `/app/backend/server.py` - Endpoints ai-credits

## Pending Tasks

### P0 - Priority Critical
- [ ] Refinements UI/UX des cartes Enterprise:
  - Changer flèche dropdown → cercle avec '+'
  - Nettoyer titres (supprimer _ et -)
  - Changer police titres cartes
  - Ajouter flèches navigation médias
  - Remplacer étoiles par 5 bulles vertes

### P1 - Priority High
- [ ] Générer vidéos manquantes (6 catégories) - BLOQUÉ sur crédits
- [ ] Régénérer vidéo #107 sans personnes

### P2 - Medium
- [ ] Réorganiser produits/services homepage
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation

## API Endpoints
- GET /api/main-categories - 15 catégories principales
- GET /api/ai-credits - Crédits IA disponibles
- POST /api/ai-credits/use - Utiliser un crédit IA

## Key Resources
- Flyer: https://category-video-hub.preview.emergentagent.com/flyer
- Homepage: https://category-video-hub.preview.emergentagent.com/
