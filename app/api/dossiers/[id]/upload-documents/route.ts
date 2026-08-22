import { NextResponse } from 'next/server'
import { processUploadDocuments } from '@/lib/server/upload-documents'
import supabaseAdmin from '@/lib/supabase-admin'
import { recordHistorique } from '@/lib/server/historique'

export async function POST(req: Request, context: any) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 })
    }

    const form = await req.formData()
    const mot_de_passe = form.get('mot_de_passe') as string | null
    const files = form.getAll('files') as File[]

    if (!mot_de_passe) return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })
    if (!files || files.length === 0) return NextResponse.json({ error: 'Aucun fichier envoyé' }, { status: 400 })

    const params = typeof context?.params?.then === 'function' ? await context.params : context?.params
    const dossierId = Number(params?.id)
    if (!dossierId) return NextResponse.json({ error: 'Invalid dossier id' }, { status: 400 })

    const { data: dossier, error: dossierError } = await supabaseAdmin
      .from('dossiers')
      .select('id, numero_dossier, mot_de_passe_suivi, statut')
      .eq('id', dossierId)
      .maybeSingle()

    if (dossierError || !dossier) {
      console.error('upload-documents fetch error', dossierError)
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })
    }

    if (String(dossier.mot_de_passe_suivi || '') !== String(mot_de_passe)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const result = await processUploadDocuments({ files, numeroDossier: dossier.numero_dossier, dossierId: dossier.id })
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const updatePayload: Record<string, unknown> = {}
    const currentStatus = String(dossier.statut || '').toUpperCase()
    if (currentStatus === 'INFORMATIONS_MANQUANTES') {
      updatePayload.statut = 'EN_COURS'
    }

    if (Object.keys(updatePayload).length > 0) {
      const { error: updateError } = await supabaseAdmin.from('dossiers').update(updatePayload).eq('id', dossier.id)
      if (updateError) {
        console.error('upload-documents dossier update error', updateError)
      } else {
        try {
          await recordHistorique(dossier.id, 'STATUT_MODIFIE', 'Statut modifié', 'CLIENT', {
            ancien_statut: dossier.statut,
            nouveau_statut: updatePayload.statut ?? dossier.statut,
          })
        } catch (err) {
          console.error('Error recording historique after upload', err)
        }
      }
    }

    return NextResponse.json({ ok: true, uploaded: result.uploaded })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('upload-documents unexpected', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
