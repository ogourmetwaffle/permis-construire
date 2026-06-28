import Link from 'next/link'

type Props = {
  searchParams?: { numero?: string }
}

export default function Merci({ searchParams }: Props) {
  const numero = searchParams?.numero

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow text-center">
        <h1 className="text-2xl font-bold text-blue-900">Merci — Dossier reçu</h1>
        <p className="mt-4 text-gray-700">Nous avons bien reçu votre dossier. Merci de votre confiance.</p>

        {numero && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <div className="text-sm text-gray-600">Numéro de dossier</div>
            <div className="font-mono font-semibold mt-1">{numero}</div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href="/" className="text-blue-700 underline">Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  )
}
