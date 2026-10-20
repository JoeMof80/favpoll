import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { FavpollPollWithItems, Favourite } from "@favpoll/types"

// The pick step must work from the keyboard. Chips used to toggle on
// mousedown only, so Enter and Space on a focused chip did nothing and
// the Next button — which only renders once something is picked — never
// appeared for a keyboard user (a11y audit, 2026-10-19).

const mockRouter = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }))
const mockActions = vi.hoisted(() => ({
  createPledge: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
  createGuestPledge: vi
    .fn()
    .mockResolvedValue({ ok: true, value: "guest-token" }),
  topUpFund: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
  pledgeFromFund: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
}))
vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }))
vi.mock("@/app/favpolls/[id]/actions", () => mockActions)
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ clientSecret: "pi_test_secret" }),
})

import { PledgeDialog } from "@/components/pledge-dialog"

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

const poll: FavpollPollWithItems = {
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
    favourites: [makeFavourite("blue", "Blue"), makeFavourite("red", "Red")],
  },
} as FavpollPollWithItems

function renderDialog() {
  return render(
    <PledgeDialog
      open
      onOpenChange={() => {}}
      favpollId="favpoll-1"
      clerkUserId={null}
      charityNames={["Marie Curie"]}
      pollWithItems={poll}
      pot={null}
      userPotAllocation={null}
    />
  )
}

async function tabToChip(
  user: ReturnType<typeof userEvent.setup>,
  name: string
) {
  const chip = screen.getByRole("button", { name, pressed: false })
  for (let i = 0; i < 20 && document.activeElement !== chip; i++) {
    await user.tab()
  }
  expect(document.activeElement).toBe(chip)
  return chip
}

describe("pledge dialog — picking a favourite from the keyboard", () => {
  it("Space on a focused chip picks it and reveals Next", async () => {
    const user = userEvent.setup()
    renderDialog()
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull()
    expect(
      screen.getByRole("button", { name: "Give without picking" })
    ).toBeInTheDocument()

    const blue = await tabToChip(user, "Blue")
    await user.keyboard(" ")

    expect(blue).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Give without picking" })
    ).toBeNull()
  })

  it("Enter on a focused chip picks it, and Enter again un-picks it", async () => {
    const user = userEvent.setup()
    renderDialog()

    const red = await tabToChip(user, "Red")
    await user.keyboard("{Enter}")
    expect(red).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument()

    await user.keyboard("{Enter}")
    expect(red).toHaveAttribute("aria-pressed", "false")
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull()
  })

  it("a pointer pick still works and leaves focus in the search field", async () => {
    const user = userEvent.setup()
    renderDialog()
    const search = screen.getByRole("textbox", {
      name: /pick your favourite colour/i,
    })
    search.focus()

    await user.click(
      screen.getByRole("button", { name: "Blue", pressed: false })
    )

    expect(screen.getByRole("button", { name: "Blue" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    expect(document.activeElement).toBe(search)
  })

  it("the search field shows a focus ring from the keyboard", () => {
    renderDialog()
    const search = screen.getByRole("textbox", {
      name: /pick your favourite colour/i,
    })
    // Bare outline-none left no visible focus at all (a11y audit,
    // 2026-10-19); the project's focus-visible ring tokens replace it.
    expect(search.className).toMatch(/focus-visible:ring-3/)
    expect(search.className).toMatch(/focus-visible:ring-ring\/50/)
  })
})
