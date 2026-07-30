import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { FormInner } from "../form-inner"
import { OCCASIONS } from "@/lib/occasions"
import type { OccasionSpec } from "@/lib/occasions"
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
// The picker's overlay behaviour is its own concern — here it is a flat
// list so the tests drive form-inner's occasion logic directly.
vi.mock("../occasion-picker", () => ({
  OccasionPicker: ({
    open,
    occasions,
    onSelect,
  }: {
    open: boolean
    occasions: OccasionSpec[]
    onSelect: (o: OccasionSpec | null) => void
  }) =>
    open ? (
      <div data-testid="occasion-picker">
        {occasions.map((o) => (
          <button key={o.label} onClick={() => onSelect(o)}>
            {o.label}
          </button>
        ))}
      </div>
    ) : null,
}))

let capturedForm: ReturnType<
  typeof useForm<FavpollFormValues, unknown, FavpollFormValues>
>

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
  capturedForm = form
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

const occasionChip = () => screen.getByRole("button", { name: /occasion/i })

beforeEach(() => {
  mockSafeGenerateDraft.mockReset()
  mockSafeGenerateDraft.mockResolvedValue({
    about: "generated about",
    reveal: "generated reveal",
    fromCache: false,
  })
  vi.spyOn(window, "confirm").mockReturnValue(true)
})

describe("FormInner — occasion chip readiness", () => {
  it("waits for a who on celebrations, then enables", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    expect(occasionChip()).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Generate for She" }))
    // The tap also generates; the chip unlocks once generation settles.
    await waitFor(() => expect(occasionChip()).toBeEnabled())
  })

  it("is live from the start on a memorial", () => {
    render(
      <Wrapper
        defaultValues={{
          category: "memorial",
          register: "remembering",
          topics: [CANONICAL_TOPIC],
        }}
      />
    )
    expect(occasionChip()).toBeEnabled()
  })

  it("is live from the start on a cause", () => {
    render(
      <Wrapper
        defaultValues={{
          category: undefined,
          subject: "cause",
          register: "cause",
          topics: [CANONICAL_TOPIC],
        }}
      />
    )
    expect(occasionChip()).toBeEnabled()
  })
})

describe("FormInner — occasion-targeted generation", () => {
  it("stamps an opening line and context from the picked occasion's variants", async () => {
    render(
      <Wrapper
        defaultValues={{
          category: "memorial",
          register: "remembering",
          topics: [CANONICAL_TOPIC],
        }}
      />
    )
    fireEvent.click(occasionChip())
    fireEvent.click(screen.getByRole("button", { name: "Pet memorial" }))
    const spec = OCCASIONS.find((o) => o.label === "Pet memorial")!
    await waitFor(() => expect(mockSafeGenerateDraft).toHaveBeenCalled())
    expect(spec.openingLines).toContain(capturedForm.getValues("openingLine"))
    expect(spec.contexts).toContain(capturedForm.getValues("context"))
  })

  it("filters the list by who — Pair sees Wedding, Group does not", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    fireEvent.click(screen.getByRole("button", { name: "Generate for Pair" }))
    await waitFor(() => expect(occasionChip()).toBeEnabled())
    fireEvent.click(occasionChip())
    expect(screen.getByRole("button", { name: "Wedding" })).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "Championship win" })
    ).not.toBeInTheDocument()
  })

  it("clears an incompatible occasion when the who changes", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    fireEvent.click(screen.getByRole("button", { name: "Generate for Pair" }))
    await waitFor(() => expect(occasionChip()).toBeEnabled())
    fireEvent.click(occasionChip())
    fireEvent.click(screen.getByRole("button", { name: "Wedding" }))
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Occasion: Wedding" })
      ).toBeEnabled()
    )
    fireEvent.click(screen.getByRole("button", { name: "Generate for Group" }))
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Pick an occasion" })
      ).toBeInTheDocument()
    )
    // The regeneration after the incompatible who fell back to the
    // register-level prefix, not Wedding's opening lines.
    const wedding = OCCASIONS.find((o) => o.label === "Wedding")!
    expect(wedding.openingLines).not.toContain(
      capturedForm.getValues("openingLine")
    )
  })

  it("keeps a compatible occasion across a who change", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    fireEvent.click(screen.getByRole("button", { name: "Generate for Pair" }))
    await waitFor(() => expect(occasionChip()).toBeEnabled())
    fireEvent.click(occasionChip())
    fireEvent.click(screen.getByRole("button", { name: "Joint celebration" }))
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Occasion: Joint celebration" })
      ).toBeEnabled()
    )
    fireEvent.click(screen.getByRole("button", { name: "Generate for Group" }))
    expect(
      screen.getByRole("button", { name: "Occasion: Joint celebration" })
    ).toBeInTheDocument()
  })
})
