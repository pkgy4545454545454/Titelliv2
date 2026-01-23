# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 20 : Page Entreprise Améliorée + Préparation Refactoring

**Nouvelles fonctionnalités :**

1. **Page Entreprise - Nouveaux onglets**
   - **Photos/Vidéos** : Affiche la galerie média de l'entreprise avec :
     - Grille de photos avec lightbox plein écran
     - Section vidéos avec aperçu et bouton play
     - État vide élégant si pas de médias
   - **Formations** : Affiche les formations proposées par l'entreprise
     - Cartes avec image, titre, durée, prix
     - Badge "En ligne" ou "Présentiel"
     - Lien vers la page de détail de formation
   - **Offres d'emploi** : Affiche les postes ouverts
     - Titre, lieu, type de contrat (CDI, CDD...)
     - Fourchette salariale et date de publication
     - Lien vers la page de détail de l'emploi

2. **Corrections API**
   - `trainingsAPI.getAll()` → `trainingsAPI.listAll()`
   - `jobsAPI.list()` → `jobsAPI.listAll()` (endpoint public sans auth)

**Fichiers modifiés :**
- `/app/frontend/src/pages/EnterprisePage.js`

### Phase 19 : Corrections P0 et Système Cashback 10%

**Bugs corrigés :**

1. **Flux de candidature aux emplois corrigé**
   - Correction `doc.url`/`doc.name` dans `JobDetailPage.js`
   - Les CV s'affichent maintenant dans le modal de candidature

2. **Système de cashback passé de 3% à 10%**
   - Appliqué sur commandes et formations
   - Historique des transactions avec statistiques

---

## Tests Effectués

### Itération 17 (Frontend)
| Test | Statut |
|------|--------|
| Onglet Photos/Vidéos | ✅ PASS |
| Onglet Formations | ✅ PASS |
| Onglet Offres d'emploi | ✅ PASS |
| Navigation 7 onglets | ✅ PASS |
| Lightbox modal | ✅ Code OK (pas de data) |

### Itération 16 (Backend + Frontend)
- 21/21 tests backend passés (100%)
- Tous les flux utilisateur validés

---

## Credentials de test
- **Client**: test@example.com / Test123!
- **Enterprise**: spa.luxury@titelli.com / Demo123!
- **Influencer**: test_influencer2@example.com / Test123!
- **Admin**: admin@titelli.com / Admin123!

---

## Tâches Restantes

### 🔴 P0 - Critique
- ✅ ~~Bug flux candidature~~ - CORRIGÉ
- ✅ ~~Système cashback 10%~~ - IMPLÉMENTÉ
- ✅ ~~Page entreprise Photos/Vidéos~~ - CORRIGÉ
- ✅ ~~Onglets Formations/Emplois~~ - AJOUTÉS

### 🟡 P1 - Important
- [ ] Refactoring `server.py` → modules (Plan créé dans `/app/backend/REFACTORING_PLAN.md`)
- [ ] Interface UI questions suggestives (entreprises → clients)
- [ ] Audit complet responsivité mobile

### 🟢 P2 - Futur
- [ ] Vidéo panoramique sur la page d'accueil
- [ ] Commentaires/avis défilants sur les pages entreprises
- [ ] Notifications temps réel (WebSocket)

---

## Architecture des fichiers clés

```
/app/
├── backend/
│   ├── server.py              # API principale (~4500 lignes)
│   ├── routers/               # Structure de refactoring préparée
│   │   ├── __init__.py
│   │   ├── online_status.py   # Placeholder
│   │   └── trainings.py       # Placeholder
│   ├── REFACTORING_PLAN.md    # Plan de refactoring détaillé
│   └── uploads/
└── frontend/
    └── src/
        ├── pages/
        │   ├── EnterprisePage.js      # 7 onglets avec Photos/Formations/Emplois
        │   ├── ClientDashboard.js     # Dashboard client avec cashback 10%
        │   ├── JobDetailPage.js       # Page détail emploi (corrigé)
        │   └── HomePage.js
        └── services/
            └── api.js
```

---

*Dernière mise à jour: 23 Jan 2026 - Page entreprise améliorée + préparation refactoring*
