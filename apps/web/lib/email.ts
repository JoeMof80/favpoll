import { Resend } from "resend"
import { renderEmail, escapeHtml } from "./email-template"
import { formatFavpollDate } from "./display"
import { formatPoundsExact } from "./i18n"

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
  favpollId: string
}

export async function sendPledgeConfirmation(params: PledgeConfirmationParams) {
  const {
    to,
    protagonistName,
    charityNames,
    amount,
    closesAt,
    guestToken,
    favpollId,
  } = params
  const withdrawUrl = `${BASE_URL}/pledges/withdraw?token=${guestToken}`
  const favpollUrl = `${BASE_URL}/favpolls/${favpollId}`
  const closesDate = closesAt ? formatFavpollDate(closesAt.slice(0, 10)) : null
  const name = escapeHtml(protagonistName)
  const charityLabel = escapeHtml(
    charityNames.length === 0
      ? "charity"
      : charityNames.length === 1
        ? charityNames[0]
        : charityNames.slice(0, -1).join(", ") + " & " + charityNames.at(-1)!
  )

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your pledge for ${protagonistName}`,
    html: renderEmail({
      preheader: `${formatPoundsExact(amount)} to ${charityNames.join(" & ") || "charity"}, in honour of ${protagonistName}.`,
      heading: "Thank you.",
      bodyHtml: `<p style="margin:0 0 12px;">You pledged <strong>${formatPoundsExact(amount)}</strong> to ${charityLabel}, in honour of ${name}. favpoll takes no fee — 100% of your pledge goes to charity.</p>${
        closesDate
          ? `<p style="margin:0;">The poll closes on ${escapeHtml(closesDate)}. Until then, your favourite stands in the running.</p>`
          : ""
      }`,
      cta: { label: `Return to ${protagonistName}'s favpoll`, url: favpollUrl },
      footnoteHtml: `You can <a href="${withdrawUrl}" style="color:#534AB7;">withdraw your pledge</a> any time before the poll closes. <a href="${BASE_URL}/sign-up" style="color:#534AB7;">Create an account</a> with this address to keep your pledges together. If you did not make this pledge, you can safely ignore this email.`,
    }),
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
  const resultsUrl = `${BASE_URL}/favpolls/${favpollId}`
  const name = escapeHtml(protagonistName)

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your favpoll for ${protagonistName} has closed`,
    html: renderEmail({
      preheader: `${formatPoundsExact(totalRaised)} raised in ${protagonistName}'s name.`,
      heading: "The poll has closed.",
      bodyHtml: `<p style="margin:0 0 12px;">Your favpoll for <strong>${name}</strong> raised <strong>${formatPoundsExact(totalRaised)}</strong> for charity.</p><p style="margin:0;">Every guest's favourite now stands in the final rankings — a small, lasting record from a day that mattered.</p>`,
      cta: { label: "See the final rankings", url: resultsUrl },
    }),
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
  const favpollUrl = `${BASE_URL}/favpolls/${favpollId}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New item added to your ${topicTitle} poll`,
    html: renderEmail({
      preheader: `A guest added “${itemLabel}”.`,
      heading: "A guest added a favourite.",
      bodyHtml: `<p style="margin:0;">Someone added <strong>“${escapeHtml(itemLabel)}”</strong> to the ${escapeHtml(topicTitle)} poll on your ${escapeHtml(openingLine)} for ${escapeHtml(protagonistName)}.</p>`,
      cta: { label: "View your favpoll", url: favpollUrl },
    }),
  })
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
  const favpollUrl = `${BASE_URL}/favpolls/${favpollId}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: supportEmail,
    subject: `Extension request — favpoll ${favpollId}`,
    html: renderEmail({
      heading: "Extension request",
      bodyHtml: `<p style="margin:0 0 12px;"><strong>Organiser:</strong> ${escapeHtml(organizerName ?? "Unknown")} (${escapeHtml(organizerEmail)})</p><p style="margin:0 0 12px;"><strong>Favpoll:</strong> <a href="${favpollUrl}" style="color:#534AB7;">${favpollUrl}</a></p><p style="margin:0;">${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }),
  })
}

type ContactMessageParams = {
  name: string
  email: string
  /** Optional self-description, e.g. "a charity"; empty string when unset. */
  role: string
  message: string
}

// Routes a public contact-form submission to the team inbox. All fields are
// user-supplied, so every value is escaped; replyTo lets you answer directly.
export async function sendContactMessage(params: ContactMessageParams) {
  const { name, email, role, message } = params
  const to =
    process.env.CONTACT_EMAIL ?? process.env.SUPPORT_EMAIL ?? FROM_EMAIL

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: email,
    subject: `Contact form — ${name}`,
    html: renderEmail({
      heading: "New message via the contact form",
      bodyHtml: `<p style="margin:0 0 12px;"><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>${
        role
          ? `<p style="margin:0 0 12px;"><strong>Getting in touch as:</strong> ${escapeHtml(role)}</p>`
          : ""
      }<p style="margin:0;">${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
    }),
  })
}

/**
 * Sent when a new account's verified email matches existing guest pledges
 * and they are linked to the account (Clerk webhook). The notification is
 * the shared-inbox safeguard: a wrongful claim is at least visible to
 * whoever holds the address.
 */
export async function sendPledgesClaimed(to: string, count: number) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your pledges are now linked to your favpoll account",
    html: renderEmail({
      preheader:
        "Guest pledges made with this address now live in your account.",
      heading: "Your pledges, together.",
      bodyHtml: `<p style="margin:0 0 12px;">${
        count === 1
          ? "A pledge you made as a guest with this email address"
          : `${count} pledges you made as a guest with this email address`
      } ${count === 1 ? "is" : "are"} now linked to your new favpoll account. Your withdrawal links still work, and nothing changes about where your pledges go.</p>`,
      cta: { label: "See your pledges", url: `${BASE_URL}/my-favpolls` },
      footnoteHtml: `If you did not create this account, contact us by replying to this email.`,
    }),
  })
}
