import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'
import { sendPaymentConfirmationEmail } from '@/lib/email'
import { recordHistorique } from '@/lib/server/historique'

export async function POST(req: Request, context: any) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = typeof context?.params?.then === 'function' ? await context.params : context?.params
  const idParam = params?.id

  let body: any
  try {
    body = await req.json()
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { date, reference, commentaire } = body || {}
  if (!reference || typeof reference !== 'string' || !reference.trim()) {
    return NextResponse.json({ error: 'Reference bancaire obligatoire' }, { status: 400 })
  }
  const parsedDate = date ? new Date(date) : new Date()
  if (isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 })
  }

  try {
    let fetchRes
    if (typeof idParam === 'string' && idParam.startsWith('PE-')) {
      fetchRes = await supabaseAdmin.from('dossiers').select('*').eq('numero_dossier', idParam).single()
    } else {
      fetchRes = await supabaseAdmin.from('dossiers').select('*').eq('id', idParam).single()
    }
    const dossier = fetchRes.data
    if (fetchRes.error || !dossier) {
      console.error('supabase fetch dossier error', fetchRes.error)
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    if (dossier.paiement_effectue) return NextResponse.json({ error: 'Dossier déjà payé' }, { status: 409 })
    const blockedStatuses = ['ARCHIVE', 'ARCHIVED', 'TERMINE']
    if (dossier.statut && blockedStatuses.includes(String(dossier.statut).toUpperCase())) {
      return NextResponse.json({ error: 'Dossier archivé ou terminé — modification refusée' }, { status: 409 })
    }

    const allowedStatuses = ['EN_ATTENTE_PAIEMENT', 'EN_ATTENTE_VERIFICATION_PAIEMENT']
    const currentStatus = String(dossier.statut || '').toUpperCase()
    if (!allowedStatuses.includes(currentStatus)) {
      return NextResponse.json({ error: 'Statut du dossier non autorisé pour la confirmation de paiement' }, { status: 409 })
    }

    const montantAcompte = Number(dossier.montant_acompte || 0)
    const hasAcompte = montantAcompte > 0

    const updatePayload: Record<string, any> = {
      date_paiement: parsedDate.toISOString(),
      reference_paiement: reference.trim(),
      commentaire_paiement: commentaire ?? null,
    }

    if (hasAcompte) {
      updatePayload.paiement_effectue = false
      updatePayload.statut = 'SOLDE_A_PAYER'
    } else {
      updatePayload.paiement_effectue = true
      updatePayload.statut = 'NOUVEAU'
    }

    const updateRes = await supabaseAdmin.from('dossiers').update(updatePayload).eq('id', dossier.id).select()
    if (updateRes.error) {
      console.error('supabase update error', updateRes.error)
      return NextResponse.json({ error: updateRes.error.message }, { status: 500 })
    }

    try {
      if (dossier.email) {
        await sendPaymentConfirmationEmail(
          dossier.email,
          dossier.numero_dossier,
          Number(dossier.montant) || undefined,
          'EUR',
          reference.trim(),
          hasAcompte ? { mode: 'ACOMPTE', montant_acompte: montantAcompte, solde: Number(dossier.montant) - montantAcompte } : undefined
        )
      }
    } catch (err) {
      console.error('Error sending payment confirmation email', err)
    }

    try {
      const historiqueMetadata: Record<string, unknown> = {
        montant: Number(dossier.montant) || null,
        reference: reference.trim(),
        date_paiement: parsedDate.toISOString(),
      }
      if (hasAcompte) {
        await recordHistorique(dossier.id, 'ACOMPTE_PAYE', 'Accompte payé', 'ADMINISTRATION', {
          ...historiqueMetadata,
          montant_acompte: montantAcompte,
          solde_restant: Number(dossier.montant) - montantAcompte,
        })
      } else {
        await recordHistorique(dossier.id, 'PAIEMENT_CONFIRME', 'Paiement confirmé', 'ADMINISTRATION', historiqueMetadata)
      }
    } catch (err) {
      console.error('Error recording historique for payment confirmation', err)
    }

    return NextResponse.json({ ok: true, data: updateRes.data?.[0] ?? null })
  } catch (err) {
    console.error('server error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
