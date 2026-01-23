# Titelli Marketplace - Product Requirements Document

## Aperçu du Projet
**Titelli** est une marketplace premium pour Lausanne, Suisse, connectant les entreprises locales avec les clients et les influenceurs.

## Stack Technique
- **Frontend** : React 18, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend** : FastAPI, Motor (async MongoDB), JWT Auth
- **Base de données** : MongoDB
- **Paiements** : Stripe

---

## Fonctionnalités Implémentées

### ✅ Phases 1-10 : Complétées précédemment

### ✅ Phase 11 : Corrections Multiples (23 Jan 2026)
- Inscription influenceur → redirect `/dashboard/influencer`
- Dashboard influenceur fonctionnel
- Vidéo header Services/Produits
- Filtres emploi élargis (Type, Ville, Entreprise)
- Stripe checkout corrigé
- Avis clients centrés
- Bouton switch compte

### ✅ Phase 12 : Améliorations Entreprise & Notifications (23 Jan 2026)
- [x] **Image de couverture entreprise** : Upload et modification de la bannière
- [x] **Photo de profil entreprise** : Logo modifiable  
- [x] **Navigation contextuelle notifications** : Clic redirige vers la page concernée
- [x] **Validation ajout produits/services** : Fonctionnement confirmé via tests

---

## Notifications avec Navigation Contextuelle

| Type | Lien de redirection |
|------|---------------------|
| Nouvelle offre d'emploi | `/emploi/{job_id}` |
| Candidature reçue (entreprise) | `/dashboard/entreprise?tab=applications` |
| Statut candidature (client) | `/dashboard/client?tab=jobs` |
| Demande d'ami | `/dashboard/client?tab=contacts` |
| Ami accepté | `/dashboard/client?tab=contacts` |
| Nouvelle commande | `/dashboard/entreprise?tab=orders` |

---

## APIs Clés

### Upload d'images
- `POST /api/upload/image` - Upload fichier image (retourne URL)
- `POST /api/upload/image-base64` - Upload image en base64

### Profil Entreprise
- `PUT /api/enterprises/{id}` - Met à jour logo ET cover_image

### Notifications
- `GET /api/notifications` - Liste avec champ `link` pour navigation

---

## Structure Fichiers Clés
```
/app/
├── backend/
│   └── server.py (4200+ lignes)
└── frontend/src/
    ├── pages/
    │   ├── EnterpriseDashboard.js (ProfileSection avec cover upload)
    │   ├── ClientDashboard.js (useSearchParams pour tab URL)
    │   └── ...
    └── components/
        └── Header.js (notification click navigation)
```

---

## Tâches Restantes

### 🟡 P1 - Moyenne Priorité
1. **Responsivité mobile** - Audit CSS complet
2. **Refonte menu Enterprise Dashboard** - Structure maquettes

### 🟢 P2 - Basse Priorité
1. Commentaires défilants prestataires
2. Mini-labels annonces
3. Refactoring `server.py` en routers FastAPI

---

## Credentials de Test
- **Admin** : admin@titelli.com / Admin123!
- **Client** : test@example.com / Test123!
- **Entreprise** : spa.luxury@titelli.com / Demo123!
- **Influenceur** : test_influencer2@example.com / Test123!

---

## Tests Validés
- **iteration_10.json** : Système candidature ✓
- **iteration_11.json** : Corrections multiples ✓
- **Phase 12** : Tests manuels via curl et screenshot ✓

---

*Dernière mise à jour : 23 Janvier 2026*
