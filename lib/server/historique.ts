import supabaseAdmin from '@/lib/supabase-admin'

export type ActeurType = 'CLIENT' | 'ADMINISTRATION' | 'SYSTEME'

export type HistoriqueMetadata = Record<string, unknown>

export async function recordHistorique(
  dossierId: number | string,
  action: string,
  description: string,
  acteurType: ActeurType,
  metadata?: HistoriqueMetadata
) {
  try {
    const payload: Record<string, unknown> = {
      dossier_id: Number(dossierId),
      action,
      description,
      acteur_type: acteurType,
    }
    if (metadata !== undefined) payload.metadata = metadata

    const { error } = await supabaseAdmin.from('dossier_historique').insert(payload)
    if (error) {
      console.error('recordHistorique error', error)
    }
  } catch (err) {
    console.error('recordHistorique unexpected', err)
  }
}
