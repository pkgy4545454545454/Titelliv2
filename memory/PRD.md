# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 22 : Systèmes de Paiement et Abonnements - PRODUCTION READY

**TOUS les systèmes sont maintenant RÉELS et en PRODUCTION :**

1. **Abonnements Premium Client (Stripe)**
   - Checkout Premium (9.99 CHF/mois) → URLs Stripe réelles
   - Checkout VIP (29.99 CHF/mois) → URLs Stripe réelles
   - Annulation d'abonnement → Supprime TOUS les avantages DB
   - Session ID stocké dans localStorage pour confirmation

2. **Système de Cashback Dynamique**
   - Plan Gratuit : 1% cashback
   - Plan Premium : 10% cashback
   - Plan VIP : 15% cashback
   - Calcul basé sur subscription active OU user.premium_plan

3. **Abonnements Entreprise (Stripe)**
   - Standard (200 CHF), Guest (250 CHF), Premium (500 CHF), etc.
   - URLs Stripe réelles pour tous les plans

4. **Algorithme IA Targeting - RÉEL**
   - Calcul de reach basé sur VRAIS utilisateurs de la DB
   - Query MongoDB avec filtres (genre, localisation, intérêts)
   - Taux engagement/conversion basés sur standards industrie

5. **Achats de Formations (Stripe)**
   - Checkout vers Stripe réel
   - Inscription après vérification du paiement

### Phase 21 : Dashboard Client - Nouvelles Sections Production-Ready

**Nouvelles sections implémentées :**

1. **Mon Agenda** - CRUD complet
2. **Mes Finances** - Stats réelles de la BDD
3. **Mes Donations** - Dons avec montants
4. **Ma Liste de Souhaits** - Produits/services favoris
5. **Suggestions de mes contacts** - Basé sur activité amis
6. **Mes Prestataires Personnels** - Favoris entreprises
7. **Mes Cartes** - Formulaire carte production-ready

---

## ✅ Tests Effectués - Itération 20

| Système | Statut | Détails |
|---------|--------|---------|
| Premium Checkout (Premium) | ✅ PASS | URLs Stripe réelles |
| Premium Checkout (VIP) | ✅ PASS | URLs Stripe réelles |
| Premium Cancel | ✅ PASS | Supprime tous avantages |
| Cashback Rates | ✅ PASS | 1%/10%/15% vérifié |
| Enterprise Subscription | ✅ PASS | URLs Stripe réelles |
| IA Campaign Targeting | ✅ PASS | Vrais utilisateurs DB |
| Training Purchase | ✅ PASS | URLs Stripe réelles |
| **Total** | **16/16 (100%)** | **Tous systèmes RÉELS** |

---

## APIs de Paiement

```
# Client Premium
GET  /api/client/premium                    # Statut abonnement
POST /api/client/premium/checkout?plan=X    # Checkout Stripe
POST /api/client/premium/confirm            # Confirmation après paiement
POST /api/client/premium/cancel             # Annulation

# Enterprise Subscriptions
POST /api/subscriptions/checkout?plan_id=X  # Checkout Stripe
POST /api/subscriptions/activate            # Activation après paiement

# IA Campaigns (targeting réel)
POST /api/enterprise/ia-campaigns           # Création campagne

# Trainings
POST /api/trainings/{id}/purchase           # Achat formation
POST /api/trainings/{id}/enroll             # Inscription après paiement
```
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
