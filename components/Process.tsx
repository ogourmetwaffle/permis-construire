import { FileText as FileTextIcon, CreditCard as CreditCardIcon, UserCheck as UserCheckIcon, Car as CarIcon } from 'lucide-react'

const steps = [
  { icon: <FileTextIcon size={28} className="text-blue-700" />, title: 'Étape 1', heading: 'Déposez votre dossier', desc: 'Remplissez le formulaire et envoyez vos documents.' },
  { icon: <CreditCardIcon size={28} className="text-blue-700" />, title: 'Étape 2', heading: 'Réglez les frais de dossier', desc: 'Paiement sécurisé de 49 €.' },
  { icon: <UserCheckIcon size={28} className="text-blue-700" />, title: 'Étape 3', heading: 'Vérification du dossier', desc: 'Notre équipe contrôle vos documents.' },
  { icon: <CarIcon size={28} className="text-blue-700" />, title: 'Étape 4', heading: 'Traitement de votre demande', desc: 'Nous vous accompagnons dans vos démarches.' }
]

export default function Process() {
  return (
    <div id="process" className="grid md:grid-cols-4 gap-6">
      {steps.map((s) => (
        <div key={s.title} className="p-6 bg-white rounded-lg shadow-md border">
          <div className="mb-3">{s.icon}</div>
          <div className="text-sm font-semibold text-red-600 mb-1">{s.title}</div>
          <div className="font-semibold text-lg text-blue-900 mb-2">{s.heading}</div>
          <div className="text-gray-600">{s.desc}</div>
        </div>
      ))}
    </div>
  )
}
