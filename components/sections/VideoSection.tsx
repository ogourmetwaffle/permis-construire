import Reveal from '@/components/Reveal'

export default function VideoSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[#7b2020]" />
            <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-4">
              VOTRE PROJET, ÉTAPE PAR ÉTAPE
            </p>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] leading-tight mb-5">
              Découvrez comment ça fonctionne
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed">
              De la création de votre dossier au suivi de votre demande,
              découvrez en vidéo comment Esquiss Habitat simplifie vos démarches.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 sm:mt-12 flex justify-center">
            <div className="relative w-full max-w-[880px] aspect-video rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(12,28,51,0.06)] ring-1 ring-[#0c1c33]/5 bg-black">
              <video
                src="/esquiss-habitat.mp4"
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
