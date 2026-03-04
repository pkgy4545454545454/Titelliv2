# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services.

## User Language: **Français**

## Last Completed (March 4, 2026)

### ✅ Flyer Marketing avec QR Code
- Page accessible à `/flyer`
- Contenu complet avec tous les slogans
- Image femme heureuse générée par IA
- QR code pointant vers titelli.com
- Coordonnées Titelli (email, téléphone, adresse)
- Bouton télécharger/imprimer fonctionnel

### ✅ Essai IA Gratuit à l'inscription entreprise
- 1 crédit d'image IA offert automatiquement
- Validité 90 jours après activation
- Système de crédits dans MongoDB (collection `ai_credits`)
- Endpoints: GET /api/ai-credits, POST /api/ai-credits/use
- Message de confirmation mis à jour avec "Cadeau de bienvenue"

### ✅ 15 Catégories principales avec images/vidéos de fond
| # | Catégorie | Entreprises | Vidéo |
|---|-----------|-------------|-------|
| 1 | Restauration | 671 | ✅ restaurant.mp4 |
| 2 | Personnel de maison | 76 | ✅ personnel_maison.mp4 |
| 3 | Soins esthétiques | 252 | ✅ soins_esthetiques.mp4 |
| 4 | Coiffeurs | 323 | ✅ coiffeurs.mp4 |
| 5 | Cours de sport | 87 | ✅ cours_sport.mp4 |
| 6 | Activités | 90 | ✅ activites.mp4 |
| 7 | Professionnels de santé | 329 | ✅ professionnels_sante.mp4 |
| 8 | Agent immobilier | 76 | ✅ agent_immobilier.mp4 |
| 9 | Sécurité | 5 | ✅ securite.mp4 |
| 10 | Professionnels de transports | 22 | Image |
| 11 | Professionnels d'éducation | 57 | Image |
| 12 | Professionnels administratifs | 80 | Image |
| 13 | Professionnels juridiques | 127 | Image |
| 14 | Professionnels informatiques | 71 | Image |
| 15 | Professionnels de construction | 152 | Image |

## Files Modified/Created This Session
- `/app/frontend/src/pages/FlyerPage.js` - Nouveau flyer marketing
- `/app/frontend/src/pages/EnterpriseRegistrationPage.js` - Cadeau bienvenue IA
- `/app/backend/server.py` - Endpoints ai-credits + crédit offert à l'inscription
- `/app/frontend/src/App.js` - Route /flyer ajoutée

## Pending Tasks

### P0 - Priority Critical
- [ ] Refinements UI/UX des cartes Enterprise:
  - Changer flèche dropdown → cercle avec '+'
  - Nettoyer titres (supprimer _ et -)
  - Changer police titres cartes
  - Ajouter flèches navigation médias
  - Remplacer étoiles par 5 bulles vertes
  - Changer titre principal "les meilleurs services de ta région"
  - Ajouter titre "Les meilleurs produits de ta région"

### P1 - Priority High
- [ ] Générer vidéos manquantes (6 catégories) - BLOQUÉ sur crédits utilisateur
- [ ] Régénérer vidéo #107 sans personnes

### P2 - Medium
- [ ] Réorganiser produits/services homepage
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation
- [ ] Redesign profils prestataires

### P3 - Future
- [ ] Créer flyer QR code personnalisé par entreprise
- [ ] Démontrer fonctionnalité multi-tags
- [ ] Créer CDC final

## API Endpoints
- GET /api/main-categories - 15 catégories principales avec vidéos
- GET /api/ai-credits - Crédits IA disponibles
- POST /api/ai-credits/use - Utiliser un crédit IA gratuit

## Test Credentials
- **Client**: test.client@titelli.com / Test123!

## Key Resources
- Flyer: https://category-video-hub.preview.emergentagent.com/flyer
- Image femme: https://static.prod-images.emergentagent.com/jobs/f4332303-e66b-4547-8bcc-769c9b82fc6d/images/d343b00951f2d8eec641ab219b9fc88c02f7bab65d4dc93d29c2315d2312032a.png
