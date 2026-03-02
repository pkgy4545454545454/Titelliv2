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
- **Image Storage**: Cloudinary
- **Video Generation**: Sora 2 (via Emergent LLM Key)

---

## CHANGELOG

### 2025-03-02 - Système de sous-catégories complet

#### ✅ Corrections effectuées
- **MongoDB corrigé** : Mot de passe mis à jour (Mini.1996)
- **EnterprisesPage.js restauré** : Page originale des entreprises remise en place (avec vidéo et carousel)

#### ✅ Nouvelle page CategoryEnterprisesPage.js
- **Route** : `/categorie/:category` (ex: `/categorie/Restaurant`)
- **Paramètre URL** : `?subcategory=...` pour filtrer par sous-catégorie
- **Fonctionnalités** :
  - Bouton "Retour" en haut
  - Titre de la catégorie en grand
  - Badge de sous-catégorie actif avec bouton × pour supprimer
  - Barre de sous-catégories horizontale avec défilement (sticky)
  - Barre de recherche "Rechercher dans [catégorie]..."
  - Compteur de résultats
  - Toggle vue grille/liste
  - Cards entreprises avec animation

#### ✅ EnterpriseCard.js amélioré
- **Menu sous-catégories dynamique** : Chargé via API au clic sur la catégorie
- **Indicateur de chargement** : Spinner pendant le fetch des sous-catégories
- **Flèche animée** : ChevronDown qui tourne à 180° quand ouvert
- **Navigation** : Clic sur sous-catégorie → `/categorie/{category}?subcategory={subcat}`

#### ✅ Nouveaux endpoints API
- `GET /api/enterprise-categories` : Liste toutes les catégories avec comptage et sous-catégories
- `GET /api/enterprise-categories/{name}` : Détails d'une catégorie spécifique
- `GET /api/enterprise-subcategories/{name}` : Sous-catégories d'une catégorie
- `GET /api/enterprises` mis à jour : Support du paramètre `subcategory`

#### ✅ 250+ sous-catégories configurées
Catégories principales couvertes :
- **Restauration** : Cuisine française, italienne, chinoise, japonaise, thaï, indienne, mexicaine, libanaise, grecque, Fast food, Gastronomique, Végétarien/Vegan, Pizzeria, Sushi, Brasserie
- **Alimentation** : Boulangerie, Pâtisserie, Chocolaterie, Boucherie, Fromagerie, Épicerie, Bio, Caviste, Glacier
- **Beauté & Bien-être** : Coiffure, Institut, Spa, Massage, Manucure, Épilation, Bronzage, Maquillage, Tatouage
- **Santé** : Médecin, Dentiste, Pharmacie, Opticien, Kiné, Ostéopathe, Psychologue, Nutritionniste, Vétérinaire
- **Mode & Accessoires** : Vêtements, Chaussures, Bijouteries, Horlogerie, Maroquinerie, Lingerie
- **Automobile** : Garage, Carrosserie, Pneus, Location, Taxi, VTC, Déménagement
- **Immobilier** : Agence, Architecte, Décoration d'intérieur
- **Services** : Électricien, Plombier, Serrurier, Peinture, Menuiserie, Chauffage, Nettoyage
- **Informatique** : Développement, Maintenance, Réparation, Cloud
- **Sport & Loisirs** : Fitness, Yoga, Tennis, Golf, Natation, Arts martiaux
- **Hôtellerie** : Hôtel, Auberge, Camping, Agence de voyage
- Et bien plus...

#### ✅ HomePage.js alignement corrigé
- Cards alignées à gauche sous le titre "Les meilleurs prestataires de ta région"
- Bouton "Voir tout" aligné à gauche

---

## ROADMAP

### P0 - Critique (Résolu)
- ✅ Connexion MongoDB restaurée
- ✅ Système de sous-catégories fonctionnel

### P1 - Haute Priorité
- [ ] Régénérer vidéo #107 (Lausanne rue lac) sans personnes
- [ ] Réorganiser produits homepage (priorité noms commençant par "t")
- [ ] Investiguer corruption d'images lors de l'upload
- [ ] Ajouter le champ `subcategory` aux entreprises existantes en base

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
- `/app/frontend/src/pages/HomePage.js` - Page d'accueil avec cartes par catégorie
- `/app/frontend/src/pages/EnterprisesPage.js` - Page entreprises avec carousel (restaurée)
- `/app/frontend/src/pages/CategoryEnterprisesPage.js` - **NOUVELLE** Page catégorie avec sous-catégories
- `/app/frontend/src/components/EnterpriseCard.js` - Card entreprise avec menu sous-catégories dynamique
- `/app/frontend/src/services/api.js` - API client avec endpoints catégories
- `/app/backend/server.py` - Endpoints catégories/sous-catégories (ENTERPRISE_SUBCATEGORIES)
- `/app/frontend/src/App.js` - Route `/categorie/:category` ajoutée

## Routes Frontend
| Route | Page | Description |
|-------|------|-------------|
| `/` | HomePage | Accueil avec cards par catégorie |
| `/entreprises` | EnterprisesPage | Liste entreprises avec carousel |
| `/entreprise/:id` | EnterprisePage | Détail d'une entreprise |
| `/categorie/:category` | CategoryEnterprisesPage | **NOUVELLE** Liste entreprises par catégorie/sous-catégorie |
| `/services` | ServicesPage | Services |
| `/products` | ProductsPage | Produits |
