"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { MentionTextarea } from "@/components/mention-textarea"
import { MentionText } from "@/components/mention-text"
import { CharCounter } from "@/components/favpoll-form/edit-helpers"
import { DateTimePicker } from "@/components/favpoll-form/date-time-picker"
import { CLOSE_DATE_PRESETS } from "@/components/favpoll-form/date-helpers"
import { SettingsRow } from "@/components/manage/settings-rows"
import type { MentionTarget } from "@/lib/mentions"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"

// ROWS THAT EDIT IN PLACE (founder, 2026-09-29: "I thought we were
// editing in line?"). At rest a row shows its value with a pencil at
// the edge; the pencil (or the value) opens the field IN the row —
// the wizard's own input, the same limit, the same counter — with
// Cancel and Save beneath. Save calls the server, keeps the new value
// on success, and toasts on failure with the field still open, so
// nothing typed is lost. A closed favpoll gets no pencil: its rows are
// the record.

const NONE = <span className="text-muted-foreground">None written.</span>

function EditFooter({
  saving,
  onCancel,
  onSave,
  disabled,
}: {
  saving: boolean
  onCancel: () => void
  onSave: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={saving}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        disabled={saving || disabled}
        onClick={onSave}
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  )
}

function PencilButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      aria-label={`Edit ${label}`}
    >
      <Pencil className="size-4" aria-hidden="true" />
    </Button>
  )
}

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
  /** The About and the note: a MentionTextarea, stacked under the label. */
  multiline?: boolean
  mentions?: MentionTarget[]
  required?: boolean
  /** A closed favpoll: the value, no pencil. */
  readOnly?: boolean
  onSave: (next: string) => Promise<void>
}) {
  const [current, setCurrent] = useState(value)
  const [draft, setDraft] = useState(value)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  function open() {
    setDraft(current)
    setEditing(true)
  }
  function cancel() {
    setEditing(false)
    setDraft(current)
  }
  async function save() {
    const next = draft.trim()
    if (required && !next) return
    if (next === current) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(next)
      setCurrent(next)
      setEditing(false)
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Couldn't save — try again.",
        {
          style: TOAST_ERROR_STYLE,
        }
      )
    } finally {
      setSaving(false)
    }
  }

  const shown = current ? (
    multiline ? (
      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        <MentionText text={current} mentions={mentions} />
      </p>
    ) : (
      current
    )
  ) : (
    NONE
  )

  if (!editing) {
    return (
      <SettingsRow
        label={label}
        description={description}
        stacked={multiline}
        className={readOnly ? undefined : "group"}
      >
        {multiline ? (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">{shown}</div>
            {!readOnly && <PencilButton label={label} onClick={open} />}
          </div>
        ) : (
          <span className="inline-flex max-w-full items-center justify-end gap-1">
            <span className="min-w-0 break-words">{shown}</span>
            {!readOnly && <PencilButton label={label} onClick={open} />}
          </span>
        )}
      </SettingsRow>
    )
  }

  return (
    <SettingsRow label={label} description={description} stacked>
      <div className="grid w-full gap-3">
        {multiline ? (
          <InputGroup className="bg-background">
            <MentionTextarea
              rows={4}
              maxLength={maxLength}
              value={draft}
              placeholder={placeholder}
              onChange={setDraft}
              mentions={mentions}
              aria-label={label}
            />
            <div
              data-align="block-end"
              className="order-last flex w-full items-center justify-end px-3 py-1.5"
            >
              <CharCounter value={draft} max={maxLength} />
            </div>
          </InputGroup>
        ) : (
          <InputGroup className="bg-background">
            <InputGroupInput
              autoFocus
              className="md:text-base"
              value={draft}
              maxLength={maxLength}
              placeholder={placeholder}
              aria-label={label}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void save()
                } else if (e.key === "Escape") {
                  e.preventDefault()
                  cancel()
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <CharCounter value={draft} max={maxLength} />
            </InputGroupAddon>
          </InputGroup>
        )}
        <EditFooter
          saving={saving}
          onCancel={cancel}
          onSave={() => void save()}
          disabled={required && !draft.trim()}
        />
      </div>
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
  const [draft, setDraft] = useState<Date>(value)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const shown = current.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  async function save() {
    if (draft.getTime() === current.getTime()) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(draft)
      setCurrent(draft)
      setEditing(false)
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Couldn't save — try again.",
        {
          style: TOAST_ERROR_STYLE,
        }
      )
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <SettingsRow label={label} description={description}>
        <span className="inline-flex items-center gap-1">
          {shown}
          {!readOnly && (
            <PencilButton
              label={label}
              onClick={() => {
                setDraft(current)
                setEditing(true)
              }}
            />
          )}
        </span>
      </SettingsRow>
    )
  }

  return (
    <SettingsRow label={label} description={description} stacked>
      <div className="grid w-full gap-3">
        <DateTimePicker
          value={draft}
          onChange={setDraft}
          presets={CLOSE_DATE_PRESETS}
        />
        <EditFooter
          saving={saving}
          onCancel={() => {
            setEditing(false)
            setDraft(current)
          }}
          onSave={() => void save()}
        />
      </div>
    </SettingsRow>
  )
}

export function EditableAmountRow({
  label,
  description,
  value,
  format,
  readOnly = false,
  onSave,
}: {
  label: string
  description?: React.ReactNode
  /** Null: no goal. */
  value: number | null
  format: (n: number) => string
  readOnly?: boolean
  onSave: (next: number | null) => Promise<void>
}) {
  const [current, setCurrent] = useState(value)
  const [draft, setDraft] = useState(value ? String(value) : "")
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function save() {
    const n = draft.trim() === "" ? null : Number(draft)
    if (n !== null && (!Number.isFinite(n) || n < 0)) return
    if (n === current) {
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await onSave(n)
      setCurrent(n)
      setEditing(false)
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Couldn't save — try again.",
        {
          style: TOAST_ERROR_STYLE,
        }
      )
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <SettingsRow label={label} description={description}>
        <span className="inline-flex items-center gap-1">
          {current ? (
            <span className="tabular-nums">{format(current)}</span>
          ) : (
            <span className="text-muted-foreground">No goal</span>
          )}
          {!readOnly && (
            <PencilButton
              label={label}
              onClick={() => {
                setDraft(current ? String(current) : "")
                setEditing(true)
              }}
            />
          )}
        </span>
      </SettingsRow>
    )
  }

  return (
    <SettingsRow label={label} description={description} stacked>
      <div className="grid w-full gap-3">
        <InputGroup className="max-w-xs bg-background">
          <InputGroupAddon>£</InputGroupAddon>
          <InputGroupInput
            autoFocus
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            className="md:text-base"
            value={draft}
            placeholder="No goal"
            aria-label={label}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                void save()
              } else if (e.key === "Escape") {
                e.preventDefault()
                setEditing(false)
              }
            }}
          />
        </InputGroup>
        <EditFooter
          saving={saving}
          onCancel={() => setEditing(false)}
          onSave={() => void save()}
        />
      </div>
    </SettingsRow>
  )
}
