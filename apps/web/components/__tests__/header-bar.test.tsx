import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { HeaderBar } from "../header-bar"

describe("HeaderBar", () => {
  it("renders the register links in a labelled nav beside the mark, and the section name for mobile", () => {
    render(
      <HeaderBar
        section="For memorials"
        nav={
          <>
            <a href="/memorial" aria-current="page">
              Memorial
            </a>
            <a href="/celebration">Celebration</a>
          </>
        }
      />
    )
    const nav = screen.getByRole("navigation", { name: "Kinds of favpoll" })
    expect(nav).toHaveClass("hidden", "md:flex")
    expect(screen.getByRole("link", { name: "Memorial" })).toHaveAttribute(
      "aria-current",
      "page"
    )
    expect(screen.getByText("For memorials")).toHaveClass("md:hidden")
  })

  it("shows the section name at every width when there is no nav (the static demo header)", () => {
    render(<HeaderBar staticMenu section="For memorials" />)
    expect(screen.queryByRole("navigation")).toBeNull()
    expect(screen.getByText("For memorials")).not.toHaveClass("md:hidden")
  })

  // THE HEADER FOLLOWS THE HOME HERO (2026-10-15): element-scoped, header
  // only. A palette is worn; null (scrolled past) wears none but keeps the
  // slow fade; undefined (no hero on the page) leaves the header alone.
  it("wears the hero's register on itself, element-scoped, with the slow fade", () => {
    const { container } = render(<HeaderBar heroRegister="celebration" />)
    const header = container.querySelector("header")!
    expect(header).toHaveAttribute("data-register", "celebration")
    expect(header).toHaveAttribute("data-hero-fade")
  })

  it("returns to the default once the hero is scrolled past, fade kept", () => {
    const { container } = render(<HeaderBar heroRegister={null} />)
    const header = container.querySelector("header")!
    expect(header).not.toHaveAttribute("data-register")
    expect(header).toHaveAttribute("data-hero-fade")
  })

  it("is untouched on a page with no hero", () => {
    const { container } = render(<HeaderBar />)
    const header = container.querySelector("header")!
    expect(header).not.toHaveAttribute("data-register")
    expect(header).not.toHaveAttribute("data-hero-fade")
  })
})
