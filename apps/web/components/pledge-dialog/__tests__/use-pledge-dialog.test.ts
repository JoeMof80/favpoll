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
    personal_note: null,
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
  it("starts at step 1", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    expect(result.current.step).toBe(1)
  })

  it("starts with nothing selected", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    expect(result.current.selectedIds).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: the picker (settled 2026-09-16 — chips toggle, the footer commits)
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — the picker", () => {
  it("toggleFavourite selects without advancing", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    expect(result.current.selectedIds).toEqual(["red"])
    expect(result.current.step).toBe(1)
  })

  it("toggling an already-selected favourite deselects it", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    act(() => result.current.toggleFavourite("red"))
    expect(result.current.selectedIds).toEqual([])
  })

  it("chips stack — multi-select is the picker's own grammar", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    act(() => result.current.toggleFavourite("blue"))
    expect(result.current.selectedIds).toEqual(["red", "blue"])
  })

  it("handleNext with nothing selected advances — the Give anyway path", async () => {
    // Inverted 2026-08-17: giving without backing anything is a shape the
    // product already has; the pledge lands with a total and no allocations.
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    await act(async () => result.current.handleNext())
    expect(result.current.step).toBe(2)
    expect(result.current.selectedIds).toEqual([])
  })

  it("removeFavourite deselects from step 2's lines", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.removeFavourite("red"))
    expect(result.current.selectedIds).toEqual([])
    expect(result.current.step).toBe(2)
  })

  it("filteredItems filters by search", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.setSearch("re"))
    expect(result.current.filteredItems.map((i) => i.id)).toContain("red")
    expect(result.current.filteredItems.map((i) => i.id)).not.toContain("blue")
  })

  it("enterAddView seeds the add text from the search (option C)", () => {
    const onAddItem = vi.fn()
    const { result } = renderHook(() =>
      usePledgeDialog({ ...baseOptions, onAddItem })
    )
    act(() => result.current.setSearch("Marmalade"))
    act(() => result.current.enterAddView())
    expect(result.current.pickerView).toBe("add")
    expect(result.current.addText).toBe("Marmalade")
  })

  it("handleAdd auto-selects the new favourite and returns to the picker", async () => {
    const onAddItem = vi.fn().mockResolvedValue("new-fav")
    const { result } = renderHook(() =>
      usePledgeDialog({ ...baseOptions, onAddItem })
    )
    act(() => result.current.enterAddView())
    act(() => result.current.setAddText("Marmalade"))
    await act(async () => result.current.handleAdd())
    expect(onAddItem).toHaveBeenCalledWith("Marmalade")
    expect(result.current.selectedIds).toEqual(["new-fav"])
    expect(result.current.step).toBe(1)
    expect(result.current.pickerView).toBe("select")
    expect(result.current.search).toBe("")
    // The optimistic row carries the label into the breakdown
    act(() => result.current.updatePledgeAmount("10"))
    expect(result.current.favouriteBreakdown).toEqual([
      { id: "new-fav", label: "Marmalade", amount: 10 },
    ])
  })

  it("adding a duplicate selects the existing chip instead of calling the server", async () => {
    // Founder, 2026-09-18: same intent, better outcome — no constraint
    // error to read. Case-insensitive against the merged favourites.
    const onAddItem = vi.fn()
    const { result } = renderHook(() =>
      usePledgeDialog({ ...baseOptions, onAddItem })
    )
    act(() => result.current.enterAddView())
    act(() => result.current.setAddText("  rEd "))
    await act(async () => result.current.handleAdd())
    expect(onAddItem).not.toHaveBeenCalled()
    expect(result.current.selectedIds).toEqual(["red"])
    expect(result.current.pickerView).toBe("select")
    expect(result.current.search).toBe("")
    expect(result.current.addError).toBeNull()
  })

  it("a failed add surfaces addError and stays in the add view", async () => {
    const onAddItem = vi.fn().mockRejectedValue(new Error("Too many"))
    const { result } = renderHook(() =>
      usePledgeDialog({ ...baseOptions, onAddItem })
    )
    act(() => result.current.enterAddView())
    act(() => result.current.setAddText("Marmalade"))
    await act(async () => result.current.handleAdd())
    expect(result.current.addError).toBe("Too many")
    expect(result.current.step).toBe(1)
    expect(result.current.pickerView).toBe("add")
    expect(result.current.selectedIds).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Step navigation
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — step navigation", () => {
  it("handleBack from step 2 keeps the selection and returns to step 1", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.handleBack())
    expect(result.current.step).toBe(1)
    expect(result.current.selectedIds).toEqual(["red"])
  })

  it("card path advances through guest book and prices the intent", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("blue"))
    await act(async () => result.current.handleNext()) // → step 2
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext()) // → step 3 (guest book)
    expect(result.current.step).toBe(3)
    await act(async () => result.current.handleNext()) // → prices intent → step 4
    expect(result.current.step).toBe(4)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it("a no-pick pledge takes the same path (picking is optional)", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    await act(async () => result.current.handleNext()) // → step 2
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext()) // → step 3
    expect(result.current.step).toBe(3)
    await act(async () => result.current.handleNext()) // → step 4
    expect(result.current.step).toBe(4)
  })

  it("handleBack from the review clears clientSecret, returns to guest book", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("blue"))
    await act(async () => result.current.handleNext()) // → step 2
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext()) // → step 3
    await act(async () => result.current.handleNext()) // → step 4
    expect(result.current.step).toBe(4)
    act(() => result.current.handleBack())
    expect(result.current.step).toBe(3)
    expect(result.current.pledgeClientSecret).toBeNull()
  })

  it("handleClose resets to step 1 and clears the selection", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.handleClose())
    expect(result.current.step).toBe(1)
    expect(result.current.selectedIds).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Per-favourite breakdown
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — favouriteBreakdown", () => {
  it("returns empty when no selections", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    expect(result.current.favouriteBreakdown).toEqual([])
  })

  it("single selection gets 100% of pledge", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    expect(result.current.favouriteBreakdown).toEqual([
      { id: "red", label: "Red", amount: 10 },
    ])
  })

  it("two selections split evenly", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    act(() => result.current.toggleFavourite("blue"))
    await act(async () => result.current.handleNext())
    act(() => result.current.updatePledgeAmount("10"))
    const breakdown = result.current.favouriteBreakdown
    expect(breakdown).toHaveLength(2)
    const total = breakdown.reduce((s, l) => s + l.amount, 0)
    expect(total).toBeCloseTo(10, 1)
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — two-part entry (favourites + fund)", () => {
  it("favourites and fund are independent additive parts", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.handleFavChange("20"))
    act(() => result.current.handleFundChange("5"))
    expect(result.current.pledgeAmount).toBe("20")
    expect(result.current.topUpAmount).toBe("5")
    expect(result.current.fundPart).toBe(5)
  })

  it("setFavShare rebalances the sum without changing it (slider)", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.handleFavChange("20"))
    act(() => result.current.handleFundChange("5"))
    act(() => result.current.setFavShare(15))
    expect(result.current.pledgeAmount).toBe("15")
    expect(result.current.topUpAmount).toBe("10")
    act(() => result.current.setFavShare(25))
    expect(result.current.pledgeAmount).toBe("25")
    expect(result.current.topUpAmount).toBe("")
  })

  it("keeps a picked favourite at least £1 of worth", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.toggleFavourite("red"))
    await act(async () => result.current.handleNext())
    act(() => result.current.handleFavChange("20"))
    act(() => result.current.setFavShare(0))
    expect(result.current.pledgeAmount).toBe("1")
    expect(result.current.topUpAmount).toBe("19")
  })

  it("switching to the shared-fund tab zeroes the fund part", async () => {
    const { result } = renderHook(() => usePledgeDialog(baseOptions))
    act(() => result.current.handleFavChange("20"))
    act(() => result.current.handleFundChange("2"))
    act(() => result.current.toggleFund())
    expect(result.current.fundPart).toBe(0)
    expect(result.current.pledgeAmount).toBe("20")
    expect(result.current.topUpAmount).toBe("")
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Shared pot path
// ─────────────────────────────────────────────────────────────────────────────

describe("usePledgeDialog — shared pot path", () => {
  it("step stays at 3 (no split, no review) when shared pot pledge succeeds", async () => {
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
    act(() => result.current.toggleFavourite("red"))
    await act(async () => result.current.handleNext()) // → step 2
    act(() => result.current.updatePledgeAmount("10"))
    act(() => result.current.toggleFund())
    await act(async () => result.current.handleNext()) // → step 3 (guest book)
    await act(async () => result.current.handleNext()) // fund confirm
    expect(mockActions.pledgeFromFund).toHaveBeenCalled()
    expect(result.current.step).toBe(3)
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
    act(() => result.current.toggleFavourite("red"))
    await act(async () => result.current.handleNext()) // → step 2
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext()) // → step 3
    await act(async () => result.current.handleNext()) // → step 4 (review)
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
    act(() => result.current.toggleFavourite("red"))
    await act(async () => result.current.handleNext()) // → step 2
    act(() => result.current.updatePledgeAmount("10"))
    await act(async () => result.current.handleNext()) // → step 3
    await act(async () => result.current.handleNext()) // → step 4
    expect(result.current.step).toBe(4)
    await act(async () => {
      result.current.updateTip(2)
    })
    expect(result.current.tipAmount).toBe(2)
    expect(mockFetch).toHaveBeenCalledTimes(2)
    const body = JSON.parse(mockFetch.mock.calls[1][1].body)
    expect(body.tipAmount).toBe(2)
    // the review holds — only the intent behind it was re-priced
    expect(result.current.step).toBe(4)
  })
})
