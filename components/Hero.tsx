import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold text-blue-900 leading-tight">Votre permis étranger,
            <span className="block">notre expertise</span>
          </h1>

          <p className="mt-4 text-gray-700 text-base sm:text-lg">Conversion de permis étranger vers permis français. Simple, rapide et sécurisée.</p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/deposer-dossier" className="inline-block px-6 py-3 bg-red-600 text-white rounded-full font-semibold shadow-md">Déposer mon dossier</Link>
            <Link href="#process" className="inline-block px-4 py-2 text-blue-900 font-medium">Comment ça marche</Link>

            <div className="ml-4 text-sm text-gray-600 flex items-center gap-3">
              <span className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded">À partir de <strong className="text-red-600 ml-2">49€</strong></span>
            </div>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-2 text-gray-700">
            <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Partout en France</li>
            <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Accompagnement personnalisé</li>
            <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Dossier vérifié avant envoi</li>
            <li className="flex items-center gap-2"><span className="text-green-600">✓</span> Réponse rapide</li>
          </ul>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          <div className="rounded-xl overflow-hidden shadow-xl bg-white border border-gray-100">
            <Image src="/flyer-mock.png" alt="Permis Express" width={900} height={520} className="w-full h-64 sm:h-80 object-cover" priority />
          </div>
        </div>
      </div>
    </section>
  )
}
