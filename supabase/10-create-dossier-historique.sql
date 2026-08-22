-- Migration: create dossier_historique table
CREATE TABLE public.dossier_historique (
  id bigint generated always as identity primary key,
  dossier_id bigint NOT NULL references public.dossiers(id) on delete cascade,
  action text NOT NULL,
  description text NULL,
  acteur_type text NOT NULL check (acteur_type in ('CLIENT','ADMINISTRATION','SYSTEME')),
  metadata jsonb NULL,
  created_at timestamptz not null default now()
);

create index idx_dossier_historique_dossier_id_created_at
  on public.dossier_historique (dossier_id, created_at desc);

-- Note: run this migration with your usual supabase migration process.
