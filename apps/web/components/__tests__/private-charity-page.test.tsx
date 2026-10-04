import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PrivateCharityPage } from "@/components/private-charity-page"
import type { PrivateCharityPage as PrivatePage } from "@/lib/charity-profile-page"

const base: PrivatePage = {
  registeredNumber: "1146792",
  name: "The Arts Council Of England",
  registerName: "THE ARTS COUNCIL OF ENGLAND",
  registerStatus: "Registered",
  removedOn: null,
  place: "Manchester, Greater Manchester",
  website: "www.artscouncil.org.uk",
  activities: "We champion, develop and invest in artistic experiences.",
  objects: "To develop and improve the knowledge of the arts.",
  latestIncome: 893_000_000,
  financialYearEnd: "2026-03-31",
  registeredOn: "1994-04-01",
  topicFamily: "Books & Arts",
  suggestedTopic: "Painter or artist",
  suggestedSubset: null,
  suggestionReason:
    "Arts Council England invests in artists, so guests naturally think of a favourite painter.",
  signatureEvents: [],
  imageUrl: null,
  imageSource: null,
  profileStatus: "drafted",
  account: null,
}

const page = (over: Partial<PrivatePage> = {}): PrivatePage => ({
  ...base,
  ...over,
})

describe("PrivateCharityPage", () => {
  // The one thing this page must never do is imply an endorsement.
  it("says it is not public, and why, before anything else", () => {
    render(<PrivateCharityPage page={page()} contactEmail="hello@x.com" />)
    expect(screen.getByText("This page is not public")).toBeInTheDocument()
    expect(screen.getByText(/no favpoll account yet/i)).toBeInTheDocument()
    expect(
      screen.getByText(/nothing here is an endorsement/i)
    ).toBeInTheDocument()
  })

  it("gives the reason the consent doctrine gives", () => {
    render(
      <PrivateCharityPage
        page={page({
          account: { id: "c1", isActive: false, consentStatus: "pending" },
        })}
        contactEmail="hello@x.com"
      />
    )
    expect(screen.getByText(/agreement is still pending/i)).toBeInTheDocument()
  })

  it("names a removal as a removal", () => {
    render(
      <PrivateCharityPage
        page={page({ registerStatus: "Removed", removedOn: "2023-02-16" })}
        contactEmail="hello@x.com"
      />
    )
    expect(
      screen.getByText(/register has removed this charity/i)
    ).toBeInTheDocument()
  })

  it("renders the charity's own words and the register's own facts", () => {
    render(<PrivateCharityPage page={page()} contactEmail="hello@x.com" />)
    expect(
      screen.getByText(/champion, develop and invest/i)
    ).toBeInTheDocument()
    expect(screen.getByText("Registered charity 1146792")).toBeInTheDocument()
    // The facts card renders twice on purpose — the rail hides on mobile,
    // so the page surfaces it inline too, exactly as the account page
    // does. Both copies must say the same thing.
    // The house date format: ordinal, never ISO.
    expect(screen.getAllByText(/the year to 31st March 2026/)).toHaveLength(2)
    expect(screen.getAllByText("£893,000,000")).toHaveLength(2)
    expect(screen.getAllByText("Manchester, Greater Manchester")).toHaveLength(
      2
    )
  })

  it("offers the suggested favourite with its reason", () => {
    render(<PrivateCharityPage page={page()} contactEmail="hello@x.com" />)
    expect(screen.getByText("Favourite painter or artist")).toBeInTheDocument()
    expect(
      screen.getByText(/naturally think of a favourite/i)
    ).toBeInTheDocument()
  })

  it("prefers the SUBSET when one was suggested", () => {
    render(
      <PrivateCharityPage
        page={page({ suggestedSubset: "Funeral flower" })}
        contactEmail="hello@x.com"
      />
    )
    expect(screen.getByText("Favourite funeral flower")).toBeInTheDocument()
  })

  // The register-only page: no profile has been written yet.
  it("renders from the register alone, saying what it does not know", () => {
    render(
      <PrivateCharityPage
        page={page({
          topicFamily: null,
          suggestedTopic: null,
          suggestionReason: null,
          profileStatus: null,
        })}
        contactEmail="hello@x.com"
      />
    )
    expect(screen.getByText("Registered charity 1146792")).toBeInTheDocument()
    expect(screen.getByText(/have not picked a favourite/i)).toBeInTheDocument()
    // And it never claims a topic it has not got.
    expect(screen.queryByText(/^Favourite /)).not.toBeInTheDocument()
  })

  it("falls back to the rule floor's family when there is no topic yet", () => {
    render(
      <PrivateCharityPage
        page={page({ suggestedTopic: null, suggestionReason: null })}
        contactEmail="hello@x.com"
      />
    )
    expect(
      screen.getByText(/suit books & arts favourites/i)
    ).toBeInTheDocument()
  })

  // Each kind of image where its own shape works: measured on the first
  // real run, most og:images are 1200x630 hero photos, and a photo shrunk
  // into the square logo box is a strip in a field of whitespace.
  it("puts a favicon in the logo box — it is a mark", () => {
    render(
      <PrivateCharityPage
        page={page({
          imageUrl: "https://example.org/apple-touch-icon.png",
          imageSource: "favicon",
        })}
        contactEmail="hello@x.com"
      />
    )
    const img = screen.getByAltText("The Arts Council Of England")
    expect(img).toHaveAttribute(
      "src",
      "https://example.org/apple-touch-icon.png"
    )
    expect(img.className).toMatch(/rounded-xl/)
    expect(img.className).not.toMatch(/aspect-/)
  })

  it("puts an og:image in the banner, in the shape it was cut for", () => {
    render(
      <PrivateCharityPage
        page={page({
          imageUrl: "https://example.org/open-graph.jpg",
          imageSource: "og",
        })}
        contactEmail="hello@x.com"
      />
    )
    const banner = screen.getByAltText(
      "The Arts Council Of England, from their own site"
    )
    expect(banner.className).toMatch(/aspect-\[1\.91\/1\]/)
    // ...and the logo box keeps its initial tile rather than letterboxing
    // the same photo into a square.
    expect(
      screen.queryByAltText("The Arts Council Of England")
    ).not.toBeInTheDocument()
  })

  it("shows the events read from the charity's own site", () => {
    render(
      <PrivateCharityPage
        page={page({
          signatureEvents: [
            {
              name: "Big Garden Birdwatch",
              kind: "appeal",
              when: "January",
              occasionType: null,
              topic: "Bird",
              sourceUrl: "https://example.org/events",
            },
          ],
        })}
        contactEmail="hello@x.com"
      />
    )
    expect(screen.getByText("Big Garden Birdwatch")).toBeInTheDocument()
    expect(screen.getByText(/appeal · January/)).toBeInTheDocument()
    expect(
      screen.getByText(/Favourite bird would suit it/i)
    ).toBeInTheDocument()
  })
})
