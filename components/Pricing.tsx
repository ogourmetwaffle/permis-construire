export default function Pricing() {
  return (
    <div className="flex justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-8 text-center">
        <div className="text-sm text-gray-500">Tarif simple et transparent</div>
        <div className="mt-4 text-6xl font-extrabold text-blue-900">49€</div>
        <div className="text-sm text-gray-600">par dossier</div>

        <ul className="mt-6 text-left space-y-2 text-gray-700">
          <li>✓ Vérification du dossier</li>
          <li>✓ Accompagnement</li>
          <li>✓ Suivi personnalisé</li>
          <li>✓ Assistance</li>
        </ul>

        <div className="mt-6">
          <a href="/deposer-dossier" className="inline-block px-6 py-3 bg-red-600 text-white rounded-full font-semibold shadow">Déposer mon dossier</a>
        </div>
      </div>
    </div>
  )
}
