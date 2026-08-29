import Link from 'next/link'

const services = [
  { title: 'Permis de construire', price: 'à partir de 400 €' },
  { title: 'Déclaration préalable', price: 'à partir de 300 €' },
  { title: 'Extension', price: 'à partir de 300 €' },
  { title: 'Véranda', price: 'à partir de 300 €' },
  { title: 'Plans 3D', price: 'à partir de 150 €' },
]

export default function ServicesList() {
  return (
    <section id="prestations" className="bg-[#f7f8fa]">
      <div className="max-w-4xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Ce que nous proposons</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] mb-4">Nos prestations</h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            De la déclaration préalable au permis de construire complet, nous prenons en charge l&apos;intégralité de votre dossier administratif.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100">
          {services.map((service, i) => (
            <div
              key={service.title}
              className={`flex items-center justify-between py-5 px-6 ${i !== services.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <span className="text-[#111827] font-medium">{service.title}</span>
              <span className="text-[#7b2020] font-semibold text-sm">{service.price}</span>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold rounded-lg transition-colors text-sm min-h-[48px]"
          >
            Demander un devis gratuit
          </Link>
        </div>
      </div>
    </section>
  )
}
