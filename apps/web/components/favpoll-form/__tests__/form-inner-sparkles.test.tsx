import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { FormInner } from "../form-inner"
import type { FavpollFormValues } from "../schema"

const mockSafeGenerateDraft = vi.hoisted(() => vi.fn())

vi.mock("../command-panel", () => ({ CommandPanel: () => null }))
vi.mock("../editable-hero", () => ({
  EditableHero: () => <div data-testid="editable-hero" />,
}))
vi.mock("../editable-poll-area", () => ({
  EditablePollArea: () => <div data-testid="editable-poll-area" />,
}))
vi.mock("../editable-countdown", () => ({ EditableCountdown: () => null }))
vi.mock("../goal-overlay", () => ({ GoalOverlay: () => null }))
vi.mock("@/components/charity-banner", () => ({ CharityBanner: () => null }))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))
vi.mock("@/lib/actions/generate-draft", () => ({
  safeGenerateDraft: mockSafeGenerateDraft,
}))
// Flatten the overlay so the dialog's steps render inline.
vi.mock("@/components/ui/responsive-overlay", () => ({
  ResponsiveOverlay: ({
    open,
    children,
  }: {
    open: boolean
    children?: React.ReactNode
  }) => (open ? <div data-testid="generate-dialog">{children}</div> : null),
}))

// Drives the two-step dialog: pill -> who -> No occasion.
function generateVia(who: string) {
  fireEvent.click(screen.getByRole("button", { name: "Generate an example" }))
  fireEvent.click(screen.getByRole("button", { name: who }))
  fireEvent.click(screen.getByRole("option", { name: "No occasion" }))
}

function Wrapper({
  defaultValues,
}: {
  defaultValues?: Partial<FavpollFormValues>
}) {
  const form = useForm<FavpollFormValues, unknown, FavpollFormValues>({
    defaultValues: {
      register: "celebrating_one",
      category: "celebration",
      grouping: "individual",
      subject: "someone",
      topics: [],
      charities: [],
      isListed: true,
      ...defaultValues,
    } as FavpollFormValues,
  })
  return (
    <FormInner
      form={form}
      charities={[]}
      topics={[]}
      mode="create"
      submitting={false}
      error={null}
      onSubmit={vi.fn()}
      hasNewTopicDraft={false}
    />
  )
}

const CANONICAL_TOPIC: FavpollFormValues["topics"][0] = {
  topicId: "topic-1",
  title: "Colour",
  isCustom: false,
  items: [],
  customLabels: [],
}

describe("FormInner — Sparkles button reachability", () => {
  beforeEach(() => {
    mockSafeGenerateDraft.mockReset()
    vi.spyOn(window, "confirm").mockReturnValue(true)
  })

  it("is absent when no topic is selected", () => {
    render(<Wrapper defaultValues={{ topics: [] }} />)
    expect(screen.queryByText("Generate an example")).not.toBeInTheDocument()
  })

  it("is present when a custom topic with a title is selected", () => {
    render(
      <Wrapper
        defaultValues={{
          topics: [
            {
              topicId: "",
              title: "My topic",
              isCustom: true,
              items: [],
              customLabels: [],
            },
          ],
        }}
      />
    )
    expect(screen.getByText("Generate an example")).toBeInTheDocument()
  })

  it("is absent when a custom topic has no title", () => {
    render(
      <Wrapper
        defaultValues={{
          topics: [
            {
              topicId: "",
              title: "",
              isCustom: true,
              items: [],
              customLabels: [],
            },
          ],
        }}
      />
    )
    expect(screen.queryByText("Generate an example")).not.toBeInTheDocument()
  })

  it("is present when a canonical topic is selected", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    expect(screen.getByText("Generate an example")).toBeInTheDocument()
  })

  it("invokes safeGenerateDraft with topicId for canonical topic", async () => {
    mockSafeGenerateDraft.mockResolvedValue({
      about: "generated about",
      reveal: "generated reveal",
      fromCache: false,
    })
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    generateVia("She")
    await waitFor(() =>
      expect(mockSafeGenerateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          register: "celebrating_one",
          subject: "someone",
          topicId: "topic-1",
          primaryCharityId: null,
          pronoun: "she",
        })
      )
    )
  })

  it("invokes safeGenerateDraft with topicTitle/itemLabels for custom topic", async () => {
    mockSafeGenerateDraft.mockResolvedValue({
      about: "generated about",
      reveal: "generated reveal",
      fromCache: false,
    })
    render(
      <Wrapper
        defaultValues={{
          topics: [
            {
              topicId: "",
              title: "Thing",
              isCustom: true,
              items: [],
              customLabels: ["Hat", "Scarf"],
            },
          ],
        }}
      />
    )
    generateVia("They")
    await waitFor(() =>
      expect(mockSafeGenerateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          register: "celebrating_one",
          subject: "someone",
          topicId: "",
          primaryCharityId: null,
          topicTitle: "Thing",
          itemLabels: ["Hat", "Scarf"],
        })
      )
    )
  })

  it("shows Generating… while safeGenerateDraft is in flight", async () => {
    let settle!: () => void
    mockSafeGenerateDraft.mockImplementation(
      () =>
        new Promise<null>((r) => {
          settle = () => r(null)
        })
    )
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    generateVia("They")
    await waitFor(() =>
      expect(screen.getByText("Generating…")).toBeInTheDocument()
    )
    act(() => settle())
  })
})
