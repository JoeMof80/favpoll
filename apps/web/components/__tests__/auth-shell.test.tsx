import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { AuthShell } from "@/components/auth-shell"

describe("AuthShell", () => {
  it("is the page's main landmark and the skip link's target", () => {
    render(
      <AuthShell>
        <p>card</p>
      </AuthShell>
    )
    const main = screen.getByRole("main")
    expect(main).toHaveAttribute("id", "main")
    expect(main).toHaveAttribute("tabindex", "-1")
    expect(main).toHaveTextContent("card")
  })
})
