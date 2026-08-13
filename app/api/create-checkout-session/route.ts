import supabaseAdmin from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '')
    const body = await req.json()

    // Support legacy call (numero + dossierId) and new wizard call (full wizard data)
    const {
      numero: legacyNumero,
      dossierId: legacyDossierId,
      typeClient,
      typeProjet,
      nom,
      prenom,
      email,
      telephone,
      dateNaissance,
      adresseProjet,
      adresseClient,
      numeroParcelle,
      surface,
      description,
      montant,
    } = body as {
      numero?: string
      dossierId?: number
      typeClient?: string
      typeProjet?: string
      nom?: string
      prenom?: string
      email?: string
      telephone?: string
      dateNaissance?: string
      adresseProjet?: string
      adresseClient?: string
      numeroParcelle?: string
      surface?: string
      description?: string
      montant?: number
    }

    let numeroDossier = legacyNumero ?? ''
    let dossierId = legacyDossierId ?? 0
    let effectiveEmail = email ?? ''
    let effectiveTypeProjet = typeProjet ?? ''
    let effectiveMontant = montant

    // Retry flow: when dossier already exists, hydrate missing payment context from DB.
    if (legacyNumero && legacyDossierId && (!effectiveEmail || !effectiveMontant || !effectiveTypeProjet)) {
      const { data: existingDossier, error: existingError } = await supabaseAdmin
        .from('dossiers')
        .select('id, numero_dossier, email, type_projet, montant')
        .eq('id', legacyDossierId)
        .maybeSingle()

      if (!existingError && existingDossier) {
        numeroDossier = (existingDossier as { numero_dossier?: string }).numero_dossier || numeroDossier
        effectiveEmail = (existingDossier as { email?: string }).email || effectiveEmail
        effectiveTypeProjet = (existingDossier as { type_projet?: string }).type_projet || effectiveTypeProjet
        if (effectiveMontant == null) {
          const dbMontant = (existingDossier as { montant?: number | null }).montant
          effectiveMontant = dbMontant == null ? undefined : Number(dbMontant)
        }
      }
    }

    // New wizard flow: create the dossier server-side before redirecting to Stripe
    if (!legacyNumero && typeClient && email) {
      const supabase = supabaseAdmin

      numeroDossier = 'PE-' + Date.now()

      const { data: dossier, error } = await supabase
        .from('dossiers')
        .insert({
          numero_dossier: numeroDossier,
          type_client: typeClient,
          type_projet: typeProjet,
          nom: nom ?? '',
          prenom: prenom ?? '',
          email: email ?? '',
          telephone: telephone || null,
          date_naissance: dateNaissance || null,
          adresse_projet: adresseProjet ?? '',
          adresse_client: adresseClient || null,
          numero_parcelle: numeroParcelle || null,
          surface: surface ? parseFloat(surface) : null,
          description: description || null,
          montant: montant ?? 0,
          mode_paiement: 'CARTE',
          paiement_effectue: false,
          statut: 'EN_ATTENTE_PAIEMENT',
        })
        .select('id, numero_dossier')
        .single()

      if (error || !dossier) {
        console.error('Dossier insert error:', error)
        return new Response(JSON.stringify({ error: 'Erreur lors de la création du dossier' }), { status: 500 })
      }

      dossierId = (dossier as { id: number; numero_dossier: string }).id
      numeroDossier = (dossier as { id: number; numero_dossier: string }).numero_dossier
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'

    // Amount in cents — use dynamic montant or fallback
    const unitAmount = effectiveMontant ? Math.round(effectiveMontant * 100) : 4900

    const prestationLabel =
      effectiveTypeProjet === 'DP'
        ? 'Déclaration Préalable — Esquiss Habitat'
        : effectiveTypeProjet === 'PCMI'
          ? 'Permis de Construire (PCMI) — Esquiss Habitat'
          : 'Dossier permis de construire — Esquiss Habitat'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: { name: prestationLabel },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: effectiveEmail || undefined,
      metadata: {
        numero: numeroDossier,
        dossierId: String(dossierId),
      },
      success_url: `${origin}/merci?session_id={CHECKOUT_SESSION_ID}&numero=${encodeURIComponent(numeroDossier)}`,
      cancel_url: `${origin}/deposer-dossier?cancelled=1&numero=${encodeURIComponent(numeroDossier)}&dossierId=${encodeURIComponent(String(dossierId))}`,
    })

    return new Response(JSON.stringify({ url: session.url, numeroDossier }), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(message)
    return new Response(JSON.stringify({ error: message || 'Internal error' }), { status: 500 })
  }
}
