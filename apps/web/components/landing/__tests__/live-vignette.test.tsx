import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

import { LiveVignette } from "../live-vignette"

// The vignette is a picture of the live display, aria-hidden — but the
// display's own controls are real buttons, and aria-hidden alone left
// them in the Tab order (axe aria-hidden-focus on the home page, a11y
// audit 2026-10-19). `inert` takes them out of it.
describe("LiveVignette — hidden from AT and from the keyboard", () => {
  it("the aria-hidden wrapper is also inert, so nothing inside can take focus", () => {
    const { container } = render(<LiveVignette still room />)
    const inert = container.querySelector('[aria-hidden="true"][inert]')
    expect(inert).not.toBeNull()
    // Every focusable control the picture contains sits under an inert
    // ancestor, so none of them can take focus.
    const focusables = container.querySelectorAll(
      "button, a[href], input, select, textarea, [tabindex]"
    )
    expect(focusables.length).toBeGreaterThan(0)
    for (const el of focusables) expect(el.closest("[inert]")).not.toBeNull()
  })
})
