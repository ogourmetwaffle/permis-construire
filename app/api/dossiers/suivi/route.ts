import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { numero, mot_de_passe } = body || {}
    if (!numero || !mot_de_passe) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { data: dossier, error } = await supabaseAdmin
      .from('dossiers')
      .select('id, numero_dossier, statut, montant, iban, bic, titulaire, reference_virement, commentaire_admin, created_at, updated_at')
      .eq('numero_dossier', numero)
      .maybeSingle()

    if (error) {
      console.error('suivi fetch error', error)
      return NextResponse.json({ error: 'Unable to fetch dossier' }, { status: 500 })
    }
    if (!dossier) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })

    // verify tracking password server-side
    const { data: pwdRow, error: pwdError } = await supabaseAdmin
      .from('dossiers')
      .select('mot_de_passe_suivi')
      .eq('numero_dossier', numero)
      .maybeSingle()

    if (pwdError) {
      console.error('suivi pwd fetch error', pwdError)
      return NextResponse.json({ error: 'Unable to verify credentials' }, { status: 500 })
    }

    const stored = pwdRow?.mot_de_passe_suivi ?? ''
    if (!stored || String(stored) !== String(mot_de_passe)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // fetch any client-declared virements
    const { data: declarations } = await supabaseAdmin
      .from('virements_declarations')
      .select('id, reference, montant, date_declaration, created_at')
      .eq('dossier_id', dossier.id)
      .order('created_at', { ascending: false })

    // do NOT return mot_de_passe_suivi
    return NextResponse.json({ ok: true, dossier, declarations: declarations || [] })
  } catch (err) {
    console.error('suivi unexpected', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
