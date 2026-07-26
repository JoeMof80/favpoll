import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import type {
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
  Favourite,
} from "@favpoll/types"
import {
  FUND_GREEN,
  FUND_AMBER,
  FUND_RED,
} from "@/components/pledge-card/utils"

// --- mocks ---

const mockRouter = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const mockActions = vi.hoisted(() => ({
  createPledge: vi.fn().mockResolvedValue(undefined),
  createGuestPledge: vi.fn().mockResolvedValue(undefined),
  topUpFund: vi.fn().mockResolvedValue(undefined),
  pledgeFromFund: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }))
vi.mock("@/app/favpolls/[id]/actions", () => mockActions)

import { usePledge } from "@/components/pledge-card/use-pledge"

// --- fixtures ---

function makeTopicItem(id: string): Favourite {
  return {
    id,
    topic_id: "topic-1",
    label: id,
    all_time_pledged: 0,
    all_time_count: 0,
    is_canonical: true,
    source: "seed",
    markets: ["en-GB"],
    favpoll_count: 0,
    total_pledge_count: 0,
    created_at: "2024-01-01T00:00:00Z",
  }
}

function makePoll(id: string): FavpollPollWithItems {
  return {
    id,
    favpoll_id: "favpoll-1",
    topic_id: "topic-1",
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
      favourites: [makeTopicItem("red"), makeTopicItem("blue")],
    },
  }
}

function makePot(deposited: number, allocated: number): FavpollPot {
  return {
    id: "pot-1",
    favpoll_id: "favpoll-1",
    created_by: "user-1",
    total_deposited: deposited,
    total_allocated: allocated,
    created_at: "2024-01-01T00:00:00Z",
  }
}

const poll = makePoll("poll-1")

const baseOptions = {
  favpollId: "favpoll-1",
  clerkUserId: "user-1",
  charityNames: ["Oxfam"],
  pollWithItems: poll,
  pot: null as FavpollPot | null,
  userPotAllocation: null as PotAllocation | null,
  pollSelections: {} as Record<string, string[]>,
  onPledgeAmountChange: vi.fn(),
  onPledgeSuccess: vi.fn(),
  suggestTip: false,
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
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: null })
    )
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
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: null })
    )
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
    act(() => {
      result.current.updatePledgeAmount("0")
    })
    expect(result.current.isPledgeValid).toBe(false)
  })

  it("isPledgeValid is true for a positive number", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    expect(result.current.isPledgeValid).toBe(true)
    expect(result.current.numericPledge).toBe(10)
  })

  it("isPledgeValid is false for non-numeric input", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("abc")
    })
    expect(result.current.isPledgeValid).toBe(false)
  })

  it("updatePledgeAmount calls onPledgeAmountChange", () => {
    const onPledgeAmountChange = vi.fn()
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, onPledgeAmountChange })
    )
    act(() => {
      result.current.updatePledgeAmount("15")
    })
    expect(onPledgeAmountChange).toHaveBeenCalledWith("15")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Fee & charge calculation
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledge — optional contribution (tip)", () => {
  it("suggests the tier default when suggestTip is on (the default)", () => {
    const { suggestTip: _omit, ...rest } = baseOptions
    const { result } = renderHook(() => usePledge(rest))
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    expect(result.current.tipAmount).toBe(1) // <£15 tier → £1
    expect(result.current.ownCharge).toBe(11)
  })

  it("defaults to None when suggestTip is false (memorial register)", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    expect(result.current.tipAmount).toBe(0)
    expect(result.current.ownCharge).toBe(10)
  })

  it("scales chip options and the suggestion with the pledge", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, suggestTip: true })
    )
    act(() => {
      result.current.updatePledgeAmount("50")
    })
    expect(result.current.tipOptions).toEqual([0, 2, 5, 10])
    expect(result.current.tipAmount).toBe(5) // ~10% suggestion
    expect(result.current.ownCharge).toBe(55)

    act(() => {
      result.current.updatePledgeAmount("20")
    })
    expect(result.current.tipOptions).toEqual([0, 1, 2, 3])
    expect(result.current.tipAmount).toBe(2)
  })

  it("never overrides a touched tip when the pledge tier changes", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, suggestTip: true })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.setTipAmount(0)
    })
    expect(result.current.tipAmount).toBe(0)
    act(() => {
      result.current.updatePledgeAmount("50") // tier jump
    })
    expect(result.current.tipAmount).toBe(0) // explicit None sticks
    expect(result.current.ownCharge).toBe(50)
  })

  it("surfaces a preserved tip that isn't in the new tier as an extra chip", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, suggestTip: true })
    )
    act(() => {
      result.current.updatePledgeAmount("20") // tier None/£1/£2/£3
      result.current.setTipAmount(3)
    })
    expect(result.current.tipOptions).toEqual([0, 1, 2, 3])
    act(() => {
      result.current.updatePledgeAmount("50") // tier None/£2/£5/£10 — no £3
    })
    // £3 preserved AND visible: injected into the chip set, still selected
    expect(result.current.tipAmount).toBe(3)
    expect(result.current.tipOptions).toEqual([0, 2, 3, 5, 10])
    expect(result.current.ownCharge).toBe(53)
  })

  it("the breakdown carries no duplicate tip line — total includes it", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, suggestTip: true })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    const labels = result.current.ownBreakdown!.lines.map((l) => l.label)
    expect(labels).not.toContain("For favpoll")
    expect(result.current.ownBreakdown!.total.amount).toBe(11)
  })

  it("never touches the charity amount — total_amount stays the pledge", async () => {
    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        suggestTip: true,
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    await act(async () => {
      await result.current.handlePledgePaymentSuccess()
    })
    expect(mockActions.createPledge).toHaveBeenCalledWith(
      expect.objectContaining({ totalAmount: 10, tipAmount: 1 })
    )
  })
})

describe("usePledge — ownCharge", () => {
  it("ownCharge is 0 when no pledge amount", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    expect(result.current.ownCharge).toBe(0)
  })

  it("ownCharge equals the pledge exactly — no platform fee", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    expect(result.current.ownCharge).toBe(10)
  })

  it("ownCharge = pledge + topUp with no fee applied", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
      result.current.setTopUpAmount("5")
    })
    expect(result.current.ownCharge).toBe(15)
  })

  it("ownBreakdown has no fee line", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    const labels = result.current.ownBreakdown!.lines.map((l) => l.label)
    expect(labels.join(" ")).not.toMatch(/fee/i)
  })

  it("fundOverAvailable is false when pledge is within available balance", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => {
      result.current.updatePledgeAmount("50")
    })
    expect(result.current.fundOverAvailable).toBe(false)
  })

  it("fundOverAvailable is true when pledge exceeds available balance", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 60) })
    )
    act(() => {
      result.current.updatePledgeAmount("50")
    })
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
    act(() => {
      result.current.updatePledgeAmount("80")
    })
    expect(result.current.fundBarColor).toBe(FUND_GREEN)
  })

  it("is amber when pledge is between 80% and 100% of available", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => {
      result.current.updatePledgeAmount("90")
    })
    expect(result.current.fundBarColor).toBe(FUND_AMBER)
  })

  it("is red when pledge exceeds available", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => {
      result.current.updatePledgeAmount("110")
    })
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
    act(() => {
      result.current.setGuestEmail("guest@example.com")
    })
    expect(result.current.isGuestEmailValid).toBe(true)
  })

  it("is false for an invalid email format when guest", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, clerkUserId: null })
    )
    act(() => {
      result.current.setGuestEmail("not-an-email")
    })
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
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    expect(result.current.canOwnConfirm).toBe(false)
  })

  it("is true when signed-in user has valid amount and selections", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
    })
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
    act(() => {
      result.current.updatePledgeAmount("10")
    })
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
    act(() => {
      result.current.updatePledgeAmount("50")
    })
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
    act(() => {
      result.current.updatePledgeAmount("10")
    })
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

  it("includes charity and total lines when valid — total equals the pledge", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    expect(result.current.ownBreakdown).not.toBeNull()
    const lines = result.current.ownBreakdown!.lines
    expect(lines[0]).toMatchObject({ label: "To Oxfam", amount: 10 })
    expect(result.current.ownBreakdown!.total).toMatchObject({ amount: 10 })
  })

  it("marks the top-up line as hidden when no topUp is entered", () => {
    const { result } = renderHook(() => usePledge(baseOptions))
    act(() => {
      result.current.updatePledgeAmount("10")
    })
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
    act(() => {
      result.current.updatePledgeAmount("10")
    })
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
    expect(result.current.fundBreakdown!.total).toMatchObject({
      label: "Charged to you",
      amount: 0,
    })
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
    act(() => {
      result.current.toggleFund()
    })
    expect(result.current.useSharedFund).toBe(true)
    act(() => {
      result.current.toggleFund()
    })
    expect(result.current.useSharedFund).toBe(false)
  })

  it("clears the error when toggling", () => {
    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pot: makePot(100, 0) })
    )
    act(() => {
      result.current.setSubmitting(true)
    })
    act(() => {
      result.current.toggleFund()
    })
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

    await act(async () => {
      await result.current.handleOwnConfirm()
    })

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("calls /api/stripe/payment-intent with the charge parts", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientSecret: "pi_secret_test" }), {
        status: 200,
      })
    )

    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    await act(async () => {
      await result.current.handleOwnConfirm()
    })

    // The route computes the charge server-side from these parts
    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/stripe/payment-intent",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          favpollPollId: "poll-1",
          favpollId: "favpoll-1",
          pledgeAmount: 10,
          tipAmount: 0,
          topUpAmount: 0,
        }),
      })
    )
  })

  it("threads the PaymentIntent id from creation into savePledge", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          clientSecret: "pi_secret_test",
          paymentIntentId: "pi_threaded_1",
        }),
        { status: 200 }
      )
    )

    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
    })
    await act(async () => {
      await result.current.handleOwnConfirm()
    })
    await act(async () => {
      await result.current.handlePledgePaymentSuccess()
    })

    expect(mockActions.createPledge).toHaveBeenCalledWith(
      expect.objectContaining({ paymentIntentId: "pi_threaded_1" })
    )
  })

  it("sets pledgeClientSecret on successful payment-intent creation", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ clientSecret: "pi_secret_test" }), {
        status: 200,
      })
    )

    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    await act(async () => {
      await result.current.handleOwnConfirm()
    })

    expect(result.current.pledgeClientSecret).toBe("pi_secret_test")
  })

  it("sets error and stops submitting on fetch failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Card declined" }), { status: 400 })
    )

    const { result } = renderHook(() =>
      usePledge({ ...baseOptions, pollSelections: { "poll-1": ["red"] } })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    await act(async () => {
      await result.current.handleOwnConfirm()
    })

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
    act(() => {
      result.current.updatePledgeAmount("50")
    }) // exceeds available=40

    await act(async () => {
      await result.current.handleFundConfirm()
    })

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
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    await act(async () => {
      await result.current.handleFundConfirm()
    })

    expect(mockActions.pledgeFromFund).toHaveBeenCalledWith(
      expect.objectContaining({
        favpollPollId: "poll-1",
        potId: "pot-1",
        totalAmount: 10,
      })
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
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    await act(async () => {
      await result.current.handleFundConfirm()
    })

    expect(onPledgeSuccess).toHaveBeenCalled()
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
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    await act(async () => {
      await result.current.handleFundConfirm()
    })

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
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    await act(async () => {
      await result.current.handlePledgePaymentSuccess()
    })

    expect(mockActions.createPledge).toHaveBeenCalledWith(
      expect.objectContaining({ favpollPollId: "poll-1", totalAmount: 10 })
    )
    expect(onPledgeSuccess).toHaveBeenCalled()
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

    await act(async () => {
      await result.current.handlePledgePaymentSuccess()
    })

    expect(mockActions.createGuestPledge).toHaveBeenCalledWith(
      expect.objectContaining({
        favpollPollId: "poll-1",
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
    await act(async () => {
      await result.current.handleOwnConfirm()
    })
    // Then simulate payment success
    await act(async () => {
      await result.current.handlePledgePaymentSuccess()
    })

    expect(mockActions.topUpFund).toHaveBeenCalledWith("favpoll-1", 5, "")
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

    await act(async () => {
      await result.current.handlePledgePaymentSuccess()
    })

    expect(result.current.pledgeClientSecret).toBeNull()
  })

  it("sets error on failure and re-throws for CheckoutForm to display", async () => {
    mockActions.createPledge.mockRejectedValueOnce(new Error("DB error"))

    const { result } = renderHook(() =>
      usePledge({
        ...baseOptions,
        pollSelections: { "poll-1": ["red"] },
      })
    )
    act(() => {
      result.current.updatePledgeAmount("10")
    })

    // Re-throws so the still-mounted CheckoutForm can show the message and
    // re-enable its buttons (the save-failure freeze, 2026-07-26)
    await act(async () => {
      await expect(result.current.handlePledgePaymentSuccess()).rejects.toThrow(
        "DB error"
      )
    })

    expect(result.current.error).toBe("DB error")
  })
})
