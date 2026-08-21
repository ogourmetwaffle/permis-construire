"use client"

import React, { useState } from 'react'

export default function SuiviPage() {
  const [numero, setNumero] = useState('')
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [dossier, setDossier] = useState<any>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showDeclare, setShowDeclare] = useState(false)
  const [decl, setDecl] = useState({ date: '', reference: '', montant: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const resp = await fetch('/api/dossiers/suivi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero, mot_de_passe: pwd }) })
      const j = await resp.json()
      if (!resp.ok) { setMessage(j?.error || 'Erreur'); setDossier(null); setLoading(false); return }
      setDossier(j.dossier)
    } catch (err) {
      setMessage('Erreur réseau')
      setDossier(null)
    } finally { setLoading(false) }
  }

  const submitDeclaration = async () => {
    if (!dossier) return
    setLoading(true)
    setMessage(null)
    try {
      const resp = await fetch(`/api/dossiers/${encodeURIComponent(String(dossier.id))}/declarer-virement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mot_de_passe: pwd, date: decl.date, reference: decl.reference, montant: decl.montant ? Number(decl.montant) : null }),
      })
      const j = await resp.json()
      if (!resp.ok) { setMessage(j?.error || 'Erreur'); setLoading(false); return }
      setMessage('Déclaration envoyée. L\'administration vérifiera votre virement.')
      setShowDeclare(false)
    } catch (err) {
      setMessage('Erreur réseau')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Suivi de dossier</h1>
      {!dossier ? (
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="text-sm">Numéro de dossier</label>
            <input value={numero} onChange={e => setNumero(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="text-sm">Mot de passe de suivi</label>
            <input value={pwd} onChange={e => setPwd(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <button type="submit" className="bg-[#E30613] text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Chargement…' : 'Accéder au suivi'}</button>
          </div>
          {message && <div className="text-sm text-red-600">{message}</div>}
        </form>
      ) : (
        <div className="bg-white border rounded p-6">
          <h2 className="text-lg font-semibold mb-2">MON DOSSIER</h2>
          <div className="mb-4">{dossier.numero_dossier}</div>
          <div className="mb-4">
            <strong>Statut:</strong> {dossier.statut}
          </div>

          {dossier.statut === 'DEVIS' && (
            <div className="mb-4">Votre dossier est actuellement étudié par notre équipe. Aucune action requise pour le moment.</div>
          )}

          {dossier.statut === 'EN_ATTENTE_PAIEMENT' && (
            <div className="space-y-2">
              <div className="text-sm">Votre devis est disponible.</div>
              <div><strong>Montant:</strong> {dossier.montant ?? 0} €</div>
              <div><strong>Titulaire:</strong> {dossier.titulaire}</div>
              <div><strong>IBAN:</strong> {dossier.iban}</div>
              <div><strong>BIC:</strong> {dossier.bic}</div>
              <div><strong>Référence du virement:</strong> {dossier.reference_virement || dossier.numero_dossier}</div>
              <div>
                <button className="mt-3 bg-gray-800 text-white px-3 py-2 rounded" onClick={() => setShowDeclare(true)}>J'ai effectué mon virement</button>
              </div>
            </div>
          )}

          {dossier.statut === 'NOUVEAU' && (
            <div className="mb-4">Paiement confirmé. Votre dossier va maintenant être traité par notre équipe.</div>
          )}

          {dossier.declarations && dossier.declarations.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Déclarations de virement</h3>
              <ul className="space-y-2">
                {dossier.declarations.map((d: any) => (
                  <li key={d.id} className="text-sm">Réf: {d.reference} — Montant: {d.montant ?? '-'} — Déclaré: {d.date_declaration || d.created_at}</li>
                ))}
              </ul>
            </div>
          )}

          {message && <div className="mt-3 text-sm text-green-700">{message}</div>}

          {showDeclare && (
            <div className="mt-4 border p-3 rounded bg-gray-50">
              <h4 className="font-semibold mb-2">Déclarer un virement</h4>
              <div className="mb-2"><label className="text-sm">Date du virement</label><input type="date" value={decl.date} onChange={e => setDecl(s => ({ ...s, date: e.target.value }))} className="w-full border rounded px-2 py-1" /></div>
              <div className="mb-2"><label className="text-sm">Référence</label><input value={decl.reference} onChange={e => setDecl(s => ({ ...s, reference: e.target.value }))} className="w-full border rounded px-2 py-1" /></div>
              <div className="mb-2"><label className="text-sm">Montant</label><input value={decl.montant} onChange={e => setDecl(s => ({ ...s, montant: e.target.value }))} className="w-full border rounded px-2 py-1" /></div>
              <div className="flex gap-2">
                <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={submitDeclaration} disabled={loading}>{loading ? 'Envoi…' : 'Envoyer'}</button>
                <button className="px-3 py-1 rounded border" onClick={() => setShowDeclare(false)}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
