# Architecture du projet – Permis Construire

Date : 2026

---

# Présentation

Permis Construire est une plateforme web permettant aux particuliers et aux professionnels de déposer une demande de permis de construire ou de déclaration préalable.

L'application permet :

* déposer un dossier en ligne ;
* téléverser des documents ;
* choisir un mode de paiement ;
* suivre l'état d'avancement du dossier ;
* gérer les dossiers depuis une interface d'administration.

Le projet est développé en Next.js avec Supabase comme backend.

---

# Stack technique

## Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS

## Backend

* API Routes Next.js

## Base de données

* PostgreSQL (Supabase)

## Stockage

* Supabase Storage

Bucket principal :

documents

## Paiement

* Stripe
* Virement bancaire (Wise)

## Emails

* Brevo

## Hébergement

* Vercel

---

# Architecture du projet

```
app/
components/
lib/
public/
supabase/
```

---

# app/

Contient les pages de l'application. Arborescence des routes (pages + API) et nombre de pages par lien :

```
/
	- page.tsx  (page d'accueil) — 1 page

/deposer-dossier/
	- page.tsx  — 1 page

/merci/
	- page.tsx  — 1 page

/admin/  — 4 pages exposées
	- page.tsx  (index admin)
	- dossiers/
		- page.tsx  (/admin/dossiers) — liste — 1 page
		- [id]/
			- page.tsx  (/admin/dossiers/[id]) — détail — 1 page
	- login/
		- page.tsx  (/admin/login) — 1 page

/api/  — 7 endpoints
	- create-checkout-session/route.ts
	- upload/route.ts
	- webhook/route.ts
	- send-emails/route.ts
	- deposer-virement/route.ts
	- admin/
		- docs/route.ts
		- update-statut/route.ts
```

---

# components/

Tous les composants réutilisables.

Exemples :

* Header
* Footer
* Hero
* FileUpload
* DossierForm
* AdminPanel

---

# lib/

Contient les services communs.

Exemples :

* Supabase
* Email
* Helpers

---

# supabase/

Contient toute la configuration SQL du projet.

```
supabase/

01_create_tables.sql

02_storage.sql

03_policies.sql
```

Un nouveau projet Supabase peut être créé simplement en exécutant ces scripts.

---

# Base de données

Tables principales :

## dossiers

Contient :

* informations client
* informations du projet
* paiement
* statut
* commentaires

## documents

Contient :

* dossier associé
* nom du fichier
* chemin Storage
* type
* taille

---

# Stockage

Tous les documents sont stockés dans :

documents/

Chaque dossier possède son propre répertoire.

Exemple :

```
documents/

PC-17820999/

photo1.jpg

plan.pdf
```

---

# Paiement

Deux modes de paiement sont disponibles.

## Carte bancaire

Stripe Checkout

Validation automatique via Webhook.

## Virement bancaire

Wise

Le dossier est créé avec le statut :

EN_ATTENTE_PAIEMENT

L'administrateur valide ensuite le paiement.

---

# États d'un dossier

```
EN_ATTENTE_PAIEMENT

NOUVEAU

EN_COURS

EN_ATTENTE_DOCUMENT

TERMINE

REFUSE

ARCHIVE
```

---

# Emails

Brevo est utilisé pour :

* confirmation de dépôt ;
* confirmation de paiement ;
* notifications administrateur ;
* demandes de documents complémentaires.

---

# Variables d'environnement

## Frontend

* NEXT_PUBLIC_SUPABASE_URL
* NEXT_PUBLIC_SUPABASE_ANON_KEY
* NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
* NEXT_PUBLIC_SITE_URL

## Backend

* SUPABASE_SERVICE_ROLE_KEY
* STRIPE_SECRET_KEY
* STRIPE_WEBHOOK_SECRET
* BREVO_API_KEY
* ADMIN_EMAIL
* SENDER_EMAIL

---

# Sécurité

* Bucket Storage privé.
* Aucune clé sensible côté frontend.
* Toutes les opérations sensibles sont réalisées côté serveur.
* Validation des données avant toute écriture en base.
* Utilisation des variables d'environnement pour tous les secrets.

---

# Philosophie du projet

L'application doit rester :

* simple ;
* rapide ;
* responsive ;
* facile à maintenir ;
* évolutive.

Chaque nouvelle fonctionnalité doit être cohérente avec l'architecture existante et éviter toute complexité inutile.

---

# Refonte — Esquiss Habitat (2026-07-01)

Ce dépôt est une adaptation du projet original "Permis Express" pour le client "Esquiss Habitat". La refonte concerne uniquement la page d'accueil (landing) et l'identité visuelle ; l'architecture technique et les intégrations restent inchangées.

Principes généraux
- Conserver : Next.js (App Router), TypeScript, Tailwind CSS, Supabase (Postgres + Storage), Stripe, Brevo, déploiement sur Vercel.
- Ne pas modifier les flows métier : dépôt de dossier, formulaire, API, administration, webhooks, logique Supabase.
- Réutiliser au maximum les composants existants et éviter la duplication.

Palette & identité
- Variables CSS utilisées : `--eh-primary` (bleu foncé), `--eh-bordeaux` (rouge bordeaux), `--eh-light` (gris très clair), blanc.
- Logo : `/public/logo.jpeg` (remplacé pour Esquiss Habitat) ; visuels de référence : `/public/flyer.jpeg`.

Landing page — changements fonctionnels
- Nouvelle page d'accueil orchestrée depuis `app/page.tsx` et composée des composants suivants (créés ou adaptés) :
	- `components/Hero.tsx` (hero premium, blueprint)
	- `components/Services.tsx` (cartes prestations)
	- `components/Benefits.tsx` (bloc confiance)
	- `components/Process.tsx` (timeline 5 étapes)
	- `components/WhyUs.tsx` (argumentaire deux-colonnes)
	- `components/Realisations.tsx` (galerie projets)
	- `components/Testimonials.tsx` (avis clients)
	- `components/FAQ.tsx` (accordéon)
	- `components/Contact.tsx` (contact + placeholder Maps)

Fichiers principaux modifiés
- `app/globals.css` : tokens et couleurs Esquiss Habitat
- `app/layout.tsx` : metadata SEO (titre, description, lang=fr)
- `app/page.tsx` : nouvelle orchestration de la landing
- `components/Header.tsx`, `components/MobileNav.tsx`, `components/Footer.tsx` : adaptations branding et navigation

Ce qui n'a pas été touché
- `components/DossierForm.tsx`, `components/FileUpload.tsx` — formulaire de dépôt inchangé
- `components/admin/*` — interface d'administration conservée
- `app/api/*` — routes API (Stripe checkout, webhook, envoi d'emails, admin helpers) inchangées
- `lib/supabase.ts`, `lib/email.ts` — services réutilisés

Notes pour les développeurs
- Le projet a été buildé localement pour validation (`next build`) après modifications.
- Conserver l'approche Mobile First et les bonnes pratiques SEO lors de futures évolutions.

AGENTS.md
- `AGENTS.md` contient des instructions pour des agents/automatisations. Il **n'est pas** partie de l'application et n'a pas besoin d'être modifié pour la refonte UI, sauf si l'on souhaite modifier le comportement des agents de développement ou de CI.

Prochaine étape recommandée
- Vérifier visuellement la landing en local (`npm run dev`) et procéder aux ajustements de design (espacements, images, contrastes). Si souhaité, je peux ajouter une note dans `AGENTS.md` indiquant que le fichier est réservé aux agents et qu'il ne faut pas le modifier pour la refonte UI.

---

# Uploads sécurisés — Refonte (2026-07-03)

Dans le cadre de l'amélioration de la sécurité et des performances des téléversements, l'architecture de l'upload a été refondue pour routage EXCLUSIF via le backend Next.js. Le but est : garder le bucket `documents` privé, ne jamais exposer de clés sensibles côté client, centraliser la validation et améliorer les performances.

Flow principal

Navigateur -> `POST /api/upload` -> Next.js API (runtime=nodejs) -> Supabase Storage (via `SUPABASE_SERVICE_ROLE_KEY`) -> insertion en masse dans la table `documents`

Principaux changements réalisés

- Création de `lib/supabase-admin.ts` : client Supabase serveur utilisant `SUPABASE_SERVICE_ROLE_KEY` (service role). Utilisation réservée aux routes API (server-side only).
- Création de `lib/storage.ts` : couche service pour le stockage offrant :
	- `uploadDocuments(files, basePath, concurrency)` — upload concurrent limité (constante `UPLOAD_CONCURRENCY = 3`).
	- `deleteDocuments(paths)` — suppression en masse (utilisée pour rollback).
- Nouvelle route API `app/api/upload/route.ts` :
	- accepte `multipart/form-data` (champ `files`, `numeroDossier`, `dossierId`),
	- effectue validation unique (taille 50 Mo, extensions, MIME, nom),
	- résout `dossierId` une seule fois si nécessaire,
	- utilise `lib/storage.ts` pour uploader en parallèle (concurrence limitée),
	- insère les métadonnées en un seul `INSERT` dans `documents` (batch),
	- effectue rollback atomique (supprime fichiers uploadés si échec),
	- ajoute des métriques `console.time()` pour : parsing, validation, upload, insert, durée totale.
- Modifications frontend minimes :
	- `components/wizard/Wizard.tsx` : suppression des appels directs `supabase.storage.upload(...)` côté client ; utilisation de `POST /api/upload` via `XMLHttpRequest` pour conserver la barre de progression réelle (`xhr.upload.onprogress`).
	- `components/DossierForm.tsx` : envoi des fichiers vers `/api/upload` après création du dossier.

Décisions de sécurité et performance

- Le bucket `documents` reste privé.
- Aucune clé secrète n'est exposée au navigateur — seules les variables serveur (`SUPABASE_SERVICE_ROLE_KEY`) sont utilisées côté API.
- Le runtime de la route est forcé à `nodejs` (`export const runtime = 'nodejs'`) pour de meilleures performances I/O et gestion des buffers.
- Concurrence par défaut : `UPLOAD_CONCURRENCY = 3` (modifiable dans `lib/storage.ts`) — choix privilégie stabilité et faible empreinte mémoire.
- Mesures de performance embarquées avec `console.time()` pour identifier précisément les goulots d'étranglement en production/local.

Notes opérationnelles

- Avant déploiement : définir `SUPABASE_SERVICE_ROLE_KEY` dans les variables d'environnement du serveur (Vercel / local `.env`).
- Tests recommandés : lancer plusieurs uploads (fichiers variés, plusieurs fichiers simultanés) et consulter les timers server-side pour ajuster `UPLOAD_CONCURRENCY` si nécessaire.
- Si le parsing multipart (`req.formData()`) devient le goulot, envisager un parser stream-based (optionnel, plus complexe).

Références de fichiers modifiés / ajoutés

- `lib/supabase-admin.ts` (nouveau)
- `lib/storage.ts` (nouveau)
- `app/api/upload/route.ts` (nouveau / remplace upload direct)
- `components/wizard/Wizard.tsx` (modifié : envoi via `/api/upload`)
- `components/DossierForm.tsx` (modifié : envoi via `/api/upload`)

Cette refonte respecte l'architecture existante décrite plus haut en conservant Next.js, Supabase et la table `documents`. Elle renforce la sécurité et améliore la latence globale des uploads tout en conservant l'expérience utilisateur actuelle.

