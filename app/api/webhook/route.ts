import supabaseAdmin from '@/lib/supabase-admin'
import { sendPaymentConfirmationEmail, sendClientConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')

  const sig = req.headers.get('stripe-signature') || ''

  const buf = await req.arrayBuffer()
  const rawBody = Buffer.from(buf)

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  if (!webhookSecret) {
    console.error('No STRIPE_WEBHOOK_SECRET configured')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  let event: unknown

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Webhook signature verification failed.', message)
    return new Response('Invalid signature', { status: 400 })
  }

  // Use centralized Supabase admin client (supabaseAdmin)
  let shouldRetry = false

  if ((event as { type?: string }).type === 'checkout.session.completed') {
    const ev = event as { data?: { object?: any }; type?: string }
    const session = ev.data?.object ?? {}
    const metadata = session.metadata ?? {}
    const dossierId = metadata.dossierId ?? null

    if (dossierId && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Ensure idempotence: fetch current dossier and only update if not already paid
        const { data: existing, error: fetchErr } = await supabaseAdmin.from('dossiers').select('paiement_effectue, email, numero_dossier, nom, prenom, telephone').eq('id', dossierId).single()
        if (fetchErr) {
          console.error('Error fetching dossier before payment update', fetchErr)
          shouldRetry = true
        } else if (existing?.paiement_effectue) {
          // already marked as paid - skip
        } else {
          // Keep Stripe payment intent as the primary transaction reference.
          const paymentRef = session.payment_intent ?? session.id
          const now = new Date().toISOString()

          const basePayload: Record<string, any> = {
            paiement_effectue: true,
            date_paiement: now,
            reference_paiement: paymentRef ?? session.id,
            statut: 'NOUVEAU',
            mode_paiement: 'CARTE',
          }

          try {
            let updateErr: { message?: string } | null = null

            const payloadWithSessionId: Record<string, any> = { ...basePayload }
            if (session.id) payloadWithSessionId.stripe_payment_id = session.id

            const firstUpdate = await supabaseAdmin.from('dossiers').update(payloadWithSessionId).eq('id', dossierId)
            updateErr = firstUpdate.error as { message?: string } | null

            // Backward compatibility: retry without stripe_payment_id if DB schema is not aligned yet.
            if (updateErr && payloadWithSessionId.stripe_payment_id && String(updateErr.message || '').includes('stripe_payment_id')) {
              console.warn('stripe_payment_id column is missing in dossiers table, retrying update without it')
              const retryUpdate = await supabaseAdmin.from('dossiers').update(basePayload).eq('id', dossierId)
              updateErr = retryUpdate.error as { message?: string } | null
            }

            if (updateErr) {
              console.error('Error updating dossier payment', updateErr)
              shouldRetry = true
              return new Response('Webhook update failed', { status: 500 })
            }

            // send confirmation emails when available
            try {
              if (existing?.email) {
                // Try to determine amount and currency from session
                const rawAmount = session.amount_total ?? session.amount_subtotal ?? session.total ?? null
                const montant = rawAmount ? Number(rawAmount) / 100 : undefined
                const currency = session.currency ?? 'EUR'
                const reference = session.payment_intent ?? session.id

                try {
                  await sendPaymentConfirmationEmail(existing.email, existing.numero_dossier, montant, currency, reference)
                } catch (err) {
                  console.error('Error sending payment confirmation email', err)
                }

                // also send unified client confirmation (includes dossier + payment recap)
                try {
                  await sendClientConfirmationEmail(
                    existing.email,
                    existing.nom ?? '',
                    existing.prenom ?? '',
                    existing.numero_dossier,
                    { mode: 'CARTE', montant, currency, transactionId: reference }
                  )
                } catch (err) {
                  console.error('Error sending client confirmation email (CARTE)', err)
                }

                // notify admin
                try {
                  await sendAdminNotificationEmail(existing.numero_dossier, existing.nom ?? '', existing.prenom ?? '', existing.email, undefined, {
                    mode: 'CARTE',
                    montant,
                    currency,
                    reference
                  })
                } catch (err) {
                  console.error('Error sending admin notification (CARTE)', err)
                }
              }
            } catch (err) {
              console.error('Error preparing/sending confirmation emails', err)
            }
          } catch (err) {
            console.error('Error updating dossier payment', err)
            shouldRetry = true
            return new Response('Webhook update failed', { status: 500 })
          }
        }
      } catch (err) {
        console.error('Error processing checkout.session.completed', err)
        shouldRetry = true
        return new Response('Webhook processing failed', { status: 500 })
      }
    } else {
      console.warn('No dossierId or SUPABASE_SERVICE_ROLE_KEY not set; cannot mark payment')
      shouldRetry = true
      return new Response('Webhook configuration issue', { status: 500 })
    }
  }

  if (shouldRetry) {
    return new Response('Webhook temporary failure', { status: 500 })
  }

  return new Response('ok')
}
