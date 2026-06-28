import Header from '../../components/Header'
import Footer from '../../components/Footer'
import DossierForm from '../../components/DossierForm'

export default function DeposerDossierPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">Déposer mon dossier</h1>
          <p className="text-gray-700 mb-6">Remplissez le formulaire, téléchargez vos documents et procédez au paiement sécurisé.</p>

          {/* badges removed to simplify page (moved to FAQ) */}

          <DossierForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}
