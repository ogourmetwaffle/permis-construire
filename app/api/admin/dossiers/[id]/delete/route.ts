import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

export async function POST(req: Request, context: any) {
  const auth = req.headers.get('authorization')
  const params = typeof context?.params?.then === 'function' ? await context.params : context?.params
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rawId = params?.id
    if (!rawId || typeof rawId !== 'string') {
      return NextResponse.json({ error: 'Missing dossier id' }, { status: 400 })
    }

    let dossier: { id: number; numero_dossier: string } | null = null

    if (rawId.startsWith('PE-')) {
      const { data, error } = await supabaseAdmin
        .from('dossiers')
        .select('id, numero_dossier')
        .eq('numero_dossier', rawId)
        .maybeSingle()
      if (error) {
        console.error('lookup dossier by numero error', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      dossier = (data as { id: number; numero_dossier: string } | null) ?? null
    } else {
      const numericId = Number(rawId)
      if (!Number.isFinite(numericId)) {
        return NextResponse.json({ error: 'Invalid dossier id' }, { status: 400 })
      }

      const { data, error } = await supabaseAdmin
        .from('dossiers')
        .select('id, numero_dossier')
        .eq('id', numericId)
        .maybeSingle()
      if (error) {
        console.error('lookup dossier by id error', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      dossier = (data as { id: number; numero_dossier: string } | null) ?? null
    }

    if (!dossier) {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })
    }

    const { data: docs, error: docsErr } = await supabaseAdmin
      .from('documents')
      .select('id, chemin_storage')
      .eq('dossier_id', dossier.id)

    if (docsErr) {
      console.error('query dossier documents error', docsErr)
      return NextResponse.json({ error: docsErr.message }, { status: 500 })
    }

    const paths = Array.from(
      new Set(
        (docs || [])
          .map((d: { chemin_storage?: string | null }) => d.chemin_storage)
          .filter((p): p is string => typeof p === 'string' && p.length > 0)
      )
    )

    if (paths.length > 0) {
      const { error: removeErr } = await supabaseAdmin.storage.from('documents').remove(paths)
      if (removeErr) {
        console.error('storage remove error', removeErr)
        return NextResponse.json({ error: removeErr.message }, { status: 500 })
      }
    }

    const { error: delDocsErr } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('dossier_id', dossier.id)

    if (delDocsErr) {
      console.error('delete documents rows error', delDocsErr)
      return NextResponse.json({ error: delDocsErr.message }, { status: 500 })
    }

    const { error: delDossierErr } = await supabaseAdmin
      .from('dossiers')
      .delete()
      .eq('id', dossier.id)

    if (delDossierErr) {
      console.error('delete dossier error', delDossierErr)
      return NextResponse.json({ error: delDossierErr.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      deleted: {
        dossier_id: dossier.id,
        numero_dossier: dossier.numero_dossier,
        documents_removed: (docs || []).length,
        storage_files_removed: paths.length,
      },
    })
  } catch (err) {
    console.error('delete dossier server error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
