import { supabaseAdmin } from '@/lib/supabase-admin'
import { uploadDocuments, deleteDocuments, UPLOAD_CONCURRENCY } from '@/lib/storage'

const MAX_SIZE = 50 * 1024 * 1024
const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.zip', '.skp', '.webp']
const ACCEPTED_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'application/zip', 'application/x-zip-compressed', 'image/webp']

function sanitizeFileName(name: string) {
  return name.replace(/[^a-z0-9.\-_.]/gi, '_')
}

export type UploadDocumentInput = {
  files: File[]
  numeroDossier?: string | null
  dossierId?: number | null
}

export async function processUploadDocuments(input: UploadDocumentInput) {
  const { files, numeroDossier, dossierId } = input

  if (!numeroDossier && !dossierId) {
    return { ok: false as const, error: 'numeroDossier or dossierId is required' }
  }

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
  if (problems.length) {
    return { ok: false as const, error: problems.join('; ') }
  }

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

  const basePath = `${sanitizeFileName(numeroDossier ?? String(finalDossierId))}`

  let uploadedResults: { name: string; size: number; type: string; path: string }[] = []
  try {
    uploadedResults = await uploadDocuments(files, basePath, UPLOAD_CONCURRENCY)
  } catch (uploadErr) {
    console.error('Upload error:', uploadErr)
    try {
      const attemptedPaths = uploadedResults.map(r => r.path)
      if (attemptedPaths.length) await deleteDocuments(attemptedPaths)
    } catch (cleanupErr) {
      console.error('Cleanup error after failed upload:', cleanupErr)
    }
    return { ok: false as const, error: 'Erreur lors du téléversement des fichiers.' }
  }

  const rows = uploadedResults.map(u => ({
    dossier_id: finalDossierId,
    nom_fichier: u.name,
    chemin_storage: u.path,
    taille: u.size,
    type_mime: u.type,
  }))

  const { error: insertErr } = await supabaseAdmin.from('documents').insert(rows)
  if (insertErr) {
    console.error('Insert metadata error:', insertErr)
    try {
      const paths = uploadedResults.map(r => r.path)
      await deleteDocuments(paths)
    } catch (cleanupErr) {
      console.error('Cleanup error after failed insert:', cleanupErr)
    }
    return { ok: false as const, error: "Erreur lors de l'enregistrement des métadonnées." }
  }

  return { ok: true as const, uploaded: uploadedResults, dossierId: finalDossierId }
}
