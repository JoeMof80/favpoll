import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import type {
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
  Favourite,
} from "@favpoll/types"

// --- mocks ---

const mockRouter = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const mockActions = vi.hoisted(() => ({
  createPledge: vi.fn().mockResolvedValue(undefined),
  createGuestPledge: vi.fn().mockResolvedValue(undefined),
  topUpFund: vi.fn().mockResolvedValue(undefined),
  pledgeFromFund: vi.fn().mockResolvedValue(undefined),
}))
const mockFetch = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ clientSecret: "pi_test_secret" }),
  })
)

vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }))
vi.mock("@/app/favpolls/[id]/actions", () => mockActions)
global.fetch = mockFetch

import { usePledgeDialog } from "@/components/pledge-dialog/use-pledge-dialog"

// --- fixtures ---

function makeFavourite(id: string, label: string): Favourite {
  return {
    id,
    topic_id: "topic-1",
    label,
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

function makePoll(): FavpollPollWithItems {
  return {
    id: "poll-1",
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
      favourites: [
        makeFavourite("red", "Red"),
        makeFavourite("blue", "Blue"),
        makeFavourite("green", "Green"),
      ],
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

const poll = makePoll()

const baseOptions = {
  favpollId: "favpoll-1",
  clerkUserId: "user-1",
  charityNames: ["Oxfam"],
  pollWithItems: poll,
  pot: null as FavpollPot | null,
  userPotAllocation: null as PotAllocation | null,
  onPledgeSuccess: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({ clientSecret: "pi_test_secret" }),
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — initial state", () => {
  it("starts at step 1", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    expect(result.current.step).toBe(1)
  })

  it("starts with empty draftIds", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    expect(result.current.draftIds).toEqual([])
  })

  it("canAdvanceStep1 is true with no selections — picking is optional", () => {
    // Inverted 2026-08-17. It required a favourite, which left a guest who
    // could not decide stuck on step 1 behind a dead Next button. Giving
    // without backing anything is a shape the product already has, and the
    // pledge lands with a total and no allocations.
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    expect(result.current.canAdvanceStep1).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: picker draft
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — step 1 picker draft", () => {
  it("toggleDraft adds an id", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("red"))
    expect(result.current.draftIds).toEqual(["red"])
    expect(result.current.canAdvanceStep1).toBe(true)
  })

  it("toggleDraft removes an id already present", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("red"))
    act(() => result.current.toggleDraft("red"))
    expect(result.current.draftIds).toEqual([])
  })

  it("filteredItems filters by search", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.setSearch("re"))
    expect(result.current.filteredItems.map((i) => i.id)).toContain("red")
    expect(result.current.filteredItems.map((i) => i.id)).not.toContain("blue")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Step navigation
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — step navigation", () => {
  it("handleNext at step 1 commits draftIds and advances to step 2", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    expect(result.current.step).toBe(2)
  })

  it("handleBack from step 2 restores draft and returns to step 1", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.handleBack())
    expect(result.current.step).toBe(1)
    expect(result.current.draftIds).toEqual(["red"])
  })

  it("card path prices the intent at step 2 and advances to the review", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("blue"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext())
    expect(result.current.step).toBe(3)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it("a no-pick pledge takes the same path (picking is optional)", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext())
    expect(result.current.step).toBe(3)
  })

  it("handleBack from the review clears clientSecret, returns to step 2", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("blue"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext())
    expect(result.current.step).toBe(3)
    act(() => result.current.handleBack())
    expect(result.current.step).toBe(2)
    expect(result.current.pledgeClientSecret).toBeNull()
  })

  it("handleClose resets to step 1 and clears draftIds", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.handleClose())
    expect(result.current.step).toBe(1)
    expect(result.current.draftIds).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Per-favourite breakdown
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — favouriteBreakdown", () => {
  it("returns empty when no selections", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    expect(result.current.favouriteBreakdown).toEqual([])
  })

  it("single selection gets 100% of pledge", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    expect(result.current.favouriteBreakdown).toEqual([
      { label: "Red", amount: 10 },
    ])
  })

  it("two selections split evenly", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("red"))
    act(() => result.current.toggleDraft("blue"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    const breakdown = result.current.favouriteBreakdown
    expect(breakdown).toHaveLength(2)
    const total = breakdown.reduce((s, l) => s + l.amount, 0)
    expect(total).toBeCloseTo(10, 1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Per-charity breakdown
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — charityBreakdown", () => {
  it("returns empty for single charity", async () => {
    const { result } = renderHook(() =>
      usePledgeDialog({ ...baseOptions, charityNames: ["Oxfam"] })
    )
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    expect(result.current.charityBreakdown).toEqual([])
  })

  it("splits equally between two charities", async () => {
    const { result } = renderHook(() =>
      usePledgeDialog({
        ...baseOptions,
        charityNames: ["Oxfam", "RNLI"],
      })
    )
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("20"))
    const breakdown = result.current.charityBreakdown
    expect(breakdown).toHaveLength(2)
    expect(breakdown[0].amount).toBeCloseTo(10, 2)
    expect(breakdown[1].amount).toBeCloseTo(10, 2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Total-then-split mapping
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — total-then-split", () => {
  it("maps total and fund steps onto pledge/topUp parts", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.handleTotalChange("20"))
    expect(result.current.pledgeAmount).toBe("20")
    act(() => result.current.stepFund(1))
    act(() => result.current.stepFund(1))
    expect(result.current.fundPart).toBe(2)
    expect(result.current.pledgeAmount).toBe("18")
    expect(result.current.topUpAmount).toBe("2")
    act(() => result.current.stepFund(-1))
    expect(result.current.fundPart).toBe(1)
    expect(result.current.pledgeAmount).toBe("19")
  })

  it("clamps the fund so the favourite keeps at least £1", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.handleTotalChange("5"))
    for (let i = 0; i < 10; i++) act(() => result.current.stepFund(1))
    expect(result.current.fundPart).toBe(4)
    expect(result.current.pledgeAmount).toBe("1")
  })

  it("shrinking the total pulls the fund down with it", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.handleTotalChange("20"))
    for (let i = 0; i < 5; i++) act(() => result.current.stepFund(1))
    expect(result.current.fundPart).toBe(5)
    act(() => result.current.handleTotalChange("3"))
    expect(result.current.fundPart).toBe(2)
    expect(result.current.pledgeAmount).toBe("1")
  })

  it("setFundTo maps an absolute pound value onto the parts (slider)", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.handleTotalChange("20"))
    act(() => result.current.setFundTo(5))
    expect(result.current.fundPart).toBe(5)
    expect(result.current.pledgeAmount).toBe("15")
    expect(result.current.topUpAmount).toBe("5")
    act(() => result.current.setFundTo(0))
    expect(result.current.fundPart).toBe(0)
    expect(result.current.pledgeAmount).toBe("20")
    expect(result.current.topUpAmount).toBe("")
  })

  it("switching to the shared-fund tab zeroes the split", () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.handleTotalChange("20"))
    act(() => result.current.stepFund(1))
    act(() => result.current.toggleFund())
    expect(result.current.fundPart).toBe(0)
    expect(result.current.pledgeAmount).toBe("20")
    expect(result.current.topUpAmount).toBe("")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Shared fund path
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — shared fund path", () => {
  it("step stays at 2 (no split, no review) when shared fund pledge succeeds", async () => {
    const pot = makePot(100, 0)
    const onPledgeSuccess = vi.fn()
    const { result } = renderHook(() =>
      usePledgeDialog({
        ...baseOptions,
        pot,
        clerkUserId: "user-1",
        onPledgeSuccess,
      })
    )
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    act(() => result.current.toggleFund())
    await act(async () => result.current.handleNext())
    expect(mockActions.pledgeFromFund).toHaveBeenCalled()
    expect(result.current.step).toBe(2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Payment success
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — payment success", () => {
  it("handlePledgePaymentSuccess calls onPledgeSuccess and router.refresh", async () => {
    const onPledgeSuccess = vi.fn()
    const { result } = renderHook(() =>
      usePledgeDialog({ ...baseOptions, onPledgeSuccess })
    )
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext()) // → review
    await act(async () => result.current.handlePledgePaymentSuccess())
    expect(mockActions.createPledge).toHaveBeenCalled()
    expect(onPledgeSuccess).toHaveBeenCalled()
    expect(mockRouter.refresh).toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Review tip (founder, 2026-09-06): chips on the bill re-price the intent
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — review tip", () => {
  it("updateTip re-prices the PaymentIntent with the new tip", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleDraft("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext())
    expect(result.current.step).toBe(3)
    await act(async () => {
      result.current.updateTip(2)
    })
    expect(result.current.tipAmount).toBe(2)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    const body = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(body.tipAmount).toBe(2)
    // the review holds — only the intent behind it was re-priced
    expect(result.current.step).toBe(3)
  })
})
