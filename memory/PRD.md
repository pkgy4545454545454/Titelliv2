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

### ✅ Phase 1-6 : Foundation à Refactoring (Complété précédemment)
- Authentification JWT (client, entreprise, influenceur)
- Dashboards Admin, Entreprise, Client, Influenceur
- Services/Produits, Commandes, Paiements Stripe
- Système d'abonnement multi-tiers
- Outils IA/Marketing
- Refactoring des fichiers volumineux

### ✅ Phase 7 : Dashboard Client Complet (Complété)
- Profil avec photo modifiable, LinkedIn
- Système d'amis complet
- Cartes de paiement (FIXÉ)
- Documents (FIXÉ)
- Messagerie production-ready
- "Compte particulier" (ex entrepreneur)
- Section "Demandes en cours"

### ✅ Phase 8 : Système d'Offres d'Emploi (Complété 23 Jan 2026)
- [x] **CRUD Jobs complet** : Création, lecture, mise à jour, suppression
- [x] **Toggle activation** des offres
- [x] **Section HomePage** : Affichage des offres d'emploi publiques
- [x] **Candidatures** : Postuler avec CV et lettre de motivation
- [x] **Notifications** : Alertes aux clients pour nouvelles offres
- [x] **Date limite** : Support des deadlines

### ✅ Phase 9 : Dashboard Influenceur Restructuré (Complété 23 Jan 2026)
Nouveau menu :
- [x] **Tableau de bord** : Vue d'ensemble avec stats
- [x] **Statistiques** : Vues, likes, partages, engagement
- [x] **Amis** : Système d'amis complet avec demandes/acceptation
- [x] **Offres reçues** : Liste des demandes de collaboration
- [x] **Statut en cours** : Collaboration active avec date de fin
- [x] **Mon profil** : Édition des informations
- [x] **Messages** : (À venir)
- [x] **Paramètres**

### ✅ Phase 10 : Demandes en cours Client (Complété 23 Jan 2026)
- [x] **Demandes envoyées** : Liste avec statut "En attente"
- [x] **Demandes reçues** : Avec boutons Accepter/Refuser
- [x] **Amis acceptés** : Cartes de profil des amis avec bouton Message

---

## APIs Ajoutées (Phases 8-10)

### Jobs/Emplois (Amélioré)
- `GET /api/jobs` - Liste publique des offres
- `GET /api/jobs/{id}` - Détail d'une offre
- `POST /api/jobs/{id}/apply` - Postuler à une offre
- `GET /api/client/job-applications` - Mes candidatures
- `GET /api/enterprise/jobs` - Mes offres (entreprise)
- `POST /api/enterprise/jobs` - Créer une offre
- `PUT /api/enterprise/jobs/{id}` - Modifier une offre
- `PUT /api/enterprise/jobs/{id}/toggle` - Activer/Désactiver
- `DELETE /api/enterprise/jobs/{id}` - Supprimer
- `GET /api/enterprise/jobs/{id}/applications` - Candidatures reçues

### Collections MongoDB Ajoutées
- `jobs` : Offres d'emploi
- `job_applications` : Candidatures
- `friendships` : Relations d'amitié
- `payment_cards` : Cartes de paiement clients
- `client_documents` : Documents clients
- `messages` : Messages entre utilisateurs
- `profile_views` : Tracking des vues de profil
- `influencer_profiles` : Profils influenceurs

---

## Tâches Restantes

### 🔴 P0 - Haute Priorité
1. ~~Système d'Offres d'Emploi~~ ✅ FAIT
2. ~~Dashboard Influenceur restructuré~~ ✅ FAIT
3. ~~Demandes en cours Client~~ ✅ FAIT
4. **Test flux publicitaire Stripe** - End-to-end

### 🟡 P1 - Moyenne Priorité
1. **Responsivité mobile complète** - Audit CSS
2. **Vidéo panoramique homepage**
3. **Notifications push** pour collaborations influenceurs

### 🟢 P2 - Basse Priorité
1. Commentaires défilants prestataires
2. Variantes d'affichage produits
3. Mini-labels sur annonces

---

## Credentials de Test
- **Admin** : admin@titelli.com / Admin123!
- **Client** : test@example.com / Test123!
- **Entreprise** : spa.luxury@titelli.com / Demo123!
- **Influenceur** : (créer via inscription)

---

## Structure Fichiers Clés
```
/app/
├── backend/
│   ├── server.py (3500+ lignes - APIs complètes)
│   └── tests/
└── frontend/src/
    ├── pages/
    │   ├── HomePage.js (avec section Offres d'emploi)
    │   ├── ClientDashboard.js (refait - 1200+ lignes)
    │   ├── InfluencerDashboard.js (restructuré)
    │   └── EnterpriseDashboard.js
    └── components/dashboard/
        ├── IAClientsSection.js
        ├── InfluencersSection.js
        ├── InvitationsSection.js
        └── SubscriptionsSection.js
```

---

*Dernière mise à jour : 23 Janvier 2026*
