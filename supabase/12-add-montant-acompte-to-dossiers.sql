-- 12 - add montant_acompte to dossiers.sql
-- Ajoute la colonne montant_acompte pour supporter le paiement avec acompte.
-- Valeur par défaut 0 = paiement intégral (rétrocompatible).

ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS montant_acompte numeric DEFAULT 0;
