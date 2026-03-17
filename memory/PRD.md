# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services.

## User Language: **Français**

## Last Completed (March 17, 2026)

### ✅ Fix Catégories et Sous-catégories dynamiques
- **Problème:** Les pages de catégories affichaient "undefined" et les sous-catégories ne montraient aucune entreprise
- **Solution:** 
  1. Modifié `/api/enterprise-subcategories/{category}` pour retourner les vraies sous-catégories depuis MongoDB
  2. Modifié `/api/enterprises` pour utiliser le mapping des catégories principales depuis `main_categories`
  3. Corrigé `EnterpriseCard.js` pour utiliser l'API au lieu de listes statiques

### ✅ Enlever logo des cards entreprises
- Supprimé l'affichage du logo en petit sur les cartes d'entreprises sur la page d'accueil

### ✅ Nouvelles catégories produits avec images de fond
- Ajouté 22 catégories de produits dans l'ordre spécifié:
  1. Courses alimentaires
  2. Vêtements et accessoires de mode
  3. Tout pour mon enfant
  4. Matériel de soins
  5. Maquillage et beauté
  6. Matériel de sport
  7. Matériel de loisirs
  8. Nécessaire voyages
  9. Appareils électroniques
  10. Matériel de bureautique
  11. Appareils électroménager
  12. Ameublement et décoration d'intérieur
  13. Matériel artisanal
  14. Matériel de bricolage et jardinage
  15. Acheter un bien immobilier
  16. Automobiles
  17. Matériel de sécurité
  18. Matériel animaux
  19. Matériel professionnel
  20. Métaux précieux et matières premières
  21. Haute joaillerie
  22. Montres
- Créé composant `ProductCategoryCard.js` avec support vidéo de fond (comme pour entreprises)

### ✅ Pages catégories fonctionnelles
- `/categorie/Restauration` → 671 entreprises
- `/categorie/Coiffeurs` → 323 entreprises  
- `/categorie/Soins esthétiques` → 252 entreprises
- Toutes les 15 catégories principales fonctionnent correctement

## Files Modified This Session
- `/app/backend/server.py`:
  - `GET /api/enterprise-subcategories/{category}` - Retourne vraies sous-catégories depuis DB
  - `GET /api/enterprises` - Utilise main_categories mapping
- `/app/frontend/src/components/EnterpriseCard.js`:
  - Supprimé affichage logo
  - Corrigé handler clic catégorie
  - Utilise API pour sous-catégories
- `/app/frontend/src/components/ProductCategoryCard.js` - NOUVEAU composant pour catégories produits
- `/app/frontend/src/pages/HomePage.js`:
  - Import ProductCategoryCard
  - Nouvelles catégories produits dans l'ordre demandé

## System Architecture

### Main Categories Flow
1. `main_categories` collection définit 15 catégories principales
2. Chaque catégorie principale mappe vers plusieurs catégories DB
3. API agrège les entreprises de toutes les catégories mappées

### Subcategories Flow
1. `/api/enterprise-subcategories/{category}` vérifie `main_categories`
2. Query les entreprises avec les catégories mappées
3. Retourne les sous-catégories distinctes de la DB

## Pending Tasks

### P1 - Priority High
- [ ] Générer vidéos pour catégories produits (si crédits Sora 2 disponibles)
- [ ] Générer vidéos manquantes pour 6 catégories entreprises - BLOQUÉ sur crédits
- [ ] Régénérer vidéo #107 sans personnes
- [ ] Refinements UI EnterpriseCard (police "pro et cool", flèches navigation)

### P2 - Medium
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation

### P3 - Backlog
- [ ] Refactorer server.py (10,000+ lignes) en modules APIRouter

## API Endpoints
- `GET /api/main-categories` - 15 catégories principales avec mapping
- `GET /api/enterprise-subcategories/{category}` - Vraies sous-catégories depuis DB
- `GET /api/enterprises?category=X&subcategory=Y` - Liste entreprises avec filtres

## Key Resources
- Preview URL: https://category-refactor-2.preview.emergentagent.com/
- Test Categories: /categorie/Restauration, /categorie/Coiffeurs, /categorie/Soins%20esthétiques
