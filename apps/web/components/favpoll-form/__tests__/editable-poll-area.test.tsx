import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import type { FavpollFormValues } from "../schema"

vi.mock("@/components/poll-heading", () => ({
  PollHeading: ({
    onPledge,
  }: {
    topicTitle?: string
    onPledge?: () => void
  }) => (
    <button data-testid="poll-heading-pledge" onClick={onPledge}>
      Pledge
    </button>
  ),
}))

vi.mock("@/components/favpoll-card/poll-results", () => ({
  PollResults: ({
    results,
  }: {
    results: { label: string; amount: string; widthPercent: number }[]
  }) => (
    <ul data-testid="poll-results">
      {results.map((r) => (
        <li key={r.label} data-testid="result-item" data-width={r.widthPercent}>
          {r.label}
        </li>
      ))}
    </ul>
  ),
}))

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
      <div data-testid="reveal-overlay">
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

import { EditablePollArea } from "../editable-poll-area"

const TOPIC_ITEMS = [
  { id: "i1", label: "Red" },
  { id: "i2", label: "Blue" },
  { id: "i3", label: "Green" },
]

const FORM_TOPIC = {
  topicId: "t1",
  title: "Colour",
  isCustom: false,
  items: TOPIC_ITEMS,
  customLabels: [],
}

function Wrap({
  children,
  reveal = "",
}: {
  children: React.ReactNode
  reveal?: string
}) {
  const form = useForm<FavpollFormValues>({
    defaultValues: { topics: [FORM_TOPIC], reveal },
  })
  return <Form {...form}>{children}</Form>
}

function openRevealOverlay() {
  fireEvent.click(screen.getByRole("button", { name: /add reveal/i }))
}

// ── Reveal instructional placeholder (page level) ────────────────────────────

describe("EditablePollArea — reveal instructional placeholder", () => {
  it("shows fixed instructional text when reveal is empty", () => {
    render(
      <Wrap>
        <EditablePollArea />
      </Wrap>
    )
    expect(screen.getByText(/What did they love\? Name it/)).toBeInTheDocument()
  })

  it("shows the reveal text when reveal is non-empty", () => {
    render(
      <Wrap reveal="She always chose Blue.">
        <EditablePollArea />
      </Wrap>
    )
    expect(screen.getByText("She always chose Blue.")).toBeInTheDocument()
    expect(screen.queryByText(/What did they love/)).not.toBeInTheDocument()
  })
})

// ── Reveal overlay helper text ─────────────────────────────────────────────────

describe("EditablePollArea — reveal overlay helper text", () => {
  it("shows R1 helper text after opening the reveal overlay", () => {
    render(
      <Wrap>
        <EditablePollArea />
      </Wrap>
    )
    openRevealOverlay()
    expect(screen.getByText(/Name the thing they loved/)).toBeInTheDocument()
    expect(screen.getByText(/a detail only you/)).toBeInTheDocument()
  })

  it("reveal dialog textarea uses short placeholder, not the page instructional string", () => {
    render(
      <Wrap>
        <EditablePollArea />
      </Wrap>
    )
    openRevealOverlay()
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveAttribute(
      "placeholder",
      "Share something they loved…"
    )
    expect(textarea.getAttribute("placeholder")).not.toMatch(
      /What did they love/
    )
  })

  it("reveal textarea has aria-describedby pointing at #reveal-helper", () => {
    render(
      <Wrap>
        <EditablePollArea />
      </Wrap>
    )
    openRevealOverlay()
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveAttribute("aria-describedby", "reveal-helper")
    expect(document.getElementById("reveal-helper")).toBeInTheDocument()
  })
})

// ── Zeroed preview bars ────────────────────────────────────────────────────────

describe("EditablePollArea — zeroed preview bars", () => {
  it("all catalog-item result bars render with widthPercent=0", () => {
    render(
      <Wrap>
        <EditablePollArea />
      </Wrap>
    )
    const items = screen.getAllByTestId("result-item")
    expect(items.length).toBeGreaterThan(0)
    items.forEach((item) => {
      expect(item.getAttribute("data-width")).toBe("0")
    })
  })

  it("custom labels also render with widthPercent=0", () => {
    function WrapCustomLabels({ children }: { children: React.ReactNode }) {
      const form = useForm<FavpollFormValues>({
        defaultValues: {
          topics: [
            { ...FORM_TOPIC, items: [], customLabels: ["Crimson", "Sage"] },
          ],
          reveal: "",
        },
      })
      return <Form {...form}>{children}</Form>
    }
    render(
      <WrapCustomLabels>
        <EditablePollArea />
      </WrapCustomLabels>
    )
    const items = screen.getAllByTestId("result-item")
    items.forEach((item) => {
      expect(item.getAttribute("data-width")).toBe("0")
    })
  })
})
