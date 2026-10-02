"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { MentionTextarea } from "@/components/mention-textarea"
import { CharCounter } from "@/components/favpoll-form/edit-helpers"
import { DateTimePicker } from "@/components/favpoll-form/date-time-picker"
import { CLOSE_DATE_PRESETS } from "@/components/favpoll-form/date-helpers"
import { GoalPicker } from "@/components/favpoll-form/goal-picker"
import { WIZARD_INPUT_SIZE } from "@/components/new-favpoll-wizard/wizard-field"
import { SettingsRow } from "@/components/manage/settings-rows"
import type { MentionTarget } from "@/lib/mentions"
import { cn } from "@/lib/utils"

// FIELDS THAT ARE ALWAYS LIVE (founder, 2026-09-29: "Should each
// editable field have its own editable field?" — no). The wizard's own
// inputs, exactly as the wizard shows them, and each saves ITSELF: a
// line saves on Enter or on leaving it, a paragraph on leaving it, a
// date or an amount as soon as it changes. Escape puts the old value
// back. The hint says "Saved" for a moment, or carries the error with
// the typed text kept. The switches and the visibility control already
// worked this way; the text fields were the odd ones out behind a
// pencil. A closed favpoll shows the fields disabled — the record.

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string }

function useSaveStatus() {
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )
  function flash(next: Status) {
    setStatus(next)
    if (timer.current) clearTimeout(timer.current)
    if (next.kind === "saved")
      timer.current = setTimeout(() => setStatus({ kind: "idle" }), 2000)
  }
  return [status, flash] as const
}

function Hint({
  description,
  status,
}: {
  description?: React.ReactNode
  status: Status
}) {
  if (status.kind === "error")
    return <span className="text-destructive">{status.message}</span>
  return (
    <>
      {description}
      {status.kind === "saving" && (
        <span className="ml-2 text-muted-foreground">Saving…</span>
      )}
      {status.kind === "saved" && (
        <span className="ml-2 inline-flex items-center gap-1 text-primary">
          <Check className="size-3" aria-hidden="true" />
          Saved
        </span>
      )}
    </>
  )
}

const errorText = (e: unknown) =>
  e instanceof Error ? e.message : "Couldn't save — try again."

export function EditableTextRow({
  label,
  description,
  value,
  maxLength,
  placeholder,
  multiline = false,
  mentions = [],
  required = false,
  readOnly = false,
  onSave,
}: {
  label: string
  description?: React.ReactNode
  value: string
  maxLength: number
  placeholder?: string
  /** The About and the note: a MentionTextarea. */
  multiline?: boolean
  mentions?: MentionTarget[]
  required?: boolean
  /** A closed favpoll: the field, disabled. */
  readOnly?: boolean
  onSave: (next: string) => Promise<void>
}) {
  const [current, setCurrent] = useState(value)
  const [draft, setDraft] = useState(value)
  const [status, flash] = useSaveStatus()
  const [focused, setFocused] = useState(false)
  // The server's value wins while the field isn't being typed in:
  // after a refresh, and when React reuses this row for another field
  // (React's own derive-in-render pattern, not an effect).
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    if (!focused) {
      setCurrent(value)
      setDraft(value)
    }
  }

  async function commit() {
    const next = draft.trim()
    if (next === current) return
    if (required && !next) {
      setDraft(current)
      flash({ kind: "error", message: "This can't be empty." })
      return
    }
    flash({ kind: "saving" })
    try {
      await onSave(next)
      setCurrent(next)
      flash({ kind: "saved" })
    } catch (e) {
      flash({ kind: "error", message: errorText(e) })
    }
  }

  function revert() {
    setDraft(current)
    flash({ kind: "idle" })
  }

  const hint = <Hint description={description} status={status} />

  if (multiline) {
    return (
      <SettingsRow label={label} description={hint} required={required}>
        <InputGroup className="bg-background">
          <MentionTextarea
            rows={4}
            maxLength={maxLength}
            value={draft}
            placeholder={placeholder}
            onChange={setDraft}
            mentions={mentions}
            aria-label={label}
            disabled={readOnly}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              void commit()
            }}
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-end px-3 py-1.5"
          >
            <CharCounter value={draft} max={maxLength} />
          </div>
        </InputGroup>
      </SettingsRow>
    )
  }

  return (
    <SettingsRow label={label} description={hint} required={required}>
      <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
        <InputGroupInput
          className="md:text-base"
          value={draft}
          maxLength={maxLength}
          placeholder={placeholder}
          aria-label={label}
          disabled={readOnly}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            void commit()
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              e.currentTarget.blur()
            } else if (e.key === "Escape") {
              e.preventDefault()
              revert()
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <CharCounter value={draft} max={maxLength} />
        </InputGroupAddon>
      </InputGroup>
    </SettingsRow>
  )
}

export function EditableDateRow({
  label,
  description,
  value,
  readOnly = false,
  onSave,
}: {
  label: string
  description?: React.ReactNode
  value: Date
  readOnly?: boolean
  onSave: (next: Date) => Promise<void>
}) {
  const [current, setCurrent] = useState(value)
  const [status, flash] = useSaveStatus()
  const [seen, setSeen] = useState(value.getTime())
  if (value.getTime() !== seen) {
    setSeen(value.getTime())
    setCurrent(value)
  }

  async function change(next: Date) {
    if (next.getTime() === current.getTime()) return
    const before = current
    setCurrent(next)
    flash({ kind: "saving" })
    try {
      await onSave(next)
      flash({ kind: "saved" })
    } catch (e) {
      setCurrent(before)
      flash({ kind: "error", message: errorText(e) })
    }
  }

  return (
    <SettingsRow
      label={label}
      description={<Hint description={description} status={status} />}
    >
      {readOnly ? (
        current.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      ) : (
        <DateTimePicker
          value={current}
          onChange={(d) => void change(d)}
          size="lg"
          presets={CLOSE_DATE_PRESETS}
        />
      )}
    </SettingsRow>
  )
}

export function EditableGoalRow({
  label,
  description,
  value,
  readOnly = false,
  onSave,
}: {
  label: string
  description?: React.ReactNode
  /** Null: no goal. */
  value: number | null
  readOnly?: boolean
  onSave: (next: number | null) => Promise<void>
}) {
  const [current, setCurrent] = useState(value)
  const [amount, setAmount] = useState<number | null>(value)
  const [draft, setDraft] = useState(value ? String(value) : "")
  const [status, flash] = useSaveStatus()
  const [seen, setSeen] = useState(value)
  if (value !== seen) {
    setSeen(value)
    setCurrent(value)
    setAmount(value)
    setDraft(value ? String(value) : "")
  }

  async function commit(n: number | null) {
    if (n === current) return
    flash({ kind: "saving" })
    try {
      await onSave(n)
      setCurrent(n)
      flash({ kind: "saved" })
    } catch (e) {
      flash({ kind: "error", message: errorText(e) })
    }
  }

  return (
    <SettingsRow
      label={label}
      description={<Hint description={description} status={status} />}
    >
      {/* The wizard's own picker: a preset saves on the tap, the box on
          leaving it. */}
      <GoalPicker
        amount={amount}
        draft={draft}
        disabled={readOnly}
        onChange={(n, d) => {
          setAmount(n)
          setDraft(d)
          // A preset tap arrives with its own text; the box's typing
          // does not — that waits for blur.
          if (d === String(n)) void commit(n)
        }}
        onBlur={() => void commit(draft.trim() === "" ? null : amount)}
      />
    </SettingsRow>
  )
}
