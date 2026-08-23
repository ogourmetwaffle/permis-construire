import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { recordHistorique } from '@/lib/server/historique'

export async function POST(req: any, context: any) {
  try {
    const body = await req.json()
    const { mot_de_passe, date, reference, montant } = body || {}

    if (!mot_de_passe) return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })
    if (!reference || !String(reference).trim()) return NextResponse.json({ error: 'Référence du virement obligatoire' }, { status: 400 })
    if (!date) return NextResponse.json({ error: 'Date du virement obligatoire' }, { status: 400 })
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) return NextResponse.json({ error: 'Date du virement invalide' }, { status: 400 })

    const montantNum = montant == null ? null : Number(montant)
    if (montantNum == null || Number.isNaN(montantNum) || montantNum <= 0) {
      return NextResponse.json({ error: 'Montant du virement obligatoire et doit être positif' }, { status: 400 })
    }

    const params = context?.params
    const resolvedParams = params && typeof params.then === 'function' ? await params : params
    const dossierId = Number(resolvedParams?.id)
    if (!dossierId) return NextResponse.json({ error: 'Invalid dossier id' }, { status: 400 })

    const { data: dossier, error } = await supabaseAdmin
      .from('dossiers')
      .select('id, numero_dossier, mot_de_passe_suivi, statut, montant, montant_acompte')
      .eq('id', dossierId)
      .maybeSingle()

    if (error) {
      console.error('declarer-virement fetch error', error)
      return NextResponse.json({ error: 'Unable to fetch dossier' }, { status: 500 })
    }
    if (!dossier) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })

    if (String(dossier.mot_de_passe_suivi || '') !== String(mot_de_passe)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const montantAcompte = Number(dossier.montant_acompte || 0)
    if (montantAcompte > 0 && montantNum !== montantAcompte) {
      return NextResponse.json({ error: `Le montant déclaré (${montantNum} €) ne correspond pas au montant attendu (${montantAcompte} €).` }, { status: 400 })
    }

    const insertPayload: Record<string, unknown> = {
      dossier_id: dossierId,
      reference: String(reference).trim(),
      montant: montantNum,
      date_declaration: parsedDate,
    }

    const { data: dec, error: insertErr } = await supabaseAdmin
      .from('virements_declarations')
      .insert(insertPayload)
      .select('*')
      .single()

    if (insertErr) {
      console.error('declarer-virement insert error', insertErr)
      return NextResponse.json({ error: 'Unable to save declaration' }, { status: 500 })
    }

    const updatePayload: Record<string, unknown> = {
      reference_virement: String(reference).trim(),
      statut: 'EN_ATTENTE_VERIFICATION_PAIEMENT',
    }

    const { error: updateErr } = await supabaseAdmin.from('dossiers').update(updatePayload).eq('id', dossierId)
    if (updateErr) {
      console.error('declarer-virement dossier update error', updateErr)
    }

    try {
      await recordHistorique(dossierId, 'VIREMENT_DECLARE', 'Déclaration de virement envoyée', 'CLIENT', {
        date_virement: parsedDate.toISOString(),
        reference: String(reference).trim(),
        montant: montantNum,
      })
    } catch (err) {
      console.error('Error recording historique for virement declaration', err)
    }

    return NextResponse.json({ ok: true, declaration: dec })
  } catch (err) {
    console.error('declarer-virement unexpected', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
