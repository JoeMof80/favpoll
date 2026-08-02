import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { FormInner } from "../form-inner"
import { OCCASIONS } from "@/lib/occasions"
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
// Flatten the overlay so the real GenerateExampleDialog's step logic is
// exercised without Radix portals.
vi.mock("@/components/ui/responsive-overlay", () => ({
  ResponsiveOverlay: ({
    open,
    title,
    header,
    footer,
    children,
    mobileBack,
  }: {
    open: boolean
    title: string
    header?: React.ReactNode
    footer?: React.ReactNode
    children?: React.ReactNode
    mobileBack?: { label?: string; onClick: () => void }
  }) =>
    open ? (
      <div data-testid="generate-dialog">
        <span>{title}</span>
        {mobileBack && (
          <button onClick={mobileBack.onClick}>
            {mobileBack.label ?? "Back"}
          </button>
        )}
        {header}
        {children}
        {footer}
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

const openDialog = () =>
  fireEvent.click(screen.getByRole("button", { name: "Generate an example" }))

beforeEach(() => {
  mockSafeGenerateDraft.mockReset()
  mockSafeGenerateDraft.mockResolvedValue({
    about: "generated about",
    reveal: "generated reveal",
    fromCache: false,
  })
  vi.spyOn(window, "confirm").mockReturnValue(true)
})

describe("GenerateExampleDialog — steps", () => {
  it("opens on the who step for a celebration", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    expect(screen.getByText("Who is this favpoll for?")).toBeInTheDocument()
    expect(screen.queryByText("Pick an occasion")).not.toBeInTheDocument()
  })

  it("opens straight onto occasions for a cause", () => {
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
    openDialog()
    expect(screen.getByText("Pick an occasion")).toBeInTheDocument()
    expect(
      screen.getByRole("option", { name: "Coffee morning" })
    ).toBeInTheDocument()
  })

  it("picking a who advances to its narrowed occasion list", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "She" }))
    expect(screen.getByText("Pick an occasion")).toBeInTheDocument()
    expect(
      screen.getByRole("option", { name: "Retirement" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "Wedding" })
    ).not.toBeInTheDocument()
  })

  it("Pair sees pair occasions, not group ones", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "Pair" }))
    expect(screen.getByRole("option", { name: "Wedding" })).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "Championship win" })
    ).not.toBeInTheDocument()
  })

  it("Back returns to the who step", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "Group" }))
    expect(screen.getByText("Pick an occasion")).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole("button", { name: /Back/ })[0])
    expect(screen.getByText("Who is this favpoll for?")).toBeInTheDocument()
  })

  it("carries the provenance line on both steps", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    expect(screen.getByText(/Examples are starting points/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "She" }))
    expect(screen.getByText(/Examples are starting points/)).toBeInTheDocument()
  })

  it("search filters the occasion list", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "She" }))
    fireEvent.change(screen.getByPlaceholderText("Search occasions…"), {
      target: { value: "retire" },
    })
    expect(
      screen.getByRole("option", { name: "Retirement" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "Birthday" })
    ).not.toBeInTheDocument()
  })
})

describe("GenerateExampleDialog — generation", () => {
  it("picking an occasion generates with its variants and closes", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "She" }))
    fireEvent.click(screen.getByRole("option", { name: "Retirement" }))
    expect(screen.queryByTestId("generate-dialog")).not.toBeInTheDocument()
    await waitFor(() =>
      expect(mockSafeGenerateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          register: "celebrating_one",
          pronoun: "she",
          topicId: "topic-1",
        })
      )
    )
    const spec = OCCASIONS.find((o) => o.label === "Retirement")!
    expect(spec.openingLines).toContain(capturedForm.getValues("openingLine"))
    expect(spec.contexts).toContain(capturedForm.getValues("context"))
  })

  it("No occasion generates at register level", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "Pair" }))
    fireEvent.click(screen.getByRole("option", { name: "No occasion" }))
    await waitFor(() =>
      expect(mockSafeGenerateDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          register: "celebrating_many",
          pronoun: "they",
        })
      )
    )
    // Register-level prefix, not any occasion's opening line
    expect(capturedForm.getValues("openingLine")).toBe("Celebrating")
  })

  it("remembers who and occasion for the next open", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "Pair" }))
    fireEvent.click(screen.getByRole("option", { name: "Wedding" }))
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Generate an example" })
      ).toBeEnabled()
    )
    openDialog()
    expect(screen.getByRole("button", { name: "Pair" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    fireEvent.click(screen.getByRole("button", { name: "Pair" }))
    expect(screen.getByRole("option", { name: "Wedding" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
  })
})
