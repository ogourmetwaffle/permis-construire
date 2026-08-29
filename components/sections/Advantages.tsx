import { Users, Shield, Clock, Send } from 'lucide-react'

const advantages = [
  {
    icon: Users,
    title: 'Analyse par nos experts en urbanisme',
  },
  {
    icon: Shield,
    title: 'Dossier complet pris en charge',
  },
  {
    icon: Clock,
    title: 'Suivi et relances auprès de la mairie',
  },
  {
    icon: Send,
    title: 'Panneau d\'autorisation livré chez vous',
  },
]

export default function Advantages() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Pourquoi nous choisir</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33]">Nos experts s&apos;occupent de tout</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] text-[#7b2020] flex items-center justify-center shrink-0">
                <item.icon size={20} />
              </div>
              <p className="text-[#111827] font-medium text-sm leading-relaxed pt-2">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
