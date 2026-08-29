import { FileCheck, FolderOpen, Globe, Star } from 'lucide-react'

const items = [
  {
    icon: FileCheck,
    title: 'Rapide & efficace',
    desc: 'Dossier prêt en moins de 5 jours ouvrés',
  },
  {
    icon: FolderOpen,
    title: '+12 000 dossiers réalisés',
    desc: 'Pour la construction de piscines, garages, pergolas, extensions, maisons',
  },
  {
    icon: Globe,
    title: 'Partout en France',
    desc: 'DOM inclus, peu importe où se situe votre projet',
  },
  {
    icon: Star,
    title: '98% de permis validés',
    desc: 'Et autant de clients satisfaits',
  },
]

export default function ReassuranceBar() {
  return (
    <section className="bg-white border-b border-gray-100" aria-label="Réassurance">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {items.map((item) => (
            <div key={item.title} className="flex items-start gap-4 py-6 sm:py-0 sm:px-6">
              <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] text-[#7b2020] flex items-center justify-center shrink-0">
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-[#0c1c33] text-sm">{item.title}</p>
                <p className="text-gray-500 text-sm mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
