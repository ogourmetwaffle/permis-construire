-- Add archived_at to documents so we can mark files removed from storage
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS archived_at timestamptz NULL;

-- Optional index for queries filtering archived state
CREATE INDEX IF NOT EXISTS idx_documents_archived_at ON public.documents (archived_at);
