import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'
import { sendClientConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'

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

  const { montant, iban, bic, titulaire, reference, commentaire, send } = body || {}
  if (montant == null || Number.isNaN(Number(montant))) return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })

  try {
    // fetch dossier
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
    }

    // if send is explicitly true or undefined (default), transition to EN_ATTENTE_PAIEMENT and mark as send
    const shouldSend = send === undefined ? true : Boolean(send)
    if (shouldSend) updatePayload.statut = 'EN_ATTENTE_PAIEMENT'

    const updateRes = await supabaseAdmin.from('dossiers').update(updatePayload).eq('id', dossier.id).select()
    if (updateRes.error) {
      console.error('supabase update error', updateRes.error)
      return NextResponse.json({ error: updateRes.error.message }, { status: 500 })
    }

    // send email only if shouldSend
    if (shouldSend) {
      try {
        const paymentInfo = {
          mode: 'VIREMENT' as const,
          montant: Number(montant),
          currency: 'EUR',
          iban: iban ?? undefined,
          bic: bic ?? undefined,
          titulaire: titulaire ?? undefined,
          reference: reference ?? (dossier.numero_dossier as string),
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
    }

    return NextResponse.json({ ok: true, data: updateRes.data?.[0] ?? null })
  } catch (err) {
    console.error('server error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
