import { NextResponse } from 'next/server'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const { user } = await verifySupabaseToken(auth)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const numero = url.searchParams.get('numero')
    if (!numero) return NextResponse.json({ error: 'Missing numero' }, { status: 400 })

    const prefix = `${numero}/`
    const { data, error } = await supabaseAdmin.storage.from('documents').list(prefix, { limit: 100 })
    if (error) {
      console.error('list docs', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const expiresIn = Number(url.searchParams.get('expires')) || 60 * 60

    const items = await Promise.all(
      (data || []).map(async (item: any) => {
        const path = `${numero}/${item.name}`
        const { data: signed, error: signedErr } = await supabaseAdmin.storage.from('documents').createSignedUrl(path, expiresIn)
        if (signedErr) console.error('createSignedUrl error', signedErr)

        let size = item.size
        if (typeof size !== 'number' || !Number.isFinite(size)) {
          if (signed?.signedUrl) {
            try {
              const head = await fetch(signed.signedUrl, { method: 'HEAD' })
              const cl = head.headers.get('content-length')
              if (cl) {
                const parsed = Number(cl)
                if (Number.isFinite(parsed)) size = parsed
              }
            } catch (e) {
              console.error('failed to fetch HEAD for signed url', e)
            }
          }
        }

        return {
          name: item.name,
          size,
          updated_at: item.updated_at,
          url: signed?.signedUrl || null,
        }
      })
    )

    return NextResponse.json({ ok: true, items })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
