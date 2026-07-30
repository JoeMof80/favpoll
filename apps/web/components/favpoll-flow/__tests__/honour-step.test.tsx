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
    expect(screen.getByRole("radio", { name: "Pair" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Group" })).toBeInTheDocument()
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

  it("clicking A cause sets subject='cause' with category=null — a cause has no type", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "A cause" }))
    expect(onChange).toHaveBeenCalledWith({
      category: null,
      subject: "cause",
      grouping: "individual",
      pronoun: undefined,
    })
  })

  it("leaving A cause for a person starts the person path with no type chosen", () => {
    const onChange = vi.fn()
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause", category: null }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "She" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "someone",
        pronoun: "she",
        category: null,
      })
    )
  })

  it("switching between person options keeps a chosen category", () => {
    const onChange = vi.fn()
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, pronoun: "he", category: "memorial" }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "Group" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ grouping: "group", category: "memorial" })
    )
  })

  it("calls onChange with grouping='couple' and pronoun=undefined when Pair is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "Pair" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "someone",
        grouping: "couple",
        pronoun: undefined,
      })
    )
  })

  it("calls onChange with grouping='group' when Group is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "Group" }))
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
    const whoOptions = ["He", "She", "They", "Pair", "Group", "A cause"]
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
        value={{ ...DEFAULT_VALUE, pronoun: "they" }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "Fundraiser" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "someone", category: "fundraiser" })
    )
  })

  it("category row stays live and unselected for a cause", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause", category: null }}
        onChange={() => {}}
      />
    )
    // Every chip stays enabled (any-order answering is the step's grammar)…
    for (const name of ["Celebration", "Memorial", "Fundraiser"]) {
      expect(screen.getByRole("radio", { name })).toBeEnabled()
    }
    // …and nothing shows selected — a cause carries category=null.
    expect(screen.getByRole("radio", { name: "Fundraiser" })).toHaveAttribute(
      "aria-checked",
      "false"
    )
  })

  it("clicking a type chip while A cause is selected hops back to the person path", () => {
    const onChange = vi.fn()
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause", category: null }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "Memorial" }))
    expect(onChange).toHaveBeenCalledWith({
      category: "memorial",
      subject: "someone",
      grouping: "individual",
      pronoun: undefined,
    })
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
