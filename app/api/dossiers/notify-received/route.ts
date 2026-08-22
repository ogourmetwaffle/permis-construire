import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { sendDossierReceivedEmail, sendAdminNotificationEmail } from '@/lib/email'
import { recordHistorique } from '@/lib/server/historique'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { dossierId, numero } = body || {}
    if (!dossierId && !numero) return NextResponse.json({ error: 'Missing dossier identifier' }, { status: 400 })

    let query = supabaseAdmin.from('dossiers').select('*')
    if (dossierId) query = query.eq('id', dossierId)
    else query = query.eq('numero_dossier', numero)

    const { data: dossier, error } = await query.maybeSingle()
    if (error) {
      console.error('notify-received fetch error', error)
      return NextResponse.json({ error: 'Unable to fetch dossier' }, { status: 500 })
    }
    if (!dossier) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })

    const suiviPassword = dossier.mot_de_passe_suivi ?? ''
    const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'
    const suiviUrl = `${origin}/suivi`

    try {
      if (dossier.email) await sendDossierReceivedEmail(dossier.email, dossier.nom ?? '', dossier.prenom ?? '', dossier.numero_dossier, suiviPassword, suiviUrl)
    } catch (err) {
      console.error('Error sending dossier received email', err)
    }

    try {
      await sendAdminNotificationEmail(dossier.numero_dossier, dossier.nom ?? '', dossier.prenom ?? '', dossier.email ?? '', dossier.telephone ?? undefined)
    } catch (err) {
      console.error('Error sending admin notification (notify-received)', err)
    }

    try {
      await recordHistorique(dossier.id, 'DOSSIER_DEPOSE', 'Dossier déposé', 'CLIENT', {
        numero_dossier: dossier.numero_dossier,
        date_creation: dossier.created_at,
      })
    } catch (err) {
      console.error('Error recording historique on notify-received', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('notify-received unexpected error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
