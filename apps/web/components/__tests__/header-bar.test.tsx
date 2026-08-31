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
              Memorials
            </a>
            <a href="/celebration">Celebrations</a>
          </>
        }
      />
    )
    const nav = screen.getByRole("navigation", { name: "Kinds of favpoll" })
    expect(nav).toHaveClass("hidden", "md:flex")
    expect(screen.getByRole("link", { name: "Memorials" })).toHaveAttribute(
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
})
