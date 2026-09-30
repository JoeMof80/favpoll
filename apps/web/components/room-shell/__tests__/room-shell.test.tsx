import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import type { FavpollWithDetails, FavpollPollWithItems } from "@favpoll/types"

const refresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh }),
}))
vi.mock("@/components/branded-qr", () => ({
  BrandedQR: (props: { "aria-label"?: string }) => (
    <div data-testid="branded-qr" aria-label={props["aria-label"]} />
  ),
}))
vi.mock("@/components/display-screen/display-chrome", () => ({
  DisplayChrome: ({
    variant,
    onVariantChange,
  }: {
    variant?: string
    onVariantChange?: (v: "fundraiser" | "tribute") => void
  }) => (
    <div data-testid="chrome" data-variant={variant}>
      <button type="button" onClick={() => onVariantChange?.("tribute")}>
        Tribute view
      </button>
    </div>
  ),
}))
// The sheet, stubbed to report the room's inputs.
vi.mock("@/components/favpoll-sheet", () => ({
  FavpollSheet: (props: {
    presentation?: string
    heroVariant?: string
    reveal?: boolean
    isClosed: boolean
  }) => (
    <div
      data-testid="sheet"
      data-presentation={props.presentation}
      data-hero={props.heroVariant}
      data-reveal={String(!!props.reveal)}
      data-closed={String(props.isClosed)}
    />
  ),
}))
import { RoomShell } from "@/components/room-shell"

const FAVPOLL = {
  id: "favpoll-1",
  closes_at: new Date(Date.now() + 60_000).toISOString(),
  closed_at: null,
  subject: "someone",
  favpoll_charities: [],
  protagonists: null,
} as unknown as FavpollWithDetails

const POLL = {
  id: "poll-1",
  personal_note: "A note",
  topics: { favourites: [] },
} as unknown as FavpollPollWithItems

function renderShell(
  over: Partial<React.ComponentProps<typeof RoomShell>> = {}
) {
  return render(
    <RoomShell
      favpoll={FAVPOLL}
      pollWithItems={POLL}
      totalRaised={0}
      wallEntries={[]}
      isClosed={false}
      manageUrl="/favpolls/favpoll-1/manage"
      qrUrl="https://favpoll.com/p/abc"
      {...over}
    />
  )
}

beforeEach(() => {
  refresh.mockClear()
  window.localStorage.clear()
})

describe("RoomShell — the sheet on the screen in the room", () => {
  it("renders the sheet in room presentation with the default dial", () => {
    renderShell({ defaultVariant: "tribute" })
    const sheet = screen.getByTestId("sheet")
    expect(sheet.dataset.presentation).toBe("room")
    expect(sheet.dataset.hero).toBe("tribute")
    expect(sheet.dataset.reveal).toBe("false")
  })

  it("pins a QR code in both gutters while open, none once closed", () => {
    const { unmount } = renderShell()
    expect(screen.getAllByTestId("branded-qr")).toHaveLength(2)
    expect(screen.getAllByText("Scan to pledge")).toHaveLength(2)
    unmount()
    renderShell({ isClosed: true })
    expect(screen.queryAllByTestId("branded-qr")).toHaveLength(0)
  })

  it("remembers the dial per favpoll on this machine", () => {
    renderShell()
    expect(screen.getByTestId("chrome").dataset.variant).toBe("fundraiser")
    act(() => {
      screen.getByText("Tribute view").click()
    })
    expect(screen.getByTestId("sheet").dataset.hero).toBe("tribute")
    expect(
      window.localStorage.getItem("favpoll:display-variant:favpoll-1")
    ).toBe("tribute")
  })

  it("re-pulls the server data on an interval", () => {
    vi.useFakeTimers()
    try {
      renderShell()
      act(() => {
        vi.advanceTimersByTime(5_100)
      })
      expect(refresh).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it("witnesses the close: the sheet closes and the reveal types out", () => {
    vi.useFakeTimers()
    try {
      renderShell({
        favpoll: {
          ...FAVPOLL,
          closes_at: new Date(Date.now() + 2_000).toISOString(),
        },
      })
      expect(screen.getByTestId("sheet").dataset.closed).toBe("false")
      act(() => {
        vi.advanceTimersByTime(2_100)
      })
      const sheet = screen.getByTestId("sheet")
      expect(sheet.dataset.closed).toBe("true")
      expect(sheet.dataset.reveal).toBe("true")
      expect(screen.queryAllByTestId("branded-qr")).toHaveLength(0)
    } finally {
      vi.useRealTimers()
    }
  })

  it("never types the reveal on a screen that was closed at mount", () => {
    renderShell({ isClosed: true })
    expect(screen.getByTestId("sheet").dataset.reveal).toBe("false")
  })
})
