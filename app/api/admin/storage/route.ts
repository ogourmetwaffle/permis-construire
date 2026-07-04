import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Fetch all documents but only needed columns (taille, dossier_id)
    const { data: docs, error: docsErr } = await supabaseAdmin.from('documents').select('taille,dossier_id')
    if (docsErr) {
      console.error('supabaseAdmin documents error', docsErr)
      return NextResponse.json({ error: docsErr.message }, { status: 500 })
    }

    const totalFiles = (docs || []).length
    const totalSize = (docs || []).reduce((s: number, r: any) => s + (Number(r.taille) || 0), 0)

    // compute distinct dossier ids that have documents
    const dossierIds = Array.from(new Set((docs || []).map((d: any) => d.dossier_id))).filter(Boolean)

    let dossiersArchivables = 0
    if (dossierIds.length > 0) {
      const { data: dossiers, error: dErr } = await supabaseAdmin
        .from('dossiers')
        .select('id')
        .in('id', dossierIds)
        .eq('statut', 'TERMINE')

      if (dErr) {
        console.error('supabaseAdmin dossiers error', dErr)
        return NextResponse.json({ error: dErr.message }, { status: 500 })
      }
      dossiersArchivables = (dossiers || []).length
    }

    return NextResponse.json({ ok: true, totalFiles, totalSize, dossiersArchivables })
  } catch (err) {
    console.error('server error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
