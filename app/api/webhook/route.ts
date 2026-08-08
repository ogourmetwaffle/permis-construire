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
        } else if (existing?.paiement_effectue) {
          // already marked as paid - skip
        } else {
          // Determine a sensible payment reference
          const paymentRef = session.payment_intent ?? session.id
          const now = new Date().toISOString()

          const updatePayload: Record<string, any> = {
            paiement_effectue: true,
            date_paiement: now,
            reference_paiement: paymentRef ?? session.id,
            statut: 'NOUVEAU',
          }
          // set mode_paiement to CARTE if empty
          if (!session.metadata?.mode_paiement) {
            updatePayload.mode_paiement = 'CARTE'
          }
          // preserve existing stripe id if possible
          if (session.id) updatePayload.stripe_payment_id = session.id

          try {
            await supabaseAdmin.from('dossiers').update(updatePayload).eq('id', dossierId)

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
          }
        }
      } catch (err) {
        console.error('Error processing checkout.session.completed', err)
      }
    } else {
      console.warn('No dossierId or SUPABASE_SERVICE_ROLE_KEY not set; cannot mark payment')
    }
  }

  return new Response('ok')
}
