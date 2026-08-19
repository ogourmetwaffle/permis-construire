-- Lieu de naissance (Particulier) + nom de société (Professionnel)
ALTER TABLE public.dossiers
ADD COLUMN IF NOT EXISTS lieu_naissance_ville text NULL,
ADD COLUMN IF NOT EXISTS lieu_naissance_pays text NULL,
ADD COLUMN IF NOT EXISTS nom_societe text NULL;
