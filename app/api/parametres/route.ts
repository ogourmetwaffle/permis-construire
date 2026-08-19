import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from('parametres').select('cle, valeur').in('cle', ['paiement_cb_enabled'])
    if (error) {
      console.error('public parametres query error', error)
      return NextResponse.json({ error: 'Failed to read params' }, { status: 500 })
    }
    const map: Record<string, string> = {}
    for (const row of data || []) map[row.cle] = row.valeur
    return NextResponse.json({ ok: true, items: map })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
