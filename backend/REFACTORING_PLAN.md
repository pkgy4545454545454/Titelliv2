# Refactoring Plan - server.py → routers/

## Objectif
Diviser le fichier monolithique `server.py` (~4500 lignes) en modules séparés pour améliorer la maintenabilité.

## Structure cible

```
/app/backend/
├── server.py              # App principale, configuration, middleware
├── database.py            # Connexion MongoDB
├── models/                # Pydantic models
│   ├── __init__.py
│   ├── user.py
│   ├── enterprise.py
│   ├── training.py
│   └── ...
├── routers/               # API endpoints par domaine
│   ├── __init__.py
│   ├── auth.py            # /auth/* (login, register, me)
│   ├── enterprises.py     # /enterprises/*
│   ├── services_products.py  # /services-products/*
│   ├── orders.py          # /orders/*
│   ├── payments.py        # /payments/*, /subscriptions/*
│   ├── trainings.py       # /trainings/*, /enterprise/trainings/*
│   ├── jobs.py            # /jobs/*, /enterprise/offers/*
│   ├── cashback.py        # /cashback/*
│   ├── advertising.py     # /advertising/*, /enterprise/advertising/*
│   ├── notifications.py   # /notifications/*
│   ├── messages.py        # /messages/*
│   ├── client.py          # /client/* (profile, friends, documents, cards)
│   ├── influencer.py      # /influencer/*
│   ├── admin.py           # /admin/*
│   └── online_status.py   # /user/heartbeat, /user/offline
└── utils/
    ├── __init__.py
    ├── auth.py            # get_current_user, JWT functions
    └── helpers.py         # Utility functions
```

## Priorité de migration

### Phase 1 (Haute priorité)
1. ✅ Structure créée
2. [ ] auth.py - Authentication endpoints
3. [ ] trainings.py - Formations
4. [ ] online_status.py - Statut en ligne

### Phase 2 (Moyenne priorité)
5. [ ] cashback.py - Système cashback
6. [ ] notifications.py
7. [ ] messages.py
8. [ ] jobs.py

### Phase 3 (Basse priorité)
9. [ ] enterprises.py
10. [ ] services_products.py
11. [ ] orders.py
12. [ ] payments.py
13. [ ] advertising.py
14. [ ] client.py
15. [ ] influencer.py
16. [ ] admin.py

## Notes
- Chaque router doit importer les dépendances communes depuis server.py
- Les modèles Pydantic peuvent rester dans server.py pour l'instant
- Ajouter progressivement les routers dans app.include_router()

## Statut actuel
- server.py contient ~4500 lignes de code
- Fichiers placeholder créés dans /routers
- Refactoring complet nécessite plusieurs sessions de travail
