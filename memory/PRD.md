# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 21 : Dashboard Client - Nouvelles Sections Production-Ready

**Nouvelles sections implémentées :**

1. **Mon Agenda**
   - Création de rendez-vous avec titre, date/heure, lieu, description
   - Types : Rendez-vous, Réunion, Rappel
   - Affichage avec badges colorés par type
   - Suppression d'événements

2. **Mes Finances (données réelles BDD)**
   - Total dépensé (commandes + formations)
   - Cashback disponible
   - Cashback gagné
   - Pourcentage d'économies
   - Détails par catégorie (commandes, formations)
   - Historique des dernières transactions

3. **Mes Donations**
   - Liste des donations effectuées
   - Total donné et nombre de donations
   - Formulaire de don (montant, bénéficiaire, message)
   - Option don anonyme

4. **Ma Liste de Souhaits**
   - Affichage des produits/services ajoutés
   - Image, nom, prix, entreprise
   - Suppression rapide
   - Lien vers le détail

5. **Suggestions de mes contacts**
   - Items aimés/ajoutés aux favoris par les amis
   - Attribution (qui recommande)
   - Raison de la suggestion (wishlist, avis positif)

6. **Mes Prestataires Personnels**
   - Liste des prestataires favoris
   - Note, catégorie, ville
   - Suppression rapide
   - Lien vers le profil

7. **Mes Cartes (Production-Ready)**
   - Formulaire complet : numéro 16 chiffres, CVV, expiration
   - Aperçu visuel de la carte en temps réel
   - Sélection type (Visa/Mastercard/Amex)
   - Message sécurité Stripe
   - Définir comme carte par défaut

---

## Tests Effectués - Itération 18

| Test | Statut |
|------|--------|
| Backend APIs | ✅ 16/16 (100%) |
| Frontend Tabs | ✅ 7/7 (100%) |
| Agenda CRUD | ✅ PASS |
| Finances Stats | ✅ PASS |
| Donations CRUD | ✅ PASS |
| Wishlist CRUD | ✅ PASS |
| Suggestions API | ✅ PASS |
| Providers CRUD | ✅ PASS |
| Cards Form | ✅ PASS |

---

## APIs créées

```
# Client Agenda
GET  /api/client/agenda
POST /api/client/agenda
PUT  /api/client/agenda/{id}
DELETE /api/client/agenda/{id}

# Client Finances
GET /api/client/finances

# Client Donations
GET  /api/client/donations
POST /api/client/donations

# Client Wishlist
GET    /api/client/wishlist
POST   /api/client/wishlist
DELETE /api/client/wishlist/{item_id}
GET    /api/client/wishlist/check/{item_id}

# Client Suggestions
GET /api/client/suggestions/from-friends

# Client Personal Providers
GET    /api/client/providers
POST   /api/client/providers
DELETE /api/client/providers/{id}
```

---

## Credentials de test
- **Client**: test@example.com / Test123!
- **Enterprise**: spa.luxury@titelli.com / Demo123!
- **Influencer**: test_influencer2@example.com / Test123!
- **Admin**: admin@titelli.com / Admin123!

---

## Tâches Restantes

### 🔴 P0 - Critique
- ✅ ~~Dashboard client sections~~ - IMPLÉMENTÉ

### 🟡 P1 - Important
- [ ] Bouton "Ajouter aux favoris" sur produits/services (pour remplir wishlist)
- [ ] Bouton "Ajouter prestataire" sur pages entreprises (pour remplir mes prestataires)
- [ ] Refactoring `server.py` → modules
- [ ] Interface UI questions suggestives (entreprises → clients)
- [ ] Audit complet responsivité mobile

### 🟢 P2 - Futur
- [ ] Vidéo panoramique sur la page d'accueil
- [ ] Commentaires/avis défilants sur les pages entreprises
- [ ] Notifications temps réel (WebSocket)

---

## Architecture des fichiers modifiés

```
/app/
├── backend/
│   ├── server.py              # +300 lignes (nouvelles APIs client)
│   └── tests/
│       └── test_client_dashboard_new_sections.py  # NEW (375 lignes)
└── frontend/
    └── src/
        ├── pages/
        │   └── ClientDashboard.js  # +700 lignes (nouvelles sections)
        └── services/
            └── api.js              # +40 lignes (nouvelles APIs)
```

---

*Dernière mise à jour: 23 Jan 2026 - Dashboard client production-ready*
