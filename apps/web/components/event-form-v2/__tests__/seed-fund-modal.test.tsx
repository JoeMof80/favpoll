import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"

// Hoist mocks before any imports that reference them
const mockTopUpFund = vi.hoisted(() => vi.fn())
const mockFetch = vi.hoisted(() => vi.fn())

vi.mock("@/app/events/[id]/actions", () => ({
  topUpFund: mockTopUpFund,
}))

// Mock heavy UI/stripe deps so tests stay fast
vi.mock("@/components/stripe-checkout", () => ({
  StripeCheckout: ({
    chargeAmount,
    onSuccess,
    onClose,
  }: {
    chargeAmount: number
    onSuccess: () => void
    onClose: () => void
  }) => (
    <div data-testid="stripe-checkout">
      <span>£{chargeAmount}</span>
      <button onClick={onSuccess}>Pay</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}))

vi.mock("@/components/ui/responsive-overlay", () => ({
  ResponsiveOverlay: ({
    title,
    children,
    footer,
  }: {
    title: string
    children: React.ReactNode
    footer?: React.ReactNode
  }) => (
    <div data-testid="responsive-overlay">
      <h2>{title}</h2>
      {children}
      {footer}
    </div>
  ),
}))

vi.mock("@/components/pledge-card/amount-input", () => ({
  AmountInput: ({
    id,
    value,
    onChange,
  }: {
    id: string
    value: string
    onChange: (v: string) => void
  }) => (
    <input
      id={id}
      data-testid="amount-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

import { SeedFundModal } from "../seed-fund-modal"

const EVENT_ID = "event-abc"

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = mockFetch
})

describe("SeedFundModal — initial render", () => {
  it("shows headline and body copy", () => {
    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    expect(
      screen.getByRole("heading", { name: "Give guests a head start" })
    ).toBeInTheDocument()
    expect(screen.getByText(/shared fund lets guests/i)).toBeInTheDocument()
  })

  it("renders preset amount buttons", () => {
    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    expect(screen.getByRole("button", { name: "£10" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "£25" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "£50" })).toBeInTheDocument()
  })

  it("renders the amount input", () => {
    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    expect(screen.getByTestId("amount-input")).toBeInTheDocument()
  })

  it("renders Skip for now link", () => {
    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    expect(screen.getByText("Skip for now")).toBeInTheDocument()
  })

  it("Seed button is disabled with no amount", () => {
    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    expect(
      screen.getByRole("button", { name: /seed the shared fund/i })
    ).toBeDisabled()
  })
})

describe("SeedFundModal — preset selection", () => {
  it("clicking £25 populates the amount input", () => {
    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: "£25" }))
    expect(screen.getByTestId("amount-input")).toHaveValue("25")
  })

  it("Seed button becomes enabled after preset selection", () => {
    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: "£10" }))
    expect(
      screen.getByRole("button", { name: /seed the shared fund/i })
    ).toBeEnabled()
  })
})

describe("SeedFundModal — skip", () => {
  it("calls onComplete when Skip is clicked", () => {
    const onComplete = vi.fn()
    render(<SeedFundModal eventId={EVENT_ID} onComplete={onComplete} />)
    fireEvent.click(screen.getByText("Skip for now"))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})

describe("SeedFundModal — payment intent flow", () => {
  it("shows StripeCheckout after successful payment intent creation", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: "pi_test_secret" }),
    })

    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: "£50" }))
    fireEvent.click(
      screen.getByRole("button", { name: /seed the shared fund/i })
    )

    await waitFor(() => {
      expect(screen.getByTestId("stripe-checkout")).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/stripe/payment-intent",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          amount: 50,
          metadata: { type: "pot_top_up", event_id: EVENT_ID },
        }),
      })
    )
  })

  it("shows inline error when payment intent request fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Card declined" }),
    })

    render(<SeedFundModal eventId={EVENT_ID} onComplete={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: "£25" }))
    fireEvent.click(
      screen.getByRole("button", { name: /seed the shared fund/i })
    )

    await waitFor(() => {
      expect(screen.getByText("Card declined")).toBeInTheDocument()
    })
    expect(screen.queryByTestId("stripe-checkout")).not.toBeInTheDocument()
  })
})

describe("SeedFundModal — post-payment", () => {
  async function renderToCheckout(onComplete: () => void) {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: "pi_secret" }),
    })

    render(<SeedFundModal eventId={EVENT_ID} onComplete={onComplete} />)
    fireEvent.click(screen.getByRole("button", { name: "£10" }))
    fireEvent.click(
      screen.getByRole("button", { name: /seed the shared fund/i })
    )

    await waitFor(() => {
      expect(screen.getByTestId("stripe-checkout")).toBeInTheDocument()
    })
  }

  it("calls topUpFund then onComplete after successful payment", async () => {
    const onComplete = vi.fn()
    mockTopUpFund.mockResolvedValueOnce(undefined)

    await renderToCheckout(onComplete)
    fireEvent.click(screen.getByRole("button", { name: "Pay" }))

    await waitFor(() => {
      expect(mockTopUpFund).toHaveBeenCalledWith(EVENT_ID, 10)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it("still calls onComplete even if topUpFund throws", async () => {
    const onComplete = vi.fn()
    mockTopUpFund.mockRejectedValueOnce(new Error("DB error"))

    await renderToCheckout(onComplete)
    fireEvent.click(screen.getByRole("button", { name: "Pay" }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1)
    })
  })

  it("shows payment cancelled error and returns to form on Cancel", async () => {
    const onComplete = vi.fn()
    await renderToCheckout(onComplete)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))

    await waitFor(() => {
      expect(screen.queryByTestId("stripe-checkout")).not.toBeInTheDocument()
    })
    expect(screen.getByText("Payment was cancelled.")).toBeInTheDocument()
    expect(onComplete).not.toHaveBeenCalled()
  })
})
