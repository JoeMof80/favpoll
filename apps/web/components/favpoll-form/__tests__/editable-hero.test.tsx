import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import type { FavpollFormValues } from "../schema"

vi.mock("../hero-about-overlay", () => ({ HeroAboutOverlay: () => null }))
vi.mock("../hero-name-overlay", () => ({ HeroNameOverlay: () => null }))
vi.mock("../hero-context-overlay", () => ({ HeroContextOverlay: () => null }))
vi.mock("../hero-opening-line-overlay", () => ({
  HeroOpeningLineOverlay: () => null,
}))
vi.mock("../hero-cause-label-overlay", () => ({
  HeroCauseLabelOverlay: () => null,
}))
vi.mock("../hero-photo-overlay", () => ({ HeroPhotoOverlay: () => null }))
vi.mock("@/components/favpoll-hero-avatar", () => ({
  ProtagonistAvatar: () => <div data-testid="avatar" />,
}))
vi.mock("@/components/ui/section-eyebrow", () => ({
  SectionEyebrow: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}))
vi.mock("@/components/editable-field", () => ({
  EditableField: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => <div onClick={onClick}>{children}</div>,
}))

import { EditableHero } from "../editable-hero"

function Wrap({
  defaultValues,
}: {
  defaultValues?: Partial<FavpollFormValues>
}) {
  const form = useForm<FavpollFormValues>({
    defaultValues: {
      subject: "someone",
      about: "",
      ...defaultValues,
    } as FavpollFormValues,
  })
  return (
    <Form {...form}>
      <EditableHero />
    </Form>
  )
}

describe("EditableHero — About instructional placeholder", () => {
  it("shows person instructional text when subject=someone and about is empty", () => {
    render(<Wrap defaultValues={{ subject: "someone", about: "" }} />)
    expect(screen.getByText(/Enter a short biography/)).toBeInTheDocument()
  })

  it("shows cause instructional text when subject=cause and about is empty", () => {
    render(<Wrap defaultValues={{ subject: "cause", about: "" }} />)
    expect(
      screen.getByText(/Tease the topic and why it matters/)
    ).toBeInTheDocument()
  })

  it("shows the typed about text when about is non-empty", () => {
    render(<Wrap defaultValues={{ about: "A wonderful person." }} />)
    expect(screen.getByText("A wonderful person.")).toBeInTheDocument()
    expect(
      screen.queryByText(/Enter a short biography/)
    ).not.toBeInTheDocument()
  })

  it("does not show topic-specific placeholder prose for any subject", () => {
    render(<Wrap defaultValues={{ subject: "someone", about: "" }} />)
    // fixed instructional string is always present regardless of topic
    expect(screen.getByText(/Enter a short biography/)).toBeInTheDocument()
    // no topic-specific gendered prose leaks through
    expect(screen.queryByText(/^She /)).not.toBeInTheDocument()
  })
})
