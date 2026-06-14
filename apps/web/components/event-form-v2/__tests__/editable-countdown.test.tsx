import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const mockCountdown = vi.hoisted(() => vi.fn())
const mockDateTimePicker = vi.hoisted(() => vi.fn())
const mockResponsiveOverlay = vi.hoisted(() => vi.fn())

vi.mock("@/components/countdown", () => ({
  Countdown: (props: { closesAt?: string }) => {
    mockCountdown(props)
    if (!props.closesAt)
      return <div data-testid="countdown-placeholder">placeholder</div>
    return <div data-testid="countdown">{props.closesAt}</div>
  },
}))

vi.mock("../date-time-picker", () => ({
  DateTimePicker: (props: {
    value: Date | undefined
    onChange: (d: Date) => void
  }) => {
    mockDateTimePicker(props)
    return (
      <button
        data-testid="date-time-picker"
        onClick={() => props.onChange(new Date("2026-12-31T12:00:00Z"))}
      >
        Pick date
      </button>
    )
  },
}))

vi.mock("@/components/ui/responsive-overlay", () => ({
  ResponsiveOverlay: ({
    open,
    title,
    children,
    footer,
  }: {
    open: boolean
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
  }) => {
    if (!open) return null
    return (
      <div data-testid="overlay">
        <h2>{title}</h2>
        {children}
        {footer}
      </div>
    )
  },
}))

import { EditableCountdown } from "../editable-countdown"

const FUTURE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
const PAST = new Date(Date.now() - 1000).toISOString()

describe("EditableCountdown — no closesAt (create mode)", () => {
  it("renders the countdown placeholder with no edit button", () => {
    render(<EditableCountdown />)
    expect(screen.getByTestId("countdown-placeholder")).toBeInTheDocument()
    expect(screen.queryByTestId("countdown")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /edit closing date/i })
    ).not.toBeInTheDocument()
  })
})

describe("EditableCountdown — with closesAt (edit mode)", () => {
  it("renders a live Countdown when date is in the future", () => {
    render(<EditableCountdown closesAt={FUTURE} />)
    expect(screen.getByTestId("countdown")).toBeInTheDocument()
    expect(screen.queryByText("--")).not.toBeInTheDocument()
  })

  it("renders 'Poll closed' when date is in the past", () => {
    render(<EditableCountdown closesAt={PAST} />)
    expect(screen.getByText("Poll closed")).toBeInTheDocument()
    expect(screen.queryByTestId("countdown")).not.toBeInTheDocument()
  })

  it("renders the pencil edit button", () => {
    render(<EditableCountdown closesAt={FUTURE} />)
    expect(
      screen.getByRole("button", { name: /edit closing date/i })
    ).toBeInTheDocument()
  })

  it("opens the date-picker overlay when pencil is clicked", () => {
    render(<EditableCountdown closesAt={FUTURE} onClosesAtChange={() => {}} />)
    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /edit closing date/i }))
    expect(screen.getByTestId("overlay")).toBeInTheDocument()
    expect(screen.getByText("Poll closing date")).toBeInTheDocument()
  })

  it("calls onClosesAtChange with new ISO string when Save is clicked", () => {
    const onChange = vi.fn()
    render(<EditableCountdown closesAt={FUTURE} onClosesAtChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /edit closing date/i }))
    // Pick a date
    fireEvent.click(screen.getByTestId("date-time-picker"))
    // Save
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }))
    expect(onChange).toHaveBeenCalledWith("2026-12-31T12:00:00.000Z")
  })

  it("closes the overlay without calling onChange when Cancel is clicked", () => {
    const onChange = vi.fn()
    render(<EditableCountdown closesAt={FUTURE} onClosesAtChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: /edit closing date/i }))
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it("Save is disabled until a date is picked", () => {
    render(<EditableCountdown closesAt={FUTURE} onClosesAtChange={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: /edit closing date/i }))
    // Draft is pre-filled from closesAt on open, so Save should be enabled
    expect(screen.getByRole("button", { name: /^save$/i })).toBeEnabled()
  })
})
