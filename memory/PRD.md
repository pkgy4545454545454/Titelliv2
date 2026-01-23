# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 17 : Corrections et Nouveau Design Menu (AUJOURD'HUI)

**Bugs corrigés :**

1. **Modal candidature - CV non affiché**
   - Avant : Filtrait uniquement les documents `category='cv'`
   - Après : Affiche tous les documents (CV, général, PDF) pour permettre la sélection
   - Le client peut maintenant sélectionner n'importe quel document comme CV

2. **Ajout document - "Veuillez remplir tous les champs"**
   - Avant : Validation échouait si le nom n'était pas rempli manuellement
   - Après : Auto-complétion du nom depuis le fichier uploadé
   - Message d'erreur amélioré : "Veuillez uploader un fichier"

3. **Flow candidature - Retour à l'offre**
   - Redirection vers documents avec `?returnToJob={id}`
   - Alerte bleue "Vous souhaitez postuler à une offre"
   - Bouton "Voir l'offre" pour retourner directement
   - Option CV ajoutée en premier dans les catégories

**Nouveau design des menus :**

1. **Sections colorées avec gradients**
   - Principal : bleu
   - Avantages : violet
   - Investissements & Emplois : vert
   - Gestion : jaune
   - Communication : rose
   - Recommandations : cyan
   - Commandes : orange
   - Aide : gris

2. **Notifications clignotantes**
   - Bordures vertes qui pulsent quand il y a des notifications
   - Badge avec compteur qui rebondit
   - Appliqué aux items : Messages, Commandes, Postulations, Demandes d'amis

3. **Animations CSS**
   - `@keyframes pulse-green` - pulsation verte
   - `@keyframes notification-pulse` - bordure qui clignote
   - `.animate-pulse-border` - classe pour les items avec notifications

---

## Style du Menu

```css
/* Exemple de section */
.section {
  background: linear-gradient(to bottom-right, rgba(59,130,246,0.2), rgba(37,99,235,0.1));
  border: 1px solid rgba(59,130,246,0.3);
  border-radius: 12px;
  padding: 12px;
}

/* Item avec notification */
.item-with-notif {
  box-shadow: 0 0 0 2px rgba(34,197,94,0.5);
  animation: pulse-green 2s infinite;
}
```

---

## Résumé des corrections

| Problème | Solution |
|----------|----------|
| CV non affiché dans modal candidature | Affiche tous les documents, pas seulement category='cv' |
| "Veuillez remplir tous les champs" | Auto-set du nom depuis le fichier uploadé |
| Menu sans couleur | Gradients colorés pour chaque section |
| Pas de notification visuelle | Bordures clignotantes vertes + badge compteur |

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
- Commentaires défilants

---

*Mise à jour: 23 Jan 2026 - Nouveau design menu + corrections*
