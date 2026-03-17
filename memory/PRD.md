# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services.

## User Language: **Français**

## Last Completed (March 17, 2026)

### ✅ Catégories produits avec mapping DB
- Créé mapping `PRODUCT_CATEGORY_MAPPING` dans backend
- Les 22 catégories principales sont maintenant mappées vers les catégories DB
- Exemples de résultats:
  - "Courses alimentaires" → 53 produits (Supermarché, Alimentation, Épicerie...)
  - "Maquillage et beauté" → 17 produits (Cosmétiques)
  - "Automobiles" → 7 produits
  - "Appareils électroniques" → 11 produits

### ✅ UI simplifié
- Symbole + supprimé sur toutes les cartes
- Clic sur titre de catégorie → navigation directe vers page catégorie
- Plus de dropdown/sous-menu

### ✅ Pages testées et fonctionnelles
- `/products?category=Courses%20alimentaires` → 53 résultats ✅
- `/products?category=Maquillage%20et%20beauté` → 17 résultats ✅
- `/products?category=Automobiles` → 7 résultats ✅
- Navigation depuis homepage → page produits ✅

## Mapping Catégories Produits

| Catégorie UI | Catégories DB mappées |
|--------------|----------------------|
| Courses alimentaires | Supermarché, Alimentation, Épicerie, Boulangerie & Pâtisserie |
| Vêtements et accessoires de mode | Mode & Vêtements, vetements_mode, Pressing & Laverie |
| Maquillage et beauté | Cosmétiques, cosmétique |
| Appareils électroniques | Électronique, Audiovisuel |
| Automobiles | Automobile & Garage |
| Montres | Optique, Autres, Produit |

## Files Modified This Session
- `/app/backend/server.py`:
  - Ajouté `PRODUCT_CATEGORY_MAPPING`
  - Modifié `/api/services-products` pour utiliser le mapping
- `/app/frontend/src/components/EnterpriseCard.js`:
  - Supprimé symbole + et dropdown
- `/app/frontend/src/components/ProductCategoryCard.js`:
  - Supprimé symbole + et dropdown

## Pending Tasks

### P0 - BLOQUÉ sur crédits
- [ ] Générer vidéos catégories produits - **Recharger crédits Sora 2**

### P1 - Priority High
- [ ] Régénérer vidéo #107 sans personnes
- [ ] Refinements UI (police "pro et cool", flèches navigation)

### P2 - Medium
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation

## API Endpoints
- `GET /api/services-products?type=product&category=X` - Liste produits avec mapping catégories
- `GET /api/categories/products` - 22 catégories produits principales
- `GET /api/enterprises?category=X&subcategory=Y` - Liste entreprises

## Key Resources
- Preview: https://category-refactor-2.preview.emergentagent.com/
- Test Products: /products?category=Courses%20alimentaires
- Test Entreprises: /categorie/Restauration
