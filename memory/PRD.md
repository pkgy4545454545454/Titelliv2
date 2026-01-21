# Titelli - Product Requirements Document

## Original Problem Statement
Plateforme Titelli - Marketplace pour exposer les meilleurs prestataires de la région de Lausanne. 
- Deux types d'utilisateurs: Entreprises et Clients
- Pages: Accueil, Services, Produits, Certifiés, Labellisés, Premium
- Dashboard entreprise et client
- Paiements Stripe
- Zone: Lausanne, Suisse
- Monnaie: CHF

## User Personas
1. **Entreprise** - Prestataire local (restaurant, spa, plombier, etc.)
2. **Client** - Consommateur de la région de Lausanne
3. **Admin** - Gestionnaire de la plateforme (admin@titelli.com)

## Core Requirements
- Inscription/connexion entreprises et clients ✅
- Profil entreprise avec services/produits ✅
- Système de badges (Certifié, Labellisé, Premium) ✅
- Système d'avis/commentaires ✅
- Paiements Stripe (abonnements, publicités) ✅
- Dashboard entreprise complet ✅
- Dashboard client complet ✅
- Dashboard admin ✅
- Système de cashback ✅

## What's Been Implemented (Jan 2026)

### Backend (FastAPI)
- API REST complète avec routes /api
- Authentification JWT
- CRUD entreprises, services/produits, commandes, avis
- Intégration Stripe pour paiements
- MongoDB pour base de données
- Routes admin pour certification/labellisation

### Frontend (React + Tailwind)
- Design dark theme luxe (fond #050505)
- Page d'accueil avec hero panoramique
- Pages Services, Produits, Entreprises
- Page profil entreprise (3 colonnes: navigation, contenu, avis)
- Pages certifiés, labellisés, premium
- Dashboard entreprise (9 sections)
- Dashboard client (11 sections)
- Dashboard admin
- Pages paiement success/cancel
- Pages statiques (CGV, Mentions légales, etc.)

### Demo Data
- 6 entreprises créées avec badges variés
- Compte admin: admin@titelli.com / Admin123!
- Compte entreprise: spa.luxury@titelli.com / Demo123!
- Compte client: test@example.com / Test123!

## P0 Features Remaining (Priority)
- [ ] Ajout d'images pour les entreprises et services
- [ ] Intégration vidéos panoramiques
- [ ] Système de commande complet avec panier

## P1 Features
- [ ] Messagerie temps réel entre entreprises et clients
- [ ] Notifications push
- [ ] Système de livraison
- [ ] Agenda/calendrier pour entreprises

## P2 Features
- [ ] Mode de vie client (recommandations)
- [ ] Investissements entreprises
- [ ] Feed social entre contacts
- [ ] Formations professionnelles

## Tech Stack
- Backend: FastAPI + Python 3.11
- Frontend: React 18 + Tailwind CSS
- Database: MongoDB Atlas
- Payments: Stripe
- Auth: JWT

## Next Tasks
1. Ajouter upload d'images pour profils entreprises
2. Intégrer les vidéos panoramiques sur la page d'accueil
3. Implémenter le panier et flow de commande complet
4. Ajouter la messagerie
