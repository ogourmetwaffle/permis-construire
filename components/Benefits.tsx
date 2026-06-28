export default function Benefits() {
  const items = [
    { icon: '🔒', title: 'Sécurisé', desc: 'Vos documents sont protégés.' },
    { icon: '⚡', title: 'Rapide', desc: 'Traitement rapide du dossier.' },
    { icon: '📞', title: 'Accompagnement', desc: 'Assistance personnalisée.' },
    { icon: '🇫🇷', title: 'France entière', desc: 'Service disponible partout en France.' }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Pourquoi choisir Permis Express ?</h2>
      <div className="grid md:grid-cols-4 gap-6">
        {items.map((it) => (
          <div key={it.title} className="p-6 bg-white rounded-lg shadow-sm border">
            <div className="text-3xl mb-3">{it.icon}</div>
            <h3 className="font-semibold text-lg text-blue-900">{it.title}</h3>
            <p className="text-gray-600 mt-2">{it.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
