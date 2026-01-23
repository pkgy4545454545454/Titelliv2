# Titelli Marketplace - PRD

## Aperçu
Marketplace premium pour Lausanne connectant entreprises, clients et influenceurs.

## Stack: React 18, FastAPI, MongoDB, Stripe

---

## ✅ Fonctionnalités Complétées (23 Jan 2026)

### Phase 18 : Corrections Finales et Design Menu (AUJOURD'HUI)

**Bugs corrigés :**

1. **Upload PDF ne fonctionnait pas**
   - Cause : `ALLOWED_EXTENSIONS` n'incluait pas `.pdf`, `.doc`, `.docx`
   - Solution : Ajout des extensions documents et vidéos
   - Augmentation de la limite de taille à 50MB

2. **"Veuillez uploader un fichier" alors que déjà uploadé**
   - Cause : Le fichier était uploadé mais le `url` n'était pas mis à jour correctement
   - Solution : Message toast "Upload en cours..." + logging amélioré

3. **CV pas sélectionné par défaut**
   - Cause : Catégorie par défaut était "general"
   - Solution : Catégorie par défaut changée à "cv"

**Nouveau design des menus et stats :**

1. **Sections menu colorées avec gradients**
   - Principal (bleu), Avantages (violet), Commercial (vert)
   - Gestion (jaune), Communication (rose), etc.

2. **Cartes de stats colorées**
   - Chaque carte a un gradient correspondant à sa section
   - Ex: Commandes (vert), Revenus (jaune), Note (violet)

3. **Notifications clignotantes**
   - Bordures vertes qui pulsent
   - Badge avec compteur qui rebondit
   - Animation CSS : `pulse-green`, `notification-pulse`

---

## Extensions de fichiers autorisées

```python
ALLOWED_EXTENSIONS = {
    # Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp',
    # Documents
    '.pdf', '.doc', '.docx', '.ppt', '.pptx',
    # Vidéos/Audio
    '.mp4', '.mov', '.avi', '.mp3', '.wav'
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
```

---

## Résumé des corrections

| Problème | Cause | Solution |
|----------|-------|----------|
| Upload PDF impossible | Extensions non autorisées | Ajout .pdf, .doc, .docx |
| Message erreur upload | URL non mis à jour | Toast + logging |
| CV pas par défaut | Default "general" | Default "cv" |
| Stats sans couleur | Style uniforme | Gradients colorés |
| Pas de notif visuelle | Pas d'animation | Bordures clignotantes |

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

*Mise à jour: 23 Jan 2026 - Corrections finales upload + design*
