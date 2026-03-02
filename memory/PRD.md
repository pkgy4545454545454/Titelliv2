# Titelli - Product Requirements Document

## Original Problem Statement
Titelli est une plateforme suisse de mise en relation entre clients et prestataires de qualité dans la région de Lausanne. L'application permet aux clients de découvrir, réserver et acheter des services et produits locaux, tandis que les entreprises peuvent développer leur visibilité et leur clientèle.

## Core Requirements
- Marketplace de services et produits locaux
- Système d'inscription et gestion des entreprises
- Réservation en ligne et paiement sécurisé
- Programme cashback pour les clients
- Certification Titelli pour les entreprises
- Offres d'emploi et formations

## Tech Stack
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Image Storage**: Cloudinary (migration effectuée)
- **Video Generation**: Sora 2 (via Emergent LLM Key)
- **Deployment**: Render

---

## CHANGELOG

### 2025-03-02 - Système de sous-catégories et refonte HomePage
- ✅ **Correction MongoDB**: Mise à jour du mot de passe MongoDB (Mini.1996)
- ✅ **Nouveau système de catégories avec sous-catégories**:
  - EnterpriseCard.js redesigné avec navigation par catégorie
  - Menu de sous-catégories animé (slide-in-from-top)
  - 40+ catégories principales avec leurs sous-catégories (Restaurant, Bijouteries, Coiffeur, etc.)
  - Inspiré de Globus.ch pour les sous-catégories
- ✅ **HomePage.js**: Mise à jour complète
  - Cards entreprises groupées par catégorie avec flèches navigation
  - Compteur de navigation (ex: 1/14)
  - Clic sur catégorie ouvre menu sous-catégories
- ✅ **EnterprisesPage.js**: Nouvelle page de listing
  - Vidéo centrée en hero section
  - Barre de filtres par catégorie avec dropdown sous-catégories
  - Filtres actifs affichés avec bouton X pour supprimer
  - Vue grille/liste switchable
  - 8251 entreprises affichables
- ✅ **Nouveaux endpoints API**:
  - `GET /api/enterprise-categories` - Liste toutes les catégories avec comptage et sous-catégories
  - `GET /api/enterprise-categories/{category_name}` - Détails d'une catégorie
  - `GET /api/enterprise-subcategories/{category_name}` - Sous-catégories d'une catégorie
  - Endpoint `/api/enterprises` mis à jour pour supporter le paramètre `subcategory`

### 2025-02-23 - UI/UX Améliorations
- ✅ **Section Avantages homepage** : Redesignée avec style popup (icônes, titres, descriptions, prix)
- ✅ **Boutons conditionnels** : "Réserver" pour services, "Ajouter au panier" pour produits

### 2025-02-22 - Migration Cloudinary & Features
- ✅ **Migration Cloudinary** : Toutes les images migrées vers Cloudinary (permanent storage)
- ✅ **Section "Les meilleurs produits"** : Ajoutée sur homepage
- ✅ **Page Cashback** : Créée et liée dans header
- ✅ **Popup Enterprise Benefits** : Multi-onglets avec services, fournisseurs, gestion, marketing, packs
- ✅ **3 PDFs générés** : Prospect_Rendez-vous_Client.pdf, Prospect_Telephonique.pdf, Questions_Formations.pdf
- ✅ **Filter tags** : Style text-only sans fond sur toutes les pages

---

## ROADMAP

### P0 - Critique (Résolu)
- ✅ Images Render corrigées via Cloudinary
- ✅ Connexion MongoDB restaurée

### P1 - Haute Priorité
- ✅ Système de sous-catégories implémenté
- [ ] Régénérer vidéo #107 (Lausanne rue lac) sans personnes
- [ ] Réorganiser produits homepage (priorité noms commençant par "t")
- [ ] Investiguer corruption d'images lors de l'upload

### P2 - Moyenne Priorité
- [ ] Corriger design brochure de monétisation
- [ ] Redesigner profils prestataires selon croquis utilisateur
- [ ] Créer flyer marketing avec QR code personnalisé

### P3 - Basse Priorité
- [ ] Démontrer fonctionnalité multi-tags
- [ ] Créer document CDC final
- [ ] Implémenter essai gratuit IA

---

## Key Files
- `/app/frontend/src/pages/HomePage.js` - Page d'accueil avec système de catégories par métier
- `/app/frontend/src/components/EnterpriseCard.js` - Carte entreprise avec menu sous-catégories animé
- `/app/frontend/src/pages/EnterprisesPage.js` - Page listing entreprises avec filtres catégories
- `/app/frontend/src/services/api.js` - API client avec endpoints catégories
- `/app/backend/server.py` - Endpoints catégories et sous-catégories (ENTERPRISE_SUBCATEGORIES)
- `/app/backend/.env` - Credentials MongoDB et Cloudinary

## Sous-catégories implémentées
Les catégories suivantes ont des sous-catégories configurées:
- **Restaurant/Restauration**: Cuisine française, italienne, chinoise, japonaise, thaï, indienne, mexicaine, libanaise, grecque, Fast food, Gastronomique, Végétarien/Vegan, Pizzeria, Sushi, Brasserie
- **Bijouteries/Horlogerie**: Bagues, Colliers, Bracelets, Boucles d'oreilles, Montres, Bijoux sur mesure, Réparation, Gravure
- **Coiffeur/Coiffure & Beauté**: Coupe femme/homme, Coloration, Mèches, Lissage, Permanente, Extensions, Coiffure mariage, Barbier
- **Et 35+ autres catégories**...
