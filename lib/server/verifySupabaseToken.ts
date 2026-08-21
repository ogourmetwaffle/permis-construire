import supabaseAdmin from '@/lib/supabase-admin'
import type { User } from '@supabase/supabase-js'

type VerifyResult = { user: User | null; error?: string }

export async function verifySupabaseToken(authHeader?: string | null): Promise<VerifyResult> {
  if (!authHeader) return { user: null, error: 'Missing Authorization header' }
  const parts = authHeader.split(' ')
  if (parts.length !== 2) return { user: null, error: 'Malformed Authorization header' }
  const [scheme, token] = parts
  if (scheme !== 'Bearer' || !token) return { user: null, error: 'Malformed Authorization header' }

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error) {
      const msg = String(error.message || '')
      if (msg.includes('JWT issued at future') || msg.includes('clock skew')) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const { data: retryData, error: retryError } = await supabaseAdmin.auth.getUser(token)
        if (retryError) return { user: null, error: 'Invalid token' }
        if (!retryData || !retryData.user) return { user: null, error: 'No user found' }
        return { user: retryData.user }
      }
      return { user: null, error: 'Invalid token' }
    }
    if (!data || !data.user) return { user: null, error: 'No user found' }
    return { user: data.user }
  } catch (err) {
    console.error('verifySupabaseToken error', err)
    return { user: null, error: 'Server error' }
  }
}

export default verifySupabaseToken
