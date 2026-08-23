import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'
import { sendBalanceRequestEmail } from '@/lib/email'
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
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { commentaire } = body || {}

  try {
    let fetchRes
    if (typeof idParam === 'string' && idParam.startsWith('PE-')) {
      fetchRes = await supabaseAdmin.from('dossiers').select('*').eq('numero_dossier', idParam).single()
    } else {
      fetchRes = await supabaseAdmin.from('dossiers').select('*').eq('id', idParam).single()
    }
    const dossier = fetchRes.data
    if (fetchRes.error || !dossier) {
      return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 })
    }

    if (String(dossier.statut || '').toUpperCase() !== 'SOLDE_A_PAYER') {
      return NextResponse.json({ error: 'Le dossier n\'est pas en attente de solde' }, { status: 409 })
    }

    const montantAcompte = Number(dossier.montant_acompte || 0)
    const montantTotal = Number(dossier.montant || 0)
    const soldeRestant = montantTotal - montantAcompte

    if (!dossier.email) {
      return NextResponse.json({ error: 'Email client manquant' }, { status: 400 })
    }

    try {
      await sendBalanceRequestEmail(
        dossier.email,
        dossier.numero_dossier,
        soldeRestant,
        dossier.iban,
        dossier.bic,
        dossier.titulaire,
        dossier.reference_virement,
        commentaire
      )
    } catch (err) {
      console.error('Error sending balance request email', err)
    }

    try {
      await recordHistorique(dossier.id, 'DEMANDE_SOLDE', 'Demande de solde envoyée', 'ADMINISTRATION', {
        solde_restant: soldeRestant,
        commentaire: commentaire ?? null,
      })
    } catch (err) {
      console.error('Error recording historique for balance request', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('server error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
