# CLAUDE.md

## Contexte du projet

Ce projet est une plateforme web de gestion de dossiers de permis de construire.

L'objectif est de permettre aux particuliers et aux professionnels de déposer un dossier en ligne, téléverser leurs documents, effectuer un paiement et suivre l'avancement de leur demande.

L'application comporte également un espace d'administration permettant de gérer les dossiers.

---

# Stack technique

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS
* Supabase (PostgreSQL + Storage)
* Stripe
* Brevo
* Déploiement sur Vercel

---

# Principes de développement

Le code doit rester simple, lisible et facilement maintenable.

Toujours privilégier une solution simple plutôt qu'une architecture complexe.

Éviter les dépendances inutiles lorsque la fonctionnalité peut être réalisée avec React, TypeScript ou les API natives.

Privilégier la réutilisation des composants.

Ne jamais dupliquer du code lorsqu'un composant réutilisable est possible.

---

# Responsive Design

Le site est conçu en **Mobile First**.

Chaque nouvelle fonctionnalité doit fonctionner parfaitement sur :

* Mobile
* Tablette
* Desktop

Ne jamais développer une interface uniquement pour ordinateur.

---

# Design

Le design doit être moderne, professionnel et épuré.

Éviter les interfaces surchargées.

Privilégier :

* grands espaces
* cartes simples
* typographie lisible
* peu de couleurs
* animations discrètes

L'expérience utilisateur doit rester fluide.

---

# SEO

Toutes les pages publiques doivent être optimisées pour le référencement naturel.

Respecter les bonnes pratiques Next.js :

* metadata
* title
* description
* balises sémantiques
* images optimisées
* performances

---

# Sécurité

Toutes les opérations sensibles doivent être réalisées côté serveur.

Ne jamais exposer :

* Service Role Supabase
* Stripe Secret Key
* Clés privées

Toujours utiliser les variables d'environnement.

Valider les données côté serveur avant toute écriture en base.

---

# Supabase

Supabase est utilisé pour :

* PostgreSQL
* Storage
* API

Les documents sont stockés dans le bucket :

documents

Les données métier sont enregistrées dans PostgreSQL.

---

# Architecture

Privilégier des composants réutilisables.

Séparer clairement :

* UI
* logique métier
* accès aux données
* API

Ne jamais mélanger plusieurs responsabilités dans un même composant.

---

# Administration

L'espace administrateur doit permettre :

* consulter les dossiers
* rechercher un dossier
* consulter les documents
* télécharger les documents
* modifier le statut
* ajouter un commentaire
* valider un paiement par virement
* archiver un dossier

L'administration doit rester simple et rapide à utiliser.

---

# Qualité du code

Toujours utiliser TypeScript.

Éviter les "any".

Utiliser des noms explicites.

Supprimer le code mort.

Éviter les composants trop volumineux.

---

# UX

Limiter le nombre de clics.

Limiter le scroll.

Privilégier des interfaces compactes.

Les formulaires doivent rester simples à remplir.

Toujours guider l'utilisateur.

---

# Performance

Optimiser :

* les images
* les requêtes
* les composants React

Éviter les re-render inutiles.

---

# Philosophie du projet

L'objectif n'est pas de créer une application complexe mais une plateforme robuste, rapide, simple à maintenir et agréable à utiliser.

Chaque nouvelle fonctionnalité doit apporter une réelle valeur à l'utilisateur et rester cohérente avec cette philosophie.

Avant d'installer une nouvelle librairie npm, toujours vérifier si la fonctionnalité peut être réalisée avec les outils déjà présents dans le projet (React, Next.js, TypeScript ou les API natives).

Ne jamais ajouter une dépendance sans justification.

---

# API Admin

- **Endpoint principal:** `/api/admin/documents` — fourni des URLs signées pour le téléchargement des documents et utilise `supabaseAdmin` côté serveur.
- **Sécurité:** Toutes les routes sous `/api/admin/*` exigent l'en-tête `Authorization: Bearer <access_token>` contenant le token d'accès Supabase (récupéré côté client via `supabase.auth.getSession()`). Le serveur vérifie ce token avant d'effectuer des opérations sensibles.
- **Bonne pratique:** Ne pas appeler directement les tables `dossiers`/`documents` ou le storage depuis le client pour des opérations administratives ; passer systématiquement par les API Next.js protégées.