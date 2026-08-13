alter table public.dossiers
add column if not exists email_client_paiement_envoye_at timestamp null,
add column if not exists email_admin_paiement_envoye_at timestamp null;
