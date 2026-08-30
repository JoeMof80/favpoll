import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { EventStep } from "../event-step"

// ToggleGroup with type="single" renders items as role="radio".
//
// This step is ONE axis now: what kind of favpoll is this. The whole who
// axis lives in the form's Generate control — pronoun and pair/group since
// 2026-07-30, Cause since 2026-08-25.

describe("EventStep", () => {
  it("renders exactly the three kinds", () => {
    render(<EventStep value={null} onChange={() => {}} />)
    expect(screen.getAllByRole("radio")).toHaveLength(3)
    for (const name of ["Celebration", "Memorial", "Fundraiser"]) {
      expect(screen.getByRole("radio", { name })).toBeInTheDocument()
    }
  })

  // The fork used to live here behind an `or` divider, and it was the
  // conflation being removed: Cause answers WHO, these three answer WHAT
  // KIND, so they were never alternatives.
  it("does not render Cause, or any who option", () => {
    render(<EventStep value={null} onChange={() => {}} />)
    for (const name of ["Cause", "He", "She", "They", "Pair", "Group"]) {
      expect(screen.queryByRole("radio", { name })).not.toBeInTheDocument()
    }
  })

  it("calls onChange with the picked category", () => {
    const onChange = vi.fn()
    render(<EventStep value={null} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "Memorial" }))
    expect(onChange).toHaveBeenCalledWith("memorial")
  })

  it("marks the current value as checked", () => {
    render(<EventStep value="fundraiser" onChange={() => {}} />)
    expect(screen.getByRole("radio", { name: "Fundraiser" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
  })

  // Each kind wears its own register (2026-08-31): the icon and label are
  // purple, magenta, green — the register-ink idiom the header uses.
  it("scopes each kind to its own register palette", () => {
    render(<EventStep value={null} onChange={() => {}} />)
    for (const [name, palette] of [
      ["Celebration", "celebration"],
      ["Memorial", "memorial"],
      ["Fundraiser", "fundraiser"],
    ]) {
      expect(screen.getByRole("radio", { name })).toHaveAttribute(
        "data-register",
        palette
      )
    }
  })

  it("ignores a deselect — the step has no empty answer", () => {
    const onChange = vi.fn()
    render(<EventStep value="memorial" onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "Memorial" }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
