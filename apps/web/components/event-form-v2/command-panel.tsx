"use client"

import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { shortTopicLabel, deriveRegister } from "@/lib/registers"
import type {
  Category,
  Charity,
  EventCategory,
  EventGrouping,
  EventSubject,
  TopicWithMeta,
} from "@favpoll/types"
import type { EventFormValues } from "./schema"
import { HonourStep } from "@/components/event-flow/honour-step"
import { LoveStep } from "@/components/event-flow/love-step"
import { CharityStep } from "@/components/event-flow/charity-step"

type CommandPanelProps = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  mode: "create" | "edit"
  submitting: boolean
  error: string | null
  onSubmit: () => void
  onCancel: () => void
  onEventSettingsOpen: () => void
}

export function CommandPanel({
  charities,
  topics,
  categories,
  mode,
  submitting,
  error,
  onSubmit,
  onCancel,
  onEventSettingsOpen,
}: CommandPanelProps) {
  const form = useFormContext<EventFormValues>()

  const category = (useWatch({ control: form.control, name: "category" }) ??
    null) as EventCategory | null
  const grouping = (useWatch({ control: form.control, name: "grouping" }) ??
    "individual") as EventGrouping
  const topicsValue = useWatch({ control: form.control, name: "topics" }) ?? []
  const charitiesValue =
    useWatch({ control: form.control, name: "charities" }) ?? []
  const nameValue = useWatch({ control: form.control, name: "name" }) ?? ""
  const causeLabelValue =
    useWatch({ control: form.control, name: "causeLabel" }) ?? ""
  const subjectValue = (useWatch({ control: form.control, name: "subject" }) ??
    "someone") as EventSubject
  const isListed = useWatch({ control: form.control, name: "isListed" }) ?? true

  const [honourOpen, setHonourOpen] = useState(false)
  const [loveOpen, setLoveOpen] = useState(false)
  const [charityOpen, setCharityOpen] = useState(false)

  const categoryLabel = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : null

  const topicLabel = topicsValue[0]
    ? shortTopicLabel(topicsValue[0].title)
    : null
  const charityNames = charities
    .filter((c) => charitiesValue.includes(c.id))
    .map((c) => c.name)

  const charityCount = charitiesValue.length
  const charityDescription =
    charityCount === 0
      ? "Choose up to 3 charities."
      : charityCount === 1
        ? "1 of 3 selected."
        : `${charityCount} of 3 selected — proceeds split equally.`

  const missing: string[] = []
  if (!category) missing.push("Occasion")
  if (!topicsValue?.[0]?.topicId && !topicsValue?.[0]?.isCustom)
    missing.push("favpoll topic")
  if (!charitiesValue?.length) missing.push("Charity")
  if (subjectValue === "cause") {
    if (!causeLabelValue) missing.push("Cause")
  } else {
    if (!nameValue) missing.push("Name")
  }

  const isPublishable = missing.length === 0

  return (
    <>
      {/* Floating command panel */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background md:right-4 md:bottom-4 md:left-auto md:w-72 md:rounded-xl md:border md:shadow-lg">
        <div
          className="space-y-3 p-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          {/* Three-pick summary */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Your event
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                selected={!!categoryLabel}
                size="sm"
                onClick={() => setHonourOpen(true)}
              >
                {categoryLabel || "Occasion…"}
              </Chip>
              <Chip
                selected={!!topicLabel}
                size="sm"
                onClick={() => setLoveOpen(true)}
              >
                {topicLabel || "Topic…"}
              </Chip>
              {charityNames.length > 0 ? (
                charityNames.map((name) => (
                  <Chip
                    key={name}
                    selected
                    size="sm"
                    onClick={() => setCharityOpen(true)}
                  >
                    {name}
                  </Chip>
                ))
              ) : (
                <Chip size="sm" onClick={() => setCharityOpen(true)}>
                  Charity…
                </Chip>
              )}
            </div>
          </div>

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
              size="sm"
              className="shrink-0 text-muted-foreground"
              onClick={onEventSettingsOpen}
            >
              Settings
            </Button>
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
              onClick={onSubmit}
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

      {/* Honour sheet */}
      <ResponsiveOverlay
        open={honourOpen}
        onOpenChange={setHonourOpen}
        title="Occasion"
        description="What is this event for?"
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => setHonourOpen(false)}
          >
            Done
          </Button>
        }
      >
        <HonourStep
          value={{
            category,
            grouping,
            subject: subjectValue,
            causeLabel: causeLabelValue,
          }}
          onChange={({
            category: cat,
            grouping: grp,
            subject: sub,
            causeLabel: cl,
          }) => {
            const derived = deriveRegister(cat, grp)
            form.setValue("category", cat ?? undefined)
            form.setValue("grouping", grp)
            form.setValue("subject", sub)
            form.setValue("causeLabel", cl)
            form.setValue("register", derived)
            form.setValue("openingLine", "")
            form.setValue("isListed", derived !== "remembering")
          }}
        />
      </ResponsiveOverlay>

      {/* Love sheet */}
      <ResponsiveOverlay
        open={loveOpen}
        onOpenChange={setLoveOpen}
        title="favpoll topic"
        description="Choose what everyone votes on."
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => setLoveOpen(false)}
          >
            Done
          </Button>
        }
      >
        <LoveStep
          topics={topics}
          categories={categories}
          value={topicsValue}
          onChange={(v) => form.setValue("topics", v, { shouldValidate: true })}
        />
      </ResponsiveOverlay>

      {/* Charity sheet */}
      <ResponsiveOverlay
        open={charityOpen}
        onOpenChange={setCharityOpen}
        title="Charity"
        description={charityDescription}
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => setCharityOpen(false)}
          >
            Done
          </Button>
        }
      >
        <CharityStep
          charities={charities}
          value={charitiesValue}
          onChange={(v) =>
            form.setValue("charities", v, { shouldValidate: true })
          }
        />
      </ResponsiveOverlay>
    </>
  )
}
