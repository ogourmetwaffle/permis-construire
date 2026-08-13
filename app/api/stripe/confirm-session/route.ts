import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { sendClientConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'

type ConfirmBody = {
  sessionId?: string
  numero?: string
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ConfirmBody
    const sessionId = body?.sessionId?.trim()
    const numero = body?.numero?.trim()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe key not configured' }, { status: 500 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 500 })
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    })

    if (session.mode !== 'payment') {
      return NextResponse.json({ ok: false, paid: false, reason: 'Not a payment session' })
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ ok: true, paid: false, reason: 'Payment not completed yet' })
    }

    const metadataNumero = session.metadata?.numero ?? null
    const metadataDossierId = session.metadata?.dossierId ?? null

    if (numero && metadataNumero && numero !== metadataNumero) {
      return NextResponse.json({ error: 'Numero mismatch' }, { status: 400 })
    }

    let existing: any = null
    let fetchError: any = null

    if (metadataDossierId) {
      const fetchById = await supabaseAdmin
        .from('dossiers')
        .select('id, numero_dossier, paiement_effectue, reference_paiement, email, nom, prenom, telephone, montant, email_client_paiement_envoye_at, email_admin_paiement_envoye_at')
        .eq('id', metadataDossierId)
        .maybeSingle()
      existing = fetchById.data
      fetchError = fetchById.error
    }

    if (!existing && metadataNumero) {
      const fetchByNumero = await supabaseAdmin
        .from('dossiers')
        .select('id, numero_dossier, paiement_effectue, reference_paiement, email, nom, prenom, telephone, montant, email_client_paiement_envoye_at, email_admin_paiement_envoye_at')
        .eq('numero_dossier', metadataNumero)
        .maybeSingle()
      existing = fetchByNumero.data
      fetchError = fetchByNumero.error
    }

    if (!existing && numero) {
      const fetchByNumero = await supabaseAdmin
        .from('dossiers')
        .select('id, numero_dossier, paiement_effectue, reference_paiement, email, nom, prenom, telephone, montant, email_client_paiement_envoye_at, email_admin_paiement_envoye_at')
        .eq('numero_dossier', numero)
        .maybeSingle()
      existing = fetchByNumero.data
      fetchError = fetchByNumero.error
    }

    if (fetchError) {
      console.error('confirm-session fetch dossier error', fetchError)
      return NextResponse.json({ error: 'Unable to fetch dossier' }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json({ error: 'Dossier not found for session' }, { status: 404 })
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null

    const paymentRef = paymentIntentId ?? session.id

    let updated = false
    if (!existing.paiement_effectue) {
      const now = new Date().toISOString()
      const basePayload: Record<string, unknown> = {
        paiement_effectue: true,
        date_paiement: now,
        reference_paiement: paymentRef,
        statut: 'NOUVEAU',
        mode_paiement: 'CARTE',
      }

      const payloadWithSession: Record<string, unknown> = { ...basePayload }
      if (session.id) payloadWithSession.stripe_payment_id = session.id

      let updateRes = await supabaseAdmin.from('dossiers').update(payloadWithSession).eq('id', existing.id)

      if (updateRes.error && String(updateRes.error.message || '').includes('stripe_payment_id')) {
        updateRes = await supabaseAdmin.from('dossiers').update(basePayload).eq('id', existing.id)
      }

      if (updateRes.error) {
        console.error('confirm-session update error', updateRes.error)
        return NextResponse.json({ error: 'Unable to update dossier payment' }, { status: 500 })
      }

      updated = true
    }

    const clientEmailAlreadySent = Boolean(existing?.email_client_paiement_envoye_at)
    const adminEmailAlreadySent = Boolean(existing?.email_admin_paiement_envoye_at)
    const hasClientEmail = Boolean(existing?.email)
    const rawAmount = session.amount_total ?? session.amount_subtotal ?? null
    const montant = rawAmount ? Number(rawAmount) / 100 : (existing?.montant == null ? undefined : Number(existing.montant))
    const currency = session.currency ?? 'EUR'
    const reference = paymentRef

    let clientEmailSentNow = false
    let adminEmailSentNow = false

    try {
      if (hasClientEmail && !clientEmailAlreadySent) {
        const clientResult = await sendClientConfirmationEmail(
          existing.email,
          existing.nom ?? '',
          existing.prenom ?? '',
          existing.numero_dossier,
          { mode: 'CARTE', montant, currency, transactionId: reference }
        )
        if (clientResult.ok) {
          clientEmailSentNow = true
        } else {
          console.error('confirm-session client email error', clientResult.error)
        }
      }

      if (!adminEmailAlreadySent) {
        const adminResult = await sendAdminNotificationEmail(
          existing.numero_dossier,
          existing.nom ?? '',
          existing.prenom ?? '',
          existing.email ?? '',
          existing.telephone ?? undefined,
          { mode: 'CARTE', montant, currency, reference }
        )
        if (adminResult.ok) {
          adminEmailSentNow = true
        } else {
          console.error('confirm-session admin email error', adminResult.error)
        }
      }
    } catch (err) {
      console.error('confirm-session email sending error', err)
    }

    if (clientEmailSentNow || adminEmailSentNow) {
      const nowIso = new Date().toISOString()
      const notificationPayload: Record<string, unknown> = {}
      if (clientEmailSentNow && !clientEmailAlreadySent) notificationPayload.email_client_paiement_envoye_at = nowIso
      if (adminEmailSentNow && !adminEmailAlreadySent) notificationPayload.email_admin_paiement_envoye_at = nowIso

      if (Object.keys(notificationPayload).length > 0) {
        const markRes = await supabaseAdmin.from('dossiers').update(notificationPayload).eq('id', existing.id)
        if (markRes.error) {
          console.error('confirm-session notification timestamp save error', markRes.error)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      paid: true,
      updated,
      numero: existing.numero_dossier,
      reference: paymentRef,
    })
  } catch (err) {
    console.error('confirm-session unexpected error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
