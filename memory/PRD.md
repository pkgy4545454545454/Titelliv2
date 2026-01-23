# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 12-13 : Ciblage IA Réel & Pages Emploi

**1. Système IA Ciblage Clients (RÉEL - pas mock)**
- Stats basées sur vraies commandes de la BDD
- Liste des vrais clients avec historique d'achats
- Filtres : par nom, par type (fidèles/récents), par produit/service
- Sélection multiple de clients
- Envoi de questions suggestives via messagerie
- Notifications automatiques aux clients

**2. Page Détail Offre d'Emploi** (`/emploi/{id}`)
- Header avec image/vidéo
- Infos complètes (lieu, type, salaire, début)
- Description, profil recherché, avantages
- Bouton "Postuler maintenant" avec modal CV
- Carte entreprise avec lien

**3. Vidéos Header**
- Page Entreprises : vidéo réunion business
- Page Services : vidéo composition florale
- Page Produits : vidéo shopping boutique

**4. Galerie Média Entreprise**
- Upload photos multiples
- Ajout vidéos YouTube
- Suppression individuelle

**5. Cover Image Entreprise**
- Upload/modification bannière
- Affichage sur cartes homepage

---

## APIs Ajoutées

```
GET  /api/enterprise/customers - Vrais clients avec filtres
POST /api/enterprise/send-question - Envoyer question suggestive
GET  /api/jobs/{id} - Détail offre emploi
```

---

## Tâches Restantes

### 🟡 P1
- Responsivité mobile complète
- Refonte menu Enterprise Dashboard

### 🟢 P2
- Commentaires défilants
- Refactoring server.py

---

## Credentials
- Client: test@example.com / Test123!
- Enterprise: spa.luxury@titelli.com / Demo123!
- Influencer: test_influencer2@example.com / Test123!

---

*Mise à jour: 23 Jan 2026*
