import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

const allowedColumns = [
  'nom', 'prenom', 'email', 'telephone', 'adresse_client',
  'type_projet', 'adresse_projet', 'surface', 'numero_parcelle', 'description'
]

export async function PATCH(req: Request, context: any) {
  const auth = req.headers.get('authorization')
  // Next.js may provide params as a promise in the context; support both shapes
  const params = typeof context?.params?.then === 'function' ? await context.params : context?.params
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: any
  try {
    body = await req.json()
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { section, values } = body || {}
  if (!section || !values || typeof values !== 'object') return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  // Build update object only from allowed columns
  const payload: Record<string, any> = {}
  for (const k of Object.keys(values)) {
    if (allowedColumns.includes(k)) {
      payload[k] = values[k]
    }
  }

  if (Object.keys(payload).length === 0) return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 })

  // Basic validation
  if (payload.email && typeof payload.email !== 'string') return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  if (payload.surface !== undefined) {
    const n = Number(payload.surface)
    if (Number.isNaN(n)) return NextResponse.json({ error: 'Invalid surface' }, { status: 400 })
    payload.surface = n
  }

  try {
    const idParam = params?.id
    let res
    if (typeof idParam === 'string' && idParam.startsWith('PE-')) {
      res = await supabaseAdmin.from('dossiers').update(payload).eq('numero_dossier', idParam).select()
    } else {
      res = await supabaseAdmin.from('dossiers').update(payload).eq('id', idParam).select()
    }
    const { data, error } = res
    if (error) {
      console.error('supabase update error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, data: data?.[0] ?? null })
  } catch (err) {
    console.error('server error', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
