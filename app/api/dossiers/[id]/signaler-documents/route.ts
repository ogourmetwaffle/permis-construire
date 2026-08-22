import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { recordHistorique } from '@/lib/server/historique'

export async function POST(req: Request, context: any) {
  try {
    const body = await req.json()
    const { mot_de_passe } = body || {}
    if (!mot_de_passe) return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })

    const params = context?.params
    const resolvedParams = params && typeof params.then === 'function' ? await params : params
    const dossierId = Number(resolvedParams?.id)
    if (!dossierId) return NextResponse.json({ error: 'Invalid dossier id' }, { status: 400 })

    const { data: dossier, error } = await supabaseAdmin
      .from('dossiers')
      .select('id, numero_dossier, mot_de_passe_suivi, statut')
      .eq('id', dossierId)
      .maybeSingle()

    if (error) {
      console.error('signaler-documents fetch error', error)
      return NextResponse.json({ error: 'Unable to fetch dossier' }, { status: 500 })
    }
    if (!dossier) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })

    if (String(dossier.mot_de_passe_suivi || '') !== String(mot_de_passe)) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    if (String(dossier.statut || '').toUpperCase() !== 'INFORMATIONS_MANQUANTES') {
      return NextResponse.json({ error: 'Statut du dossier non autorisé' }, { status: 409 })
    }

    const { error: updateError } = await supabaseAdmin.from('dossiers').update({ statut: 'EN_COURS' }).eq('id', dossierId)
    if (updateError) {
      console.error('signaler-documents update error', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    try {
      await recordHistorique(dossierId, 'STATUT_MODIFIE', 'Statut modifié', 'CLIENT', {
        ancien_statut: dossier.statut,
        nouveau_statut: 'EN_COURS',
      })
    } catch (err) {
      console.error('Error recording historique for signaler-documents', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('signaler-documents unexpected', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
