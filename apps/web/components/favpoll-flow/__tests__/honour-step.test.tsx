import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { HonourStep } from "../honour-step"

const DEFAULT_VALUE = {
  category: null as null,
  grouping: "individual" as const,
  subject: "someone" as const,
  pronoun: undefined as undefined,
}

// ToggleGroup with type="single" renders items as role="radio" with aria-checked.

describe("HonourStep — who row", () => {
  it("renders all six who options", () => {
    render(<HonourStep value={DEFAULT_VALUE} onChange={() => {}} />)
    expect(screen.getByRole("radio", { name: "He" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "She" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "They" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "A couple" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "A group" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "A cause" })).toBeInTheDocument()
  })

  it("calls onChange with pronoun='he' when He is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "He" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "someone",
        grouping: "individual",
        pronoun: "he",
      })
    )
  })

  it("calls onChange with pronoun='she' when She is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "She" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pronoun: "she" })
    )
  })

  it("calls onChange with pronoun='they' when They is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "They" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ pronoun: "they" })
    )
  })

  it("calls onChange with subject='cause' and pronoun=undefined when A cause is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "A cause" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "cause",
        grouping: "individual",
        pronoun: undefined,
      })
    )
  })

  it("calls onChange with grouping='couple' and pronoun=undefined when A couple is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "A couple" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "someone",
        grouping: "couple",
        pronoun: undefined,
      })
    )
  })

  it("calls onChange with grouping='group' when A group is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "A group" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "someone",
        grouping: "group",
        pronoun: undefined,
      })
    )
  })

  it("He item has aria-checked=true when pronoun='he' is selected", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, pronoun: "he" }}
        onChange={() => {}}
      />
    )
    expect(screen.getByRole("radio", { name: "He" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(screen.getByRole("radio", { name: "She" })).toHaveAttribute(
      "aria-checked",
      "false"
    )
  })

  it("A cause item has aria-checked=true when subject='cause'", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={() => {}}
      />
    )
    expect(screen.getByRole("radio", { name: "A cause" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
  })

  it("no who option is checked when nothing is selected", () => {
    render(<HonourStep value={DEFAULT_VALUE} onChange={() => {}} />)
    const whoOptions = ["He", "She", "They", "A couple", "A group", "A cause"]
    whoOptions.forEach((name) => {
      expect(screen.getByRole("radio", { name })).toHaveAttribute(
        "aria-checked",
        "false"
      )
    })
  })

  it("does not render a cause label input", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={() => {}}
      />
    )
    expect(
      screen.queryByLabelText("What are you raising for?")
    ).not.toBeInTheDocument()
  })
})

describe("HonourStep — category row", () => {
  it("renders all three category options", () => {
    render(<HonourStep value={DEFAULT_VALUE} onChange={() => {}} />)
    expect(
      screen.getByRole("radio", { name: "Celebration" })
    ).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Memorial" })).toBeInTheDocument()
    expect(
      screen.getByRole("radio", { name: "Fundraiser" })
    ).toBeInTheDocument()
  })

  it("calls onChange with the selected category", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "Memorial" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ category: "memorial" })
    )
  })

  it("preserves subject when category changes", () => {
    const onChange = vi.fn()
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "Fundraiser" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "cause", category: "fundraiser" })
    )
  })

  it("category row is always visible regardless of subject", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={() => {}}
      />
    )
    expect(
      screen.getByRole("radio", { name: "Celebration" })
    ).toBeInTheDocument()
  })

  it("selected category item has aria-checked=true", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, category: "celebration" }}
        onChange={() => {}}
      />
    )
    expect(screen.getByRole("radio", { name: "Celebration" })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    expect(screen.getByRole("radio", { name: "Memorial" })).toHaveAttribute(
      "aria-checked",
      "false"
    )
  })
})
