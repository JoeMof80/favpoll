"use client"

import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { suggestClosingDate } from "@/lib/registers"
import { DateTimePicker } from "./date-time-picker"
import type { EventCategory, EventSubject } from "@favpoll/types"
import type { EventFormValues } from "./schema"

type CommandPanelProps = {
  mode: "create" | "edit"
  submitting: boolean
  error: string | null
  onSubmit: (closesAt?: Date) => void
  onCancel: () => void
}

export function CommandPanel({
  mode,
  submitting,
  error,
  onSubmit,
  onCancel,
}: CommandPanelProps) {
  const form = useFormContext<EventFormValues>()

  const category = (useWatch({ control: form.control, name: "category" }) ??
    null) as EventCategory | null
  const topicsValue = useWatch({ control: form.control, name: "topics" }) ?? []
  const charitiesValue =
    useWatch({ control: form.control, name: "charities" }) ?? []
  const nameValue = useWatch({ control: form.control, name: "name" }) ?? ""
  const causeLabelValue =
    useWatch({ control: form.control, name: "causeLabel" }) ?? ""
  const subjectValue = (useWatch({ control: form.control, name: "subject" }) ??
    "someone") as EventSubject
  const isListed = useWatch({ control: form.control, name: "isListed" }) ?? true

  const [publishOpen, setPublishOpen] = useState(false)
  const [publishClosesAt, setPublishClosesAt] = useState<Date | undefined>()

  // Create mode: only Name/Cause must be filled before publishing
  // Edit mode: all fields must be filled before saving
  const missing: string[] = []
  if (mode === "edit") {
    if (!category) missing.push("Occasion")
    if (!charitiesValue?.length) missing.push("Charity")
    if (!topicsValue?.[0]?.topicId && !topicsValue?.[0]?.isCustom)
      missing.push("favpoll topic")
  }
  if (subjectValue === "cause") {
    if (!causeLabelValue) missing.push("Cause")
  } else {
    if (!nameValue) missing.push("Name")
  }

  const isPublishable = missing.length === 0

  function handlePublishClick() {
    const suggested = suggestClosingDate(category)
    setPublishClosesAt(new Date(suggested))
    setPublishOpen(true)
  }

  return (
    <>
      {/* Floating command panel */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background md:right-4 md:bottom-4 md:left-auto md:w-72 md:rounded-xl md:border md:shadow-lg">
        <div
          className="space-y-3 p-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {/* Listed / Unlisted */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {isListed ? "Listed" : "Unlisted"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isListed
                  ? "Appears on the live events page."
                  : "Only reachable by people you give the link to."}
              </p>
            </div>
            <Switch
              checked={isListed}
              onCheckedChange={(v) => form.setValue("isListed", v)}
            />
          </div>

          {/* Missing fields */}
          {missing.length > 0 && (
            <ul className="space-y-0.5">
              {missing.map((m) => (
                <li
                  key={m}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  {m}
                </li>
              ))}
            </ul>
          )}

          {/* Error */}
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={submitting || !isPublishable}
              onClick={
                mode === "create" ? handlePublishClick : () => onSubmit()
              }
            >
              {submitting
                ? mode === "create"
                  ? "Creating…"
                  : "Saving…"
                : mode === "create"
                  ? "Publish"
                  : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Publish overlay — create mode only */}
      {mode === "create" && (
        <ResponsiveOverlay
          open={publishOpen}
          onOpenChange={(o) => !o && setPublishOpen(false)}
          title="When does the poll close?"
          footer={
            <div className="space-y-2">
              <Button
                type="button"
                className="w-full"
                disabled={submitting || !publishClosesAt}
                onClick={() => {
                  if (publishClosesAt) onSubmit(publishClosesAt)
                }}
              >
                {submitting ? "Creating…" : "Publish"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full text-muted-foreground"
                onClick={() => setPublishOpen(false)}
              >
                ← Back
              </Button>
            </div>
          }
        >
          <DateTimePicker
            value={publishClosesAt}
            onChange={setPublishClosesAt}
          />
        </ResponsiveOverlay>
      )}
    </>
  )
}
