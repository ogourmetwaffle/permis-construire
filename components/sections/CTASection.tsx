import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="bg-[#7b2020]">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Prêt à lancer votre projet ?</h2>
        <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Confiez-nous votre dossier dès aujourd&apos;hui et bénéficiez d&apos;un accompagnement personnalisé.
        </p>
        <Link
          href="/deposer-dossier"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#7b2020] font-semibold rounded-lg transition-colors text-base min-h-[52px] hover:bg-gray-50"
        >
          Déposer mon dossier maintenant
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
