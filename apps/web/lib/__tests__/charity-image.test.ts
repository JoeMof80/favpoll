import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  faviconCandidates,
  findCharityImage,
  ogImage,
  websiteBase,
} from "@/lib/charity-image"

const base = new URL("https://example.org/")

describe("websiteBase", () => {
  it("takes the register's bare host", () => {
    expect(websiteBase("www.example.org")?.toString()).toBe(
      "https://www.example.org/"
    )
  })

  it("refuses what is not a web address", () => {
    expect(websiteBase(null)).toBeNull()
    expect(websiteBase("")).toBeNull()
    expect(websiteBase("javascript:alert(1)")).toBeNull()
  })
})

describe("ogImage", () => {
  it("reads it in either attribute order, either quote", () => {
    expect(
      ogImage(
        `<meta property="og:image" content="https://cdn.example.org/a.png">`,
        base
      )
    ).toBe("https://cdn.example.org/a.png")
    expect(ogImage(`<meta content='/b.png' property='og:image'>`, base)).toBe(
      "https://example.org/b.png"
    )
  })

  // Found on the first real run: a Drupal-style signed URL came back with
  // a literal "&amp;" in its query string, which is a different URL.
  it("decodes the entities in an attribute value", () => {
    expect(
      ogImage(
        `<meta property="og:image" content="/i/0034.jpg?h=91fcda32&amp;itok=4P7S8ccW">`,
        base
      )
    ).toBe("https://example.org/i/0034.jpg?h=91fcda32&itok=4P7S8ccW")
  })

  it("is null when the page declares none", () => {
    expect(ogImage(`<meta name="description" content="x">`, base)).toBeNull()
  })

  // A data: URL is not the charity's image on the charity's site, and it
  // would be stored in full in a text column.
  it("refuses a data: URL", () => {
    expect(
      ogImage(
        `<meta property="og:image" content="data:image/png;base64,AA">`,
        base
      )
    ).toBeNull()
  })
})

describe("faviconCandidates", () => {
  it("prefers an apple-touch-icon — it is the one made big enough", () => {
    const html = `
      <link rel="icon" href="/favicon-16.png" sizes="16x16">
      <link rel="apple-touch-icon" href="/touch.png">
      <link rel="icon" href="/favicon-192.png" sizes="192x192">`
    expect(faviconCandidates(html, base)[0]).toBe(
      "https://example.org/touch.png"
    )
  })

  it("then the largest declared icon, then the conventional path", () => {
    const html = `
      <link rel="icon" href="/small.png" sizes="16x16">
      <link rel="shortcut icon" href="/big.png" sizes="192x192">`
    expect(faviconCandidates(html, base)).toEqual([
      "https://example.org/big.png",
      "https://example.org/small.png",
      "https://example.org/favicon.ico",
    ])
  })

  it("always ends with /favicon.ico, even on a page declaring nothing", () => {
    expect(faviconCandidates("<html></html>", base)).toEqual([
      "https://example.org/favicon.ico",
    ])
  })
})

describe("findCharityImage", () => {
  const fetchMock = vi.fn()
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => vi.unstubAllGlobals())

  const page = (html: string) => ({
    ok: true,
    headers: new Headers({ "content-type": "text/html" }),
    text: async () => html,
  })
  const image = {
    ok: true,
    headers: new Headers({ "content-type": "image/png" }),
  }
  const notAnImage = {
    ok: true,
    headers: new Headers({ "content-type": "text/html" }),
  }

  // THE LOGO BOX WINS (founder, 2026-10-07): a declared icon beats the
  // og:image, because the icon fills the identity slot beside the name and
  // the og:image only fills a banner above it.
  it("takes a declared icon ahead of the og:image", async () => {
    fetchMock
      .mockResolvedValueOnce(
        page(
          `<meta property="og:image" content="/og.png">
           <link rel="apple-touch-icon" href="/touch.png">`
        )
      )
      .mockResolvedValueOnce(image) // HEAD on the touch icon

    expect(await findCharityImage("example.org")).toEqual({
      url: "https://example.org/touch.png",
      source: "favicon",
    })
  })

  // ...but the CONVENTIONAL /favicon.ico is not a declared icon. It is
  // usually 16 pixels, and 16 pixels in a 132-pixel box is worse than no
  // logo, so a real og:image beats it.
  it("takes the og:image ahead of the bare /favicon.ico", async () => {
    fetchMock
      .mockResolvedValueOnce(
        page(`<meta property="og:image" content="/og.png">`)
      )
      .mockResolvedValueOnce(image) // HEAD on the og:image

    expect(await findCharityImage("example.org")).toEqual({
      url: "https://example.org/og.png",
      source: "og",
    })
  })

  // An og:image that 404s, or redirects to a homepage, must not be stored
  // as a logo: the page would show a broken box to the charity itself.
  it("falls back to /favicon.ico when the og:image is not an image", async () => {
    fetchMock
      .mockResolvedValueOnce(
        page(`<meta property="og:image" content="/gone.png">`)
      )
      // A definite "not an image" is an answer, so there is no GET retry —
      // that only exists for a site answering HEAD with 405.
      .mockResolvedValueOnce(notAnImage) // HEAD on the og:image
      .mockResolvedValueOnce(image) // HEAD on /favicon.ico

    expect(await findCharityImage("example.org")).toEqual({
      url: "https://example.org/favicon.ico",
      source: "favicon",
    })
  })

  it("retries with a one-byte GET when the site refuses HEAD", async () => {
    fetchMock
      .mockResolvedValueOnce(
        page(`<meta property="og:image" content="/og.png">`)
      )
      .mockResolvedValueOnce({ ok: false, headers: new Headers() }) // 405 on og
      .mockResolvedValueOnce(image)

    expect(await findCharityImage("example.org")).toEqual({
      url: "https://example.org/og.png",
      source: "og",
    })
  })

  it("is null when nothing on the site is an image", async () => {
    fetchMock
      .mockResolvedValueOnce(page("<html></html>"))
      .mockResolvedValue(notAnImage)
    expect(await findCharityImage("example.org")).toBeNull()
  })

  it("is null when there is no site to read", async () => {
    expect(await findCharityImage(null)).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  // "No crawling further for a better picture" — one page, and only the
  // image URLs it names.
  it("reads the homepage and nothing else", async () => {
    fetchMock
      .mockResolvedValueOnce(
        page(
          `<a href="/about">About</a><a href="/gallery">Photos</a>
           <meta property="og:image" content="/og.png">`
        )
      )
      .mockResolvedValueOnce(image)

    await findCharityImage("example.org")

    const pagesFetched = fetchMock.mock.calls.filter(
      (c) => (c[1]?.method ?? "GET") === "GET" && !c[1]?.headers?.range
    )
    expect(pagesFetched).toHaveLength(1)
    expect(pagesFetched[0][0]).toBe("https://example.org/")
  })
})
