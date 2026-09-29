"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import {
  insertMention,
  mentionQueryAt,
  mentionSuggestions,
  segmentMentions,
  type MentionQuery,
  type MentionTarget,
} from "@/lib/mentions"
import { cn } from "@/lib/utils"

// A TEXTAREA WITH MENTIONS (founder, 2026-09-28: "when you type @, you
// see a shortcut"): type @ and a menu offers the favpoll's charity, its
// topic and — in the note — its favourites; pick one and the NAME goes
// into the text (lib/mentions: no markup). The names already in the text
// are lit in register ink by a highlighter behind the textarea: the
// textarea's own text is transparent, the caret is not, and the two
// share every metric so the words sit exactly on top of each other. A
// textarea cannot colour its own words, and a contenteditable is not
// worth its keyboard on iOS.
//
// The menu is anchored under the field, not the caret: one place to
// look, no caret geometry to get wrong on a phone.

type Props = {
  value: string
  onChange: (next: string) => void
  mentions: MentionTarget[]
  rows?: number
  maxLength?: number
  placeholder?: string
  className?: string
  "aria-label"?: string
}

const KIND_LABEL: Record<MentionTarget["kind"], string> = {
  charity: "charity",
  topic: "topic",
  item: "favourite",
}

export function MentionTextarea({
  value,
  onChange,
  mentions,
  rows = 4,
  maxLength,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: Props) {
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const [open, setOpen] = useState<MentionQuery | null>(null)
  const [active, setActive] = useState(0)
  // Escape on a bare-word menu keeps it shut until the word changes.
  const [dismissedAt, setDismissedAt] = useState<number | null>(null)

  const suggestions = open
    ? mentionSuggestions(mentions, open.query, open.implicit)
    : []
  const menuOpen =
    !!open &&
    suggestions.length > 0 &&
    !(open.implicit && dismissedAt === open.start)

  // Keep the highlighter's scroll in step with the textarea's.
  function syncScroll() {
    if (areaRef.current && backdropRef.current)
      backdropRef.current.scrollTop = areaRef.current.scrollTop
  }
  useEffect(syncScroll, [value])

  function refreshMenu(text: string, caret: number) {
    const q = mentionQueryAt(text, caret)
    setOpen(q)
    setActive(0)
    if (q && dismissedAt !== null && dismissedAt !== q.start)
      setDismissedAt(null)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value)
    refreshMenu(
      e.target.value,
      e.target.selectionStart ?? e.target.value.length
    )
  }

  function choose(t: MentionTarget) {
    if (!open) return
    const area = areaRef.current
    const caret = area?.selectionStart ?? value.length
    const next = insertMention(value, open.start, caret, t.label)
    onChange(next.text)
    setOpen(null)
    requestAnimationFrame(() => {
      if (!area) return
      area.focus()
      area.setSelectionRange(next.caret, next.caret)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!menuOpen) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => (a + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      choose(suggestions[active]!)
    } else if (e.key === "Escape") {
      e.preventDefault()
      if (open?.implicit) setDismissedAt(open.start)
      setOpen(null)
    }
  }

  // The two layers share these so the words align.
  const metrics =
    "px-3 py-2 text-base leading-relaxed md:text-base whitespace-pre-wrap break-words font-[inherit]"
  const segments = segmentMentions(value, mentions)

  return (
    <div className="relative w-full">
      <div
        ref={backdropRef}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden text-foreground",
          metrics,
          className
        )}
      >
        {segments.map((s, i) =>
          s.target ? (
            // Ink alone, as MentionText renders it (founder, 2026-09-29:
            // the tint was "too prominent").
            <span key={i} className="font-medium text-primary">
              {s.text}
            </span>
          ) : (
            <span key={i}>{s.text}</span>
          )
        )}
        {/* A trailing newline needs a line of its own to keep heights equal. */}
        {value.endsWith("\n") ? " " : null}
      </div>
      <Textarea
        ref={areaRef}
        data-slot="input-group-control"
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-expanded={menuOpen}
        aria-controls={menuOpen ? listId : undefined}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        onClick={(e) =>
          refreshMenu(value, e.currentTarget.selectionStart ?? value.length)
        }
        onBlur={() => setTimeout(() => setOpen(null), 120)}
        className={cn(
          "relative flex-1 resize-none rounded-none border-0 bg-transparent text-transparent caret-foreground shadow-none ring-0 placeholder:text-muted-foreground focus-visible:ring-0",
          metrics,
          className
        )}
      />
      {menuOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Mention"
          className="absolute top-full left-3 z-30 mt-1 min-w-48 overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-md"
        >
          {suggestions.map((t, i) => (
            <li
              key={`${t.kind}:${t.label}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(t)
              }}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 px-3 py-1.5 text-sm",
                i === active ? "bg-primary/10 text-primary" : "text-foreground"
              )}
            >
              <span className="font-medium">{t.label}</span>
              <span className="text-xs text-muted-foreground">
                {KIND_LABEL[t.kind]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
