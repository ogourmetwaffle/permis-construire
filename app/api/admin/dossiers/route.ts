import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabaseAdmin.from('dossiers').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('supabaseAdmin dossiers error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('server error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
