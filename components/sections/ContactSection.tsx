import Image from 'next/image'
import Link from 'next/link'
import { Phone, Mail } from 'lucide-react'

export default function ContactSection() {
  return (
    <section id="contact" className="bg-[#f7f8fa]">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">
              Parlons de votre projet
            </p>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] leading-[1.1] mb-4">
              Un projet en tête ?<br />
              Parlons-en.
            </h2>

            <div className="w-12 h-1 bg-[#7b2020] mb-6" />

            <p className="text-gray-600 leading-relaxed mb-8">
              Vous avez un projet de construction, d&apos;extension, de véranda, de piscine ou d&apos;aménagement ?
              Esquiss Habitat vous accompagne dans vos démarches et vous aide à concrétiser votre projet en toute sérénité.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-lg p-5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] text-[#7b2020] flex items-center justify-center mb-3">
                  <Phone size={18} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Appelez-nous</p>
                <a href="tel:+33750896486" className="text-[#0c1c33] font-semibold hover:text-[#7b2020] transition-colors text-sm sm:text-base">
                  +33 7 50 89 64 86
                </a>
                <p className="text-xs text-gray-500 mt-1">Du lundi au vendredi, de 9h à 18h</p>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] text-[#7b2020] flex items-center justify-center mb-3">
                  <Mail size={18} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">Écrivez-nous</p>
                <a href="mailto:contact@esquisshabitat.com" className="text-[#0c1c33] font-semibold hover:text-[#7b2020] transition-colors text-sm sm:text-base">
                  contact@esquisshabitat.com
                </a>
                <p className="text-xs text-gray-500 mt-1">Nous vous répondrons dans les meilleurs délais.</p>
              </div>
            </div>

            <div className="mb-3">
              <Link
                href="mailto:contact@esquisshabitat.com"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold rounded-lg transition-colors text-base min-h-[48px]"
              >
                Nous contacter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <p className="text-xs text-gray-400">Vos informations restent confidentielles.</p>
          </div>

          <div className="relative">
            <div className="relative w-full h-[350px] sm:h-[450px] lg:h-[500px] rounded-lg overflow-hidden bg-gray-100">
              <Image
                src="/contact.png"
                alt=""
                fill
                className="object-cover"
                quality={85}
              />
            </div>
            <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-sm max-w-[160px]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#7b2020] mb-1">Depuis 2018</p>
              <p className="text-xs text-gray-600 leading-relaxed">Esquiss Habitat vous accompagne dans vos projets.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
