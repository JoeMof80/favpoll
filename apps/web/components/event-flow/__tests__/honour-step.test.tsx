import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { HonourStep } from "../honour-step"

const DEFAULT_VALUE = {
  category: null as null,
  grouping: "individual" as const,
  subject: "someone" as const,
}

describe("HonourStep — subject row", () => {
  it("renders all four subject options", () => {
    render(<HonourStep value={DEFAULT_VALUE} onChange={() => {}} />)
    expect(
      screen.getByRole("button", { name: "An individual" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "A couple" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "A group" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "A cause" })).toBeInTheDocument()
  })

  it("calls onChange with subject='cause' when A cause is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: "A cause" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "cause" })
    )
  })

  it("calls onChange with subject='someone' and correct grouping when A couple is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: "A couple" }))
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "someone", grouping: "couple" })
    )
  })

  it("calls onChange with grouping='group' when A group is clicked", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: "A group" }))
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
})

describe("HonourStep — category row", () => {
  it("renders all three category options", () => {
    render(<HonourStep value={DEFAULT_VALUE} onChange={() => {}} />)
    expect(
      screen.getByRole("button", { name: "Celebration" })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Memorial" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Fundraiser" })
    ).toBeInTheDocument()
  })

  it("calls onChange with the selected category", () => {
    const onChange = vi.fn()
    render(<HonourStep value={DEFAULT_VALUE} onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Memorial" }))
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
    fireEvent.click(screen.getByRole("button", { name: "Fundraiser" }))
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
      screen.getByRole("button", { name: "Celebration" })
    ).toBeInTheDocument()
  })
})
