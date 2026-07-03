import { supabaseAdmin } from '@/lib/supabase-admin'
import { uploadDocuments, deleteDocuments, UPLOAD_CONCURRENCY } from '@/lib/storage'

export const runtime = 'nodejs'

const MAX_SIZE = 50 * 1024 * 1024 // 50 Mo
const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.zip', '.skp', '.webp']
const ACCEPTED_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'application/zip', 'application/x-zip-compressed', 'image/webp']

function sanitizeFileName(name: string) {
  return name.replace(/[^a-z0-9.\-_.]/gi, '_')
}

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

    if (!numeroDossier && !dossierId) {
      console.timeEnd('upload:total')
      return new Response(JSON.stringify({ error: 'numeroDossier or dossierId is required' }), { status: 400 })
    }

    const files = form.getAll('files') as File[]
    if (!files || files.length === 0) {
      console.timeEnd('upload:total')
      return new Response(JSON.stringify({ error: 'Aucun fichier envoyé' }), { status: 400 })
    }

    // Validation pass (single)
    console.time('upload:validation')
    const problems: string[] = []
    for (const f of files) {
      const name = f.name || 'file'
      const size = typeof f.size === 'number' ? f.size : (await f.arrayBuffer()).byteLength
      const type = f.type || ''
      const ext = '.' + name.split('.').pop()?.toLowerCase()
      if (!ACCEPTED_EXTENSIONS.includes(ext)) problems.push(`Extension non autorisée: ${name}`)
      if (!ACCEPTED_MIMES.includes(type)) problems.push(`Type MIME non autorisé: ${name}`)
      if (size > MAX_SIZE) problems.push(`Taille dépassée: ${name}`)
    }
    console.timeEnd('upload:validation')
    if (problems.length) {
      console.error('Validation errors:', problems)
      console.timeEnd('upload:total')
      return new Response(JSON.stringify({ error: problems.join('; ') }), { status: 400 })
    }

    // Resolve dossier id once
    console.time('upload:resolveDossier')
    let finalDossierId: number | null = dossierId ?? null
    if (!finalDossierId && numeroDossier) {
      const { data: dossierRow, error: dossierErr } = await supabaseAdmin
        .from('dossiers')
        .select('id')
        .eq('numero_dossier', numeroDossier)
        .maybeSingle()
      if (dossierErr) {
        console.error('Error fetching dossier id for', numeroDossier, dossierErr)
      }
      if (dossierRow && typeof (dossierRow as Record<string, unknown>).id === 'number') {
        finalDossierId = Number((dossierRow as Record<string, unknown>).id)
      }
    }
    console.timeEnd('upload:resolveDossier')

    // Prepare base path (per-dossier directory in bucket)
    const basePath = `${sanitizeFileName(numeroDossier ?? String(finalDossierId))}`

    // Upload in parallel with concurrency
    console.time('upload:uploadFiles')
    let uploadedResults: { name: string; size: number; type: string; path: string }[] = []
    try {
      uploadedResults = await uploadDocuments(files, basePath, UPLOAD_CONCURRENCY)
      console.timeEnd('upload:uploadFiles')
    } catch (uploadErr) {
      console.error('Upload error:', uploadErr)
      // Attempt cleanup if partial
      try {
        const attemptedPaths = [] as string[]
        // uploadedResults may contain some results
        for (const r of uploadedResults) attemptedPaths.push(r.path)
        if (attemptedPaths.length) await deleteDocuments(attemptedPaths)
      } catch (cleanupErr) {
        console.error('Cleanup error after failed upload:', cleanupErr)
      }
      console.timeEnd('upload:total')
      return new Response(JSON.stringify({ error: 'Erreur lors du téléversement des fichiers.' }), { status: 500 })
    }

    // Insert metadata in a single query
    console.time('upload:insertMetadata')
    const rows = uploadedResults.map(u => ({
      dossier_id: finalDossierId,
      nom_fichier: u.name,
      chemin_storage: u.path,
      taille: u.size,
      type_mime: u.type,
    }))

    const { error: insertErr } = await supabaseAdmin.from('documents').insert(rows)
    console.timeEnd('upload:insertMetadata')

    if (insertErr) {
      console.error('Insert metadata error:', insertErr)
      // rollback: delete uploaded files
      try {
        const paths = uploadedResults.map(r => r.path)
        await deleteDocuments(paths)
      } catch (cleanupErr) {
        console.error('Cleanup error after failed insert:', cleanupErr)
      }
      console.timeEnd('upload:total')
      return new Response(JSON.stringify({ error: 'Erreur lors de l enregistrement des métadonnées.' }), { status: 500 })
    }

    console.timeEnd('upload:total')
    return new Response(JSON.stringify({ uploaded: uploadedResults }), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Upload route error:', message)
    console.timeEnd('upload:total')
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
