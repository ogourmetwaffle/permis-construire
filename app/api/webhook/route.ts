import { createClient } from '@supabase/supabase-js'
import { sendPaymentConfirmationEmail } from '@/lib/email'

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

  // Initialize Supabase admin client (requires service role key)
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  if ((event as { type?: string }).type === 'checkout.session.completed') {
    const ev = event as { data?: { object?: { id?: string; metadata?: Record<string, string> } }; type?: string }
    const session = ev.data?.object ?? {}
    const metadata = session.metadata ?? {}
    const dossierId = metadata.dossierId ?? null

    if (dossierId && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await supabaseAdmin.from('dossiers').update({ paiement_effectue: true, stripe_payment_id: session.id }).eq('id', dossierId)
        console.log('Dossier updated for', dossierId)

        // fetch dossier to get email and numero_dossier for notification
        try {
          const { data: dossierRow, error: fetchErr } = await supabaseAdmin.from('dossiers').select('email,numero_dossier').eq('id', dossierId).single()
          if (!fetchErr && dossierRow?.email) {
            await sendPaymentConfirmationEmail(dossierRow.email, dossierRow.numero_dossier)
          }
        } catch (err) {
          console.error('Error fetching dossier for email notification', err)
        }
      } catch (err) {
        console.error('Error updating dossier', err)
      }
    } else {
      console.warn('No dossierId or SUPABASE_SERVICE_ROLE_KEY not set; cannot mark payment')
    }
  }

  return new Response('ok')
}
