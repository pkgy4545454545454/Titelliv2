# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 15 : Avis Formations, Statut En Ligne, Migration (NOUVEAU)

**1. Système d'avis sur les formations**
- Note de 1 à 5 étoiles avec commentaire optionnel
- Seuls les utilisateurs ayant terminé une formation peuvent laisser un avis
- Protection anti-double avis
- Note moyenne et nombre d'avis sur chaque formation
- Modal d'avis avec étoiles cliquables dans le dashboard client

**2. Statut en ligne des contacts**
- Heartbeat automatique toutes les 60 secondes
- Badge vert (en ligne) / gris (hors ligne) sur chaque contact
- Section "En ligne maintenant" avec liste des amis connectés
- Considéré en ligne si last_seen < 5 minutes
- Marquage automatique hors ligne à la déconnexion

**3. Migration des données formations**
- Endpoint admin `/api/admin/migrate-trainings`
- Toutes les formations ont maintenant `training_type: online|on_site`
- Champ `downloadable_files` ajouté aux formations existantes

### Phase 14 : Système de Formations

**1. Formulaire de création Entreprise**
- Choix type: En ligne (fichiers téléchargeables) / Présentiel (dates, lieu)
- Upload multi-fichiers (vidéos, PDF, images) pour formations online
- Catégories, prérequis, certificat

**2. Dashboard Client "Mes Formations"**
- Stats (Total, En cours, Terminées)
- Onglets de filtrage
- Fichiers téléchargeables pour formations online
- Bouton "Donner un avis" pour formations terminées

**3. Section "Formations disponibles" sur Homepage**
- Cartes avec badges type et catégorie
- Prix et bouton "S'inscrire"
- Intégration Stripe

---

## APIs Nouvelles (Phase 15)

```
# Online Status
POST /api/user/heartbeat - Met à jour last_seen et is_online
POST /api/user/offline - Marque utilisateur hors ligne
GET  /api/client/friends/online - Liste amis avec statut en ligne

# Training Reviews
POST /api/trainings/{id}/review - Créer un avis (auth + formation terminée requise)
GET  /api/trainings/{id}/reviews - Liste avis avec note moyenne

# Migration
POST /api/admin/migrate-trainings - Migration données formations (admin only)
```

---

## Schémas DB (Nouveaux)

```javascript
// training_reviews collection
{
  id: string,
  training_id: string,
  user_id: string,
  user_name: string,
  user_avatar: string,
  rating: number (1-5),
  comment: string,
  created_at: string
}

// users collection (champs ajoutés)
{
  is_online: boolean,
  last_seen: string (ISO date)
}

// training_enrollments (champ ajouté)
{
  has_reviewed: boolean
}
```

---

## Tâches Restantes

### 🟡 P1
- Responsivité mobile complète
- Refactoring server.py en modules

### 🟢 P2
- Vidéo panoramique homepage
- Commentaires défilants
- Questions suggestives UI

---

## Credentials
- Client: test@example.com / Test123!
- Enterprise: spa.luxury@titelli.com / Demo123!
- Admin: admin@titelli.com / Admin123!

---

*Mise à jour: 23 Jan 2026 - Avis formations + Statut en ligne*
