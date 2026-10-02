import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WizardGenerateHelp } from "@/components/new-favpoll-wizard/wizard-generate-help"

describe("WizardGenerateHelp — why Generate asks", () => {
  it("opens to the two panels: the voice, and reveal against outcome", async () => {
    render(<WizardGenerateHelp />)
    await userEvent.click(
      screen.getByRole("button", {
        name: /why generate asks who, and what the picks decide/i,
      })
    )
    expect(await screen.findByText("Who")).toBeInTheDocument()
    expect(screen.getByText("What the picks decide")).toBeInTheDocument()
    // The six voices the menu offers, I first.
    expect(
      screen.getByText("my favourite will be revealed")
    ).toBeInTheDocument()
    expect(screen.getByText("the team's will be revealed")).toBeInTheDocument()
    // The same favpoll both ways.
    expect(screen.getByText("Reveal")).toBeInTheDocument()
    expect(screen.getByText("Outcome")).toBeInTheDocument()
    expect(
      screen.getByText(/the top five are the board on the night/)
    ).toBeInTheDocument()
  })
})
