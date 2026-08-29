import { describe, expect, it } from "vitest"
import {
  favpollMetadata,
  favpollOgCard,
  favpollOgDescription,
  favpollOgTitle,
  initialsOf,
  joinCharities,
  PRIVATE_OG,
  type FavpollOgSource,
} from "../favpoll-og"

function person(overrides: Partial<FavpollOgSource> = {}): FavpollOgSource {
  return {
    id: "70f84aa8-9181-4932-91cc-1f24fc4d16e6",
    subject: "someone",
    cause_label: null,
    occasion_type: null,
    opening_line: "In memory of",
    is_private: false,
    is_listed: true,
    closes_at: "2099-01-01T00:00:00Z",
    closed_at: null,
    photo_url: null,
    protagonists: { name: "Donald", photo_url: "https://cdn.test/donald.jpg" },
    favpoll_charities: [{ charities: { name: "Alzheimer's Society" } }],
    favpoll_polls: { topics: { title: "Dinosaur" } },
    ...overrides,
  }
}

function cause(overrides: Partial<FavpollOgSource> = {}): FavpollOgSource {
  return {
    id: "1cedb6d0-d487-49a8-93d7-2b266ee2c089",
    subject: "cause",
    cause_label: "Save the Children",
    occasion_type: null,
    opening_line: null,
    is_private: false,
    is_listed: true,
    closes_at: "2099-01-01T00:00:00Z",
    closed_at: null,
    photo_url: "https://cdn.test/stc.png",
    protagonists: null,
    favpoll_charities: [{ charities: { name: "Save the Children" } }],
    favpoll_polls: [{ topics: { title: "County" } }],
    ...overrides,
  }
}

describe("favpollOgCard", () => {
  it("reads a person favpoll: the organiser's line, the name, the topic lowered, the protagonist's photo", () => {
    const card = favpollOgCard(person())
    expect(card).toMatchObject({
      eyebrow: "In memory of",
      name: "Donald",
      topic: "dinosaur",
      charities: ["Alzheimer's Society"],
      photoUrl: "https://cdn.test/donald.jpg",
      initials: "D",
      isCause: false,
    })
  })

  it("reads a cause favpoll: the register prefix, the cause label, the cause's own photo", () => {
    const card = favpollOgCard(cause())
    expect(card).toMatchObject({
      eyebrow: "In support of",
      name: "Save the Children",
      topic: "county",
      photoUrl: "https://cdn.test/stc.png",
      initials: "ST",
      isCause: true,
    })
  })

  it("accepts favpoll_polls as an object or an array (PostgREST does both)", () => {
    expect(
      favpollOgCard(person({ favpoll_polls: [{ topics: { title: "Song" } }] }))
        .topic
    ).toBe("song")
    expect(favpollOgCard(person({ favpoll_polls: null })).topic).toBeNull()
    expect(
      favpollOgCard(person({ favpoll_polls: { topics: null } })).topic
    ).toBeNull()
  })

  it("falls back when the name is missing", () => {
    const card = favpollOgCard(person({ protagonists: null }))
    expect(card.name).toBe("A favpoll")
    expect(card.photoUrl).toBeNull()
  })

  it("drops charities without a name", () => {
    const card = favpollOgCard(
      person({
        favpoll_charities: [
          { charities: { name: "Mind" } },
          { charities: null },
          { charities: { name: "  " } },
        ],
      })
    )
    expect(card.charities).toEqual(["Mind"])
  })
})

describe("title and description", () => {
  it("titles the way the share sheet does", () => {
    expect(favpollOgTitle(favpollOgCard(person()))).toBe("Donald — favpoll")
  })

  it("says who, the arc, and where every pound goes", () => {
    expect(favpollOgDescription(favpollOgCard(person()))).toBe(
      "In memory of Donald. Pick your favourite dinosaur, give what it's worth, and every pound goes to Alzheimer's Society."
    )
  })

  it("uses the organiser's own opening line as the eyebrow", () => {
    const card = favpollOgCard(
      person({
        opening_line: "Jumpers on for",
        protagonists: { name: "Madge", photo_url: null },
        favpoll_charities: [{ charities: { name: "Diabetes UK" } }],
        favpoll_polls: { topics: { title: "Comfort food" } },
      })
    )
    expect(favpollOgDescription(card)).toBe(
      "Jumpers on for Madge. Pick your favourite comfort food, give what it's worth, and every pound goes to Diabetes UK."
    )
  })

  it("survives a favpoll with no topic and no charity", () => {
    const card = favpollOgCard(
      person({ favpoll_polls: null, favpoll_charities: [] })
    )
    expect(favpollOgDescription(card)).toBe(
      "In memory of Donald. Pick your favourite, give what it's worth, and every pound goes to charity."
    )
  })

  it("states what happened once the favpoll has closed, by hand or by the clock", () => {
    const now = new Date("2026-08-29T12:00:00Z")
    expect(favpollOgCard(person(), now).isClosed).toBe(false)
    const byHand = favpollOgCard(
      person({ closed_at: "2026-08-20T00:00:00Z" }),
      now
    )
    const byClock = favpollOgCard(
      person({ closes_at: "2026-08-28T00:00:00Z" }),
      now
    )
    expect(byHand.isClosed).toBe(true)
    expect(byClock.isClosed).toBe(true)
    expect(favpollOgDescription(byHand)).toBe(
      "In memory of Donald. This favpoll has closed. Every pound raised goes to Alzheimer's Society."
    )
    expect(
      favpollOgDescription(
        favpollOgCard(
          person({ closed_at: "2026-08-20T00:00:00Z", favpoll_charities: [] }),
          now
        )
      )
    ).toBe(
      "In memory of Donald. This favpoll has closed. Every pound raised goes to charity."
    )
  })

  it("joins two and three charities the list card's way", () => {
    expect(joinCharities(["Mind"])).toBe("Mind")
    expect(joinCharities(["Mind", "Crisis"])).toBe("Mind & Crisis")
    expect(joinCharities(["Mind", "Crisis", "Shelter"])).toBe(
      "Mind, Crisis & Shelter"
    )
    expect(joinCharities([])).toBe("")
  })

  it("takes initials from the first two words", () => {
    expect(initialsOf("Donald")).toBe("D")
    expect(initialsOf("Belinda Hart")).toBe("BH")
    expect(initialsOf("Ending homelessness in the UK")).toBe("EH")
    expect(initialsOf("  ")).toBe("")
  })
})

describe("favpollMetadata", () => {
  it("carries the site identity and the page url into openGraph", () => {
    const meta = favpollMetadata(person())
    expect(meta.title).toBe("Donald — favpoll")
    expect(meta.openGraph).toMatchObject({
      siteName: "favpoll",
      locale: "en_GB",
      type: "website",
      url: "/favpolls/70f84aa8-9181-4932-91cc-1f24fc4d16e6",
      title: "Donald — favpoll",
    })
    expect(meta.robots).toBeUndefined()
  })

  it("previews a private favpoll as nothing more than private, and keeps it out of search", () => {
    const meta = favpollMetadata(person({ is_private: true }))
    expect(meta.title).toBe(PRIVATE_OG.title)
    expect(meta.description).toBe(PRIVATE_OG.description)
    expect(meta.robots).toEqual({ index: false, follow: false })
    expect(JSON.stringify(meta)).not.toContain("Donald")
    expect(JSON.stringify(meta)).not.toContain("donald.jpg")
  })

  it("keeps an unlisted favpoll out of search but previews it in full", () => {
    const meta = favpollMetadata(person({ is_listed: false }))
    expect(meta.robots).toEqual({ index: false })
    expect(meta.title).toBe("Donald — favpoll")
  })

  it("treats a missing is_listed as listed", () => {
    expect(
      favpollMetadata(person({ is_listed: undefined })).robots
    ).toBeUndefined()
    expect(favpollMetadata(person({ is_listed: null })).robots).toBeUndefined()
  })
})
