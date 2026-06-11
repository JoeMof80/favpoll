import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act, waitFor } from "@testing-library/react"
import { useState, useEffect, useRef } from "react"
import type { Register } from "@favpoll/types"

// Mock generateDraft before any imports that transitively use it
const mockGenerateDraft = vi.hoisted(() => vi.fn())
vi.mock("@/lib/actions/generate-draft", () => {
  class MockRateLimitError extends Error {
    constructor() {
      super("Rate limit exceeded — try again in a few minutes.")
      this.name = "RateLimitError"
    }
  }
  return {
    generateDraft: mockGenerateDraft,
    RateLimitError: MockRateLimitError,
  }
})

import { generateDraft } from "@/lib/actions/generate-draft"

// ---------------------------------------------------------------------------
// Shared test fixture
// ---------------------------------------------------------------------------

const MOCK_RESULT = {
  about: "A gathering for someone truly remarkable.",
  reveal: "Her favourite was always Blue.",
  fromCache: true,
}

const MOCK_CAUSE_RESULT = {
  about: "Join together for a cause that matters.",
  reveal: "Their ocean work reflects the breadth of Blue.",
  fromCache: false,
}

const MOCK_TOPIC = {
  topicId: "topic-1",
  title: "Colour",
  isCustom: false,
  items: [
    { id: "i1", label: "Red" },
    { id: "i2", label: "Blue" },
  ],
  customLabels: [],
}

// ---------------------------------------------------------------------------
// Test component — mirrors FormInner's generation useEffect
// ---------------------------------------------------------------------------

type GeneratorProps = {
  register: Register
  subject?: "someone" | "cause"
  topicId: string
  isCustomTopic: boolean
  primaryCharityId: string | null
  mode?: "create" | "edit"
}

type GeneratedState = {
  isGenerating: boolean
  about: string
  reveal: string
  personRevealExample: string | null
}

function DraftGenerator({
  register,
  subject = "someone",
  topicId,
  isCustomTopic,
  primaryCharityId,
  mode = "create",
}: GeneratorProps) {
  const [state, setState] = useState<GeneratedState>({
    isGenerating: false,
    about: "",
    reveal: "",
    personRevealExample: null,
  })
  const lastGeneratedAbout = useRef<string | null>(null)
  const lastGeneratedReveal = useRef<string | null>(null)

  useEffect(() => {
    if (mode !== "create") return
    if (isCustomTopic || !topicId) return

    setState((s) => ({ ...s, isGenerating: true }))
    generateDraft({ register, subject, topicId, primaryCharityId })
      .then((result) => {
        setState((s) => {
          const next = { ...s, isGenerating: false }
          if (!s.about) {
            next.about = result.about
            lastGeneratedAbout.current = result.about
          }
          if (subject === "cause") {
            if (!s.reveal) {
              next.reveal = result.reveal
              lastGeneratedReveal.current = result.reveal
            }
          } else {
            next.personRevealExample = result.reveal
          }
          return next
        })
      })
      .catch(() => setState((s) => ({ ...s, isGenerating: false })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {state.isGenerating && (
        <div data-testid="shimmer" aria-label="Generating suggestion…" />
      )}
      <span data-testid="about">{state.about}</span>
      <span data-testid="reveal">{state.reveal}</span>
      <span data-testid="personRevealExample">
        {state.personRevealExample ?? ""}
      </span>
      <span data-testid="isGenerating">{state.isGenerating ? "1" : "0"}</span>
    </div>
  )
}

beforeEach(() => {
  mockGenerateDraft.mockReset()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("generation on mount — cache hit, person event", () => {
  it("shows shimmer during generation then pre-fills about", async () => {
    let resolve!: (v: typeof MOCK_RESULT) => void
    mockGenerateDraft.mockReturnValueOnce(
      new Promise<typeof MOCK_RESULT>((res) => {
        resolve = res
      })
    )

    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    expect(screen.getByTestId("shimmer")).toBeInTheDocument()
    expect(screen.getByTestId("about").textContent).toBe("")

    await act(async () => {
      resolve(MOCK_RESULT)
    })

    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
    expect(screen.getByTestId("about").textContent).toBe(MOCK_RESULT.about)
  })

  it("pre-fills about but not reveal for person events", async () => {
    mockGenerateDraft.mockResolvedValueOnce(MOCK_RESULT)

    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    expect(screen.getByTestId("about").textContent).toBe(MOCK_RESULT.about)
    // Reveal field NOT set for person events
    expect(screen.getByTestId("reveal").textContent).toBe("")
    // Person reveal example IS set
    expect(screen.getByTestId("personRevealExample").textContent).toBe(
      MOCK_RESULT.reveal
    )
  })
})

describe("generation on mount — cause event", () => {
  it("pre-fills both about and reveal for cause events", async () => {
    mockGenerateDraft.mockResolvedValueOnce(MOCK_CAUSE_RESULT)

    await act(async () => {
      render(
        <DraftGenerator
          register="cause"
          subject="cause"
          topicId="topic-1"
          isCustomTopic={false}
          primaryCharityId="charity-1"
        />
      )
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    expect(screen.getByTestId("about").textContent).toBe(
      MOCK_CAUSE_RESULT.about
    )
    // Reveal IS set for cause events
    expect(screen.getByTestId("reveal").textContent).toBe(
      MOCK_CAUSE_RESULT.reveal
    )
    // Person reveal example is NOT set for cause
    expect(screen.getByTestId("personRevealExample").textContent).toBe("")
  })
})

describe("generation skipped cases", () => {
  it("does not call generateDraft for custom topics", async () => {
    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          isCustomTopic={true}
          primaryCharityId={null}
        />
      )
    })

    expect(mockGenerateDraft).not.toHaveBeenCalled()
    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
  })

  it("does not call generateDraft in edit mode", async () => {
    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          isCustomTopic={false}
          primaryCharityId={null}
          mode="edit"
        />
      )
    })

    expect(mockGenerateDraft).not.toHaveBeenCalled()
  })

  it("silently falls back on generation failure", async () => {
    mockGenerateDraft.mockRejectedValueOnce(new Error("Network error"))

    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    expect(screen.getByTestId("about").textContent).toBe("")
    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
  })
})

describe("generateDraft call arguments", () => {
  it("passes subject=cause when subject prop is cause", async () => {
    mockGenerateDraft.mockResolvedValueOnce(MOCK_CAUSE_RESULT)

    await act(async () => {
      render(
        <DraftGenerator
          register="cause"
          subject="cause"
          topicId="topic-1"
          isCustomTopic={false}
          primaryCharityId="charity-1"
        />
      )
    })

    await waitFor(() => expect(mockGenerateDraft).toHaveBeenCalled())

    expect(mockGenerateDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        register: "cause",
        subject: "cause",
        topicId: "topic-1",
        primaryCharityId: "charity-1",
      })
    )
  })

  it("passes subject=someone for person registers", async () => {
    mockGenerateDraft.mockResolvedValueOnce(MOCK_RESULT)

    await act(async () => {
      render(
        <DraftGenerator
          register="remembering"
          subject="someone"
          topicId="topic-1"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    await waitFor(() => expect(mockGenerateDraft).toHaveBeenCalled())

    expect(mockGenerateDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        register: "remembering",
        subject: "someone",
      })
    )
  })

  it("fundraiser-person (register=cause, subject=someone) passes subject=someone", async () => {
    mockGenerateDraft.mockResolvedValueOnce(MOCK_RESULT)

    await act(async () => {
      render(
        <DraftGenerator
          register="cause"
          subject="someone"
          topicId="topic-1"
          isCustomTopic={false}
          primaryCharityId="charity-1"
        />
      )
    })

    await waitFor(() => expect(mockGenerateDraft).toHaveBeenCalled())

    expect(mockGenerateDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        register: "cause",
        subject: "someone",
      })
    )
  })
})
