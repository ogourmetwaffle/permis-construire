import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'
import { recordHistorique } from '@/lib/server/historique'
import emailClient from '@/lib/email'

export async function POST(req: Request) {
  try {
    const auth = req.headers.get('authorization')
    const { user } = await verifySupabaseToken(auth)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { dossierId, statut, commentaire } = body
    if (!dossierId || !statut) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('dossiers')
      .select('statut, email, nom, prenom, numero_dossier')
      .eq('id', dossierId)
      .single()

    const ancienStatut = existing?.statut ?? null

    const updatePayload: Record<string, unknown> = { statut }
    if (commentaire !== undefined) updatePayload.commentaire_statut = commentaire ?? null

    const { data, error } = await supabaseAdmin.from('dossiers').update(updatePayload).eq('id', dossierId).select().single()
    if (error) {
      console.error('update-statut error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    try {
      await recordHistorique(dossierId, 'STATUT_MODIFIE', 'Statut modifié', 'ADMINISTRATION', {
        ancien_statut: ancienStatut,
        nouveau_statut: statut,
        commentaire: commentaire ?? null,
      })
    } catch (err) {
      console.error('Error recording historique for statut change', err)
    }

    if (statut === 'INFORMATIONS_MANQUANTES' && existing?.email && commentaire) {
      try {
        await emailClient.sendStatusChangeEmail(existing.email, existing.nom ?? '', existing.prenom ?? '', existing.numero_dossier, statut, commentaire)
      } catch (err) {
        console.error('Error sending status change email', err)
      }
    }

    return NextResponse.json({ ok: true, dossier: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
