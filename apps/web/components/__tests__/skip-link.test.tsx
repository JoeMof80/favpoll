import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { SkipLink } from "@/components/skip-link"
import { t } from "@/lib/i18n"

describe("SkipLink", () => {
  it("is a link to #main with the message-file text, hidden until focused", () => {
    render(<SkipLink />)
    const link = screen.getByRole("link", { name: t("a11y.skipToMain") })
    expect(link).toHaveAttribute("href", "#main")
    expect(link.className).toMatch(/\bsr-only\b/)
    expect(link.className).toMatch(/focus:not-sr-only/)
  })
})
