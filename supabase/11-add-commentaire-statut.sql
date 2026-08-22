-- Migration: add commentaire_statut to dossiers
ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS commentaire_statut text NULL;

-- Note: run this migration with your usual supabase migration process.
