import Header from '@/components/Header'
import Hero from '@/components/sections/Hero'
import ReassuranceBar from '@/components/sections/ReassuranceBar'
import ServicesList from '@/components/sections/ServicesList'
import BeforeAfterSlider from '@/components/sections/BeforeAfterSlider'
import Advantages from '@/components/sections/Advantages'
import ProcessSteps from '@/components/sections/ProcessSteps'
import StatsGallery from '@/components/sections/StatsGallery'
import FAQ from '@/components/FAQ'
import CTASection from '@/components/sections/CTASection'
import ContactSection from '@/components/sections/ContactSection'
import Footer from '@/components/Footer'

const beforeAfterItems = [
  {
    id: 'maison-1',
    label: 'Maison 1',
    beforeSrc: '/maison_1_before.jpeg',
    afterSrc: '/maison_1_after.jpeg',
    beforeAlt: 'Maison avant travaux',
    afterAlt: 'Maison après travaux',
  },
  {
    id: 'maison-2',
    label: 'Maison 2',
    beforeSrc: '/maison_2_before.jpeg',
    afterSrc: '/maison_2_after.jpeg',
    beforeAlt: 'Maison avant travaux',
    afterAlt: 'Maison après travaux',
  },
  {
    id: 'veranda-1',
    label: 'Véranda 1',
    beforeSrc: '/veranda1_before.jpeg',
    afterSrc: '/veranda1_after.jpeg',
    beforeAlt: 'Véranda avant travaux',
    afterAlt: 'Véranda après travaux',
  },
  {
    id: 'veranda-2',
    label: 'Véranda 2',
    beforeSrc: '/veranda2_before.jpeg',
    afterSrc: '/veranda2_after.jpeg',
    beforeAlt: 'Véranda avant travaux',
    afterAlt: 'Véranda après travaux',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero />
        <ReassuranceBar />
        <ServicesList />
        <BeforeAfterSlider items={beforeAfterItems} />
        <Advantages />
        <ProcessSteps />
        <StatsGallery />
        <FAQ />
        <CTASection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}
