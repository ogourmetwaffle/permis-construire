import { processUploadDocuments } from '@/lib/server/upload-documents'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  console.time('upload:total')
  try {
    console.time('upload:parseForm')
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      console.timeEnd('upload:parseForm')
      console.timeEnd('upload:total')
      return new Response(JSON.stringify({ error: 'Content-Type must be multipart/form-data' }), { status: 400 })
    }

    const form = await req.formData()
    console.timeEnd('upload:parseForm')

    const numeroDossier = form.get('numeroDossier') as string | null
    const dossierIdRaw = form.get('dossierId') as string | null
    const dossierId = dossierIdRaw ? parseInt(dossierIdRaw, 10) : null
    const files = form.getAll('files') as File[]

    if (!files || files.length === 0) {
      console.timeEnd('upload:total')
      return new Response(JSON.stringify({ error: 'Aucun fichier envoyé' }), { status: 400 })
    }

    const result = await processUploadDocuments({ files, numeroDossier, dossierId })
    console.timeEnd('upload:total')

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error }), { status: 400 })
    }

    return new Response(JSON.stringify({ uploaded: result.uploaded }), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Upload route error:', message)
    console.timeEnd('upload:total')
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
