import Header from '@/components/Header'
import Hero from '@/components/sections/Hero'
import ReassuranceBar from '@/components/sections/ReassuranceBar'
import Showcase from '@/components/sections/Showcase'
import ExpertsSection from '@/components/sections/ExpertsSection'
import StatsGallery from '@/components/sections/StatsGallery'
import FAQ from '@/components/FAQ'
import CTASection from '@/components/sections/CTASection'
import ContactSection from '@/components/sections/ContactSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero />
        <ReassuranceBar />
        <Showcase />
        <ExpertsSection />
        <StatsGallery />
        <FAQ />
        <CTASection />
        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}
