import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@favpoll.com'

type PledgeConfirmationParams = {
  to: string
  personName: string
  charityNames: string[]
  amount: number
  closesAt: string
  guestToken: string
}

type ExtensionRequestParams = {
  organizerEmail: string
  organizerName: string | null
  eventId: string
  message: string
}

export async function sendExtensionRequest(params: ExtensionRequestParams) {
  const { organizerEmail, organizerName, eventId, message } = params
  const supportEmail = process.env.SUPPORT_EMAIL ?? FROM_EMAIL
  const eventUrl = `${BASE_URL}/events/${eventId}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: supportEmail,
    subject: `Extension request — event ${eventId}`,
    html: `
      <p><strong>Organiser:</strong> ${organizerName ?? 'Unknown'} (${organizerEmail})</p>
      <p><strong>Event:</strong> <a href="${eventUrl}">${eventUrl}</a></p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  })
}

type EventClosedParams = {
  to: string
  personName: string
  totalRaised: number
  eventId: string
}

export async function sendEventClosed(params: EventClosedParams) {
  const { to, personName, totalRaised, eventId } = params
  const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
  const resultsUrl = `${BASE_URL}/events/${eventId}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your FavPoll for ${personName} has closed`,
    html: `
      <p>Your FavPoll for <strong>${personName}</strong> has now closed.</p>
      <p>Total raised: <strong>${GBP.format(totalRaised)}</strong></p>
      <p><a href="${resultsUrl}">View the results</a></p>
    `,
  })
}

export async function sendPledgeConfirmation(params: PledgeConfirmationParams) {
  const { to, personName, charityNames, amount, closesAt, guestToken } = params
  const GBP = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })
  const withdrawUrl = `${BASE_URL}/pledges/withdraw?token=${guestToken}`
  const closesDate = new Date(closesAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const charityLabel = charityNames.length === 0 ? 'charity'
    : charityNames.length === 1 ? charityNames[0]
    : charityNames.slice(0, -1).join(', ') + ' & ' + charityNames.at(-1)!

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your pledge for ${personName}`,
    html: `
      <p>Thank you for pledging ${GBP.format(amount)} to ${charityLabel} in honour of ${personName}.</p>
      <p>You can withdraw your pledge any time before ${closesDate} using the link below:</p>
      <p><a href="${withdrawUrl}">Withdraw my pledge</a></p>
      <p>If you did not make this pledge, you can safely ignore this email.</p>
    `,
  })
}
