export async function POST(req: Request) {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
    const body = await req.json()
    const { numero, dossierId } = body

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Conversion de permis - Permis Express'
            },
            unit_amount: 4900
          },
          quantity: 1
        }
      ],
      metadata: {
        numero: numero || '',
        dossierId: dossierId || ''
      },
      success_url: `${origin}/merci?session_id={CHECKOUT_SESSION_ID}&numero=${encodeURIComponent(numero || '')}`,
      cancel_url: `${origin}/deposer-dossier?cancelled=1`
    })

    return new Response(JSON.stringify({ url: session.url }), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(message)
    return new Response(JSON.stringify({ error: message || 'Internal error' }), { status: 500 })
  }
}
