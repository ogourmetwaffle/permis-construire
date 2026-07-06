import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabaseAdmin.from('tarifs').select('*').order('type_client').order('type_projet')
    if (error) {
      console.error('tarifs query error', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true, items: data || [] })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const items = Array.isArray(body) ? body : [body]

    for (const it of items) {
      if (!it) continue
      if (it.id) {
        const { error } = await supabaseAdmin.from('tarifs').update({ prix: it.prix, actif: it.actif ?? true }).eq('id', it.id)
        if (error) {
          console.error('update tarif error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      } else if (it.type_client && it.type_projet) {
        const payload = { type_client: it.type_client, type_projet: it.type_projet, prix: it.prix, actif: it.actif ?? true }
        const { error } = await supabaseAdmin.from('tarifs').upsert(payload, { onConflict: 'type_client,type_projet' })
        if (error) {
          console.error('upsert tarif error', error)
          return NextResponse.json({ error: error.message }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
