# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services.

## User Language: **Français**

## Last Completed (March 4, 2026)

### ✅ 15 Catégories principales avec images/vidéos de fond
Les catégories sont maintenant affichées dans l'ordre exact demandé :

| # | Catégorie | Entreprises | Vidéo |
|---|-----------|-------------|-------|
| 1 | Restauration | 671 | ✅ restaurant.mp4 |
| 2 | Personnel de maison | 76 | ✅ personnel_maison.mp4 |
| 3 | Soins esthétiques | 252 | ✅ soins_esthetiques.mp4 |
| 4 | Coiffeurs | 323 | ✅ coiffeurs.mp4 |
| 5 | Cours de sport | 87 | ✅ cours_sport.mp4 |
| 6 | Activités | 90 | ✅ activites.mp4 |
| 7 | Professionnels de santé | 329 | ✅ professionnels_sante.mp4 |
| 8 | Agent immobilier | 76 | ✅ agent_immobilier.mp4 |
| 9 | Sécurité | 5 | ✅ securite.mp4 |
| 10 | Professionnels de transports | 22 | Image |
| 11 | Professionnels d'éducation | 57 | Image |
| 12 | Professionnels administratifs | 80 | Image |
| 13 | Professionnels juridiques | 127 | Image |
| 14 | Professionnels informatiques | 71 | Image |
| 15 | Professionnels de construction | 152 | Image |

### ✅ 9 vidéos générées avec Sora 2
Toutes les vidéos demandées sont maintenant générées :
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/restaurant.mp4
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/personnel_maison.mp4
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/soins_esthetiques.mp4
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/coiffeurs.mp4
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/cours_sport.mp4
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/activites.mp4
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/professionnels_sante.mp4
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/agent_immobilier.mp4
- https://category-video-hub.preview.emergentagent.com/api/uploads/category_videos/securite.mp4

### ✅ Autres modifications de cette session
- Animation splash: Logo sans cercle
- Message d'accueil: Nouveau texte avec code promo "Neworldpourtoi"
- CGV: 13 articles complets selon la loi suisse

## Files Modified/Created
- `/app/frontend/src/pages/HomePage.js` - 15 catégories principales
- `/app/frontend/src/services/api.js` - getMainCategories()
- `/app/backend/server.py` - Endpoint /api/main-categories
- `/app/backend/scripts/create_main_categories.py` - Script création catégories
- `/app/backend/uploads/category_videos/*.mp4` - 9 vidéos

## Pending Tasks
### P1 - Priority High
- [ ] Régénérer vidéo #107 sans personnes

### P2 - Medium
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation
- [ ] Redesign profils prestataires

## API Endpoints
- GET /api/main-categories - 15 catégories principales avec vidéos

## Test Credentials
- **Client**: test.client@titelli.com / Test123!
