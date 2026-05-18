import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import type { EventPollWithItems, EventPot, PotAllocation, TopicItem } from "@/types"
import { FUND_GREEN, FUND_AMBER, FUND_RED } from "@/components/pledge-card/utils"

// --- mocks ---

const mockRouter = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const mockActions = vi.hoisted(() => ({
  createPledge: vi.fn().mockResolvedValue(undefined),
  createGuestPledge: vi.fn().mockResolvedValue(undefined),
  topUpFund: vi.fn().mockResolvedValue(undefined),
  pledgeFromFund: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }))
vi.mock("@/app/events/[id]/actions", () => mockActions)

import { usePledge } from "@/components/pledge-card/use-pledge"

// --- fixtures ---

function makeTopicItem(id: string): TopicItem {
  return {
    id,
    topic_id: "topic-1",
    label: id,
    all_time_pledged: 0,
    all_time_count: 0,
    is_canonical: true,
    source: "seed",
    event_count: 0,
    total_pledge_count: 0,
    created_at: "2024-01-01T00:00:00Z",
  }
}

function makePoll(id: string): EventPollWithItems {
  return {
    id,
    event_id: "event-1",
    topic_id: "topic-1",
    personal_framing: null,
    personal_reveal: null,
    created_at: "2024-01-01T00:00:00Z",
    topics: {
      id: "topic-1",
      title: "Colour",
      description: null,
      is_finite: false,
      is_active: true,
      created_by: null,
      created_at: "2024-01-01T00:00:00Z",
      topic_items: [makeTopicItem("red"), makeTopicItem("blue")],
    },
  }
}

function makePot(deposited: number, allocated: number): EventPot {
  return {
    id: "pot-1",
    event_id: "event-1",
    created_by: "user-1",
    total_deposited: deposited,
    total_allocated: allocated,
    created_at: "2024-01-01T00:00:00Z",
  }
}

const poll = makePoll("poll-1")

const baseOptions = {
  eventId: "event-1",
  clerkUserId: "user-1",
  charityNames: ["Oxfam"],
  pollsWithItems: [poll],
  pot: null as EventPot | null,
  userPotAllocation: null as PotAllocation | null,
  pollSelections: {} as Record<string, string[]>,
  onPledgeAmountChange: vi.fn(),
  onPledgeSuccess: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — initial state", () => {
  it("starts with empty string amounts and email", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.pledgeAmount).toBe("")
    expect(result.current.topUpAmount).toBe("")
    expect(result.current.guestEmail).toBe("")
  })

  it("starts with useSharedFund as false", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.useSharedFund).toBe(false)
  })

  it("starts with no error, not submitting", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.error).toBeNull()
    expect(result.current.submitting).toBe(false)
  })

  it("starts with pledgeClientSecret as null", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.pledgeClientSecret).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// charityLabel
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — charityLabel", () => {
  it("returns the single charity name directly", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.charityLabel).toBe("Oxfam")
  })

  it("joins two charities with ' & '", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, charityNames: ["Oxfam", "RNLI"] })
    )
    expect(result.current.charityLabel).toBe("Oxfam & RNLI")
  })

  it("returns 'charity' for an empty charity list", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, charityNames: [] })
    )
    expect(result.current.charityLabel).toBe("charity")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// available / hasFund
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — available & hasFund", () => {
  it("available is 0 when pot is null", () => {
    const { result } = renderHook(() => usePledge({ ...baseOptions, pot: null }))
    expect(result.current.available).toBe(0)
  })

  it("available is deposited minus allocated", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 30) })
    )
    expect(result.current.available).toBe(70)
  })

  it("hasFund is true when pot has available balance and user is logged in", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0), clerkUserId: "user-1" })
    )
    expect(result.current.hasFund).toBe(true)
  })

  it("hasFund is false when pot is null", () => {
    const { result } = renderHook(() => usePledge({ ...baseOptions, pot: null }))
    expect(result.current.hasFund).toBe(false)
  })

  it("hasFund is false when available is 0 (fully allocated)", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 100) })
    )
    expect(result.current.hasFund).toBe(false)
  })

  it("hasFund is false when user is not logged in (guest)", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0), clerkUserId: null })
    )
    expect(result.current.hasFund).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Pledge amount parsing & validation
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — pledge amount validation", () => {
  it("isPledgeValid is false for empty string", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.isPledgeValid).toBe(false)
  })

  it("isPledgeValid is false for zero", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => { result.current.updatePledgeAmount("0") })
    expect(result.current.isPledgeValid).toBe(false)
  })

  it("isPledgeValid is true for a positive number", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => { result.current.updatePledgeAmount("10") })
    expect(result.current.isPledgeValid).toBe(true)
    expect(result.current.numericPledge).toBe(10)
  })

  it("isPledgeValid is false for non-numeric input", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => { result.current.updatePledgeAmount("abc") })
    expect(result.current.isPledgeValid).toBe(false)
  })

  it("updatePledgeAmount calls onPledgeAmountChange", () => {
    const onPledgeAmountChange = vi.fn()
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, onPledgeAmountChange })
    )
    act(() => { result.current.updatePledgeAmount("15") })
    expect(onPledgeAmountChange).toHaveBeenCalledWith("15")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Fee & charge calculation
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — ownCharge & ownFee", () => {
  it("ownCharge is 0 when no pledge amount", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.ownCharge).toBe(0)
  })

  it("ownCharge = pledge * 1.03 when no topUp", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => { result.current.updatePledgeAmount("10") })
    // 10 * 1.03 = 10.30
    expect(result.current.ownCharge).toBe(10.3)
  })

  it("ownCharge includes topUp before applying 3% fee", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.setTopUpAmount("5")
    })
    // (10 + 5) * 1.03 = 15.45
    expect(result.current.ownCharge).toBe(15.45)
  })

  it("ownFee (3% of pledge, rounded) appears in ownBreakdown.lines[2]", () => {
    // ownFee is internal; observable via ownBreakdown lines
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => { result.current.updatePledgeAmount("10") })
    // fee line is index 2: "Platform fee (3%)"
    expect(result.current.ownBreakdown!.lines[2].amount).toBe(0.3)
  })

  it("fundOverAvailable is false when pledge is within available balance", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => { result.current.updatePledgeAmount("50") })
    expect(result.current.fundOverAvailable).toBe(false)
  })

  it("fundOverAvailable is true when pledge exceeds available balance", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 60) })
    )
    act(() => { result.current.updatePledgeAmount("50") })
    // available = 40, pledge = 50 → over
    expect(result.current.fundOverAvailable).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Fund bar
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — fundBarColor", () => {
  it("is green when pledge ≤ 80% of available", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => { result.current.updatePledgeAmount("80") })
    expect(result.current.fundBarColor).toBe(FUND_GREEN)
  })

  it("is amber when pledge is between 80% and 100% of available", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => { result.current.updatePledgeAmount("90") })
    expect(result.current.fundBarColor).toBe(FUND_AMBER)
  })

  it("is red when pledge exceeds available", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => { result.current.updatePledgeAmount("110") })
    expect(result.current.fundBarColor).toBe(FUND_RED)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Guest email validation
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — isGuestEmailValid", () => {
  it("is always true when user is signed in", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, clerkUserId: "user-1" })
    )
    expect(result.current.isGuestEmailValid).toBe(true)
  })

  it("is false for empty email when guest", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, clerkUserId: null })
    )
    expect(result.current.isGuestEmailValid).toBe(false)
  })

  it("is true for a valid email when guest", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, clerkUserId: null })
    )
    act(() => { result.current.setGuestEmail("guest@example.com") })
    expect(result.current.isGuestEmailValid).toBe(true)
  })

  it("is false for an invalid email format when guest", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, clerkUserId: null })
    )
    act(() => { result.current.setGuestEmail("not-an-email") })
    expect(result.current.isGuestEmailValid).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// canOwnConfirm / canFundConfirm
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — canOwnConfirm", () => {
  it("is false when no pledge amount", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    expect(result.current.canOwnConfirm).toBe(false)
  })

  it("is false when no selections", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: {} })
    )
    act(() => { result.current.updatePledgeAmount("10") })
    expect(result.current.canOwnConfirm).toBe(false)
  })

  it("is true when signed-in user has valid amount and selections", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => { result.current.updatePledgeAmount("10") })
    expect(result.current.canOwnConfirm).toBe(true)
  })

  it("is false for guest with invalid email even with valid amount and selections", () => {
    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        clerkUserId: null,
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => { result.current.updatePledgeAmount("10") })
    expect(result.current.canOwnConfirm).toBe(false)
  })

  it("is true for guest once email is valid", () => {
    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        clerkUserId: null,
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.setGuestEmail("test@example.com")
    })
    expect(result.current.canOwnConfirm).toBe(true)
  })
})

describe("usePledge — canFundConfirm", () => {
  it("is false when pledge exceeds available fund", () => {
    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pot: makePot(100, 60),
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => { result.current.updatePledgeAmount("50") })
    expect(result.current.canFundConfirm).toBe(false)
  })

  it("is true when pledge is within available fund and has selections", () => {
    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pot: makePot(100, 0),
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => { result.current.updatePledgeAmount("10") })
    expect(result.current.canFundConfirm).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Breakdown objects
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — ownBreakdown", () => {
  it("is null when useSharedFund is true", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.toggleFund()
    })
    expect(result.current.ownBreakdown).toBeNull()
  })

  it("is null when pledge amount is invalid", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.ownBreakdown).toBeNull()
  })

  it("includes charity, fee, and total lines when valid", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => { result.current.updatePledgeAmount("10") })

    expect(result.current.ownBreakdown).not.toBeNull()
    const lines = result.current.ownBreakdown!.lines
    expect(lines[0]).toMatchObject({ label: "To Oxfam", amount: 10 })
    expect(lines[2]).toMatchObject({ label: "Platform fee (3%)", amount: 0.3 })
    expect(result.current.ownBreakdown!.total).toMatchObject({ amount: 10.3 })
  })

  it("marks the top-up line as hidden when no topUp is entered", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => { result.current.updatePledgeAmount("10") })
    const topUpLine = result.current.ownBreakdown!.lines[1]
    expect(topUpLine.hidden).toBe(true)
  })

  it("shows the top-up line when a topUp amount is entered", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.setTopUpAmount("5")
    })
    const topUpLine = result.current.ownBreakdown!.lines[1]
    expect(topUpLine.hidden).toBe(false)
    expect(topUpLine.amount).toBe(5)
  })
})

describe("usePledge — fundBreakdown", () => {
  it("is null when useSharedFund is false", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => { result.current.updatePledgeAmount("10") })
    expect(result.current.fundBreakdown).toBeNull()
  })

  it("is null when pledge exceeds fund", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 60) })
    )
    act(() => {
      result.current.updatePledgeAmount("50")
      result.current.toggleFund()
    })
    expect(result.current.fundBreakdown).toBeNull()
  })

  it("shows zero total when pledging from fund", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.toggleFund()
    })

    expect(result.current.fundBreakdown).not.toBeNull()
    expect(result.current.fundBreakdown!.total).toMatchObject({ label: "Charged to you", amount: 0 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// toggleFund
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — toggleFund", () => {
  it("toggles useSharedFund between false and true", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => { result.current.toggleFund() })
    expect(result.current.useSharedFund).toBe(true)
    act(() => { result.current.toggleFund() })
    expect(result.current.useSharedFund).toBe(false)
  })

  it("clears the error when toggling", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => { result.current.setSubmitting(true) })
    act(() => { result.current.toggleFund() })
    expect(result.current.error).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// handleOwnConfirm
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — handleOwnConfirm", () => {
  it("does nothing when canOwnConfirm is false", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const { result } = renderHook(() => usePledge(baseOptions))

    await act(async () => { await result.current.handleOwnConfirm() })

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("calls /api/stripe/payment-intent with the correct charge amount", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientSecret: "pi_secret_test" }), { status: 200 })
    )

    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => { result.current.updatePledgeAmount("10") })

    await act(async () => { await result.current.handleOwnConfirm() })

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/stripe/payment-intent",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ amount: 10.3 }),
      })
    )
  })

  it("sets pledgeClientSecret on successful payment-intent creation", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientSecret: "pi_secret_test" }), { status: 200 })
    )

    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => { result.current.updatePledgeAmount("10") })

    await act(async () => { await result.current.handleOwnConfirm() })

    expect(result.current.pledgeClientSecret).toBe("pi_secret_test")
  })

  it("sets error and stops submitting on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Card declined" }), { status: 400 })
    )

    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => { result.current.updatePledgeAmount("10") })

    await act(async () => { await result.current.handleOwnConfirm() })

    expect(result.current.error).toBe("Card declined")
    expect(result.current.submitting).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// handleFundConfirm
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — handleFundConfirm", () => {
  it("does nothing when canFundConfirm is false", async () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 60) })
    )
    act(() => { result.current.updatePledgeAmount("50") }) // exceeds available=40

    await act(async () => { await result.current.handleFundConfirm() })

    expect(mockActions.pledgeFromFund).not.toHaveBeenCalled()
  })

  it("calls pledgeFromFund for each poll with selections", async () => {
    const onPledgeSuccess = vi.fn()
    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pot: makePot(100, 0),
        pollSelections: { "poll-1": ["red"] },
        onPledgeSuccess,
      })
    )
    act(() => { result.current.updatePledgeAmount("10") })

    await act(async () => { await result.current.handleFundConfirm() })

    expect(mockActions.pledgeFromFund).toHaveBeenCalledWith(
      expect.objectContaining({ eventPollId: "poll-1", potId: "pot-1", totalAmount: 10 })
    )
  })

  it("calls onPledgeSuccess and router.refresh on success", async () => {
    const onPledgeSuccess = vi.fn()
    mockRouter.refresh.mockClear()

    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pot: makePot(100, 0),
        pollSelections: { "poll-1": ["red"] },
        onPledgeSuccess,
      })
    )
    act(() => { result.current.updatePledgeAmount("10") })

    await act(async () => { await result.current.handleFundConfirm() })

    expect(onPledgeSuccess).toHaveBeenCalledWith(["poll-1"])
    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it("sets error and stops submitting on pledgeFromFund failure", async () => {
    mockActions.pledgeFromFund.mockRejectedValueOnce(new Error("Fund error"))

    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pot: makePot(100, 0),
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => { result.current.updatePledgeAmount("10") })

    await act(async () => { await result.current.handleFundConfirm() })

    expect(result.current.error).toBe("Fund error")
    expect(result.current.submitting).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// handlePledgePaymentSuccess
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — handlePledgePaymentSuccess", () => {
  it("calls createPledge for signed-in user and refreshes", async () => {
    const onPledgeSuccess = vi.fn()
    mockRouter.refresh.mockClear()

    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pollSelections: { "poll-1": ["red"] },
        onPledgeSuccess,
      })
    )
    act(() => { result.current.updatePledgeAmount("10") })

    await act(async () => { await result.current.handlePledgePaymentSuccess() })

    expect(mockActions.createPledge).toHaveBeenCalledWith(
      expect.objectContaining({ eventPollId: "poll-1", totalAmount: 10 })
    )
    expect(onPledgeSuccess).toHaveBeenCalledWith(["poll-1"])
    expect(mockRouter.refresh).toHaveBeenCalled()
  })

  it("calls createGuestPledge for guest user", async () => {
    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        clerkUserId: null,
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.setGuestEmail("guest@example.com")
    })

    await act(async () => { await result.current.handlePledgePaymentSuccess() })

    expect(mockActions.createGuestPledge).toHaveBeenCalledWith(
      expect.objectContaining({
        eventPollId: "poll-1",
        guestEmail: "guest@example.com",
        totalAmount: 10,
      })
    )
  })

  it("calls topUpFund when pendingTopUp is set", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientSecret: "pi_test" }), { status: 200 })
    )

    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.setTopUpAmount("5")
    })

    // Trigger handleOwnConfirm to set pendingTopUp=true
    await act(async () => { await result.current.handleOwnConfirm() })
    // Then simulate payment success
    await act(async () => { await result.current.handlePledgePaymentSuccess() })

    expect(mockActions.topUpFund).toHaveBeenCalledWith("event-1", 5)
  })

  it("clears pledgeClientSecret on success", async () => {
    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.setPledgeClientSecret("existing_secret")
    })

    await act(async () => { await result.current.handlePledgePaymentSuccess() })

    expect(result.current.pledgeClientSecret).toBeNull()
  })

  it("sets error on failure without crashing", async () => {
    mockActions.createPledge.mockRejectedValueOnce(new Error("DB error"))

    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => { result.current.updatePledgeAmount("10") })

    await act(async () => { await result.current.handlePledgePaymentSuccess() })

    expect(result.current.error).toBe("DB error")
  })
})
