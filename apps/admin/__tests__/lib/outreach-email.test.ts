import { describe, it, expect } from "vitest"
import {
  inviteEmail,
  welcomeEmail,
  mailtoFor,
  type OutreachRow,
} from "@/lib/outreach-email"

const base: OutreachRow = {
  name: "St Richard's Hospice",
  registered_email: "hello@example.org",
  signature_events: null,
  perfect_topic_title: null,
  perfect_subset_title: null,
  perfect_topic_reason: null,
}

// Every event below is a real one the reader stored on production.
const halfMarathon = {
  name: "Cardiff Half Marathon",
  kind: "running event",
  when: "October",
  occasionType: "Sponsored event",
  topic: null,
  sourceUrl: "https://example.org/events",
}
const coffeeMorning = {
  name: "Macmillan Coffee Morning",
  kind: "coffee morning",
  when: null,
  occasionType: "Fundraiser",
  topic: "Cake",
  sourceUrl: "https://example.org/events",
}

describe("welcomeEmail's event hook", () => {
  // THE CHANGE OF 2026-10-15. Only 9 of 32 active charities have an event
  // carrying a topic, but 22 have a fundraisable event. The paragraph used to
  // require the topic and vanished silently for the other 13 — half
  // marathons, sponsored walks, carol concerts, which map to no favourite
  // because there is none to pick at a half marathon. Naming the event is
  // the hook; the topic is a bonus.
  it("names an event that maps to no topic, with the general wording", () => {
    const { body } = welcomeEmail({
      ...base,
      signature_events: [halfMarathon],
    })
    expect(body).toContain("We noticed your Cardiff Half Marathon (October)")
    expect(body).toContain("your supporters could each run a favpoll for it")
    expect(body).not.toContain("favourite null")
  })

  it("prefers a topic-matched event and keeps the sharper wording", () => {
    const { body } = welcomeEmail({
      ...base,
      // Listed second, so this proves PREFERENCE rather than order.
      signature_events: [halfMarathon, coffeeMorning],
    })
    expect(body).toContain("We noticed your Macmillan Coffee Morning")
    expect(body).toContain("a favpoll on favourite cake would suit it")
    expect(body).not.toContain("Cardiff Half Marathon")
  })

  it("drops the paragraph only when there is no event at all", () => {
    const none = welcomeEmail({ ...base, signature_events: [] })
    const unread = welcomeEmail({ ...base, signature_events: null })
    for (const { body } of [none, unread]) {
      expect(body).not.toContain("We noticed")
      // The rest of the email still stands.
      expect(body).toContain("Three optional things")
    }
  })
})

describe("the mailto", () => {
  it("addresses nobody rather than guessing when the register has no email", () => {
    const email = inviteEmail({ ...base, registered_email: null })
    expect(email.to).toBeNull()
    expect(mailtoFor(email)).toMatch(/^mailto:\?subject=/)
  })

  it("carries the subject and body as the recipient will read them", () => {
    const email = inviteEmail(base)
    expect(email.subject).toBe(
      "Receiving pledges through favpoll — St Richard's Hospice"
    )
    expect(decodeURIComponent(mailtoFor(email))).toContain(email.body)
  })
})
