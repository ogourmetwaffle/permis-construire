import { sendAdminNotificationEmail, sendClientConfirmationEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, nom, prenom, telephone, numeroDossier } = body

    // send emails but do not fail the request if sending fails
    const clientRes = await sendClientConfirmationEmail(email, nom, prenom, numeroDossier)
    const adminRes = await sendAdminNotificationEmail(numeroDossier, nom, prenom, email, telephone)

    return new Response(JSON.stringify({ client: clientRes, admin: adminRes }), { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('send-emails error', message)
    return new Response(JSON.stringify({ error: message }), { status: 500 })
  }
}
