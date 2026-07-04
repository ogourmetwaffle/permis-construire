import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization')
    const { user } = await verifySupabaseToken(auth)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { dossierId, statut } = body
    if (!dossierId || !statut) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const { data, error } = await supabaseAdmin.from('dossiers').update({ statut }).eq('id', dossierId).select().single()
    if (error) {
      console.error('update-statut error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, dossier: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
