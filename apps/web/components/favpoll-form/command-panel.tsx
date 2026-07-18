"use client"

import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Check, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { TOAST_ERROR_STYLE, TOAST_WARNING_STYLE } from "@/lib/toast-styles"
import { suggestClosingDate } from "@/lib/registers"
import type { FavpollCategory, FavpollSubject } from "@favpoll/types"
import type { FavpollFormValues } from "./schema"
import { CloseDateOverlay } from "./close-date-overlay"

type CommandPanelProps = {
  mode: "create" | "edit"
  submitting: boolean
  error: string | null
  onSubmit: (closesAt?: Date) => void
}

// Floating action button — the form's single command. Clicking with
// required fields missing raises a warning toast naming them instead of
// disabling the button (a disabled FAB can't explain itself).
export function CommandPanel({
  mode,
  submitting,
  error,
  onSubmit,
}: CommandPanelProps) {
  const form = useFormContext<FavpollFormValues>()

  const category = (useWatch({ control: form.control, name: "category" }) ??
    null) as FavpollCategory | null
  const topicsValue = useWatch({ control: form.control, name: "topics" }) ?? []
  const charitiesValue =
    useWatch({ control: form.control, name: "charities" }) ?? []
  const nameValue = useWatch({ control: form.control, name: "name" }) ?? ""
  const causeLabelValue =
    useWatch({ control: form.control, name: "causeLabel" }) ?? ""
  const subjectValue = (useWatch({ control: form.control, name: "subject" }) ??
    "someone") as FavpollSubject
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishInitialDate, setPublishInitialDate] = useState<Date>(new Date())

  // Surface submit errors as toasts — the FAB has no panel to print into.
  useEffect(() => {
    if (error) toast.error(error, { style: TOAST_ERROR_STYLE })
  }, [error])

  // Create mode: only Name/Cause must be filled before publishing
  // Edit mode: all fields must be filled before saving
  const missing: string[] = []
  if (mode === "edit") {
    // A cause favpoll has no category (null since the 2026-07-13 remodel).
    if (!category && subjectValue !== "cause") missing.push("occasion")
    if (!charitiesValue?.length) missing.push("charity")
    if (!topicsValue?.[0]?.topicId && !topicsValue?.[0]?.isCustom)
      missing.push("favpoll topic")
  }
  if (subjectValue === "cause") {
    if (!causeLabelValue) missing.push("cause")
  } else {
    if (!nameValue) missing.push("name")
  }

  function handleClick() {
    if (missing.length > 0) {
      const list = missing.join(" · ")
      toast.warning(
        mode === "create"
          ? `Still needed before publishing: ${list}`
          : `Still needed before saving: ${list}`,
        { style: TOAST_WARNING_STYLE }
      )
      return
    }
    if (mode === "create") {
      setPublishInitialDate(new Date(suggestClosingDate(category)))
      setPublishOpen(true)
    } else {
      onSubmit()
    }
  }

  return (
    <>
      <div
        className="fixed right-4 z-50 md:right-6"
        style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <Button
          type="button"
          disabled={submitting}
          onClick={handleClick}
          aria-label={
            submitting
              ? mode === "create"
                ? "Publishing…"
                : "Saving…"
              : mode === "create"
                ? "Publish"
                : "Save"
          }
          className="size-14 rounded-full shadow-lg [&_svg]:size-6"
        >
          {mode === "create" ? (
            <Send aria-hidden="true" />
          ) : (
            <Check aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Publish overlay — create mode only */}
      {mode === "create" && (
        <CloseDateOverlay
          open={publishOpen}
          onOpenChange={setPublishOpen}
          title="When does the poll close?"
          initialDate={publishInitialDate}
          saveLabel="Publish"
          submitting={submitting}
          onSave={(date) => onSubmit(date)}
        />
      )}
    </>
  )
}
