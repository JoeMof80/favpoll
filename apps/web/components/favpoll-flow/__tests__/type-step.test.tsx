import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TypeStep } from "../type-step"

const DEFAULT_VALUE = {
  category: null as null,
  grouping: "individual" as const,
  subject: "someone" as const,
  pronoun: undefined as undefined,
}

// ToggleGroup with type="single" renders items as role="radio" with aria-checked.
// The who refinements (pronoun, pair/group) moved to the form's Generate
// control (2026-07-30) — this step is now type-or-cause only.

describe("TypeStep — category row", () => {
  it("renders all three category options and A cause", () => {
    render(<TypeStep value={DEFAULT_VALUE} onChange={() => {}} />)
    expect(
      screen.getByRole("radio", { name: "Celebration" })
    ).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Memorial" })).toBeInTheDocument()
    expect(
      screen.getByRole("radio", { name: "Fundraiser" })
    ).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Cause" })).toBeInTheDocument()
  })

  it("does not render the who options (moved to the Generate control)", () => {
    render(<TypeStep value={DEFAULT_VALUE} onChange={() => {}} />)
    for (const name of ["He", "She", "They", "Pair", "Group"]) {
      expect(screen.queryByRole("radio", { name })).not.toBeInTheDocument()
    }
  })

  it("calls onChange with the selected category on subject someone", () => {
    const onChange = vi.fn()
    render(<TypeStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "Memorial" }))
    expect(onChange).toHaveBeenCalledWith({
      category: "memorial",
      subject: "someone",
      grouping: "individual",
      pronoun: undefined,
    })
  })

  it("preserves grouping and pronoun when the category changes on the person path", () => {
    const onChange = vi.fn()
    render(
      <TypeStep
        value={{
          category: "celebration",
          subject: "someone",
          grouping: "couple",
          pronoun: undefined,
        }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "Fundraiser" }))
    expect(onChange).toHaveBeenCalledWith({
      category: "fundraiser",
      subject: "someone",
      grouping: "couple",
      pronoun: undefined,
    })
  })

  it("selected category item has aria-checked=true", () => {
    render(
      <TypeStep
        value={{ ...DEFAULT_VALUE, category: "celebration" }}
        onChange={() => {}}
      />
    )
    expect(screen.getByRole("radio", { name: "Celebration" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
  })
})

describe("TypeStep — cause fork", () => {
  it("clicking A cause sets subject='cause' with category=null — a cause has no type", () => {
    const onChange = vi.fn()
    render(
      <TypeStep
        value={{ ...DEFAULT_VALUE, category: "celebration" }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "Cause" }))
    expect(onChange).toHaveBeenCalledWith({
      category: null,
      subject: "cause",
      grouping: "individual",
      pronoun: undefined,
    })
  })

  it("A cause item has aria-checked=true when subject='cause'", () => {
    render(
      <TypeStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={() => {}}
      />
    )
    expect(screen.getByRole("radio", { name: "Cause" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
  })

  it("category row stays live and unselected for a cause", () => {
    render(
      <TypeStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={() => {}}
      />
    )
    for (const name of ["Celebration", "Memorial", "Fundraiser"]) {
      const item = screen.getByRole("radio", { name })
      expect(item).not.toBeDisabled()
      expect(item).toHaveAttribute("aria-checked", "false")
    }
  })

  it("clicking a type chip while A cause is selected hops back to the person path", () => {
    const onChange = vi.fn()
    render(
      <TypeStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "Celebration" }))
    expect(onChange).toHaveBeenCalledWith({
      category: "celebration",
      subject: "someone",
      grouping: "individual",
      pronoun: undefined,
    })
  })

  it("does not render a cause label input", () => {
    render(
      <TypeStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={() => {}}
      />
    )
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })
})
