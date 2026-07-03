import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Wizard from '../../components/wizard/Wizard'

export const metadata: Metadata = {
  title: 'Déposer mon dossier — Esquiss Habitat',
  description: 'Déposez votre dossier de permis de construire ou déclaration préalable en ligne. Simple, rapide et sécurisé.',
}

export default function DeposerDossierPage() {
  return (
    <>
      <Header />
      <Wizard />
      <Footer />
    </>
  )
}
