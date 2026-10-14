import type { SignatureEvent } from "@favpoll/types";

// ─── The outreach emails, as data ────────────────────────────────────────────
//
// These bodies lived inside consent-queue.tsx and returned a finished
// `mailto:` URL — percent-encoded, one charity at a time, visible only by
// opening a draft in the team's own mail client. So the only way to read one
// was to send-adjacent: open it, look, close it. Forty-two charities cannot be
// checked that way, and 171,886 certainly cannot.
//
// The founder asked for exactly this (2026-10-07): "we should make it possible
// to cycle though what the email looks like for every charity so we can
// preview any issues."
//
// So the builders now return SUBJECT, BODY and RECIPIENT as data, and the
// mailto is assembled from that at the last moment. The queue behaves exactly
// as before — the words are unchanged, and must stay unchanged: they are the
// founder's, approved 2026-09-18 for the welcome and carried from web #868 for
// the invite.
//
// THE INVITE'S COPY IS KNOWN TO BE WRONG FOR COLD OUTREACH. It says "An
// organiser has picked <charity>", which is true in the consent queue (that
// queue only lists charities already on a favpoll) and false for a cold
// approach. Rewriting it waits on the rail: under the GoFundMe arrangement the
// invite stops asking permission and starts making an offer. The preview
// exists so the rewrite can be read against every charity before it is sent.

/** Everything the two emails interpolate. Structural on purpose, so a
 *  ConsentQueueRow satisfies it and the preview can pass a narrower row. */
export type OutreachRow = {
  name: string;
  registered_email: string | null;
  signature_events: SignatureEvent[] | null;
  perfect_topic_title: string | null;
  perfect_subset_title: string | null;
  perfect_topic_reason: string | null;
};

export type OutreachEmail = {
  /** Null when the register holds no public address: the mailto then opens
   *  with an EMPTY recipient, which is the failure the preview is for. */
  to: string | null;
  subject: string;
  body: string;
};

export function inviteEmail(row: OutreachRow): OutreachEmail {
  return {
    to: row.registered_email,
    subject: `Receiving pledges through favpoll — ${row.name}`,
    body: [
      "Hello,",
      "",
      `favpoll (https://favpoll.com) is a pledge poll for occasions — guests pick a favourite and pledge money, and everything raised goes to a chosen charity. An organiser has picked ${row.name} to receive what their favpoll raises.`,
      "",
      "Before any money is collected, we ask each charity to confirm it's happy to receive donations this way. Could you confirm by reply? We'll follow up with the details.",
      "",
      "Thank you,",
      "The favpoll team",
    ].join("\n"),
  };
}

// The WELCOME follows Approve (founder, 2026-09-18): the invite stays a
// single ask, and the promised "details" get an artefact — the three
// optional enrichments a charity can hand us (suggested topics, impact
// lines, logo), which otherwise nobody remembers to collect.
export function welcomeEmail(row: OutreachRow): OutreachEmail {
  // The charity's own signature event, when its site showed one, is the
  // strongest hook: it names the occasion as well as the favourite.
  const event = row.signature_events?.find((e) => e.topic) ?? null;
  return {
    to: row.registered_email,
    subject: `Welcome to favpoll — ${row.name}`,
    body: [
      "Hello,",
      "",
      `Thank you for confirming — ${row.name} can now receive pledges through favpoll, and everything raised is passed on when each favpoll closes.`,
      "",
      ...(event
        ? [
            `We noticed your ${event.name}${event.when ? ` (${event.when})` : ""}: a favpoll on favourite ${event.topic!.toLowerCase()} would suit it, and we can set one up for you to share.`,
            "",
          ]
        : []),
      "Three optional things that make your favpolls work harder — just reply with any of them:",
      "",
      // The charity's own topic, when an admin has confirmed one: offered,
      // with the reason, and theirs to overrule (founder, 2026-09-25).
      row.perfect_topic_title
        ? `1. Your topic — we've set up Favourite ${(row.perfect_subset_title ?? row.perfect_topic_title).toLowerCase()} as the topic we suggest to organisers raising for you${row.perfect_topic_reason ? `: ${row.perfect_topic_reason.replace(/\.$/, "")}` : ""}. Reply if you'd rather another, or add more.`
        : "1. Suggested topics — poll topics you'd like us to suggest to organisers raising for you (some charities suit certain favourites: a hospice might pick Comfort food, a rescue might pick Dog breed).",
      "2. Impact lines — one or two short sentences like “£20 funds an hour of care”, shown to guests as they pick an amount.",
      "3. Your logo — shown wherever your charity is named.",
      "",
      "Thank you,",
      "The favpoll team",
    ].join("\n"),
  };
}

/** The mailto the team's mail client opens. An absent recipient is passed
 *  through as an empty address rather than guessed at — the draft opening
 *  with nobody in the To field is the honest result. */
export function mailtoFor(email: OutreachEmail): string {
  return `mailto:${encodeURIComponent(email.to ?? "")}?subject=${encodeURIComponent(
    email.subject,
  )}&body=${encodeURIComponent(email.body)}`;
}

export const OUTREACH_KINDS = ["invite", "welcome"] as const;
export type OutreachKind = (typeof OUTREACH_KINDS)[number];

export function outreachEmail(
  kind: OutreachKind,
  row: OutreachRow,
): OutreachEmail {
  return kind === "invite" ? inviteEmail(row) : welcomeEmail(row);
}
