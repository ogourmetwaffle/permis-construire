import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client using service role key.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { dossierId, statut } = body
    if (!dossierId || !statut) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const { data, error } = await supabase.from('dossiers').update({ statut }).eq('id', dossierId).select().single()
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
