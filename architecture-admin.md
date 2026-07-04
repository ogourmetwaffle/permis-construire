# Architecture - Administration

Résumé concis des choix pour l'espace `admin`.

- **Tables publiques**
  - `tarifs`
  - `parametres`

- **Tables privées (accès restreint, via API serveur)**
  - `dossiers`
  - `documents` (fichiers stockés dans le bucket `documents`)

- **Authentification Supabase (flux résumé)**
  - Frontend utilise le client public (`lib/supabase.ts`) pour authentifier l'utilisateur (ex. `signInWithPassword`) et obtenir la session.
  - Le frontend admin récupère le `access_token` via `supabase.auth.getSession()` et l'envoie aux routes admin en en-tête `Authorization: Bearer <access_token>`.
  - Les routes Next.js côté serveur utilisent un helper (`lib/server/verifySupabaseToken.ts`) qui appelle `supabaseAdmin.auth.getUser(token)` pour valider le token.
  - Si la validation réussit, l'API utilise `lib/supabase-admin.ts` (service role) pour effectuer les opérations sensibles (lecture/écriture sur `dossiers`/`documents`, génération d'URLs signées, etc.).
  - RLS doit rester activé en base ; les accès côté client aux tables privées doivent être interdits (tout passe par les APIs serveur).

- **Routes API principales (existant dans le projet)**
  - `GET /api/admin/documents?numero=...` — retourne URLs signées pour les documents d'un dossier (utilise `supabaseAdmin.storage.createSignedUrl`).
  - `GET /api/admin/dossiers` — retourne la liste des dossiers accessibles à l'admin.
  - `POST /api/admin/update-statut` — met à jour le statut d'un dossier (opération protégée).
  - Autres routes non-admin présentes :
    - `/api/create-checkout-session` (Stripe checkout)
    - `/api/deposer-virement` (signalement dépôt virement)
    - `/api/send-emails` (envoi d'emails serveur)
    - `/api/upload` (endpoint d'upload utilisé côté client pour téléversements)
    - `/api/webhook` (webhooks externes)

- **Sécurité des routes admin**
  - Toutes les routes sous `/api/admin/*` exigent l'en-tête `Authorization: Bearer <access_token>` et renvoient `401` si absent/ invalide.
  - Le serveur n'utilise jamais la clé Service Role côté client ; la clé Service Role (`SUPABASE_SERVICE_ROLE_KEY`) est stockée côté serveur uniquement.

- **Variables d'environnement nécessaires (minimum)**
  - `NEXT_PUBLIC_SUPABASE_URL` (public)
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (public)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only) — clé service role / secret pour `supabaseAdmin`
  - `STRIPE_SECRET_KEY` (server-only) — pour les opérations Stripe côté serveur
  - `STRIPE_PUBLISHABLE_KEY` (public)
  - `BREVO_API_KEY` (server-only) — si utilisé pour l'envoi d'emails

Notes
- Marquer clairement les variables *server-only* (ne jamais les exposer côté client).
- Après déploiement, activer des politiques RLS minimales pour `dossiers` et `documents` afin d'empêcher toute lecture directe depuis le client.
