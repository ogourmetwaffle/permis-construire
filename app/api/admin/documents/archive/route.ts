import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const numero: string | undefined = body?.numero
    if (!numero) return NextResponse.json({ error: 'Missing numero' }, { status: 400 })

    // find dossier id
    const { data: dossiers, error: dErr } = await supabaseAdmin.from('dossiers').select('id').eq('numero_dossier', numero).limit(1)
    if (dErr) {
      console.error('lookup dossier error', dErr)
      return NextResponse.json({ error: dErr.message }, { status: 500 })
    }
    const dossier = Array.isArray(dossiers) && dossiers.length ? dossiers[0] : null
    if (!dossier) return NextResponse.json({ error: 'Dossier not found' }, { status: 404 })

    // select documents that are not already archived
    const { data: docs, error: docsErr } = await supabaseAdmin.from('documents').select('id, chemin_storage').eq('dossier_id', dossier.id).is('archived_at', null)
    if (docsErr) {
      console.error('documents query error', docsErr)
      return NextResponse.json({ error: docsErr.message }, { status: 500 })
    }

    const paths = (docs || []).map((d: { chemin_storage?: string }) => d.chemin_storage).filter(Boolean) as string[]
    if (paths.length === 0) return NextResponse.json({ ok: true, removed: [], updated: 0 })

    // remove files from storage (KISS: single call, no chunking)
    const { error: removeErr } = await supabaseAdmin.storage.from('documents').remove(paths)
    if (removeErr) {
      console.error('storage remove error', removeErr)
      return NextResponse.json({ error: removeErr.message }, { status: 500 })
    }

    // mark documents as archived in DB
    const { data: upd, error: updErr } = await supabaseAdmin.from('documents').update({ archived_at: new Date().toISOString() }).in('chemin_storage', paths).eq('dossier_id', dossier.id)
    if (updErr) {
      console.error('update archived_at error', updErr)
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    const updatedCount = Array.isArray(upd) ? (upd as Array<unknown>).length : 0

    return NextResponse.json({ ok: true, removed: paths.length, updated: updatedCount })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
