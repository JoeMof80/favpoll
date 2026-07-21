// Regression: the FormInner "didn't come from the wizard" guard was
// `if (!category) return null`, which blank-paged /favpolls/new/details for
// cause favpolls once they started carrying category=null (2026-07-13
// remodel — found by the founder creating a cause favpoll). The guard must
// be subject-aware.
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { FormInner } from "../form-inner"
import type { FavpollFormValues } from "../schema"

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
  safeGenerateDraft: vi.fn(),
}))

function Wrapper({
  defaultValues,
}: {
  defaultValues: Partial<FavpollFormValues>
}) {
  const form = useForm<FavpollFormValues, unknown, FavpollFormValues>({
    defaultValues: {
      grouping: "individual",
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

describe("FormInner — from-wizard guard", () => {
  it("renders a cause favpoll with no category", () => {
    render(<Wrapper defaultValues={{ subject: "cause", register: "cause" }} />)
    expect(screen.getByTestId("editable-hero")).toBeInTheDocument()
  })

  it("renders nothing for a person favpoll with no category (not from the wizard)", () => {
    const { container } = render(
      <Wrapper defaultValues={{ subject: "someone" }} />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it("renders a person favpoll with a category", () => {
    render(
      <Wrapper
        defaultValues={{
          subject: "someone",
          category: "celebration",
          register: "celebrating_one",
        }}
      />
    )
    expect(screen.getByTestId("editable-hero")).toBeInTheDocument()
  })
})
