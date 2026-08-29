import Image from 'next/image'
import Link from 'next/link'
import { UploadCloud, Mail } from 'lucide-react'

export default function Hero() {
  return (
    <section id="accueil" className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/backround.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          quality={85}
        />
        <div className="absolute inset-0 bg-white/10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0c1c33] leading-[1.05] tracking-tight">
            Permis de construire
            <br />
            Concevons ensemble votre projet
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#111827]/80 leading-relaxed max-w-xl">
            Permis de construire, déclaration préalable, extension, véranda et accompagnement administratif.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/deposer-dossier"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold rounded-lg transition-colors text-base min-h-[52px]"
            >
              <UploadCloud size={18} />
              <span>Déposer mon dossier</span>
            </Link>

            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-[#0c1c33] text-[#0c1c33] hover:bg-gray-50 font-semibold rounded-lg transition-colors text-base min-h-[52px]"
            >
              <Mail size={18} />
              <span>Nous contacter</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
