import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import verifySupabaseToken from '@/lib/server/verifySupabaseToken'

export async function GET(req: any, context: any) {
  try {
    const auth = req.headers?.get ? req.headers.get('authorization') || '' : (req.headers?.authorization || '')
    const ok = await verifySupabaseToken(auth)
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const params = context?.params
    const resolvedParams = params && typeof params.then === 'function' ? await params : params
    const dossierId = Number(resolvedParams?.id)
    if (!dossierId) return NextResponse.json({ error: 'Invalid dossier id' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('virements_declarations')
      .select('id, reference, montant, date_declaration, created_at')
      .eq('dossier_id', dossierId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('admin virements fetch error', error)
      return NextResponse.json({ error: 'Unable to fetch declarations' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, items: data || [] })
  } catch (err) {
    console.error('admin virements unexpected', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
