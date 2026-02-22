# Titelli - PRD (Product Requirements Document)

## Vue d'ensemble
Titelli est une plateforme suisse connectant clients et prestataires de services/produits dans la région de Lausanne.

## Architecture
- **Frontend**: React 18 + TailwindCSS + Shadcn UI
- **Backend**: FastAPI + Python
- **Database**: MongoDB Atlas (secondevie)
- **Déploiement**: Render (production), Emergent Preview (développement)

## État actuel (Février 2025)

### ✅ Fonctionnalités implémentées
- Système d'authentification (JWT + redirection basée sur le rôle)
- Catalogue de services/produits avec filtres et catégories
- Cartes d'entreprises avec système de notation
- Panier d'achat et wishlist
- Système de réservation (RDV)
- Offres d'emploi et candidatures
- Formations
- Notifications en temps réel (WebSocket)
- Génération IA (images, vidéos avec Sora 2)
- Intégration Stripe pour paiements

### ✅ Corrections récentes (22 Février 2025)
1. **UI Polish pour présentation**:
   - Tags de catégories sans fond (texte simple)
   - Bouton "Ajouter au panier" (remplace "Réserver")
   - Icône cashback dans la navigation
   - Icône panier moderne (ShoppingBag)
   
2. **Fix des images cassées en production**:
   - 248 logos corrigés (URLs relatives)
   - 312 galeries photos corrigées
   - 2 images produits corrigées
   
3. **Conflit npm résolu**:
   - date-fns@3.6.0 compatible avec react-day-picker@8.10.1

## Backlog Prioritisé

### P1 - À faire
- [ ] Filtrer produits homepage (image + prix requis)
- [ ] Prioriser produits commençant par 't' sur la homepage
- [ ] Investiguer images corrompues section "photo vidéo"

### P2 - Futur
- [ ] Corriger design brochure monétisation
- [ ] Redessiner profils prestataires (selon maquettes)
- [ ] Créer flyer marketing avec QR code

### P3 - Backlog
- [ ] Démontrer fonctionnalité multi-tags
- [ ] Créer document CDC final
- [ ] Implémenter essai IA gratuit

## Structure des fichiers clés
```
/app
├── backend/
│   ├── server.py           # API FastAPI principale
│   └── .env                 # Config MongoDB, Stripe
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js           # Navigation responsive
│   │   │   ├── ServiceProductCard.js
│   │   │   ├── EnterpriseCard.js
│   │   │   └── Footer.js
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Page d'accueil
│   │   │   ├── ServicesPage.js
│   │   │   ├── ProductsPage.js
│   │   │   └── EnterprisePage.js
│   │   └── context/
│   │       ├── AuthContext.js
│   │       └── CartContext.js
│   └── package.json
└── fix_broken_logos.py     # Script correction URLs
```

## Notes techniques
- REACT_APP_BACKEND_URL utilisé pour toutes les requêtes API
- Les images doivent utiliser des chemins relatifs (/api/uploads/...)
- Le déploiement Render nécessite yarn (pas npm)
