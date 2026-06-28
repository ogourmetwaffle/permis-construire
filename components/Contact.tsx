export default function Contact() {
  return (
    <div id="contact" className="flex flex-col md:flex-row items-start justify-between gap-6">
      <div>
        <h3 className="text-xl font-bold">Contact</h3>
        <p className="mt-2">Téléphone: <a href="tel:+33699142598" className="font-semibold text-white">+33 6 99 14 25 98</a></p>
        <p>Email: <a href="mailto:contact@permiexpress.example" className="font-semibold text-white">contact@permiexpress.example</a></p>
        <p className="mt-2">WhatsApp: <a href="https://wa.me/33699142598" className="font-semibold text-white">Chattez-nous</a></p>
      </div>

      <div className="bg-white text-gray-900 p-4 rounded">
        <div className="font-semibold">Accompagnement et suivi</div>
        <div className="mt-2 text-sm">7j/7 24h/24 • Réactivité • Fiabilité • Confidentialité</div>
      </div>
    </div>
  )
}
