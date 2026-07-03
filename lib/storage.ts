import supabaseAdmin from './supabase-admin'

export const UPLOAD_CONCURRENCY = 3

type UploadResult = {
  name: string
  size: number
  type: string
  path: string
}

async function uploadSingle(file: File, destPath: string): Promise<UploadResult> {
  // Read ArrayBuffer once and create Buffer for Supabase Node upload
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabaseAdmin.storage.from('documents').upload(destPath, buffer, {
    contentType: file.type || undefined,
    upsert: false,
  })
  if (error) throw error

  return { name: file.name, size: file.size, type: file.type, path: destPath }
}

export async function uploadDocuments(files: File[], basePath: string, concurrency = UPLOAD_CONCURRENCY): Promise<UploadResult[]> {
  const results: UploadResult[] = []
  const queue = files.slice()

  const workers: Promise<void>[] = []
  for (let i = 0; i < concurrency; i++) {
    const worker = (async () => {
      while (queue.length) {
        const f = queue.shift()
        if (!f) break
        const destPath = `${basePath}/${Date.now()}_${f.name.replace(/[^a-z0-9.\-_.]/gi, '_')}`
        const res = await uploadSingle(f, destPath)
        results.push(res)
      }
    })()
    workers.push(worker)
  }

  await Promise.all(workers)
  return results
}

export async function deleteDocuments(paths: string[]): Promise<void> {
  if (!paths || paths.length === 0) return
  const { error } = await supabaseAdmin.storage.from('documents').remove(paths)
  if (error) {
    console.error('Error deleting documents:', error)
    throw error
  }
}

export default { uploadDocuments, deleteDocuments }
