import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { FormInner } from "../form-inner"
import type { FavpollFormValues } from "../schema"

const mockSafeGenerateDraft = vi.hoisted(() => vi.fn())
const mockToastError = vi.hoisted(() => vi.fn())

vi.mock("../command-panel", () => ({
  CommandPanel: ({ onSubmit }: { onSubmit: () => void }) => (
    <button onClick={() => onSubmit()}>Publish</button>
  ),
}))
vi.mock("../editable-hero", () => ({
  EditableHero: () => <div data-testid="editable-hero" />,
}))
vi.mock("../editable-poll-area", () => ({
  EditablePollArea: () => <div data-testid="editable-poll-area" />,
}))
vi.mock("../editable-countdown", () => ({ EditableCountdown: () => null }))
vi.mock("../goal-overlay", () => ({ GoalOverlay: () => null }))
vi.mock("@/components/charity-banner", () => ({ CharityBanner: () => null }))
vi.mock("sonner", () => ({ toast: { error: mockToastError } }))
vi.mock("@/lib/actions/generate-draft", () => ({
  safeGenerateDraft: mockSafeGenerateDraft,
}))
vi.mock("@/components/ui/responsive-overlay", () => ({
  ResponsiveOverlay: ({
    open,
    children,
  }: {
    open: boolean
    children?: React.ReactNode
  }) => (open ? <div data-testid="generate-dialog">{children}</div> : null),
}))

let capturedForm: ReturnType<
  typeof useForm<FavpollFormValues, unknown, FavpollFormValues>
>
const onSubmit = vi.fn()

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
      onSubmit={onSubmit}
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

async function generate() {
  fireEvent.click(screen.getByRole("button", { name: "Generate an example" }))
  fireEvent.click(screen.getByRole("button", { name: "She" }))
  fireEvent.click(screen.getByRole("option", { name: "No occasion" }))
  await waitFor(() => expect(mockSafeGenerateDraft).toHaveBeenCalled())
}

beforeEach(() => {
  onSubmit.mockReset()
  mockToastError.mockReset()
  mockSafeGenerateDraft.mockReset()
  mockSafeGenerateDraft.mockResolvedValue({
    about: "generated about",
    reveal: "generated reveal",
    fromCache: false,
  })
  vi.spyOn(window, "confirm").mockReturnValue(true)
})

describe("FormInner — generated-example submit guard", () => {
  it("blocks publishing while example fields are unedited", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    await generate()
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringContaining("still the generated example"),
      expect.anything()
    )
  })

  it("submits once the example fields are personalised", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    await generate()
    capturedForm.setValue("name", "Auntie Vi")
    capturedForm.setValue("context", "1938 – 2026")
    capturedForm.setValue("reveal", "Hers was Blue. She painted every door.")
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    expect(onSubmit).toHaveBeenCalled()
    expect(mockToastError).not.toHaveBeenCalled()
  })

  it("names only the fields still on example copy", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    await generate()
    capturedForm.setValue("name", "Auntie Vi")
    capturedForm.setValue("context", "1938 – 2026")
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(mockToastError).toHaveBeenCalledWith(
      expect.stringMatching(/^The reveal is still/),
      expect.anything()
    )
  })

  it("does not gate a favpoll that never generated", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    expect(onSubmit).toHaveBeenCalled()
  })

  it("does not gate cause favpolls (their example copy is truthful)", async () => {
    mockSafeGenerateDraft.mockResolvedValue({
      about: "generated about",
      reveal: "Our pick to start: Blue — a good one.",
      causeLabel: "Warm Plates This Winter",
      context: "Winter 2026 appeal",
      fromCache: false,
    })
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
    fireEvent.click(screen.getByRole("button", { name: "Generate an example" }))
    fireEvent.click(screen.getByRole("option", { name: "No occasion" }))
    await waitFor(() => expect(mockSafeGenerateDraft).toHaveBeenCalled())
    fireEvent.click(screen.getByRole("button", { name: "Publish" }))
    expect(onSubmit).toHaveBeenCalled()
  })
})
