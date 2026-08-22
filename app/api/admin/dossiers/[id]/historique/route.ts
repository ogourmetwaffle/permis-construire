import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(req: Request, context: any) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = typeof context?.params?.then === 'function' ? await context.params : context?.params
  const idParam = params?.id

  let query = supabaseAdmin.from('dossier_historique').select('*').order('created_at', { ascending: false })
  if (typeof idParam === 'string' && idParam.startsWith('PE-')) {
    const { data: dossier } = await supabaseAdmin.from('dossiers').select('id').eq('numero_dossier', idParam).maybeSingle()
    if (dossier) query = query.eq('dossier_id', dossier.id)
  } else if (idParam) {
    query = query.eq('dossier_id', Number(idParam))
  }

  const { data, error } = await query
  if (error) {
    console.error('admin historique fetch error', error)
    return NextResponse.json({ error: 'Unable to fetch historique' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data: data || [] })
}
