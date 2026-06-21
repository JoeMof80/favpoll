import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { useEffect, useState } from "react"

const NEW_TOPIC_DRAFT_KEY = "favpoll_new_topic_draft"
const DRAFT_ADDITIONS_KEY = "favpoll_draft_additions"

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
// Mirrors the useEffect in FavpollForm that registers beforeunload.

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

// ─── New draft format (favpoll_draft_additions) ───────────────────────────────
// Mirrors FormInner's updated hydration: new key first, legacy fallback.

const MOCK_TOPICS = [
  {
    id: "t1",
    title: "Colour",
    favourites: [
      { id: "i1", label: "Red" },
      { id: "i2", label: "Blue" },
    ],
  },
]

type DraftV2State = {
  topicId: string
  title: string
  isCustom: boolean
  customLabels: string[]
} | null

function DraftReaderV2({ active }: { active: boolean }) {
  const [draft, setDraft] = useState<DraftV2State>(null)

  useEffect(() => {
    if (!active) return
    try {
      const newRaw = sessionStorage.getItem(DRAFT_ADDITIONS_KEY)
      if (newRaw) {
        const { topicRef, addedItems } = JSON.parse(newRaw) as {
          topicRef:
            | { kind: "new"; title: string }
            | { kind: "existing"; id: string }
          addedItems: string[]
        }
        if (topicRef.kind === "new") {
          setDraft({
            topicId: "",
            title: topicRef.title,
            isCustom: true,
            customLabels: addedItems,
          })
        } else {
          const t = MOCK_TOPICS.find((m) => m.id === topicRef.id)
          if (t) {
            setDraft({
              topicId: t.id,
              title: t.title,
              isCustom: false,
              customLabels: addedItems,
            })
          }
        }
        return
      }
      const legacyRaw = sessionStorage.getItem(NEW_TOPIC_DRAFT_KEY)
      if (!legacyRaw) return
      const { title, items } = JSON.parse(legacyRaw) as {
        title: string
        items: string[]
      }
      setDraft({ topicId: "", title, isCustom: true, customLabels: items })
    } catch {
      /* ignore */
    }
  }, [active])

  return (
    <div>
      <span data-testid="topicId">{draft?.topicId ?? ""}</span>
      <span data-testid="title">{draft?.title ?? ""}</span>
      <span data-testid="isCustom">{draft?.isCustom ? "true" : "false"}</span>
      <span data-testid="customLabels">
        {(draft?.customLabels ?? []).join(",")}
      </span>
    </div>
  )
}

describe("favpoll_draft_additions format hydration", () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it("hydrates a new custom topic from kind:new draft", async () => {
    sessionStorage.setItem(
      DRAFT_ADDITIONS_KEY,
      JSON.stringify({
        topicRef: { kind: "new", title: "My Sport" },
        addedItems: ["Football", "Tennis"],
      })
    )
    await act(async () => {
      render(<DraftReaderV2 active={true} />)
    })
    expect(screen.getByTestId("title").textContent).toBe("My Sport")
    expect(screen.getByTestId("isCustom").textContent).toBe("true")
    expect(screen.getByTestId("customLabels").textContent).toBe(
      "Football,Tennis"
    )
  })

  it("hydrates a canonical topic from kind:existing draft", async () => {
    sessionStorage.setItem(
      DRAFT_ADDITIONS_KEY,
      JSON.stringify({
        topicRef: { kind: "existing", id: "t1" },
        addedItems: ["Purple", "Orange"],
      })
    )
    await act(async () => {
      render(<DraftReaderV2 active={true} />)
    })
    expect(screen.getByTestId("topicId").textContent).toBe("t1")
    expect(screen.getByTestId("title").textContent).toBe("Colour")
    expect(screen.getByTestId("isCustom").textContent).toBe("false")
    expect(screen.getByTestId("customLabels").textContent).toBe("Purple,Orange")
  })

  it("new format takes priority when both keys are present", async () => {
    sessionStorage.setItem(
      DRAFT_ADDITIONS_KEY,
      JSON.stringify({
        topicRef: { kind: "new", title: "New Format" },
        addedItems: ["A"],
      })
    )
    sessionStorage.setItem(
      NEW_TOPIC_DRAFT_KEY,
      JSON.stringify({ title: "Legacy Format", items: ["B"] })
    )
    await act(async () => {
      render(<DraftReaderV2 active={true} />)
    })
    expect(screen.getByTestId("title").textContent).toBe("New Format")
  })

  it("falls back to legacy format when new key is absent", async () => {
    sessionStorage.setItem(
      NEW_TOPIC_DRAFT_KEY,
      JSON.stringify({ title: "Legacy Topic", items: ["X", "Y"] })
    )
    await act(async () => {
      render(<DraftReaderV2 active={true} />)
    })
    expect(screen.getByTestId("title").textContent).toBe("Legacy Topic")
    expect(screen.getByTestId("isCustom").textContent).toBe("true")
    expect(screen.getByTestId("customLabels").textContent).toBe("X,Y")
  })

  it("does nothing when active=false even with storage set", async () => {
    sessionStorage.setItem(
      DRAFT_ADDITIONS_KEY,
      JSON.stringify({
        topicRef: { kind: "new", title: "Ignored" },
        addedItems: [],
      })
    )
    await act(async () => {
      render(<DraftReaderV2 active={false} />)
    })
    expect(screen.getByTestId("title").textContent).toBe("")
  })
})

// ─── Updated exit guard condition ─────────────────────────────────────────────
// Mirrors: isCustom || customLabels.length > 0
// Guard now fires for canonical topics that have organiser additions too.

function ExitGuardV2({
  isCustom,
  customLabelsCount,
}: {
  isCustom: boolean
  customLabelsCount: number
}) {
  const active = isCustom || customLabelsCount > 0
  useEffect(() => {
    if (!active) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "You have unsaved changes. Leave without publishing?"
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [active])
  return null
}

describe("updated exit guard condition", () => {
  it("fires for a new custom topic (isCustom=true, no labels yet)", async () => {
    const spy = vi.spyOn(window, "addEventListener")
    await act(async () => {
      render(<ExitGuardV2 isCustom={true} customLabelsCount={0} />)
    })
    expect(
      spy.mock.calls.filter((args) => args[0] === "beforeunload")
    ).toHaveLength(1)
    spy.mockRestore()
  })

  it("fires for a canonical topic with organiser additions", async () => {
    const spy = vi.spyOn(window, "addEventListener")
    await act(async () => {
      render(<ExitGuardV2 isCustom={false} customLabelsCount={2} />)
    })
    expect(
      spy.mock.calls.filter((args) => args[0] === "beforeunload")
    ).toHaveLength(1)
    spy.mockRestore()
  })

  it("does not fire for a canonical topic with no additions", async () => {
    const spy = vi.spyOn(window, "addEventListener")
    await act(async () => {
      render(<ExitGuardV2 isCustom={false} customLabelsCount={0} />)
    })
    expect(
      spy.mock.calls.filter((args) => args[0] === "beforeunload")
    ).toHaveLength(0)
    spy.mockRestore()
  })
})
