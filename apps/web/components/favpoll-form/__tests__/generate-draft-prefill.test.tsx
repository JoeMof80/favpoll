import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act, waitFor } from "@testing-library/react"
import { useState, useRef } from "react"
import type { Register, FavpollGrouping } from "@favpoll/types"
import { getExampleName } from "@/lib/registers"
import { getFavpollHeadline } from "@/lib/display"

// Mock safeGenerateDraft before any imports that transitively use it
const mockSafeGenerateDraft = vi.hoisted(() => vi.fn())
vi.mock("@/lib/actions/generate-draft", () => ({
  safeGenerateDraft: mockSafeGenerateDraft,
}))

import { safeGenerateDraft } from "@/lib/actions/generate-draft"

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

// Register-keyed example context values (mirrors CONTEXT_SUGGESTIONS in index.tsx)
const CONTEXT_SUGGESTIONS: Partial<Record<Register, string>> = {
  remembering: "1940 – 2025",
  celebrating_one: "turning 40",
  celebrating_many: "class of 2025",
}

// ---------------------------------------------------------------------------
// Test component — mirrors FormInner's opt-in generation pattern
// ---------------------------------------------------------------------------

type GeneratorProps = {
  register: Register
  subject?: "someone" | "cause"
  topicId: string
  topicTitle?: string
  grouping?: FavpollGrouping
  isCustomTopic: boolean
  primaryCharityId: string | null
  mode?: "create" | "edit"
}

type GeneratedState = {
  isGenerating: boolean
  openingLine: string
  name: string
  context: string
  about: string
  reveal: string
}

function DraftGenerator({
  register,
  subject = "someone",
  topicId,
  topicTitle = "Colour",
  grouping = "individual",
  isCustomTopic,
  primaryCharityId,
  mode = "create",
}: GeneratorProps) {
  const [state, setState] = useState<GeneratedState>({
    isGenerating: false,
    openingLine: "",
    name: "",
    context: "",
    about: "",
    reveal: "",
  })
  const lastGeneratedOpeningLine = useRef<string | null>(null)
  const lastGeneratedName = useRef<string | null>(null)
  const lastGeneratedContext = useRef<string | null>(null)
  const lastGeneratedAbout = useRef<string | null>(null)
  const lastGeneratedReveal = useRef<string | null>(null)

  function handleGenerate() {
    if (mode !== "create") return
    if (isCustomTopic || !topicId) return

    const suggestedOpeningLine = getFavpollHeadline({
      register,
      occasionType: null,
      name: "",
      subject,
    }).prefix

    const suggestedName =
      subject !== "cause"
        ? getExampleName(topicTitle, undefined, grouping, register)
        : null
    const suggestedContext =
      subject !== "cause" ? (CONTEXT_SUGGESTIONS[register] ?? "") : null

    setState((s) => ({
      ...s,
      isGenerating: true,
      openingLine: suggestedOpeningLine,
      ...(suggestedName !== null ? { name: suggestedName } : {}),
      ...(suggestedContext !== null ? { context: suggestedContext } : {}),
    }))
    lastGeneratedOpeningLine.current = suggestedOpeningLine
    if (suggestedName !== null) lastGeneratedName.current = suggestedName
    if (suggestedContext !== null)
      lastGeneratedContext.current = suggestedContext

    safeGenerateDraft({ register, subject, topicId, primaryCharityId })
      .then((result) => {
        setState((s) => {
          const next = { ...s, isGenerating: false }
          if (!result) return next
          if (!s.about) {
            next.about = result.about
            lastGeneratedAbout.current = result.about
          }
          if (!s.reveal) {
            next.reveal = result.reveal
            lastGeneratedReveal.current = result.reveal
          }
          return next
        })
      })
      .catch(() => setState((s) => ({ ...s, isGenerating: false })))
  }

  const showGenerateBtn = mode === "create" && !isCustomTopic && !!topicId

  return (
    <div>
      {state.isGenerating && (
        <div data-testid="shimmer" aria-label="Generating suggestion…" />
      )}
      <span data-testid="openingLine">{state.openingLine}</span>
      <span data-testid="name">{state.name}</span>
      <span data-testid="context">{state.context}</span>
      <span data-testid="about">{state.about}</span>
      <span data-testid="reveal">{state.reveal}</span>
      <span data-testid="isGenerating">{state.isGenerating ? "1" : "0"}</span>
      {showGenerateBtn && (
        <button
          type="button"
          data-testid="generate-btn"
          onClick={handleGenerate}
        >
          Generate a suggestion →
        </button>
      )}
    </div>
  )
}

beforeEach(() => {
  mockSafeGenerateDraft.mockReset()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("generate prompt — person favpoll", () => {
  it("fields are empty on mount; shimmer shows during generation then all fields fill", async () => {
    let resolve!: (v: typeof MOCK_RESULT) => void
    mockSafeGenerateDraft.mockReturnValueOnce(
      new Promise<typeof MOCK_RESULT>((res) => {
        resolve = res
      })
    )

    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          topicTitle="Colour"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    // No auto-generation on mount
    expect(mockSafeGenerateDraft).not.toHaveBeenCalled()
    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
    expect(screen.getByTestId("openingLine").textContent).toBe("")
    expect(screen.getByTestId("name").textContent).toBe("")
    expect(screen.getByTestId("context").textContent).toBe("")
    expect(screen.getByTestId("about").textContent).toBe("")

    // Click the generate prompt
    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    // Static fields fill immediately; shimmer shows while LLM runs
    expect(screen.getByTestId("shimmer")).toBeInTheDocument()
    expect(screen.getByTestId("openingLine").textContent).not.toBe("")
    expect(screen.getByTestId("name").textContent).not.toBe("")
    expect(screen.getByTestId("context").textContent).not.toBe("")
    expect(screen.getByTestId("about").textContent).toBe("") // LLM not done yet

    await act(async () => {
      resolve(MOCK_RESULT)
    })

    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
    expect(screen.getByTestId("about").textContent).toBe(MOCK_RESULT.about)
  })

  it("fills openingLine, name, context immediately; about and reveal after LLM", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(MOCK_RESULT)

    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          topicTitle="Colour"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    // All empty on mount
    expect(screen.getByTestId("openingLine").textContent).toBe("")
    expect(screen.getByTestId("name").textContent).toBe("")
    expect(screen.getByTestId("context").textContent).toBe("")
    expect(screen.getByTestId("about").textContent).toBe("")
    expect(mockSafeGenerateDraft).not.toHaveBeenCalled()

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    expect(screen.getByTestId("openingLine").textContent).not.toBe("")
    expect(screen.getByTestId("name").textContent).not.toBe("")
    expect(screen.getByTestId("context").textContent).toBe("turning 40")
    expect(screen.getByTestId("about").textContent).toBe(MOCK_RESULT.about)
    expect(screen.getByTestId("reveal").textContent).toBe(MOCK_RESULT.reveal)
  })

  it("sets register-keyed opening line prefix", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(MOCK_RESULT)

    await act(async () => {
      render(
        <DraftGenerator
          register="remembering"
          subject="someone"
          topicId="topic-1"
          topicTitle="Colour"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    expect(screen.getByTestId("openingLine").textContent).toBe("In memory of")
    expect(screen.getByTestId("context").textContent).toBe("1940 – 2025")
  })
})

describe("generate prompt — cause favpoll", () => {
  it("fills openingLine, about, and reveal for cause; does NOT set name or context", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(MOCK_CAUSE_RESULT)

    await act(async () => {
      render(
        <DraftGenerator
          register="cause"
          subject="cause"
          topicId="topic-1"
          topicTitle="Colour"
          isCustomTopic={false}
          primaryCharityId="charity-1"
        />
      )
    })

    expect(screen.getByTestId("openingLine").textContent).toBe("")
    expect(screen.getByTestId("about").textContent).toBe("")
    expect(mockSafeGenerateDraft).not.toHaveBeenCalled()

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    expect(screen.getByTestId("openingLine").textContent).toBe("In support of")
    expect(screen.getByTestId("about").textContent).toBe(
      MOCK_CAUSE_RESULT.about
    )
    expect(screen.getByTestId("reveal").textContent).toBe(
      MOCK_CAUSE_RESULT.reveal
    )
    // Person-only fields must NOT be set for cause favpolls
    expect(screen.getByTestId("name").textContent).toBe("")
    expect(screen.getByTestId("context").textContent).toBe("")
  })
})

describe("generation skipped cases", () => {
  it("does not show generate button for custom topics", async () => {
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

    expect(mockSafeGenerateDraft).not.toHaveBeenCalled()
    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
    expect(screen.queryByTestId("generate-btn")).not.toBeInTheDocument()
  })

  it("does not show generate button in edit mode", async () => {
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

    expect(mockSafeGenerateDraft).not.toHaveBeenCalled()
    expect(screen.queryByTestId("generate-btn")).not.toBeInTheDocument()
  })

  it("silently falls back on generation failure — static fields still set", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(null)

    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          topicTitle="Colour"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    // Static fields were set before the LLM call
    expect(screen.getByTestId("openingLine").textContent).not.toBe("")
    expect(screen.getByTestId("name").textContent).not.toBe("")
    // LLM-dependent field stays empty on failure
    expect(screen.getByTestId("about").textContent).toBe("")
    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
  })

  it("cause favpoll — generation failure leaves about/reveal empty but openingLine still set", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(null)

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

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    expect(screen.getByTestId("openingLine").textContent).toBe("In support of")
    expect(screen.getByTestId("about").textContent).toBe("")
    expect(screen.getByTestId("reveal").textContent).toBe("")
    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
  })

  it("rate limit error also degrades gracefully — static fields still set", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(null)

    await act(async () => {
      render(
        <DraftGenerator
          register="celebrating_one"
          topicId="topic-1"
          topicTitle="Colour"
          isCustomTopic={false}
          primaryCharityId={null}
        />
      )
    })

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("isGenerating").textContent).toBe("0")
    )

    expect(screen.getByTestId("openingLine").textContent).not.toBe("")
    expect(screen.getByTestId("about").textContent).toBe("")
    expect(screen.queryByTestId("shimmer")).not.toBeInTheDocument()
  })
})

describe("generateDraft call arguments", () => {
  it("passes subject=cause when subject prop is cause", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(MOCK_CAUSE_RESULT)

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

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() => expect(mockSafeGenerateDraft).toHaveBeenCalled())

    expect(mockSafeGenerateDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        register: "cause",
        subject: "cause",
        topicId: "topic-1",
        primaryCharityId: "charity-1",
      })
    )
  })

  it("passes subject=someone for person registers", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(MOCK_RESULT)

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

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() => expect(mockSafeGenerateDraft).toHaveBeenCalled())

    expect(mockSafeGenerateDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        register: "remembering",
        subject: "someone",
      })
    )
  })

  it("fundraiser-person (register=cause, subject=someone) passes subject=someone", async () => {
    mockSafeGenerateDraft.mockResolvedValueOnce(MOCK_RESULT)

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

    await act(async () => {
      screen.getByTestId("generate-btn").click()
    })

    await waitFor(() => expect(mockSafeGenerateDraft).toHaveBeenCalled())

    expect(mockSafeGenerateDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        register: "cause",
        subject: "someone",
      })
    )
  })
})
