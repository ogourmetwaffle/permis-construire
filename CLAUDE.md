@AGENTS.md
# CLAUDE.md

## Contexte du projet

Permis Express est une plateforme web permettant aux utilisateurs de déposer un dossier de conversion de permis étranger vers permis français.

L'utilisateur :

* Remplit un formulaire
* Dépose ses documents
* Effectue un paiement Stripe
* Reçoit une confirmation

L'administrateur :

* Consulte les dossiers
* Télécharge les documents
* Vérifie le paiement
* Met à jour le statut du dossier

---

## Stack technique

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS

### Backend

* API Routes Next.js

### Base de données

* Supabase PostgreSQL

### Stockage fichiers

* Supabase Storage

### Paiement

* Stripe Checkout

### Emails

* Brevo API

### Hébergement

* Vercel

---

## Objectifs du projet

Priorités absolues :

1. Simplicité
2. SEO
3. Performance
4. Mobile First
5. Code maintenable
6. Sécurité

Toujours privilégier la solution la plus simple.

---

## Règles de développement

### Dépendances

Éviter d'ajouter des dépendances inutiles.

Avant toute installation :

* vérifier si Next.js permet déjà de faire la fonctionnalité
* vérifier si TypeScript natif suffit
* privilégier du code simple

Ne jamais installer une librairie pour une fonctionnalité triviale.

---

### Architecture

Favoriser :

* composants simples
* fonctions courtes
* logique métier isolée
* code lisible

Éviter :

* sur-ingénierie
* patterns complexes
* abstractions inutiles

---

### TypeScript

Toujours typer :

* paramètres
* retours de fonctions
* objets métier

Éviter :

* any
* unknown inutile
* cast excessifs

---

### Base de données

Toujours :

* requêtes simples
* noms explicites
* colonnes clairement nommées

Privilégier :

* SELECT ciblés
* pagination si nécessaire

Éviter :

* SELECT *
* requêtes inutiles

---

### Supabase

Utiliser :

* RLS quand nécessaire
* Service Role uniquement côté serveur

Ne jamais exposer :

* Service Role Key
* secrets Stripe
* secrets Brevo

dans le frontend.

---

## SEO

Le SEO est une priorité.

Pour chaque page publique :

Ajouter :

* title
* description
* open graph
* canonical

Utiliser :

* Server Components quand possible
* rendu serveur
* HTML sémantique

Privilégier :

* h1 unique
* h2 structurés
* contenu indexable

Éviter :

* pages entièrement client-side
* contenu important chargé après rendu

---

## Responsive

Approche Mobile First.

Le site doit fonctionner parfaitement sur :

* smartphone
* tablette
* desktop

Toujours tester :

* largeur 375px
* largeur 768px
* largeur 1440px

Éviter :

* scroll horizontal
* boutons trop petits
* tableaux illisibles

---

## Design

Style attendu :

* professionnel
* moderne
* épuré
* rassurant

Couleurs principales :

* Bleu : #173B8C
* Rouge : #E30613

Inspirations :

* Stripe
* Notion
* Qonto

Privilégier :

* espace blanc
* cartes simples
* hiérarchie visuelle claire

---

## Dashboard Admin

Le dashboard doit rester simple.

Objectif :

* rechercher un dossier
* consulter les documents
* vérifier le paiement
* modifier le statut

Ne pas transformer l'application en ERP complexe.

---

## Qualité du code

Avant de proposer une solution :

Se demander :

* Est-ce la solution la plus simple ?
* Est-ce compatible mobile ?
* Est-ce bon pour le SEO ?
* Est-ce maintenable dans 1 an ?
* Peut-on faire sans nouvelle dépendance ?

Si oui, alors implémenter.
