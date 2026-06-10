import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { useEffect, useState } from "react"

const NEW_TOPIC_DRAFT_KEY = "favpoll_new_topic_draft"

// ─── Hydration component ──────────────────────────────────────────────────────
// Mirrors the useEffect in FormInner that reads sessionStorage on mount.

type DraftState = { title: string; items: string[] } | null

function DraftReader({ active }: { active: boolean }) {
  const [draft, setDraft] = useState<DraftState>(null)

  useEffect(() => {
    if (!active) return
    try {
      const raw = sessionStorage.getItem(NEW_TOPIC_DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as { title: string; items: string[] }
      setDraft(parsed)
    } catch {
      /* ignore malformed JSON */
    }
  }, [active])

  return (
    <div>
      <span data-testid="title">{draft?.title ?? ""}</span>
      <span data-testid="items">{(draft?.items ?? []).join(",")}</span>
    </div>
  )
}

// ─── Exit guard component ─────────────────────────────────────────────────────
// Mirrors the useEffect in EventFormV2 that registers beforeunload.

function ExitGuard({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "You have an unsaved topic. Leave without saving?"
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [active])
  return null
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("sessionStorage draft hydration", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("does not read storage when active=false", async () => {
    await act(async () => {
      render(<DraftReader active={false} />)
    })
    expect(screen.getByTestId("title").textContent).toBe("")
  })

  it("leaves draft empty when storage has no entry and active=true", async () => {
    await act(async () => {
      render(<DraftReader active={true} />)
    })
    expect(screen.getByTestId("title").textContent).toBe("")
  })

  it("hydrates title and items from sessionStorage when active=true", async () => {
    sessionStorage.setItem(
      NEW_TOPIC_DRAFT_KEY,
      JSON.stringify({ title: "My Sport", items: ["Football", "Tennis"] })
    )
    await act(async () => {
      render(<DraftReader active={true} />)
    })
    expect(screen.getByTestId("title").textContent).toBe("My Sport")
    expect(screen.getByTestId("items").textContent).toBe("Football,Tennis")
  })

  it("gracefully ignores malformed sessionStorage JSON", async () => {
    sessionStorage.setItem(NEW_TOPIC_DRAFT_KEY, "not{{valid")
    await act(async () => {
      expect(() => render(<DraftReader active={true} />)).not.toThrow()
    })
    expect(screen.getByTestId("title").textContent).toBe("")
  })
})

describe("beforeunload exit guard", () => {
  let addSpy: ReturnType<typeof vi.spyOn>
  let removeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    addSpy = vi.spyOn(window, "addEventListener")
    removeSpy = vi.spyOn(window, "removeEventListener")
  })

  afterEach(() => {
    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it("registers beforeunload when active", async () => {
    await act(async () => {
      render(<ExitGuard active={true} />)
    })
    const beforCalls = addSpy.mock.calls.filter(
      ([e]: [string]) => e === "beforeunload"
    )
    expect(beforCalls).toHaveLength(1)
  })

  it("does not register beforeunload when inactive", async () => {
    await act(async () => {
      render(<ExitGuard active={false} />)
    })
    const beforeCalls = addSpy.mock.calls.filter(
      ([e]: [string]) => e === "beforeunload"
    )
    expect(beforeCalls).toHaveLength(0)
  })

  it("removes the listener on unmount", async () => {
    let unmount!: () => void
    await act(async () => {
      const result = render(<ExitGuard active={true} />)
      unmount = result.unmount
    })
    act(() => unmount())
    expect(removeSpy).toHaveBeenCalledWith("beforeunload", expect.any(Function))
  })
})
