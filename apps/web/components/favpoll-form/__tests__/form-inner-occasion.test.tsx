import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useEffect } from "react"
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
  // In an effect, not during render: assigning a module-scope variable
  // while rendering is exactly what react-hooks/globals forbids, and
  // React Testing Library flushes effects inside render(), so the
  // handle is ready by the time any test reads it.
  useEffect(() => {
    capturedForm = form
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

  // A cause used to skip step 1 entirely — it had no who. Cause IS a who
  // answer now (2026-08-25), so the step opens with it already pressed.
  it("opens on the who step for a cause, with Cause pressed", () => {
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
    expect(screen.getByText("Who is this favpoll for?")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cause" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    fireEvent.click(screen.getByRole("button", { name: "Cause" }))
    expect(
      screen.getByRole("option", { name: "Coffee morning" })
    ).toBeInTheDocument()
  })

  // The move's whole point: picking Cause switches the axis mid-dialog,
  // on a form that started life as a person.
  it("picking Cause on a person form switches to the cause occasions", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "Cause" }))
    expect(
      screen.getByRole("option", { name: "Coffee morning" })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("option", { name: "Birthday" })
    ).not.toBeInTheDocument()
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

describe("GenerateExampleDialog — Cause as a who answer", () => {
  // `pronoun` is a CHECKED column (he/she/they). The who value flows into
  // it for anything that is not couple/group, so a sixth who value that
  // reached that branch would write an invalid pronoun.
  it("never writes 'cause' into pronoun, and sets the cause subject", async () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "Cause" }))
    fireEvent.click(screen.getByRole("option", { name: "No occasion" }))
    await waitFor(() => expect(mockSafeGenerateDraft).toHaveBeenCalled())

    expect(capturedForm.getValues("pronoun")).toBeUndefined()
    expect(capturedForm.getValues("subject")).toBe("cause")
    expect(capturedForm.getValues("register")).toBe("cause")
  })

  // A cause is the cause register whatever the category says — subject
  // wins in deriveRegister, so a Celebration that turns out to be a cause
  // must not stay on celebrating_one.
  it("overrides the category's register when Cause is picked", async () => {
    render(
      <Wrapper
        defaultValues={{ category: "celebration", topics: [CANONICAL_TOPIC] }}
      />
    )
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "Cause" }))
    fireEvent.click(screen.getByRole("option", { name: "No occasion" }))
    await waitFor(() =>
      expect(mockSafeGenerateDraft).toHaveBeenCalledWith(
        expect.objectContaining({ register: "cause", subject: "cause" })
      )
    )
  })
})

describe("GenerateExampleDialog — the subject lands without generating", () => {
  // Everything else in the dialog is generation metadata and waits for
  // onGenerate. Subject cannot: it decides whether a protagonist exists,
  // and routes the one "about" box into protagonists.about or
  // events.description. If it waited, declaring a cause would require an
  // LLM round-trip that also overwrites name, about and reveal.
  it("sets the cause subject on the click, before any occasion is picked", () => {
    render(<Wrapper defaultValues={{ topics: [CANONICAL_TOPIC] }} />)
    openDialog()
    fireEvent.click(screen.getByRole("button", { name: "Cause" }))

    expect(capturedForm.getValues("subject")).toBe("cause")
    expect(capturedForm.getValues("register")).toBe("cause")
    expect(mockSafeGenerateDraft).not.toHaveBeenCalled()
  })

  it("returns to a person subject when a pronoun is picked instead", () => {
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
    fireEvent.click(screen.getByRole("button", { name: "She" }))

    expect(capturedForm.getValues("subject")).toBe("someone")
    expect(mockSafeGenerateDraft).not.toHaveBeenCalled()
  })
})
