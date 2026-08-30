import Image from 'next/image'
import {
  Home,
  Expand,
  Building2,
  Sun,
  Clock,
  CheckCircle2,
  MapPin,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import Reveal from '@/components/Reveal'

type Realisation = {
  src: string
  alt: string
  title: string
  category: string
  icon: LucideIcon
}

const gallery: Realisation[] = [
  {
    src: '/realisation 1.jpeg',
    alt: 'Maison individuelle accompagnée par Esquiss Habitat',
    title: 'Maison individuelle',
    category: 'Permis de construire',
    icon: Home,
  },
  {
    src: '/realisation 2.jpeg',
    alt: 'Extension contemporaine accompagnée par Esquiss Habitat',
    title: 'Extension contemporaine',
    category: 'Permis de construire',
    icon: Expand,
  },
  {
    src: '/realisation 3.jpeg',
    alt: 'Construction de maison accompagnée par Esquiss Habitat',
    title: 'Construction maison',
    category: 'Permis de construire',
    icon: Building2,
  },
  {
    src: '/realisation 5.jpeg',
    alt: 'Véranda et extension accompagnée par Esquiss Habitat',
    title: 'Véranda et extension',
    category: 'Déclaration préalable',
    icon: Sun,
  },
]

const stats: { value: string; label: string; icon: LucideIcon }[] = [
  { value: '1000+', label: 'Dossiers réalisés', icon: FileText },
  { value: '5 jours', label: 'Délai moyen', icon: Clock },
  { value: '98%', label: 'De permis validés', icon: CheckCircle2 },
  { value: 'France entière', label: 'Accompagnement partout en France', icon: MapPin },
]

function Caption({ title, category, icon: Icon }: { title: string; category: string; icon: LucideIcon }) {
  return (
    <div className="absolute bottom-3 left-3 z-10 sm:bottom-4 sm:left-4">
      <div className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 shadow-md ring-1 ring-black/5 backdrop-blur">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#7b2020]/10 text-[#7b2020]">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight text-[#0c1c33]">{title}</span>
          <span className="block text-xs leading-tight text-gray-500">{category}</span>
        </span>
      </div>
    </div>
  )
}

export default function StatsGallery() {
  const [main, ...rest] = gallery

  return (
    <section id="realisations" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 pt-12 sm:pt-16 pb-16 sm:pb-20">
        <Reveal>
          <div className="mb-10 text-center sm:mb-14">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#7b2020]">
              Nos réalisations
            </p>
            <h2 className="mb-5 text-3xl font-extrabold leading-tight text-[#0c1c33] sm:text-4xl lg:text-5xl">
              Des projets qui prennent forme.
            </h2>
            <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-[#7b2020]" />
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
              Découvrez quelques projets accompagnés par Esquiss Habitat, de la conception des plans
              jusqu&apos;à la préparation du dossier administratif.
            </p>
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[55fr_45fr] lg:grid-rows-2 lg:gap-5 lg:h-[460px] xl:h-[540px]">
            <figure className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 lg:row-span-2 lg:aspect-auto lg:min-h-0">
              <Image
                src={main.src}
                alt={main.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <Caption title={main.title} category={main.category} icon={main.icon} />
            </figure>

            <figure className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-gray-100 lg:aspect-auto lg:min-h-0">
              <Image
                src={rest[0].src}
                alt={rest[0].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <Caption title={rest[0].title} category={rest[0].category} icon={rest[0].icon} />
            </figure>

            <div className="grid grid-cols-2 gap-4 lg:gap-5 lg:min-h-0">
              {rest.slice(1).map((item) => (
                <figure
                  key={item.src}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 lg:aspect-auto lg:min-h-0"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 1024px) 50vw, 22vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <Caption title={item.title} category={item.category} icon={item.icon} />
                </figure>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12 sm:mt-16">
            <div className="divide-y divide-gray-200 rounded-2xl bg-[#f7f8fa] px-6 py-8 sm:px-10 sm:py-10 lg:divide-x lg:divide-y-0">
              <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col items-center px-4 py-2 text-center"
                    >
                      <Icon className="mb-3 h-6 w-6 text-[#0c1c33]" strokeWidth={1.5} />
                      <span className="mb-3 h-0.5 w-8 rounded-full bg-[#7b2020]" />
                      <p className="text-2xl font-extrabold text-[#0c1c33] sm:text-3xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 max-w-[14rem] text-sm text-gray-500">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
