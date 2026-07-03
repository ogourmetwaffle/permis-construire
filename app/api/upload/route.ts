import { supabaseAdmin } from '@/lib/supabase-admin'

const MAX_SIZE = 50 * 1024 * 1024 // 50 Mo
const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.zip', '.skp', '.webp']
const ACCEPTED_MIMES = ['application/pdf', 'image/png', 'image/jpeg', 'application/zip', 'application/x-zip-compressed', 'image/webp']

function sanitizeFileName(name: string) {
  return name.replace(/[^a-z0-9.\-_.]/gi, '_')
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: 'Content-Type must be multipart/form-data' }), { status: 400 })
    }

    const form = await req.formData()
    const numeroDossier = form.get('numeroDossier') as string | null
    const dossierIdRaw = form.get('dossierId') as string | null
    const dossierId = dossierIdRaw ? parseInt(dossierIdRaw, 10) : null

    if (!numeroDossier && !dossierId) {
      return new Response(JSON.stringify({ error: 'numeroDossier or dossierId is required' }), { status: 400 })
    }

    const files = form.getAll('files') as File[]
    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ error: 'Aucun fichier envoyé' }), { status: 400 })
    }

    const uploaded: Array<Record<string, unknown>> = []

    for (const f of files) {
      // Basic validations
      const name = typeof (f as any).name === 'string' ? (f as any).name as string : 'file'
      const size = typeof (f as any).size === 'number' ? (f as any).size as number : (await (f as any).arrayBuffer()).byteLength
      const type = typeof (f as any).type === 'string' ? (f as any).type as string : ''

      const ext = '.' + name.split('.').pop()?.toLowerCase()
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        return new Response(JSON.stringify({ error: `Extension non autorisée pour ${name}` }), { status: 400 })
      }
      if (!ACCEPTED_MIMES.includes(type)) {
        return new Response(JSON.stringify({ error: `Type MIME non autorisé pour ${name}` }), { status: 400 })
      }
      if (size > MAX_SIZE) {
        return new Response(JSON.stringify({ error: `Le fichier ${name} dépasse la taille maximale autorisée (50 Mo).` }), { status: 400 })
      }

      // Read file data
      const arrayBuffer = await (f as any).arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const safeName = sanitizeFileName(name)
      const storagePath = `${numeroDossier ?? dossierId}/${Date.now()}_${safeName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage.from('documents').upload(storagePath, buffer, {
        contentType: type,
        upsert: false,
      })
      if (uploadError) {
        console.error('Upload error for', name, uploadError)
        return new Response(JSON.stringify({ error: `Erreur lors du téléversement de ${name}` }), { status: 500 })
      }

      // Insert metadata in documents table
      const dossier_id_final = dossierId ?? null
      // If dossierId not provided, try to fetch by numero_dossier
      let finalDossierId = dossier_id_final
      if (!finalDossierId && numeroDossier) {
        const { data: dossierRow, error: dossierErr } = await supabaseAdmin
          .from('dossiers')
          .select('id')
          .eq('numero_dossier', numeroDossier)
          .maybeSingle()
        if (dossierErr) {
          console.error('Error fetching dossier id for', numeroDossier, dossierErr)
        }
        if (dossierRow && (dossierRow as any).id) finalDossierId = (dossierRow as any).id
      }

      const { error: insertErr } = await supabaseAdmin
        .from('documents')
        .insert({
          dossier_id: finalDossierId,
          nom_fichier: name,
          chemin_storage: storagePath,
          taille: size,
          type_mime: type,
        })

      if (insertErr) {
        console.error('Insert documents metadata error for', name, insertErr)
        return new Response(JSON.stringify({ error: `Erreur lors de l'enregistrement des métadonnées pour ${name}` }), { status: 500 })
      }

      uploaded.push({ name, size, type, path: storagePath })
    }

    return new Response(JSON.stringify({ uploaded }), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Upload route error:', message)
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
