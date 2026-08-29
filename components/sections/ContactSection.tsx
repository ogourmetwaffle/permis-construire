import Link from 'next/link'
import { Phone, Mail, Globe, MapPin } from 'lucide-react'

export default function ContactSection() {
  return (
    <section id="contact" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Contact</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33]">Parlons de votre projet</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] text-[#7b2020] flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <a href="tel:+33750896486" className="text-[#111827] hover:text-[#7b2020] transition-colors font-medium">
                +33 7 50 89 64 86
              </a>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] text-[#7b2020] flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <a href="mailto:contact@esquisshabitat.com" className="text-[#111827] hover:text-[#7b2020] transition-colors font-medium">
                contact@esquisshabitat.com
              </a>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] text-[#7b2020] flex items-center justify-center shrink-0">
                <Globe size={18} />
              </div>
              <span className="text-[#111827] font-medium">www.esquisshabitat.com</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#f7f8fa] text-[#7b2020] flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <span className="text-[#111827] font-medium">France entière</span>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/deposer-dossier"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold rounded-lg transition-colors text-sm min-h-[48px]"
            >
              Déposer mon dossier
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
