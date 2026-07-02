import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Benefits from '@/components/Benefits'
import Services from '@/components/Services'
import Process from '@/components/Process'
import WhyUs from '@/components/WhyUs'
import Realisations from '@/components/Realisations'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-18">
        {/* Hero */}
        <Hero />

        {/* Trust badges */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <Benefits />
          </div>
        </section>

        {/* Services */}
        <Services />

        {/* Process / Timeline */}
        <Process />

        {/* Why us */}
        <WhyUs />

        {/* Réalisations */}
        <Realisations />

        {/* Testimonials */}
        <Testimonials />

        {/* FAQ */}
        <FAQ />

        {/* Contact */}
        <Contact />
      </main>

      <Footer />
    </div>
  )
}