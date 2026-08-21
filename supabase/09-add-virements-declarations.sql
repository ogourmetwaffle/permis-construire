-- Migration: add table for client-declared virements (non-confirmed)
CREATE TABLE public.virements_declarations (
  id bigint generated always as identity primary key,
  dossier_id bigint NOT NULL references public.dossiers(id) on delete cascade,
  reference text NULL,
  montant numeric NULL,
  date_declaration timestamp NULL,
  created_at timestamp default now()
);

-- Note: run this migration with your usual supabase migration process.
