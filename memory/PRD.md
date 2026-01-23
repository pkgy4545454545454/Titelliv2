# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 14 : Système de Formations (NOUVEAU)

**1. Section "Formations disponibles" sur Homepage**
- Affichage des formations publiques avec badges (En ligne / Présentiel)
- Infos: titre, entreprise, durée, prix, catégorie, certificat
- Bouton "S'inscrire" avec redirection auth si non connecté
- Intégration Stripe pour l'achat

**2. Formulaire de création Entreprise**
- Choix type: En ligne (fichiers téléchargeables) / Présentiel (dates, lieu)
- Upload multi-fichiers (vidéos, PDF, images) pour formations online
- Champs conditionnels selon le type sélectionné
- Catégories, prérequis, certificat

**3. Dashboard Client "Mes Formations"**
- Statistiques (Total, En cours, Terminées)
- Onglets de filtrage (Toutes / En cours / Terminées)
- Affichage détaillé avec progression
- Téléchargement des fichiers pour formations online
- Bouton "Marquer comme terminée"

### Phase 12-13 : Ciblage IA Réel & Pages Emploi

**1. Système IA Ciblage Clients (RÉEL - pas mock)**
- Stats basées sur vraies commandes de la BDD
- Liste des vrais clients avec historique d'achats
- Filtres : par nom, par type (fidèles/récents), par produit/service
- Envoi de questions suggestives via messagerie

**2. Page Détail Offre d'Emploi** (`/emploi/{id}`)
- Header avec image/vidéo
- Infos complètes (lieu, type, salaire, début)
- Bouton "Postuler maintenant" avec modal CV

**3. Galerie Média Entreprise**
- Upload photos multiples
- Ajout vidéos YouTube
- Cover image éditable

**4. Système de Candidatures**
- Modal de sélection CV depuis documents client
- Lettre de motivation optionnelle
- Gestion des candidatures dans dashboard entreprise

---

## APIs Formations

```
GET  /api/trainings - Liste publique avec filtres (limit, training_type)
GET  /api/trainings/{id} - Détail d'une formation
POST /api/trainings/{id}/purchase - Créer checkout Stripe
POST /api/trainings/{id}/enroll - Inscription après paiement
GET  /api/enterprise/trainings - Formations de l'entreprise
POST /api/enterprise/trainings - Créer une formation
PUT  /api/enterprise/trainings/{id} - Modifier
DELETE /api/enterprise/trainings/{id} - Supprimer
GET  /api/client/trainings - Formations du client
PUT  /api/client/trainings/{id}/complete - Marquer terminée
```

---

## Schémas DB (Formations)

```javascript
// trainings collection
{
  id: string,
  title: string,
  description: string,
  duration: string,
  price: number,
  category: string,
  training_type: "online" | "on_site",
  // Online fields
  downloadable_files: [{name, url, type}],
  // On-site fields
  location: string,
  start_date: string,
  end_date: string,
  max_participants: number,
  // Meta
  enterprise_id: string,
  enterprise_name: string,
  enterprise_logo: string,
  certificate: boolean,
  prerequisites: string,
  is_active: boolean,
  enrollments: number,
  created_at: string
}

// training_enrollments collection
{
  id: string,
  training_id: string,
  user_id: string,
  training_title: string,
  training_type: string,
  enterprise_id: string,
  enterprise_name: string,
  price_paid: number,
  status: "in_progress" | "completed",
  progress: number,
  start_date: string,
  end_date: string,
  downloadable_files: array, // Copié lors de l'inscription
  payment_verified: boolean,
  enrolled_at: string,
  completed_at: string
}
```

---

## Tâches Restantes

### 🔴 P0 (URGENT)
- Aucune

### 🟡 P1
- Responsivité mobile complète
- Migration données anciennes formations (ajouter training_type)
- Refactoring server.py (dette technique critique)

### 🟢 P2
- Vidéo panoramique homepage
- Commentaires défilants
- Questions suggestives UI

---

## Credentials
- Client: test@example.com / Test123!
- Enterprise: spa.luxury@titelli.com / Demo123!
- Influencer: test_influencer2@example.com / Test123!

---

*Mise à jour: 23 Jan 2026 - Système de formations complet*
