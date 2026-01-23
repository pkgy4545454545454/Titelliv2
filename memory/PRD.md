# Titelli Marketplace - Product Requirements Document

## Aperçu du Projet
**Titelli** est une marketplace premium pour Lausanne, Suisse, connectant les entreprises locales avec les clients et les influenceurs.

## Stack Technique
- **Frontend** : React 18, Tailwind CSS, Shadcn/UI, Lucide Icons
- **Backend** : FastAPI, Motor (async MongoDB), JWT Auth
- **Base de données** : MongoDB
- **Paiements** : Stripe

---

## Fonctionnalités Implémentées (100% Testées)

### ✅ Phases 1-11 : Complétées précédemment

### ✅ Phase 12 : Galerie Média & Cover Image (23 Jan 2026)
- [x] **Image de couverture entreprise** : Upload, sauvegarde et affichage sur les cartes
- [x] **Galerie Média** : Nouvelle section dans le dashboard entreprise
  - Upload multiple de photos (drag-drop ou clic)
  - Ajout de vidéos YouTube/Vimeo via URL
  - Suppression de photos et vidéos
- [x] **Navigation contextuelle notifications** : ?tab= paramètre URL
- [x] **Validation CRUD produits/services** : Fonctionnel

---

## Modèle Enterprise (MongoDB)

```javascript
{
  id: String,
  business_name: String,
  logo: String | null,
  cover_image: String | null,  // Bannière/Cover
  photos: [String],            // Galerie photos
  videos: [String],            // Galerie vidéos (YouTube URLs)
  // ... autres champs
}
```

---

## Notifications avec Liens

| Type Notification | Lien |
|-------------------|------|
| Nouvelle offre d'emploi | `/emploi/{job_id}` |
| Candidature reçue | `/dashboard/entreprise?tab=applications` |
| Statut candidature | `/dashboard/client?tab=jobs` |
| Demande d'ami | `/dashboard/client?tab=contacts` |

---

## API Médias Entreprise

```
PUT /api/enterprises/{id}
Body: {
  "cover_image": "https://...",
  "photos": ["url1", "url2", ...],
  "videos": ["youtube_url1", ...]
}
```

---

## Tâches Restantes

### 🟡 P1 - Moyenne Priorité
1. **Responsivité mobile** - Audit CSS complet
2. **Refonte menu Enterprise Dashboard** - Selon maquettes

### 🟢 P2 - Basse Priorité
1. Commentaires défilants prestataires
2. Mini-labels annonces
3. Refactoring `server.py` en routers FastAPI

---

## Credentials de Test
- **Client** : test@example.com / Test123!
- **Entreprise** : spa.luxury@titelli.com / Demo123!
- **Influenceur** : test_influencer2@example.com / Test123!

---

## Tests
- **iteration_10-12.json** : Tous passés à 100%

---

*Dernière mise à jour : 23 Janvier 2026*
