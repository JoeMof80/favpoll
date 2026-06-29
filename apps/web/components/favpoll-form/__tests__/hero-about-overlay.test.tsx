import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import type { FavpollFormValues } from "../schema"

vi.mock("@/components/ui/responsive-overlay", () => ({
  ResponsiveOverlay: ({
    open,
    header,
    footer,
  }: {
    open: boolean
    header?: React.ReactNode
    footer?: React.ReactNode
  }) => {
    if (!open) return null
    return (
      <div data-testid="overlay">
        {header}
        {footer}
      </div>
    )
  },
}))

vi.mock("@/components/ui/input-group", () => ({
  InputGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InputGroupAddon: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  InputGroupButton: ({
    children,
    onClick,
    disabled,
    "aria-label": ariaLabel,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    "aria-label"?: string
  }) => (
    <button onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
  InputGroupText: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  InputGroupTextarea: ({
    onChange,
    value,
    placeholder,
    maxLength,
    rows,
    "aria-describedby": ariaDescribedby,
  }: {
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
    value?: string
    placeholder?: string
    maxLength?: number
    rows?: number
    "aria-describedby"?: string
  }) => (
    <textarea
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      maxLength={maxLength}
      rows={rows}
      aria-describedby={ariaDescribedby}
    />
  ),
}))

import { HeroAboutOverlay } from "../hero-about-overlay"

function Wrap({
  children,
  subject = "someone",
}: {
  children: React.ReactNode
  subject?: "someone" | "cause"
}) {
  const form = useForm<FavpollFormValues>({
    defaultValues: { subject, about: "" },
  })
  return <Form {...form}>{children}</Form>
}

describe("HeroAboutOverlay — helper text", () => {
  it("shows person-variant copy when subject=someone", () => {
    render(
      <Wrap subject="someone">
        <HeroAboutOverlay
          open={true}
          onOpenChange={() => {}}
          isGenerating={false}
        />
      </Wrap>
    )
    expect(
      screen.getByText(/Introduce them in a sentence or two/)
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/What you're raising for/)
    ).not.toBeInTheDocument()
  })

  it("shows cause-variant copy when subject=cause", () => {
    render(
      <Wrap subject="cause">
        <HeroAboutOverlay
          open={true}
          onOpenChange={() => {}}
          isGenerating={false}
        />
      </Wrap>
    )
    expect(screen.getByText(/What you're raising for/)).toBeInTheDocument()
    expect(
      screen.queryByText(/Introduce them in a sentence or two/)
    ).not.toBeInTheDocument()
  })

  it("textarea has aria-describedby pointing at #about-helper", () => {
    render(
      <Wrap>
        <HeroAboutOverlay
          open={true}
          onOpenChange={() => {}}
          isGenerating={false}
        />
      </Wrap>
    )
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveAttribute("aria-describedby", "about-helper")
    expect(document.getElementById("about-helper")).toBeInTheDocument()
  })

  it("does not render the overlay when open=false", () => {
    render(
      <Wrap>
        <HeroAboutOverlay
          open={false}
          onOpenChange={() => {}}
          isGenerating={false}
        />
      </Wrap>
    )
    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument()
  })
})
