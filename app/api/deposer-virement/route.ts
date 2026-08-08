import supabaseAdmin from '@/lib/supabase-admin'
import { sendClientConfirmationEmail, sendAdminNotificationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
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
      typeClient: string
      typeProjet: string
      nom: string
      prenom: string
      email: string
      telephone: string
      dateNaissance: string
      adresseProjet: string
      adresseClient: string
      numeroParcelle: string
      surface: string
      description: string
      montant: number
    }

    const supabase = supabaseAdmin

    const numeroDossier = 'PE-' + Date.now()

    const { data: dossier, error } = await supabase
      .from('dossiers')
      .insert({
        numero_dossier: numeroDossier,
        type_client: typeClient,
        type_projet: typeProjet,
        nom,
        prenom,
        email,
        telephone: telephone || null,
        date_naissance: dateNaissance || null,
        adresse_projet: adresseProjet,
        adresse_client: adresseClient || null,
        numero_parcelle: numeroParcelle || null,
        surface: surface ? parseFloat(surface) : null,
        description: description || null,
        montant,
        mode_paiement: 'VIREMENT',
        paiement_effectue: false,
        statut: 'EN_ATTENTE_PAIEMENT',
      })
      .select('id, numero_dossier')
      .single()

    if (error || !dossier) {
      console.error('Dossier insert error:', error)
      return new Response(JSON.stringify({ error: 'Erreur lors de la création du dossier' }), { status: 500 })
    }

    // Fetch bank details from parametres
    const { data: params } = await supabase
      .from('parametres')
      .select('cle, valeur')
      .in('cle', ['iban', 'bic', 'titulaire'])

    const bankDetails: Record<string, string> = {}
    if (params) {
      for (const row of params as { cle: string; valeur: string }[]) {
        bankDetails[row.cle] = row.valeur
      }
    }

    // Prepare response payload
    const responsePayload = {
      numeroDossier: dossier.numero_dossier,
      dossierId: dossier.id,
      iban: bankDetails.iban ?? null,
      bic: bankDetails.bic ?? null,
      titulaire: bankDetails.titulaire ?? null,
    }

    // send emails (fire-and-forget, log errors)
    try {
      const paymentInfo = {
        mode: 'VIREMENT' as const,
        montant: montant ?? undefined,
        currency: 'EUR',
        iban: bankDetails.iban ?? undefined,
        bic: bankDetails.bic ?? undefined,
        titulaire: bankDetails.titulaire ?? undefined,
        reference: dossier.numero_dossier,
      }

      // client email
      try {
        await sendClientConfirmationEmail(email, nom, prenom, dossier.numero_dossier, paymentInfo)
      } catch (err) {
        console.error('Error sending client confirmation (virement)', err)
      }

      // admin notification
      try {
        await sendAdminNotificationEmail(dossier.numero_dossier, nom, prenom, email, telephone, paymentInfo)
      } catch (err) {
        console.error('Error sending admin notification (virement)', err)
      }
    } catch (err) {
      console.error('Error preparing/sending emails for virement', err)
    }

    return new Response(JSON.stringify(responsePayload), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(message)
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
