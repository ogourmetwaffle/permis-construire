import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const numero = url.searchParams.get('numero')
    if (!numero) return NextResponse.json({ error: 'Missing numero' }, { status: 400 })

    const prefix = `${numero}/`
    const { data, error } = await supabase.storage.from('documents').list(prefix, { limit: 100 })
    if (error) {
      console.error('list docs', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create signed URLs for each object (1 hour)
    const expiresIn = 60 * 60
    type StorageObject = { name: string; size?: number; updated_at?: string }
    const items = await Promise.all(
      (data || []).map(async (item: any) => {
        const path = `${numero}/${item.name}`
        const { data: signed, error: signedErr } = await supabase.storage.from('documents').createSignedUrl(path, expiresIn)
        if (signedErr) console.error('createSignedUrl error', signedErr)

        // Ensure we return a numeric size when possible. Some storage backends
        // may not include `size` on the list response. The Storage client
        // implementation in use may not expose a `getMetadata` helper, so
        // fallback to issuing a HEAD request to the signed URL (if created)
        // to read the `content-length` header.
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
