import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'
import { sendClientConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'
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

  const { montant, iban, bic, titulaire, reference, commentaire, send, mode_paiement, montant_acompte } = body || {}
  if (montant == null || Number.isNaN(Number(montant))) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })

  const mode = String(mode_paiement || 'INTEGRAL').toUpperCase()
  if (mode !== 'INTEGRAL' && mode !== 'ACOMPTE') return NextResponse.json({ error: 'Mode de paiement invalide' }, { status: 400 })

  const acompteNum = mode === 'ACOMPTE' ? Number(montant_acompte) : 0
  if (mode === 'ACOMPTE') {
    if (acompteNum == null || Number.isNaN(acompteNum) || acompteNum <= 0) {
      return NextResponse.json({ error: 'L\'acompte doit être supérieur à 0.' }, { status: 400 })
    }
    if (acompteNum >= Number(montant)) {
      return NextResponse.json({ error: 'L\'acompte doit être strictement inférieur au montant total.' }, { status: 400 })
    }
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

    const updatePayload: Record<string, any> = {
      montant: Number(montant),
      iban: iban ?? null,
      bic: bic ?? null,
      titulaire: titulaire ?? null,
      reference_virement: reference ?? null,
      commentaire_admin: typeof commentaire === 'string' ? `${dossier.commentaire_admin || ''}\n[Devis] ${commentaire}` : dossier.commentaire_admin || null,
      mode_paiement: mode,
      montant_acompte: acompteNum,
    }

    const shouldSend = send === undefined ? true : Boolean(send)
    if (shouldSend) updatePayload.statut = 'EN_ATTENTE_PAIEMENT'

    const updateRes = await supabaseAdmin.from('dossiers').update(updatePayload).eq('id', dossier.id).select()
    if (updateRes.error) {
      console.error('supabase update error', updateRes.error)
      return NextResponse.json({ error: updateRes.error.message }, { status: 500 })
    }

    if (shouldSend) {
      try {
        const paymentInfo: any = {
          mode: 'VIREMENT' as const,
          montant: Number(montant),
          currency: 'EUR',
          iban: iban ?? undefined,
          bic: bic ?? undefined,
          titulaire: titulaire ?? undefined,
          reference: reference ?? (dossier.numero_dossier as string),
        }
        if (mode === 'ACOMPTE') {
          paymentInfo.montant_acompte = acompteNum
          paymentInfo.solde_restant = Number(montant) - acompteNum
        }

        try {
          if (dossier.email) await sendClientConfirmationEmail(dossier.email, dossier.nom ?? '', dossier.prenom ?? '', dossier.numero_dossier, paymentInfo)
        } catch (err) {
          console.error('Error sending client devis email', err)
        }

        try {
          await sendAdminNotificationEmail(dossier.numero_dossier, dossier.nom ?? '', dossier.prenom ?? '', dossier.email ?? '', dossier.telephone ?? undefined, paymentInfo)
        } catch (err) {
          console.error('Error sending admin notification for devis', err)
        }
      } catch (err) {
        console.error('Error preparing/sending devis emails', err)
      }

      try {
        const historiqueMetadata: Record<string, unknown> = {
          montant: Number(montant),
          reference: reference ?? dossier.numero_dossier,
          iban: iban ?? null,
          bic: bic ?? null,
          titulaire: titulaire ?? null,
          mode_paiement: mode,
        }
        if (mode === 'ACOMPTE') {
          historiqueMetadata.montant_acompte = acompteNum
          historiqueMetadata.solde_restant = Number(montant) - acompteNum
        }
        await recordHistorique(dossier.id, 'DEVIS_ENVOYE', 'Devis envoyé', 'ADMINISTRATION', historiqueMetadata)
      } catch (err) {
        console.error('Error recording historique for devis', err)
      }
    }

    return NextResponse.json({ ok: true, data: updateRes.data?.[0] ?? null })
  } catch (err) {
    console.error('server error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
