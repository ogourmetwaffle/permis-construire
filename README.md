# Permis Express — Guide d'installation et déploiement

Court guide pour lancer, configurer Stripe & Supabase, et déployer l'application.

**Contenu rapide**
- Installation locale
- Variables d'environnement requises
- Test Stripe (local) / webhook
- Déploiement sur Vercel
- Sécurité & bonnes pratiques

---

-## Prérequis
- Node.js 18+ et npm
- Compte Supabase (project + table `dossiers` et bucket `documents`)
- Compte Stripe (mode test)
- (Optionnel) Stripe CLI pour tester les webhooks localement

## Installer et lancer en local

1. Installer dépendances:

```bash
npm install
```

2. Copier les variables d'environnement dans un fichier `.env.local` à la racine:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
# Pour webhook et mise à jour DB depuis le serveur
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_...
# Optionnel pour développement
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Ne committez jamais ce fichier dans git.

3. Lancer le dev server:

```bash
npm run dev
```

4. Ouvrir `http://localhost:3000` et tester le flux: déposer un dossier sur `/deposer-dossier`.

---

## Stripe — création de session & webhooks

Le projet contient:
- `app/api/create-checkout-session/route.ts` — crée une session Checkout (utilise `STRIPE_SECRET_KEY`).
- `app/api/webhook/route.ts` — webhook qui marque `paiement_effectue` en base via la clé `SUPABASE_SERVICE_ROLE_KEY`.

Étapes pour configurer Stripe (test):

1. Dans Stripe Dashboard, copiez votre clé API secrète (`sk_test_...`) dans `STRIPE_SECRET_KEY` (Vercel env).
2. Déployer ou utiliser Stripe CLI pour tester localement. Pour forwarder webhooks localement:

```bash
# installez stripe cli si nécessaire
stripe listen --forward-to localhost:3000/api/webhook

# la commande affichera un "Signing secret" (whsec_...)
# copiez-le dans STRIPE_WEBHOOK_SECRET
```

3. Dans Stripe Dashboard > Webhooks, créez un endpoint vers `https://<your-site>/api/webhook` (ou utilisez Stripe CLI pendant le dev) et sélectionnez l'événement `checkout.session.completed`.

4. Lors d'un `checkout.session.completed`, le webhook mettra à jour la table `dossiers` en passant `paiement_effectue=true` et en enregistrant `stripe_payment_id`.

---

## Variables d'environnement recommandées (Vercel)

Ajoutez ces variables dans Settings > Environment Variables (Project) sur Vercel, **à la fois pour Production et Preview quand nécessaire**:

- `NEXT_PUBLIC_SUPABASE_URL` (public)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (public)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (public)
- `STRIPE_SECRET_KEY` (server only)
- `STRIPE_WEBHOOK_SECRET` (server only)
- `SUPABASE_URL` (server only)
- `SUPABASE_SERVICE_ROLE_KEY` (server only, **sensible**)
- `NEXT_PUBLIC_APP_URL` (optionnel — url publique, ex: https://my-app.vercel.app)

Additional server-only variables for email integration:

- `BREVO_API_KEY` (server only) — clé API pour l'API Brevo (ex: xkeysib-...)
- `ADMIN_EMAIL` (server only) — adresse email de notification admin (ex: contact@permis-express.fr)
- `SENDER_EMAIL` (server only) — adresse email d'expédition (ex: contact@permis-express.fr)

Ne rendez pas publiques les clés `STRIPE_SECRET_KEY` ni `SUPABASE_SERVICE_ROLE_KEY`.

Ne rendez pas publiques `BREVO_API_KEY`, ni les adresses `ADMIN_EMAIL`/`SENDER_EMAIL` configurées pour l'envoi d'emails.

---

## Supabase — configuration requise

- Tables: `dossiers` (voir champs utilisés dans le code: `numero_dossier`, `nom`, `prenom`, `email`, `telephone`, `whatsapp`, `adresse`, `pays_permis`, `statut`, `montant`, `paiement_effectue`, `stripe_payment_id`, `created_at`, ...)
- Bucket Storage: `documents` (privé). Les fichiers téléversés sont stockés dans ce bucket; aucune table `documents` n'est créée automatiquement par l'application.
  - Assurez-vous des règles RLS / permissions selon votre modèle :
    - Les uploads depuis le frontend utilisent la clé publishable. Pour un contrôle plus strict, implémentez un endpoint serveur pour gérer les uploads ou utilisez des URLs signées.

Créer un utilisateur admin pour tester la zone `/admin` via Supabase Auth (email/password) ou depuis la console Supabase.

---

## Tests & dépannage

- Tester la connexion admin: `/admin/login`.
- Si Stripe Checkout ne redirige pas, vérifiez `STRIPE_SECRET_KEY` et la réponse de `/api/create-checkout-session` dans la console réseau.
- Pour webhooks, utilisez `stripe listen` et vérifiez la console pour les événements reçus.

---

## Prochaines améliorations suggérées

- Envoyer email de confirmation via Brevo (à implémenter dans le webhook `checkout.session.completed`).
- Ajouter téléchargement sécurisé et affichage des documents dans l'admin.
- Ajouter pagination et filtrage avancé dans le dashboard admin.

---

Si vous voulez, je peux :
- Rédiger la section exacte pour configurer les variables sur Vercel (copy-paste),
- Ajouter l'envoi d'email Brevo dans le webhook, ou
- Déployer et tester la configuration Stripe pour vous (vous fournissez les secrets côté Vercel).This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
