import supabaseAdmin from '@/lib/supabase-admin'
import { sendClientConfirmationEmail, sendAdminNotificationEmail, sendDossierReceivedEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      typeClient,
      typeProjet,
      nomSociete,
      nom,
      prenom,
      email,
      telephone,
      dateNaissance,
      lieuNaissanceVille,
      lieuNaissancePays,
      adresseProjet,
      adresseClient,
      numeroParcelle,
      surface,
      description,
      montant,
    } = body as {
      typeClient: string
      typeProjet: string
      nomSociete?: string
      nom: string
      prenom: string
      email: string
      telephone: string
      dateNaissance: string
      lieuNaissanceVille?: string
      lieuNaissancePays?: string
      adresseProjet: string
      adresseClient: string
      numeroParcelle: string
      surface: string
      description: string
      montant: number
    }

    const supabase = supabaseAdmin

    const numeroDossier = 'PE-' + Date.now()

    // generate a short secure tracking password
    const suiviPassword = Math.random().toString(36).slice(2, 10)

    const { data: dossier, error } = await supabase
      .from('dossiers')
      .insert({
        numero_dossier: numeroDossier,
        type_client: typeClient,
        type_projet: typeProjet,
        nom_societe: nomSociete || null,
        nom,
        prenom,
        email,
        telephone: telephone || null,
        date_naissance: dateNaissance || null,
        lieu_naissance_ville: lieuNaissanceVille || null,
        lieu_naissance_pays: lieuNaissancePays || null,
        adresse_projet: adresseProjet,
        adresse_client: adresseClient || null,
        numero_parcelle: numeroParcelle || null,
        surface: surface ? parseFloat(surface) : null,
        description: description || null,
        montant,
        mode_paiement: 'VIREMENT',
        paiement_effectue: false,
        statut: 'DEVIS',
        mot_de_passe_suivi: suiviPassword,
      })
      .select('id, numero_dossier')
      .single()

    if (error || !dossier) {
      console.error('Dossier insert error:', error)
      return new Response(JSON.stringify({ error: 'Erreur lors de la création du dossier' }), { status: 500 })
    }

    // send 'dossier reçu' email to client and notify admin (no bank details at creation)
    try {
      try {
        await sendDossierReceivedEmail(email, nom, prenom, dossier.numero_dossier, suiviPassword)
      } catch (err) {
        console.error('Error sending dossier received email to client', err)
      }

      try {
        await sendAdminNotificationEmail(dossier.numero_dossier, nom, prenom, email, telephone)
      } catch (err) {
        console.error('Error sending admin notification (dossier received)', err)
      }
    } catch (err) {
      console.error('Error sending notifications for dossier received', err)
    }

    const responsePayload = {
      numeroDossier: dossier.numero_dossier,
      dossierId: dossier.id,
    }

    return new Response(JSON.stringify(responsePayload), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(message)
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
