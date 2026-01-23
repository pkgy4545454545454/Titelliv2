# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 19 : Corrections Critiques et Système Cashback 10%

**Bugs corrigés :**

1. **Flux de candidature aux emplois corrigé**
   - **Cause** : `JobDetailPage.js` utilisait `doc.file_path` et `doc.file_name` au lieu de `doc.url` et `doc.name`
   - **Solution** : Correction des noms de propriétés dans le modal de candidature
   - **Fichiers modifiés** : `/app/frontend/src/pages/JobDetailPage.js`
   - **Statut** : ✅ VÉRIFIÉ - Les CV s'affichent correctement dans le modal

2. **Système de cashback passé de 3% à 10%**
   - **Cause** : Le taux de cashback était de 3% au lieu de 10% comme demandé
   - **Solution** : Modification du `CASHBACK_RATE = 0.10` dans `server.py` pour:
     - Les commandes (ligne ~1010)
     - Les formations (ligne ~1931)
   - **Fichiers modifiés** : `/app/backend/server.py`
   - **Statut** : ✅ VÉRIFIÉ - 10% cashback appliqué sur toutes les transactions

**Nouvelles fonctionnalités :**

1. **Page Cashback améliorée**
   - Affichage du solde avec badge "10% de cashback sur tous vos achats !"
   - Cartes statistiques: Total gagné, Total utilisé, Nombre de transactions
   - Historique des transactions avec dates et descriptions
   - Section explicative "Comment fonctionne le cashback ?"
   - **Fichiers modifiés** : 
     - `/app/frontend/src/pages/ClientDashboard.js`
     - `/app/frontend/src/services/api.js` (ajout `cashbackAPI.history()` et `cashbackAPI.use()`)

2. **API Cashback enrichie**
   - `GET /api/cashback/history` retourne maintenant:
     ```json
     {
       "balance": 85.47,
       "transactions": [...],
       "statistics": {
         "total_earned": 12.0,
         "total_used": 0,
         "cashback_rate": "10%",
         "transaction_count": 1
       }
     }
     ```

---

## Tests Effectués - Itération 16

| Test | Statut | Détails |
|------|--------|---------|
| Sélection CV candidature | ✅ PASS | 2 documents affichés correctement |
| Cashback 10% | ✅ PASS | Rate: 10%, Transaction enregistrée |
| Page historique cashback | ✅ PASS | Solde + stats + historique |
| Upload documents | ✅ PASS | PDF/DOC supportés |
| Création emplois | ✅ PASS | Modal avec tous les champs |
| Dashboard client | ✅ PASS | Tous les onglets fonctionnent |
| Homepage | ✅ PASS | Toutes les sections visibles |

**Taux de réussite : 100% (21/21 tests backend)**

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

### 🟡 P1 - Important
- Refactoring `server.py` → déplacer la logique vers `/app/backend/routers/`
- Interface UI questions suggestives (entreprises → clients)
- Audit complet responsivité mobile

### 🟢 P2 - Futur
- Vidéo panoramique sur la page d'accueil
- Commentaires/avis défilants sur les pages entreprises
- Notifications temps réel (WebSocket)

---

## Architecture des fichiers clés

```
/app/
├── backend/
│   ├── server.py              # API principale (~4500 lignes)
│   ├── routers/               # Pour refactoring futur
│   └── uploads/               # Fichiers uploadés
└── frontend/
    └── src/
        ├── pages/
        │   ├── ClientDashboard.js    # Dashboard client avec cashback
        │   ├── JobDetailPage.js      # Page détail emploi (corrigé)
        │   ├── HomePage.js           # Page d'accueil
        │   └── EnterpriseDashboard.js
        └── services/
            └── api.js                # APIs avec cashbackAPI.history()
```

---

*Dernière mise à jour: 23 Jan 2026 - Corrections P0 et système cashback 10%*
