import { Readable, PassThrough } from 'stream'
import { Buffer } from 'buffer'
import archiver from 'archiver'
import supabaseAdmin from '@/lib/supabase-admin'
import { verifySupabaseToken } from '@/lib/server/verifySupabaseToken'

export const runtime = 'nodejs'

export async function GET(req: Request) {
	const auth = req.headers.get('authorization')
	const { user } = await verifySupabaseToken(auth)
	if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

	try {
		const url = new URL(req.url)
		const numero = url.searchParams.get('numero')
		if (!numero) return new Response(JSON.stringify({ error: 'Missing numero' }), { status: 400 })

		// find dossier
		const { data: dossiers, error: dErr } = await supabaseAdmin.from('dossiers').select('id').eq('numero_dossier', numero).limit(1)
		if (dErr) {
			console.error('lookup dossier error', dErr)
			return new Response(JSON.stringify({ error: dErr.message }), { status: 500 })
		}
		const dossier = Array.isArray(dossiers) && dossiers.length ? dossiers[0] : null
		if (!dossier) return new Response(JSON.stringify({ error: 'Dossier not found' }), { status: 404 })

		const { data: docs, error: docsErr } = await supabaseAdmin.from('documents').select('nom_fichier, chemin_storage, archived_at').eq('dossier_id', dossier.id).is('archived_at', null)
		if (docsErr) {
			console.error('documents query error', docsErr)
			return new Response(JSON.stringify({ error: docsErr.message }), { status: 500 })
		}

		type DocRow = { nom_fichier?: string; chemin_storage?: string; archived_at?: string | null }
		type ArchivePath = { name?: string; path?: string }
		const paths: ArchivePath[] = (docs || []).map((d: DocRow) => ({ name: d.nom_fichier, path: d.chemin_storage })).filter((p) => p.path)

		const passThrough = new PassThrough()
		const archive = archiver('zip', { zlib: { level: 9 } })

		archive.on('error', (err: unknown) => {
			console.error('archiver error', err)
			passThrough.destroy(err as Error)
		})

		archive.pipe(passThrough)

		// For each file, create a signed URL and stream it into the archive
		for (const p of paths) {
			try {
				const { data: signed, error: signedErr } = await supabaseAdmin.storage.from('documents').createSignedUrl(p.path as string, 60)
				if (signedErr || !signed?.signedUrl) {
					console.error('createSignedUrl error for', p.path, signedErr)
					continue
				}

				const res = await fetch(signed.signedUrl)
				if (!res.ok) {
					console.error('failed to fetch signed url', p.path, res.status)
					continue
				}

				// Convert response to Buffer before appending to archiver
				try {
					const arrayBuffer = await res.arrayBuffer()
					const buf = Buffer.from(arrayBuffer)
					if (buf && buf.length > 0) {
						archive.append(buf, { name: p.name || p.path })
					} else {
						console.error('empty file buffer for', p.path)
					}
				} catch (e) {
					console.error('failed to read response as buffer for', p.path, e)
					continue
				}
			} catch (e) {
				console.error('error while adding file to archive', e)
			}
		}

		// finalize archive (async)
		archive.finalize().catch((e: unknown) => {
			console.error('archive finalize error', e)
			passThrough.destroy(e as Error)
		})

		const headers = new Headers()
		headers.set('Content-Type', 'application/zip')
		headers.set('Content-Disposition', `attachment; filename="${numero}.zip"`)

		// Convert Node stream to web ReadableStream
		type ReadableToWeb = { toWeb: (r: NodeJS.ReadableStream) => ReadableStream }
		const webStream = (Readable as unknown as ReadableToWeb).toWeb(passThrough as NodeJS.ReadableStream)

		return new Response(webStream, { headers })
	} catch (err) {
		console.error(err)
		return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
	}
}