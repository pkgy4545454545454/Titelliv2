# Titelli - PRD (Product Requirements Document)

## Original Problem Statement
Application marketplace locale suisse (Lausanne) connectant clients et prestataires de services.

## User Language
**Français**

## Last Completed (March 4, 2026)

### 1. Ordre des catégories
Les catégories sur la homepage sont maintenant triées selon l'ordre prioritaire suivant :
1. Restaurant
2. Personnel de maison
3. Soins esthétiques / Beauté
4. Coiffeurs
5. Cours de sport / Fitness
6. Activités
7. Professionnels de santé
8. Agent immobilier
9. Sécurité

### 2. Vidéos de catégories générées (Sora 2)
| Catégorie | Fichier | URL |
|-----------|---------|-----|
| Restaurant | restaurant.mp4 | /api/uploads/category_videos/restaurant.mp4 |
| Personnel de maison | personnel_maison.mp4 | /api/uploads/category_videos/personnel_maison.mp4 |
| Soins esthétiques | soins_esthetiques.mp4 | /api/uploads/category_videos/soins_esthetiques.mp4 |
| Coiffeurs | coiffeurs.mp4 | /api/uploads/category_videos/coiffeurs.mp4 |
| Cours de sport | cours_sport.mp4 | /api/uploads/category_videos/cours_sport.mp4 |
| Activités | activites.mp4 | /api/uploads/category_videos/activites.mp4 |
| Professionnels de santé | professionnels_sante.mp4 | /api/uploads/category_videos/professionnels_sante.mp4 |

**Note:** Les vidéos pour Agent immobilier et Sécurité n'ont pas pu être générées (balance insuffisante).

### 3. Animation Splash Screen
- Cercle autour du logo supprimé
- Affichage du "T" avec effet glow
- Barre de chargement conservée

### 4. Message d'accueil (WelcomePopup)
Nouveau message :
- "Bienvenue parmi les meilleurs prestataires de la région, tous représentés sur Titelli !"
- "Profitez immédiatement de 100.- de publicité de votre choix offerte, utilisable sur toute votre page publicitaire !"
- Code : "Neworldpourtoi" (avec bouton copier)
- "De plus, un représentant prendra contact avec vous afin d'établir un bilan et de vous communiquer les critères nécessaires imposés par les experts afin de répondre à une de nos labellisations !"
- "Soyez reconnu dans votre domaine d'activité auprès des professionnels."

### 5. CGV Complet (Loi Suisse)
Page CGV entièrement réécrite avec 13 articles conformes au droit suisse :
- Art. 1 : Dispositions générales
- Art. 2 : Définitions
- Art. 3 : Inscription et compte utilisateur
- Art. 4 : Services proposés
- Art. 5 : Tarification et modalités de paiement
- Art. 6 : Droit de rétractation et annulation
- Art. 7 : Responsabilités
- Art. 8 : Propriété intellectuelle
- Art. 9 : Protection des données personnelles (LPD/RGPD)
- Art. 10 : Utilisations interdites
- Art. 11 : Résiliation
- Art. 12 : Droit applicable et juridiction compétente
- Art. 13 : Dispositions diverses

Références légales :
- Code des obligations (CO)
- Loi fédérale contre la concurrence déloyale (LCD)
- Loi fédérale sur la protection des données (LPD)
- Code de procédure civile suisse (CPC)

## Files Modified This Session
- `/app/frontend/src/pages/HomePage.js` - Ordre des catégories
- `/app/frontend/src/components/EnterpriseCard.js` - Mapping vidéos catégories
- `/app/frontend/src/components/SplashScreen.js` - Logo sans cercle
- `/app/frontend/src/components/WelcomePopup.jsx` - Nouveau message d'accueil
- `/app/frontend/src/pages/CGVPage.js` - CGV complet loi suisse
- `/app/backend/scripts/generate_category_videos.py` - Script génération vidéos

## Pending Tasks

### P0 - Urgent
- [ ] Générer vidéos manquantes (agent_immobilier, securite) - nécessite recharge balance

### P1 - Priority High
- [ ] Réorganiser les produits sur la homepage
- [ ] Régénérer vidéo #107 sans personnes

### P2 - Medium
- [ ] Investiguer images corrompues
- [ ] Corriger design brochure monétisation
- [ ] Redesign profils prestataires

## Test Credentials
- **Client**: test.client@titelli.com / Test123!
