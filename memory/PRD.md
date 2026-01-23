# Titelli Marketplace - Product Requirements Document

## Aperçu du Projet
**Titelli** est une marketplace premium pour Lausanne, Suisse, connectant les entreprises locales avec les clients et les influenceurs.

## Stack Technique
- **Frontend** : React 18, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend** : FastAPI, Motor (async MongoDB), JWT Auth
- **Base de données** : MongoDB
- **Paiements** : Stripe

---

## Fonctionnalités Implémentées (Mise à jour 23 Jan 2026)

### ✅ Phase 1-4 : Foundation à Marketing (Complété précédemment)
- Authentification JWT
- Dashboards Admin, Entreprise, Client
- Services/Produits, Commandes, Paiements Stripe
- Système d'abonnement multi-tiers
- Outils IA/Marketing (Ciblage, Influenceurs, Invitations)

### ✅ Phase 5 : Module Influenceur (Complété)
- Inscription influenceur avec Instagram/TikTok/Facebook
- Dashboard influenceur complet
- APIs profil influenceur

### ✅ Phase 6 : Refactoring (Complété)
- EnterpriseDashboard.js réduit de 3807 à 2699 lignes
- Composants extraits dans `/components/dashboard/`

### ✅ Phase 7 : Dashboard Client Complet (Complété 23 Jan 2026)

#### Profil Client
- [x] Modification de la photo de profil
- [x] Affichage email (non modifiable)
- [x] Téléphone modifiable
- [x] **LinkedIn** - Connexion compte LinkedIn
- [x] Ville modifiable
- [x] **Statistiques réelles** : Vues profil, Amis, Commandes (via MongoDB)

#### Système d'Amis
- [x] Liste des amis avec actions (message, supprimer)
- [x] **Demandes d'amis** avec notifications
- [x] Accepter/Refuser les demandes
- [x] **Suggestions d'amis** (autres clients)
- [x] Bouton "Ajouter" pour envoyer demandes

#### Cartes de Paiement (**Fixé**)
- [x] Liste des cartes enregistrées
- [x] Ajout de carte (modal fonctionnel)
- [x] Suppression de carte
- [x] Carte par défaut

#### Documents (**Fixé**)
- [x] Liste des documents
- [x] Upload de fichiers
- [x] Suppression de documents
- [x] Catégorisation (factures, contrats, etc.)

#### Messagerie (**Production Ready**)
- [x] Liste des conversations (MongoDB)
- [x] Envoi/Réception de messages en temps réel
- [x] Notifications pour nouveaux messages
- [x] Interface chat complète

#### Menu Client
- [x] "Compte entrepreneur" → **"Compte particulier"**
- [x] Bouton de switch pour basculer entre comptes
- [x] Menu restructuré avec toutes les sections

---

## APIs Ajoutées (Phase 7)

### Client Profile
- `GET /api/client/profile` - Profil avec stats réelles
- `PUT /api/client/profile` - Mise à jour profil

### Système d'Amis
- `GET /api/client/friends` - Liste des amis
- `GET /api/client/friend-requests` - Demandes en attente
- `POST /api/client/friends/request` - Envoyer demande
- `PUT /api/client/friends/{id}/respond` - Accepter/Refuser
- `DELETE /api/client/friends/{id}` - Supprimer ami
- `GET /api/client/suggested-friends` - Suggestions

### Cartes de Paiement
- `GET /api/client/cards` - Liste des cartes
- `POST /api/client/cards` - Ajouter carte
- `DELETE /api/client/cards/{id}` - Supprimer carte
- `PUT /api/client/cards/{id}/default` - Définir par défaut

### Documents
- `GET /api/client/documents` - Liste documents
- `POST /api/client/documents` - Ajouter document
- `DELETE /api/client/documents/{id}` - Supprimer document

### Messagerie
- `GET /api/messages/conversations` - Toutes les conversations
- `GET /api/messages/{partner_id}` - Messages avec un partenaire
- `POST /api/messages` - Envoyer message

### Tracking
- `POST /api/track/profile-view/{user_id}` - Tracker vue profil
- `GET /api/stats/profile-views` - Stats des vues

---

## Tâches Restantes

### 🔴 P0 - Haute Priorité
1. ~~Dashboard Client complet~~ ✅ FAIT
2. **Système d'Offres d'Emploi** - CRUD + affichage HomePage
3. **Refonte Menu Entreprise** - Nouvelles specs
4. **Test flux publicitaire Stripe**

### 🟡 P1 - Moyenne Priorité
1. **Responsivité complète mobile** - Audit CSS
2. **Vidéo panoramique homepage**
3. **Notifications push collaborations influenceurs**

### 🟢 P2 - Basse Priorité
1. Commentaires défilants prestataires
2. Variantes d'affichage produits
3. Mini-labels sur annonces

---

## Credentials de Test
- **Admin** : admin@titelli.com / Admin123!
- **Client** : test@example.com / Test123!
- **Entreprise** : spa.luxury@titelli.com / Demo123!

---

## Structure Fichiers Clés
```
/app/
├── backend/
│   ├── server.py (3200+ lignes - APIs complètes)
│   └── tests/
│       ├── test_client_dashboard.py (nouveau)
│       └── test_api_production.py
└── frontend/src/
    ├── pages/
    │   ├── ClientDashboard.js (refait - 900+ lignes)
    │   ├── EnterpriseDashboard.js (refactoré - 2699 lignes)
    │   ├── InfluencerDashboard.js
    │   └── AuthPage.js (avec option Influenceur)
    └── components/dashboard/
        ├── IAClientsSection.js
        ├── InfluencersSection.js
        ├── InvitationsSection.js
        └── SubscriptionsSection.js
```

---

*Dernière mise à jour : 23 Janvier 2026*
