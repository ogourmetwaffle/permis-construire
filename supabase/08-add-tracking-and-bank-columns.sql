-- Migration: add tracking password and per-dossier bank fields
ALTER TABLE public.dossiers
  ADD COLUMN mot_de_passe_suivi text NULL,
  ADD COLUMN iban text NULL,
  ADD COLUMN bic text NULL,
  ADD COLUMN titulaire text NULL,
  ADD COLUMN reference_virement text NULL;

-- Note: run this migration with your usual supabase migration process.
