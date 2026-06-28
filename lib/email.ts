type EmailResult = { ok: true } | { ok: false; error: string }

const BREVO_API = 'https://api.brevo.com/v3/smtp/email'

function getEnvVar(name: string): string {
  const v = process.env[name]
  return v ?? ''
}

function sender() {
  const senderEmail = getEnvVar('SENDER_EMAIL')
  return { name: 'Permis Express', email: senderEmail }
}

async function sendEmailRaw(payload: Record<string, unknown>): Promise<EmailResult> {
  const apiKey = getEnvVar('BREVO_API_KEY')
  if (!apiKey) return { ok: false, error: 'BREVO_API_KEY not configured' }

  try {
    const res = await fetch(BREVO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const text = await res.text()
      return { ok: false, error: `Brevo error: ${res.status} ${text}` }
    }

    return { ok: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: `Request failed: ${message}` }
  }
}

export async function sendClientConfirmationEmail(
  email: string,
  nom: string,
  prenom: string,
  numeroDossier: string
): Promise<EmailResult> {
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Confirmation de réception de votre dossier</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Nous confirmons la bonne réception de votre dossier.</p>
        <p><strong>Numéro de dossier :</strong><br/>${numeroDossier}</p>
        <p>Notre équipe analysera votre dossier dans les meilleurs délais.</p>
        <p>Cordialement,<br/>Permis Express</p>
      </body>
    </html>
  `

  const payload = {
    sender: sender(),
    to: [{ email }],
    subject: 'Confirmation de réception de votre dossier',
    htmlContent: html,
    textContent: `Bonjour ${prenom} ${nom},\n\nNous confirmons la bonne réception de votre dossier.\n\nNuméro de dossier : ${numeroDossier}\n\nNotre équipe analysera votre dossier dans les meilleurs délais.\n\nCordialement,\nPermis Express`
  }

  const result = await sendEmailRaw(payload)
  if (!result.ok) console.error('sendClientConfirmationEmail error', result.error)
  return result
}

export async function sendAdminNotificationEmail(
  numeroDossier: string,
  nom: string,
  prenom: string,
  email: string,
  telephone?: string
): Promise<EmailResult> {
  const adminEmail = getEnvVar('ADMIN_EMAIL')
  if (!adminEmail) return { ok: false, error: 'ADMIN_EMAIL not configured' }

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Nouveau dossier reçu</h2>
        <p>Un nouveau dossier a été déposé.</p>
        <table style="border-collapse: collapse;">
          <tr><td><strong>Numéro :</strong></td><td>${numeroDossier}</td></tr>
          <tr><td><strong>Nom :</strong></td><td>${nom}</td></tr>
          <tr><td><strong>Prénom :</strong></td><td>${prenom}</td></tr>
          <tr><td><strong>Email :</strong></td><td>${email}</td></tr>
          <tr><td><strong>Téléphone :</strong></td><td>${telephone ?? ''}</td></tr>
        </table>
        <p>Cordialement,<br/>Permis Express</p>
      </body>
    </html>
  `

  const payload = {
    sender: sender(),
    to: [{ email: adminEmail }],
    subject: 'Nouveau dossier reçu',
    htmlContent: html,
    textContent: `Un nouveau dossier a été déposé.\n\nNuméro: ${numeroDossier}\nNom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\nTéléphone: ${telephone ?? ''}`
  }

  const result = await sendEmailRaw(payload)
  if (!result.ok) console.error('sendAdminNotificationEmail error', result.error)
  return result
}

export async function sendPaymentConfirmationEmail(email: string, numeroDossier: string): Promise<EmailResult> {
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Paiement confirmé</h2>
        <p>Votre paiement de 49 € a été validé.</p>
        <p><strong>Numéro de dossier :</strong><br/>${numeroDossier}</p>
        <p>Cordialement,<br/>Permis Express</p>
      </body>
    </html>
  `

  const payload = {
    sender: sender(),
    to: [{ email }],
    subject: 'Paiement confirmé',
    htmlContent: html,
    textContent: `Votre paiement de 49 € a été validé.\n\nNuméro de dossier: ${numeroDossier}`
  }

  const result = await sendEmailRaw(payload)
  if (!result.ok) console.error('sendPaymentConfirmationEmail error', result.error)
  return result
}

const emailClient = { sendClientConfirmationEmail, sendAdminNotificationEmail, sendPaymentConfirmationEmail }

export default emailClient
