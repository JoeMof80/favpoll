// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { HeroLayout } from "@/components/hero-layout"

// The hero reads the scroll root and watches its own band; neither is
// what these tests are about.
vi.mock("@/components/shell-scroller", () => ({
  useScrollRoot: () => ({ headerInset: 0 }),
  useScrollEdges: () => ({ top: false }),
}))

const BASE = {
  eyebrowText: <span>In support of</span>,
  title: <h1>Undercover</h1>,
  about: <p>Twelve songs.</p>,
}

const BANNER = "https://cdn.example/hall.jpg"

/** The banner image, found by the only thing that identifies it: it is
 *  decorative, so it has an empty alt and no accessible name. */
function bannerImage(container: HTMLElement) {
  return container.querySelector(`img[src="${BANNER}"]`)
}

describe("HeroLayout — the banner image", () => {
  it("shows the wide image when one is given", () => {
    const { container } = render(<HeroLayout {...BASE} bannerUrl={BANNER} />)
    const img = bannerImage(container)
    expect(img).toBeTruthy()
    // Decorative: the name beside it already says what the favpoll is,
    // and an organiser's filename is not a description.
    expect(img).toHaveAttribute("alt", "")
    expect(img?.className).toContain("object-cover")
  })

  // THE EMPTY STATE IS THE WHOLE REASON THIS SHAPE WAS CHOSEN (founder,
  // 2026-10-30). The image sits in ordinary flow, so the text below is
  // pushed down by the image's own height. No banner, no image, nothing
  // to unwind — the hero renders exactly as it did before banners
  // existed, and no placeholder has to be designed for its absence.
  it("renders nothing at all in its place when there is no banner", () => {
    const { container } = render(<HeroLayout {...BASE} />)
    expect(bannerImage(container)).toBeNull()
    expect(container.querySelectorAll("img")).toHaveLength(0)
    expect(screen.getByText("Undercover")).toBeInTheDocument()
    expect(screen.getByText("In support of")).toBeInTheDocument()
  })

  it("treats null and empty string as no banner", () => {
    const { container: a } = render(<HeroLayout {...BASE} bannerUrl={null} />)
    expect(a.querySelectorAll("img")).toHaveLength(0)
    const { container: b } = render(<HeroLayout {...BASE} bannerUrl="" />)
    expect(b.querySelectorAll("img")).toHaveLength(0)
  })

  // Text over the image was tried across six variants and rejected: a
  // veil tuned for one photograph cannot be trusted on an organiser's
  // unvetted upload. So the image must come BEFORE the text in the
  // document, never behind it.
  it("puts the image before the hero's text, never behind it", () => {
    const { container } = render(<HeroLayout {...BASE} bannerUrl={BANNER} />)
    const img = bannerImage(container)!
    const title = screen.getByText("Undercover")
    expect(img.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it("bleeds past the column's gutters, as the band does", () => {
    const { container } = render(<HeroLayout {...BASE} bannerUrl={BANNER} />)
    expect(bannerImage(container)?.parentElement?.className).toContain("-mx-6")
  })

  // THE BAND STAYS, THE BANNER SITS BENEATH IT (founder, 2026-10-30,
  // settling it after a sticky collapse and a scroll fade were tried and
  // withdrawn). The tint is present with a banner exactly as without,
  // and the pinned box keeps its one shape — fixed below the shell
  // breakpoint, sticky from it — because the banner is not inside it.
  it("keeps the tinted band above the banner, and the box its shape", () => {
    const { container } = render(
      <HeroLayout {...BASE} pins bannerUrl={BANNER} />
    )
    const band = container.querySelector(".h-14.bg-background")
    expect(band).not.toBeNull()
    const img = bannerImage(container)!
    expect(band!.compareDocumentPosition(img)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(band!.closest("[class*='max-shell:fixed']")).not.toBeNull()
    expect(img.closest("[class*='max-shell:fixed']")).toBeNull()
  })

  // Off the band the avatar landed on the roofline the organiser had
  // just framed, so with a banner it starts at the banner's lower edge —
  // and PINS at the band's own avatar line as the banner scrolls under
  // (founder, 2026-10-30: scrolling should arrive at the no-banner page).
  // The pin itself is layout; here it is the construction: a sticky
  // sibling after the banner, outside the band's pinned box, at the
  // band's tier.
  it("pins the avatar as a sticky sibling of the banner, not inside the band", () => {
    const { container } = render(
      <HeroLayout {...BASE} pins bannerUrl={BANNER} avatar={<span>av</span>} />
    )
    const img = bannerImage(container)!
    const av = screen
      .getByText("av")
      .closest<HTMLElement>("[class*='size-20']")!
    expect(av.className).toContain("sticky")
    expect(av.className).toContain("z-30")
    expect(img.compareDocumentPosition(av)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(av.closest("[class*='max-shell:fixed']")).toBeNull()
    expect(
      container
        .querySelector(".h-14.bg-background")
        ?.parentElement?.querySelector("[class*='size-20']")
    ).toBeNull()
    // Zero height in flow: nothing beneath it moves.
    expect(av.style.marginTop).toBe("-40px")
    expect(av.style.marginBottom).toBe("-40px")
  })

  it("keeps the tinted band when there is no banner", () => {
    const { container } = render(<HeroLayout {...BASE} pins />)
    expect(container.querySelector(".h-14.bg-background")).not.toBeNull()
  })
})

// THE LIGHTBOX (founder, 2026-10-30: "make the image and banner open in
// dialog on click"). Avatar and banner are tap targets on the guest page
// (`pins`) and plain on the room's screen, which nobody taps. The dialog
// shows the stored crop, larger.
describe("HeroLayout — the lightbox", () => {
  const PHOTO = "https://cdn.example/face.jpg"

  it("opens the avatar's photo in a dialog on the guest page", () => {
    render(
      <HeroLayout {...BASE} pins photoUrl={PHOTO} avatar={<span>av</span>} />
    )
    expect(screen.queryByRole("dialog")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "View photo" }))
    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(dialog.querySelector(`img[src="${PHOTO}"]`)).toBeTruthy()
    expect(screen.getByText("Photo")).toBeInTheDocument()
  })

  it("opens the banner in the same dialog", () => {
    render(<HeroLayout {...BASE} pins bannerUrl={BANNER} />)
    fireEvent.click(screen.getByRole("button", { name: "View banner" }))
    const dialog = screen.getByRole("dialog")
    expect(dialog.querySelector(`img[src="${BANNER}"]`)).toBeTruthy()
    expect(screen.getByText("Banner")).toBeInTheDocument()
  })

  it("offers no tap targets on the room's screen", () => {
    render(
      <HeroLayout
        {...BASE}
        photoUrl={PHOTO}
        bannerUrl={BANNER}
        avatar={<span>av</span>}
      />
    )
    expect(screen.queryByRole("button", { name: "View photo" })).toBeNull()
    expect(screen.queryByRole("button", { name: "View banner" })).toBeNull()
  })

  // Measured on the page: Escape left focus on <body>. The keyboard loop
  // has to land back on the button that opened the dialog. Radix restores
  // focus from a zero-delay timeout after the content unmounts, so the
  // assertion waits rather than running a tick early.
  it("returns focus to the button that opened it when closed", async () => {
    render(<HeroLayout {...BASE} pins bannerUrl={BANNER} />)
    const button = screen.getByRole("button", { name: "View banner" })
    button.focus()
    fireEvent.click(button)
    const dialog = screen.getByRole("dialog")
    expect(document.activeElement).not.toBe(button)
    fireEvent.keyDown(dialog, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(button))
  })

  it("has no photo button when there is no photo to show", () => {
    render(<HeroLayout {...BASE} pins avatar={<span>av</span>} />)
    expect(screen.queryByRole("button", { name: "View photo" })).toBeNull()
    expect(screen.getByText("av")).toBeInTheDocument()
  })
})
