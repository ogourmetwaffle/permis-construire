import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(req: any, context: any) {
  try {
    const body = await req.json()
    const { mot_de_passe, date, reference, montant } = body || {}
    if (!mot_de_passe || !reference) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const params = context?.params
    const resolvedParams = params && typeof params.then === 'function' ? await params : params
    const dossierId = Number(resolvedParams?.id)
    if (!dossierId) return NextResponse.json({ error: 'Invalid dossier id' }, { status: 400 })

    const { data: dossier, error } = await supabaseAdmin
      .from('dossiers')
      .select('id, numero_dossier, mot_de_passe_suivi')
      .eq('id', dossierId)
      .maybeSingle()

    if (error) {
      console.error('declarer-virement fetch error', error)
      return NextResponse.json({ error: 'Unable to fetch dossier' }, { status: 500 })
    }
    if (!dossier) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })

    if (String(dossier.mot_de_passe_suivi || '') !== String(mot_de_passe)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // insert declaration
    const { data: dec, error: insertErr } = await supabaseAdmin
      .from('virements_declarations')
      .insert({ dossier_id: dossierId, reference: reference, montant: montant ?? null, date_declaration: date ? new Date(date) : null })
      .select('*')
      .single()

    if (insertErr) {
      console.error('declarer-virement insert error', insertErr)
      return NextResponse.json({ error: 'Unable to save declaration' }, { status: 500 })
    }

    // update dossier.reference_virement for convenience
    try {
      await supabaseAdmin.from('dossiers').update({ reference_virement: reference }).eq('id', dossierId)
    } catch (e) {
      console.error('unable to update dossier reference_virement', e)
    }

    return NextResponse.json({ ok: true, declaration: dec })
  } catch (err) {
    console.error('declarer-virement unexpected', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
