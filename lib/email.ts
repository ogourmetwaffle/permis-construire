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

  if (mode === 'CARTE') {
    const subject = `Votre paiement a bien été reçu — Dossier ${numeroDossier}`
    const amountLine = paymentInfo?.montant ? `<p><strong>Montant payé :</strong> ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}</p>` : ''
    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #111;">
          <h2>Paiement confirmé</h2>
          <p>Bonjour ${prenom} ${nom},</p>
          <p>Nous avons bien reçu votre paiement par carte bancaire.</p>
          ${amountLine}
          <p><strong>Numéro de dossier :</strong><br/>${numeroDossier}</p>
          <p><strong>Référence transaction :</strong><br/>${paymentInfo?.transactionId ?? paymentInfo?.reference ?? '—'}</p>
          <p>Votre dossier va maintenant être traité par notre équipe.</p>
          <p>Cordialement,<br/>${sender().name}</p>
        </body>
      </html>
    `
    const text = `Bonjour ${prenom} ${nom},\n\nNous avons bien reçu votre paiement par carte bancaire.\n\nNuméro de dossier: ${numeroDossier}\n${paymentInfo?.montant ? `Montant: ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}` : ''}\nRéférence: ${paymentInfo?.transactionId ?? paymentInfo?.reference ?? '—'}\n\nVotre dossier va maintenant être traité.`
    const payload = { sender: sender(), to: [{ email }], subject, htmlContent: html, textContent: text }
    const result = await sendEmailRaw(payload)
    if (!result.ok) console.error('sendClientConfirmationEmail error', result.error)
    return result
  }

  const subject = `Instructions de paiement par virement — Dossier ${numeroDossier}`
  const amountLine = paymentInfo?.montant ? `<p><strong>Montant à payer :</strong> ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}</p>` : ''
  const virementDetails = `
    <h3>Coordonnées bancaires</h3>
    <p><strong>IBAN :</strong> ${paymentInfo?.iban ?? '—'}</p>
    <p><strong>BIC :</strong> ${paymentInfo?.bic ?? '—'}</p>
    <p><strong>Titulaire :</strong> ${paymentInfo?.titulaire ?? '—'}</p>
    <p><strong>Référence à indiquer :</strong> ${paymentInfo?.reference ?? numeroDossier}</p>
    <p>Merci d'effectuer le virement avec la référence indiquée afin que nous puissions retrouver rapidement votre paiement.</p>
  `
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Votre devis est disponible</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Nous avons étudié votre dossier et vous transmettons un devis personnalisé.</p>
        ${amountLine}
        ${virementDetails}
        <p>Vous pouvez suivre l'avancement de votre dossier depuis votre espace de suivi.</p>
        <p>Cordialement,<br/>${sender().name}</p>
      </body>
    </html>
  `
  const textParts = [
    `Bonjour ${prenom} ${nom},`,
    'Nous avons étudié votre dossier et vous transmettons un devis personnalisé.',
    `Numéro de dossier : ${numeroDossier}`,
    paymentInfo?.montant ? `Montant à payer : ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}` : '',
    'Coordonnées bancaires :',
    `IBAN: ${paymentInfo?.iban ?? '—'}`,
    `BIC: ${paymentInfo?.bic ?? '—'}`,
    `Titulaire: ${paymentInfo?.titulaire ?? '—'}`,
    `Référence: ${paymentInfo?.reference ?? numeroDossier}`,
    'Cordialement, ' + sender().name,
  ].filter(Boolean)
  const payload = { sender: sender(), to: [{ email }], subject, htmlContent: html, textContent: textParts.join('\n\n') }
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

export async function sendPaymentAssistanceEmail(
  email: string,
  nom: string,
  prenom: string,
  numeroDossier: string,
  paymentInfo?: PaymentInfo
): Promise<EmailResult> {
  const amountLine = paymentInfo?.montant ? `<p><strong>Montant :</strong> ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}</p>` : ''

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Votre dossier est bien créé</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Votre dossier a bien été créé, mais votre paiement par carte n'a pas pu être finalisé.</p>
        <p>Un membre de notre équipe va vous contacter pour vous accompagner.</p>
        <p>Vous pouvez aussi finaliser votre dossier par virement bancaire :</p>
        <p><strong>Numéro de dossier :</strong><br/>${numeroDossier}</p>
        ${amountLine}
        <p><strong>IBAN :</strong> ${paymentInfo?.iban ?? '—'}</p>
        <p><strong>BIC :</strong> ${paymentInfo?.bic ?? '—'}</p>
        <p><strong>Titulaire :</strong> ${paymentInfo?.titulaire ?? '—'}</p>
        <p><strong>Référence à indiquer :</strong> ${paymentInfo?.reference ?? numeroDossier}</p>
        <p>Cordialement,<br/>${sender().name}</p>
      </body>
    </html>
  `

  const textContent = [
    `Bonjour ${prenom} ${nom},`,
    "Votre dossier a bien été créé, mais votre paiement par carte n'a pas pu être finalisé.",
    'Un membre de notre équipe va vous contacter pour vous accompagner.',
    'Vous pouvez aussi finaliser votre dossier par virement bancaire :',
    `Numéro de dossier: ${numeroDossier}`,
    paymentInfo?.montant ? `Montant: ${paymentInfo.montant} ${paymentInfo.currency ?? 'EUR'}` : '',
    `IBAN: ${paymentInfo?.iban ?? '—'}`,
    `BIC: ${paymentInfo?.bic ?? '—'}`,
    `Titulaire: ${paymentInfo?.titulaire ?? '—'}`,
    `Référence: ${paymentInfo?.reference ?? numeroDossier}`,
    `Cordialement, ${sender().name}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const payload = {
    sender: sender(),
    to: [{ email }],
    subject: `Finalisation de votre dossier — ${numeroDossier}`,
    htmlContent: html,
    textContent,
  }

  const result = await sendEmailRaw(payload)
  if (!result.ok) console.error('sendPaymentAssistanceEmail error', result.error)
  return result
}

export async function sendDossierReceivedEmail(
  email: string,
  nom: string,
  prenom: string,
  numeroDossier: string,
  suiviPassword: string,
  suiviUrl?: string
): Promise<EmailResult> {
  const subject = `Dossier reçu — ${numeroDossier}`
  const trackingLink = suiviUrl ? `<p>Vous pouvez suivre l'avancement de votre dossier depuis votre <a href="${suiviUrl}">espace de suivi</a>.</p>` : '<p>Vous pouvez suivre l\'avancement de votre dossier depuis votre espace de suivi.</p>'
  const trackingText = suiviUrl ? `Espace de suivi: ${suiviUrl}` : "Espace de suivi: utilisez le numéro de dossier et le mot de passe fournis."

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>Merci — votre dossier a bien été reçu</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>Merci d'avoir déposé votre dossier auprès d'Esquiss Habitat.</p>
        <p>Notre expertise initiale est gratuite. Votre dossier va maintenant être étudié par notre équipe.</p>
        <p>Un membre de notre équipe prendra contact avec vous afin d'étudier votre projet et de vous communiquer un devis précis adapté à votre situation.</p>
        <p><strong>Numéro de dossier :</strong><br/>${numeroDossier}</p>
        <p><strong>Accès suivi :</strong><br/>Numéro : ${numeroDossier}<br/>Mot de passe : ${suiviPassword}</p>
        ${trackingLink}
        <p>Cordialement,<br/>${sender().name}</p>
      </body>
    </html>
  `

  const text = `Bonjour ${prenom} ${nom},\n\nMerci d'avoir déposé votre dossier auprès d'Esquiss Habitat.\n\nNuméro de dossier: ${numeroDossier}\nAccès suivi: Numéro: ${numeroDossier} Mot de passe: ${suiviPassword}\n\n${trackingText}\n\nNotre équipe analysera votre dossier et vous contactera pour un devis.`

  const payload = {
    sender: sender(),
    to: [{ email }],
    subject,
    htmlContent: html,
    textContent: text,
  }

  const result = await sendEmailRaw(payload)
  if (!result.ok) console.error('sendDossierReceivedEmail error', result.error)
  return result
}

export async function sendStatusChangeEmail(
  email: string,
  nom: string,
  prenom: string,
  numeroDossier: string,
  statut: string,
  commentaire?: string | null
): Promise<EmailResult> {
  let subject = ''
  let title = ''
  let message = ''

  if (statut === 'INFORMATIONS_MANQUANTES') {
    subject = `Informations manquantes — Dossier ${numeroDossier}`
    title = 'Informations manquantes'
    message = 'Votre dossier nécessite des informations ou des documents supplémentaires. Merci de consulter votre espace de suivi.'
  } else if (statut === 'EN_COURS') {
    subject = `Dossier en cours de traitement — Dossier ${numeroDossier}`
    title = 'Dossier en cours de traitement'
    message = 'Votre dossier est maintenant en cours de traitement par notre équipe.'
  } else if (statut === 'TERMINE') {
    subject = `Dossier terminé — Dossier ${numeroDossier}`
    title = 'Dossier terminé'
    message = 'Votre dossier a été traité et est maintenant terminé.'
  } else {
    subject = `Mise à jour du dossier — Dossier ${numeroDossier}`
    title = 'Mise à jour du dossier'
    message = 'Le statut de votre dossier a été mis à jour.'
  }

  const commentaireBlock = commentaire ? `<p><strong>Commentaire :</strong><br/>${commentaire.replace(/\n/g, '<br/>')}</p>` : ''

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; color: #111;">
        <h2>${title}</h2>
        <p>Bonjour ${prenom} ${nom},</p>
        <p>${message}</p>
        <p><strong>Numéro de dossier :</strong><br/>${numeroDossier}</p>
        ${commentaireBlock}
        <p>Vous pouvez suivre l'avancement de votre dossier depuis votre espace de suivi.</p>
        <p>Cordialement,<br/>${sender().name}</p>
      </body>
    </html>
  `

  const textParts = [
    `Bonjour ${prenom} ${nom},`,
    message,
    `Numéro de dossier: ${numeroDossier}`,
    commentaire ? `Commentaire:\n${commentaire}` : '',
    'Cordialement, ' + sender().name,
  ].filter(Boolean)

  const payload = {
    sender: sender(),
    to: [{ email }],
    subject,
    htmlContent: html,
    textContent: textParts.join('\n\n'),
  }

  const result = await sendEmailRaw(payload)
  if (!result.ok) console.error('sendStatusChangeEmail error', result.error)
  return result
}

const emailClient = {
  sendClientConfirmationEmail,
  sendAdminNotificationEmail,
  sendPaymentConfirmationEmail,
  sendPaymentAssistanceEmail,
  sendDossierReceivedEmail,
  sendStatusChangeEmail,
}

export default emailClient
