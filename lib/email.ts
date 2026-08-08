type EmailResult = { ok: true } | { ok: false; error: string }

const BREVO_API = 'https://api.brevo.com/v3/smtp/email'

function getEnvVar(name: string): string {
  const v = process.env[name]
  return v ?? ''
}

function sender() {
  const senderEmail = getEnvVar('SENDER_EMAIL')
  const senderName = getEnvVar('SENDER_NAME') || 'Esquiss Habitat'
  return { name: senderName, email: senderEmail }
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

export type PaymentInfo = {
  mode: 'CARTE' | 'VIREMENT'
  montant?: number
  currency?: string
  iban?: string
  bic?: string
  titulaire?: string
  reference?: string
  transactionId?: string
}

export async function sendClientConfirmationEmail(
  email: string,
  nom: string,
  prenom: string,
  numeroDossier: string,
  paymentInfo?: PaymentInfo
): Promise<EmailResult> {
  const mode = paymentInfo?.mode ?? 'VIREMENT'

  const subject =
    mode === 'CARTE'
      ? `Votre paiement a bien été reçu — Dossier ${numeroDossier}`
      : `Instructions de paiement par virement — Dossier ${numeroDossier}`

  const amountLine = paymentInfo?.montant ? `<p><strong>Montant payé / à payer :</strong> ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}</p>` : ''

  const virementDetails =
    mode === 'VIREMENT'
      ? `<h3>Coordonnées bancaires</h3>
         <p><strong>IBAN :</strong> ${paymentInfo?.iban ?? '—'}</p>
         <p><strong>BIC :</strong> ${paymentInfo?.bic ?? '—'}</p>
         <p><strong>Titulaire :</strong> ${paymentInfo?.titulaire ?? '—'}</p>
         <p><strong>Référence à indiquer :</strong> ${paymentInfo?.reference ?? numeroDossier}</p>
         <p>Merci d'effectuer le virement avec la référence indiquée afin que nous puissions retrouver rapidement votre paiement.</p>`
      : ''

  const paymentRecap =
    mode === 'CARTE'
      ? `<p>Nous avons bien reçu votre paiement.</p>
         ${amountLine}
         <p><strong>Référence transaction :</strong> ${paymentInfo?.transactionId ?? paymentInfo?.reference ?? '—'}</p>`
      : ''

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Confirmation de réception de votre dossier</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Nous confirmons la bonne réception de votre dossier.</p>
        <p><strong>Numéro de dossier :</strong><br/>${numeroDossier}</p>
        ${paymentRecap}
        ${virementDetails}
        <p>Notre équipe analysera votre dossier dans les meilleurs délais.</p>
        <p>Cordialement,<br/>${sender().name}</p>
      </body>
    </html>
  `

  const textParts: string[] = []
  textParts.push(`Bonjour ${prenom} ${nom},`)
  textParts.push('Nous confirmons la bonne réception de votre dossier.')
  textParts.push(`Numéro de dossier : ${numeroDossier}`)
  if (paymentInfo?.montant) textParts.push(`Montant : ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}`)
  if (mode === 'VIREMENT') {
    textParts.push('Coordonnées bancaires:')
    textParts.push(`IBAN: ${paymentInfo?.iban ?? '—'}`)
    textParts.push(`BIC: ${paymentInfo?.bic ?? '—'}`)
    textParts.push(`Titulaire: ${paymentInfo?.titulaire ?? '—'}`)
    textParts.push(`Référence: ${paymentInfo?.reference ?? numeroDossier}`)
  }
  textParts.push(`Cordialement, ${sender().name}`)

  const payload = {
    sender: sender(),
    to: [{ email }],
    subject,
    htmlContent: html,
    textContent: textParts.join('\n\n')
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
  telephone?: string,
  paymentInfo?: PaymentInfo
): Promise<EmailResult> {
  const adminEmail = getEnvVar('ADMIN_EMAIL')
  if (!adminEmail) return { ok: false, error: 'ADMIN_EMAIL not configured' }

  const paymentSummary = paymentInfo?.montant ? `<tr><td><strong>Montant :</strong></td><td>${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}</td></tr>` : ''
  const modeRow = `<tr><td><strong>Mode paiement :</strong></td><td>${paymentInfo?.mode ?? '—'}</td></tr>`

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
          ${modeRow}
          ${paymentSummary}
        </table>
        <p>Cordialement,<br/>${sender().name}</p>
      </body>
    </html>
  `

  const textContent = `Un nouveau dossier a été déposé.\n\nNuméro: ${numeroDossier}\nNom: ${nom}\nPrénom: ${prenom}\nEmail: ${email}\nTéléphone: ${telephone ?? ''}\nMode paiement: ${paymentInfo?.mode ?? '—'}${paymentInfo?.montant ? `\nMontant: ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}` : ''}`

  const payload = {
    sender: sender(),
    to: [{ email: adminEmail }],
    subject: `Nouveau dossier reçu — ${numeroDossier}`,
    htmlContent: html,
    textContent
  }

  const result = await sendEmailRaw(payload)
  if (!result.ok) console.error('sendAdminNotificationEmail error', result.error)
  return result
}

export async function sendPaymentConfirmationEmail(
  email: string,
  numeroDossier: string,
  montant?: number,
  currency?: string,
  reference?: string
): Promise<EmailResult> {
  const amountLine = montant ? `<p><strong>Montant payé :</strong> ${montant} ${currency ?? 'EUR'}</p>` : ''

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Paiement confirmé</h2>
        <p>Merci, votre paiement a bien été enregistré.</p>
        ${amountLine}
        <p><strong>Numéro de dossier :</strong><br/>${numeroDossier}</p>
        <p><strong>Référence :</strong><br/>${reference ?? '—'}</p>
        <p>Cordialement,<br/>${sender().name}</p>
      </body>
    </html>
  `

  const payload = {
    sender: sender(),
    to: [{ email }],
    subject: `Paiement confirmé — Dossier ${numeroDossier}`,
    htmlContent: html,
    textContent: `Votre paiement a été enregistré.\n\nNuméro de dossier: ${numeroDossier}\nRéférence: ${reference ?? '—'}${montant ? `\nMontant: ${montant} ${currency ?? 'EUR'}` : ''}`
  }

  const result = await sendEmailRaw(payload)
  if (!result.ok) console.error('sendPaymentConfirmationEmail error', result.error)
  return result
}

const emailClient = { sendClientConfirmationEmail, sendAdminNotificationEmail, sendPaymentConfirmationEmail }

export default emailClient
