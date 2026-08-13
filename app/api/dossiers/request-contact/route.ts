import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'

type Body = {
  dossierId?: number
  numero?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body
    const dossierId = body?.dossierId
    const numero = body?.numero?.trim()

    if (!dossierId && !numero) {
      return NextResponse.json({ error: 'Missing dossier identifier' }, { status: 400 })
    }

    let query = supabaseAdmin
      .from('dossiers')
      .select('id, numero_dossier, commentaire_admin, paiement_effectue, statut')

    if (dossierId) query = query.eq('id', dossierId)
    else query = query.eq('numero_dossier', numero)

    const { data: dossier, error: fetchError } = await query.maybeSingle()

    if (fetchError) {
      console.error('request-contact fetch error', fetchError)
      return NextResponse.json({ error: 'Unable to load dossier' }, { status: 500 })
    }

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    const now = new Date().toISOString()
    const contactLine = `[${now}] Demande client: paiement carte non finalise, merci de le recontacter.`
    const existingComment = (dossier as { commentaire_admin?: string | null }).commentaire_admin || ''
    const nextComment = existingComment ? `${existingComment}\n${contactLine}` : contactLine

    const updatePayload: Record<string, unknown> = {
      commentaire_admin: nextComment,
      statut: (dossier as { paiement_effectue?: boolean; statut?: string | null }).paiement_effectue
        ? (dossier as { statut?: string | null }).statut || 'NOUVEAU'
        : 'EN_ATTENTE_PAIEMENT',
    }

    const { error: updateError } = await supabaseAdmin
      .from('dossiers')
      .update(updatePayload)
      .eq('id', (dossier as { id: number }).id)

    if (updateError) {
      console.error('request-contact update error', updateError)
      return NextResponse.json({ error: 'Unable to save contact request' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, numero: (dossier as { numero_dossier: string }).numero_dossier })
  } catch (err) {
    console.error('request-contact unexpected error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
