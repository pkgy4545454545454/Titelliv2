# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 16 : Audit Complet et Corrections (AUJOURD'HUI)

**Bugs corrigés :**
1. **Route 404 /emplois** → Nouvelle page JobsPage.js créée avec filtres et listing complet
2. **Route 404 /produits** → Alias ajouté vers ProductsPage
3. **Flow candidature sans CV** → Amélioration complète:
   - Redirection vers documents avec `?returnToJob={id}`
   - Alerte bleue "Vous souhaitez postuler à une offre"
   - Bouton "Voir l'offre" pour retourner à l'offre
   - Option "CV" ajoutée en premier dans les catégories de documents

**Tests passés : 100% (33/33 backend, 100% frontend)**

### Fonctionnalités vérifiées et fonctionnelles :

**Pages publiques :**
- ✅ Homepage (tendances, offres, premium, jobs, formations)
- ✅ /services avec filtres par catégorie
- ✅ /produits et /products
- ✅ /emplois - NOUVELLE PAGE avec 8 offres et filtres
- ✅ /entreprises avec images de couverture et logos
- ✅ /entreprise/{id} page de détail

**Dashboard Entreprise :**
- ✅ Overview avec stats
- ✅ Création emplois (modal complet)
- ✅ Création formations (online/présentiel avec fichiers)
- ✅ Création services et produits
- ✅ Profil avec upload logo et couverture
- ✅ Section Postulations avec filtres et actions
- ✅ IA Ciblage clients avec stats réelles

**Dashboard Client :**
- ✅ Overview, Profile, Contacts avec statut en ligne
- ✅ Documents avec option CV et flow retour offre
- ✅ Messages, Formations, Orders, Cashback
- ✅ Paramètres

**Dashboard Influencer :**
- ✅ Stats, réseaux sociaux, collaborations

**Autres :**
- ✅ Panier et checkout Stripe
- ✅ Système d'avis sur formations
- ✅ Statut en ligne des contacts

---

## APIs Principales

```
# Jobs/Emplois
GET  /api/jobs - Liste publique
GET  /api/jobs/{id} - Détail
POST /api/jobs/{id}/apply - Postuler
GET  /api/enterprise/jobs - Emplois de l'entreprise
POST /api/enterprise/jobs - Créer
PUT  /api/enterprise/jobs/{id} - Modifier
DELETE /api/enterprise/jobs/{id} - Supprimer

# Trainings/Formations
GET  /api/trainings - Liste publique
POST /api/trainings/{id}/purchase - Acheter
POST /api/trainings/{id}/review - Donner un avis
GET  /api/enterprise/trainings - Formations de l'entreprise
POST /api/enterprise/trainings - Créer
GET  /api/client/trainings - Mes formations

# Online Status
POST /api/user/heartbeat - Mettre à jour présence
GET  /api/client/friends/online - Amis en ligne
```

---

## Credentials de test
- Client: test@example.com / Test123!
- Enterprise: spa.luxury@titelli.com / Demo123!
- Influencer: test_influencer2@example.com / Test123!
- Admin: admin@titelli.com / Admin123!

---

## Tâches Restantes

### 🟡 P1
- Responsivité mobile complète
- Refactoring server.py en modules (4500+ lignes)

### 🟢 P2
- Vidéo panoramique homepage
- Questions suggestives UI
- Commentaires défilants sur les providers

---

*Mise à jour: 23 Jan 2026 - Audit complet et corrections*
