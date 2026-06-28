'use client'

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Benefits from '@/components/Benefits'
import Process from '@/components/Process'
import FAQ from '@/components/FAQ'
import Contact from '@/components/Contact'
import Pricing from '@/components/Pricing'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero />

        <section className="max-w-5xl mx-auto px-6 py-10">
          <Benefits />
        </section>

        <section className="bg-gray-50">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Process />
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-12">
          <Pricing />
        </section>

        <section className="max-w-5xl mx-auto px-6 py-12">
          <FAQ />
        </section>

        <section className="bg-blue-900 text-white">
          <div className="max-w-5xl mx-auto px-6 py-12">
            <Contact />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}