import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { HonourStep } from "../honour-step"

const DEFAULT_VALUE = {
  category: null as null,
  grouping: "individual" as const,
  subject: "someone" as const,
  causeLabel: "",
}

// ToggleGroup with type="single" renders items as role="radio" with aria-checked.

describe("HonourStep — subject row", () => {
  it("renders all four subject options", () => {
    render(<HonourStep value={DEFAULT_VALUE} onChange={() => {}} />)
    expect(
      screen.getByRole("radio", { name: "An individual" })
    ).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "A couple" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "A group" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "A cause" })).toBeInTheDocument()
  })

  it("calls onChange with subject='cause' when A cause is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "A cause" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "cause" })
    )
  })

  it("calls onChange with subject='someone' and correct grouping when A couple is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "A couple" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "someone", grouping: "couple" })
    )
  })

  it("calls onChange with grouping='group' when A group is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("radio", { name: "A group" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "someone", grouping: "group" })
    )
  })

  it("shows self-honour note when individual+someone is selected", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, grouping: "individual", subject: "someone" }}
        onChange={() => {}}
      />
    )
    expect(screen.getByText(/Self-honours welcome/)).toBeInTheDocument()
  })

  it("hides self-honour note when A cause is active", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={() => {}}
      />
    )
    expect(screen.queryByText(/Self-honours welcome/)).not.toBeInTheDocument()
  })

  it("hides self-honour note when couple is selected", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, grouping: "couple", subject: "someone" }}
        onChange={() => {}}
      />
    )
    expect(screen.queryByText(/Self-honours welcome/)).not.toBeInTheDocument()
  })

  it("An individual item has aria-checked=true when individual+someone is selected", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, grouping: "individual", subject: "someone" }}
        onChange={() => {}}
      />
    )
    const btn = screen.getByRole("radio", { name: "An individual" })
    expect(btn).toHaveAttribute("aria-checked", "true")
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

describe("HonourStep — cause label input", () => {
  it("shows cause label input when subject is cause", () => {
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause" }}
        onChange={() => {}}
      />
    )
    expect(
      screen.getByLabelText("What are you raising for?")
    ).toBeInTheDocument()
  })

  it("does not show cause label input when subject is someone", () => {
    render(<HonourStep value={DEFAULT_VALUE} onChange={() => {}} />)
    expect(
      screen.queryByLabelText("What are you raising for?")
    ).not.toBeInTheDocument()
  })

  it("calls onChange with updated causeLabel on input change", () => {
    const onChange = vi.fn()
    render(
      <HonourStep
        value={{ ...DEFAULT_VALUE, subject: "cause", causeLabel: "" }}
        onChange={onChange}
      />
    )
    const input = screen.getByLabelText("What are you raising for?")
    fireEvent.change(input, { target: { value: "40 years of Shelter" } })
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ causeLabel: "40 years of Shelter" })
    )
  })

  it("reflects the current causeLabel value", () => {
    render(
      <HonourStep
        value={{
          ...DEFAULT_VALUE,
          subject: "cause",
          causeLabel: "Ocean Trust",
        }}
        onChange={() => {}}
      />
    )
    const input = screen.getByLabelText(
      "What are you raising for?"
    ) as HTMLInputElement
    expect(input.value).toBe("Ocean Trust")
  })

  it("causeLabel is preserved when category changes", () => {
    const onChange = vi.fn()
    render(
      <HonourStep
        value={{
          ...DEFAULT_VALUE,
          subject: "cause",
          causeLabel: "Save the bees",
        }}
        onChange={onChange}
      />
    )
    fireEvent.click(screen.getByRole("radio", { name: "Memorial" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "cause",
        causeLabel: "Save the bees",
        category: "memorial",
      })
    )
  })
})
