import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import type { FavpollFormValues } from "../schema"

vi.mock("../editable-hero", () => ({
  EditableHero: () => <div data-testid="editable-hero" />,
}))

vi.mock("../editable-poll-area", () => ({
  EditablePollArea: () => <div data-testid="editable-poll-area" />,
}))

vi.mock("../editable-countdown", () => ({
  EditableCountdown: () => null,
}))

vi.mock("@/components/charity-banner", () => ({
  CharityBanner: () => null,
}))

vi.mock("@/lib/registers", () => ({
  deriveRegister: () => "celebrating_one",
}))

import { PreviewPanel } from "../preview-panel"

function Wrap({
  children,
  category = "celebration",
}: {
  children: React.ReactNode
  category?: string | null
}) {
  const form = useForm<FavpollFormValues>({
    defaultValues: {
      category: (category ?? "") as FavpollFormValues["category"],
      charities: [],
      topics: [],
      grouping: "individual",
    },
  })
  return <Form {...form}>{children}</Form>
}

describe("PreviewPanel — floating Sparkles button", () => {
  it("renders the generate button when onRegenerate is provided", () => {
    render(
      <Wrap>
        <PreviewPanel charities={[]} topics={[]} onRegenerate={() => {}} />
      </Wrap>
    )
    expect(
      screen.getByRole("button", { name: /generate a suggestion/i })
    ).toBeInTheDocument()
  })

  it("does not render the generate button when onRegenerate is absent", () => {
    render(
      <Wrap>
        <PreviewPanel charities={[]} topics={[]} />
      </Wrap>
    )
    expect(
      screen.queryByRole("button", { name: /generate a suggestion/i })
    ).not.toBeInTheDocument()
  })

  it("generate button shows 'Generating…' when isGenerating=true", () => {
    render(
      <Wrap>
        <PreviewPanel
          charities={[]}
          topics={[]}
          onRegenerate={() => {}}
          isGenerating={true}
        />
      </Wrap>
    )
    expect(
      screen.getByRole("button", { name: /generating/i })
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /generating/i })).toBeDisabled()
  })

  it("does not render the preview panel at all when category is null", () => {
    render(
      <Wrap category={null}>
        <PreviewPanel charities={[]} topics={[]} onRegenerate={() => {}} />
      </Wrap>
    )
    expect(
      screen.queryByRole("button", { name: /generate/i })
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId("editable-hero")).not.toBeInTheDocument()
  })
})
