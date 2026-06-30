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
vi.mock("@/components/charity-banner", () => ({ CharityBanner: () => null }))
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))
vi.mock("@/lib/actions/generate-draft", () => ({
  safeGenerateDraft: mockSafeGenerateDraft,
}))

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
      categories={[]}
      mode="create"
      submitting={false}
      error={null}
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
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
    expect(
      screen.queryByRole("button", { name: /generate a suggestion/i })
    ).not.toBeInTheDocument()
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
    expect(
      screen.getByRole("button", { name: /generate a suggestion/i })
    ).toBeInTheDocument()
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
    expect(
      screen.queryByRole("button", { name: /generate a suggestion/i })
    ).not.toBeInTheDocument()
  })

  it("is present when a canonical topic is selected", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    expect(
      screen.getByRole("button", { name: /generate a suggestion/i })
    ).toBeInTheDocument()
  })

  it("invokes safeGenerateDraft with topicId for canonical topic", async () => {
    mockSafeGenerateDraft.mockResolvedValue({
      about: "generated about",
      reveal: "generated reveal",
      fromCache: false,
    })
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    fireEvent.click(
      screen.getByRole("button", { name: /generate a suggestion/i })
    )
    await waitFor(() =>
      expect(mockSafeGenerateDraft).toHaveBeenCalledWith({
        register: "celebrating_one",
        subject: "someone",
        topicId: "topic-1",
        primaryCharityId: null,
      })
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
    fireEvent.click(
      screen.getByRole("button", { name: /generate a suggestion/i })
    )
    await waitFor(() =>
      expect(mockSafeGenerateDraft).toHaveBeenCalledWith({
        register: "celebrating_one",
        subject: "someone",
        topicId: "",
        primaryCharityId: null,
        topicTitle: "Thing",
        itemLabels: ["Hat", "Scarf"],
      })
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
    fireEvent.click(
      screen.getByRole("button", { name: /generate a suggestion/i })
    )
    await waitFor(() =>
      expect(screen.getByText("Generating…")).toBeInTheDocument()
    )
    act(() => settle())
  })
})
