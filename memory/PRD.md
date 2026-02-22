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
- **Programme Cashback** complet avec niveaux de fidélité

### ✅ Corrections récentes (22 Février 2025)
1. **UI Polish pour présentation**:
   - Tags de catégories sans fond (texte simple)
   - Bouton "Ajouter au panier" (remplace "Réserver")
   - Icône cashback dans la navigation (desktop + mobile)
   - Icône panier moderne (ShoppingBag)
   
2. **Fix des images cassées en production**:
   - 248 logos d'entreprises corrigés (URLs relatives)
   - 312 galeries photos corrigées
   - 2 images produits corrigées
   
3. **Nouvelles fonctionnalités**:
   - **Section "Les meilleurs produits"** avec vraies cartes produits (filtrées par image + prix)
   - **Page Cashback** complète avec niveaux Bronze/Silver/Gold/Platinum
   - **Popup avantages entreprise** lors de l'inscription

4. **Conflit npm** : Résolu (date-fns@3.6.0)

## Backlog Prioritisé

### P1 - À faire
- [ ] Investiguer images corrompues section "photo vidéo"
- [ ] Améliorer le tri des produits (priorité aux produits commençant par 't')

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
│   │   │   ├── Header.js           # Navigation responsive + Cashback
│   │   │   ├── ServiceProductCard.js
│   │   │   ├── EnterpriseCard.js
│   │   │   └── Footer.js
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Section produits améliorée
│   │   │   ├── CashbackPage.js     # Page programme de fidélité
│   │   │   ├── EnterpriseRegistrationPage.js # + Popup avantages
│   │   │   ├── ServicesPage.js
│   │   │   └── ProductsPage.js
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
- Programme Cashback : 4 niveaux (Bronze 2%, Silver 3%, Gold 5%, Platinum 8%)
