import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

// Return documents from DB for a dossier number. If a file is not archived
// (documents.archived_at IS NULL) we attempt to create a signed URL so the UI
// can preview/download. If archived, url will be null and archived_at set.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const numero = url.searchParams.get('numero')
    if (!numero) return NextResponse.json({ error: 'Missing numero' }, { status: 400 })

    // Find dossier id from numero
    const { data: dossiers, error: dErr } = await supabaseAdmin.from('dossiers').select('id').eq('numero_dossier', numero).limit(1)
    if (dErr) {
      console.error('lookup dossier error', dErr)
      return NextResponse.json({ error: dErr.message }, { status: 500 })
    }
    const dossier = Array.isArray(dossiers) && dossiers.length ? dossiers[0] : null
    if (!dossier) return NextResponse.json({ ok: true, items: [] })

    const { data: docs, error: docsErr } = await supabaseAdmin.from('documents').select('*').eq('dossier_id', dossier.id)
    if (docsErr) {
      console.error('documents query error', docsErr)
      return NextResponse.json({ error: docsErr.message }, { status: 500 })
    }

    const expiresIn = Number(url.searchParams.get('expires')) || 60 * 60

    const items = await Promise.all(
      (docs || []).map(async (doc: any) => {
        let signedUrl: string | null = null
        if (!doc.archived_at && doc.chemin_storage) {
          try {
            const { data: signed, error: signedErr } = await supabaseAdmin.storage.from('documents').createSignedUrl(doc.chemin_storage, expiresIn)
            if (!signedErr && signed?.signedUrl) signedUrl = signed.signedUrl
          } catch (e) {
            console.error('createSignedUrl error', e)
          }
        }

        return {
          id: doc.id,
          name: doc.nom_fichier,
          size: doc.taille,
          created_at: doc.created_at,
          archived_at: doc.archived_at || null,
          chemin_storage: doc.chemin_storage || null,
          url: signedUrl,
        }
      })
    )

    return NextResponse.json({ ok: true, items })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
