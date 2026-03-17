# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services.

## User Language: **Français**

## Last Completed (March 17, 2026)

### ✅ UI simplifié - Symbole + supprimé
- Supprimé le symbole + sur toutes les cartes de catégories
- Clic sur le titre de catégorie navigue directement vers la page globale
- Plus de dropdown/sous-menu - navigation directe simplifiée
- Modifié: `EnterpriseCard.js` et `ProductCategoryCard.js`

### ✅ Catégories et sous-catégories dynamiques
- API `/api/enterprise-subcategories/{category}` retourne les vraies sous-catégories depuis MongoDB
- API `/api/enterprises` utilise le mapping des catégories principales
- Toutes les pages catégories fonctionnent (Restauration: 671, Coiffeurs: 323, Soins esthétiques: 252)

### ✅ Logo supprimé des cards
- Retiré l'affichage du logo en petit sur les cartes d'entreprises

### ✅ 22 catégories de produits ajoutées
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

### ❌ Génération vidéos produits - BLOQUÉ
- Tentative de génération avec Sora 2
- **Erreur: "insufficient balance"** - Crédits insuffisants
- Script disponible: `/app/backend/scripts/generate_product_videos.py`
- **Action requise**: Recharger les crédits via Profile -> Universal Key -> Add Balance

## Files Modified This Session
- `/app/frontend/src/components/EnterpriseCard.js`:
  - Supprimé symbole + et dropdown
  - Clic titre → navigation directe vers page catégorie
  - Supprimé logo
- `/app/frontend/src/components/ProductCategoryCard.js`:
  - Supprimé symbole + et dropdown
  - Clic titre → navigation directe vers page produits
- `/app/frontend/src/pages/HomePage.js`:
  - Import ProductCategoryCard
  - 22 nouvelles catégories produits
- `/app/backend/scripts/generate_product_videos.py`: Script Sora 2 prêt à utiliser

## Pending Tasks

### P0 - BLOQUÉ sur crédits
- [ ] Générer vidéos catégories produits - **Recharger crédits Sora 2**
- [ ] Générer vidéos manquantes pour 6 catégories entreprises

### P1 - Priority High
- [ ] Régénérer vidéo #107 sans personnes
- [ ] Refinements UI (police "pro et cool", flèches navigation)

### P2 - Medium
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation

## API Endpoints
- `GET /api/main-categories` - 15 catégories principales
- `GET /api/enterprise-subcategories/{category}` - Sous-catégories depuis DB
- `GET /api/enterprises?category=X&subcategory=Y` - Liste entreprises

## Key Resources
- Preview: https://category-refactor-2.preview.emergentagent.com/
- Test: /categorie/Restauration, /categorie/Coiffeurs
