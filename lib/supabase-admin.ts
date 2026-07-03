import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client — uses the secret/service role key.
// This client MUST only be used in server / API code.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default supabaseAdmin
