# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services.

## User Language: **Français**

## Last Completed (March 17, 2026)

### ✅ Fix Catégories et Sous-catégories dynamiques
- **Problème:** Les pages de catégories affichaient "undefined" et les sous-catégories ne montraient aucune entreprise
- **Cause:** Les sous-catégories dans le frontend ne correspondaient pas aux données réelles de MongoDB
- **Solution:** 
  1. Modifié `/api/enterprise-subcategories/{category}` pour retourner les vraies sous-catégories depuis la DB
  2. Modifié `/api/enterprises` pour utiliser le mapping des catégories principales depuis `main_categories`
  3. Corrigé `EnterpriseCard.js` pour utiliser l'API au lieu de listes statiques
  4. Corrigé le handler de clic sur les catégories (était `handleSubcategoryClick` au lieu de `handleCategoryClick`)

### ✅ Pages catégories maintenant fonctionnelles
- `/categorie/Restauration` → 671 entreprises avec 21 sous-catégories réelles
- `/categorie/Coiffeurs` → 323 entreprises avec sous-catégories (Coupe mixte, Barbier, Coiffure afro)
- Toutes les 15 catégories principales fonctionnent correctement

### ✅ Previous Completed Work
- Fix Render Deployment - Category Videos (videos in `/frontend/public/videos/`)
- Marketing Flyer at `/flyer`
- Essai IA Gratuit (1 crédit d'image IA à l'inscription)
- 15 Catégories principales avec vidéos
- Webhook synchronization avec Titelli Management (SalonPro)

## Files Modified This Session
- `/app/backend/server.py` - Modified:
  - `GET /api/enterprise-subcategories/{category}` - Returns real subcategories from DB
  - `GET /api/enterprises` - Uses main_categories mapping for category search
- `/app/frontend/src/components/EnterpriseCard.js` - Fixed:
  - Category click handler (was calling wrong function)
  - Subcategory fetching (now uses API instead of static list)
  - Removed misleading enterprise count from dropdown

## System Architecture

### Main Categories Flow
1. `main_categories` collection defines 15 main categories
2. Each main category maps to multiple DB categories (e.g., "Restauration" → ["Restaurant", "Brasserie", "Bar", etc.])
3. API uses this mapping to aggregate enterprises from all related DB categories

### Subcategories Flow
1. `/api/enterprise-subcategories/{category}` checks `main_categories` collection
2. Queries enterprises with categories in the mapped list
3. Returns distinct subcategories actually present in the database

## Pending Tasks

### P0 - Priority Critical ✅ COMPLETED
- [x] Fix category pages showing "undefined"
- [x] Fix subcategories not displaying enterprises

### P1 - Priority High
- [ ] Générer vidéos manquantes (6 catégories) - BLOQUÉ sur crédits Sora 2
- [ ] Régénérer vidéo #107 sans personnes
- [ ] Refinements UI/UX des cartes Enterprise:
  - Changer flèche dropdown → cercle avec '+' ✅ DONE
  - Nettoyer titres (supprimer _ et -)
  - Changer police titres cartes ("pro et cool")
  - Ajouter flèches navigation médias

### P2 - Medium
- [ ] Réorganiser produits/services homepage
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation

### P3 - Backlog
- [ ] Refactorer server.py (10,000+ lignes) en modules APIRouter

## API Endpoints
- `GET /api/main-categories` - 15 catégories principales avec mapping
- `GET /api/enterprise-subcategories/{category}` - Vraies sous-catégories depuis DB
- `GET /api/enterprises?category=X&subcategory=Y` - Liste entreprises avec filtres
- `GET /api/ai-credits` - Crédits IA disponibles
- `POST /api/ai-credits/use` - Utiliser un crédit IA

## Key Resources
- Preview URL: https://category-refactor-2.preview.emergentagent.com/
- Flyer: /flyer
- Test Categories: /categorie/Restauration, /categorie/Coiffeurs

## Database Collections
- `enterprises` - 8,251 entreprises avec category et subcategory
- `main_categories` - 15 catégories principales avec mapping
- `users` - Utilisateurs (clients et entreprises)
- `ai_credits` - Crédits IA pour entreprises
