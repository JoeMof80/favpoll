import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@favpoll.com"

type PledgeConfirmationParams = {
  to: string
  protagonistName: string
  charityNames: string[]
  amount: number
  closesAt: string
  guestToken: string
}

type ExtensionRequestParams = {
  organizerEmail: string
  organizerName: string | null
  favpollId: string
  message: string
}

export async function sendExtensionRequest(params: ExtensionRequestParams) {
  const { organizerEmail, organizerName, favpollId, message } = params
  const supportEmail = process.env.SUPPORT_EMAIL ?? FROM_EMAIL
  const eventUrl = `${BASE_URL}/favpolls/${favpollId}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: supportEmail,
    subject: `Extension request — event ${favpollId}`,
    html: `
      <p><strong>Organiser:</strong> ${organizerName ?? "Unknown"} (${organizerEmail})</p>
      <p><strong>Event:</strong> <a href="${eventUrl}">${eventUrl}</a></p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  })
}

type FavpollClosedParams = {
  to: string
  protagonistName: string
  totalRaised: number
  favpollId: string
}

export async function sendFavpollClosed(params: FavpollClosedParams) {
  const { to, protagonistName, totalRaised, favpollId } = params
  const GBP = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  })
  const resultsUrl = `${BASE_URL}/favpolls/${favpollId}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your favpoll for ${protagonistName} has closed`,
    html: `
      <p>Your favpoll for <strong>${protagonistName}</strong> has now closed.</p>
      <p>Total raised: <strong>${GBP.format(totalRaised)}</strong></p>
      <p><a href="${resultsUrl}">View the results</a></p>
    `,
  })
}

type GuestItemAddedParams = {
  to: string
  itemLabel: string
  topicTitle: string
  openingLine: string
  protagonistName: string
  favpollId: string
}

export async function sendGuestItemAdded(params: GuestItemAddedParams) {
  const { to, itemLabel, topicTitle, openingLine, protagonistName, favpollId } =
    params
  const eventUrl = `${BASE_URL}/favpolls/${favpollId}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New item added to your ${topicTitle} poll`,
    html: `
      <p>A guest added "<strong>${itemLabel}</strong>" to your ${topicTitle} poll on your ${openingLine} for ${protagonistName}.</p>
      <p><a href="${eventUrl}">View your event</a></p>
    `,
  })
}

export async function sendPledgeConfirmation(params: PledgeConfirmationParams) {
  const { to, protagonistName, charityNames, amount, closesAt, guestToken } =
    params
  const GBP = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  })
  const withdrawUrl = `${BASE_URL}/pledges/withdraw?token=${guestToken}`
  const closesDate = new Date(closesAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const charityLabel =
    charityNames.length === 0
      ? "charity"
      : charityNames.length === 1
        ? charityNames[0]
        : charityNames.slice(0, -1).join(", ") + " & " + charityNames.at(-1)!

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your pledge for ${protagonistName}`,
    html: `
      <p>Thank you for pledging ${GBP.format(amount)} to ${charityLabel} in honour of ${protagonistName}.</p>
      <p>You can withdraw your pledge any time before ${closesDate} using the link below:</p>
      <p><a href="${withdrawUrl}">Withdraw my pledge</a></p>
      <p>If you did not make this pledge, you can safely ignore this email.</p>
    `,
  })
}
