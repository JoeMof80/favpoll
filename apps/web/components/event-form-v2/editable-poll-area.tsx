"use client"

import { useState } from "react"
import { useWatch, useFormContext } from "react-hook-form"
import { RefreshCw } from "lucide-react"
import { deriveRegister } from "@/lib/registers"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { PledgePanel } from "@/components/pledge-panel"
import { PollResults } from "@/components/favpoll-card/poll-results"
import type { PollResultItem } from "@/components/favpoll-card/types"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { EDIT_BTN, EditBadge, CharCounter, overlayFooter } from "./edit-helpers"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { TopicItem, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"

type Props = {
  topics: TopicWithMeta[]
  showReveal: boolean
  onToggleReveal: () => void
  isGenerating?: boolean
  personRevealExample?: string | null
  onRegenerate?: () => void
}

export function EditablePollArea({
  topics,
  showReveal,
  onToggleReveal,
  isGenerating = false,
  personRevealExample = null,
  onRegenerate,
}: Props) {
  const [revealOpen, setRevealOpen] = useState(false)
  const [revealDraft, setRevealDraft] = useState("")

  const form = useFormContext<EventFormValues>()
  const values = useWatch({ control: form.control })

  const category = values.category ?? null
  const grouping = values.grouping ?? "individual"
  const reveal = values.reveal ?? ""
  const selectedTopics = values.topics ?? []

  const firstTopic = selectedTopics[0]
  const firstTopicMeta = topics.find((t) => t.id === firstTopic?.topicId)
  const effReg = deriveRegister(category, grouping)

  const revealPlaceholder = !reveal
    ? (personRevealExample ??
      firstTopicMeta?.placeholders?.[effReg]?.reveal ??
      "")
    : ""
  const isPersonRevealExample = !reveal && !!personRevealExample

  const topicTitle = firstTopic?.title ?? "Colour"
  const revealValue = showReveal ? reveal || null : null

  const firstTopicCustomLabels = firstTopic?.customLabels ?? []
  const isInfinite = firstTopic
    ? firstTopic.isCustom
      ? true
      : !(firstTopicMeta?.is_finite ?? true)
    : false

  const topicItems: TopicItem[] = firstTopic
    ? [
        ...((firstTopic.items ?? []) as { id: string; label: string }[]).map(
          (item) =>
            ({
              id: item.id,
              label: item.label,
              topic_id: firstTopic.topicId ?? "",
              all_time_pledged: 0,
              all_time_count: 0,
              is_canonical: true,
              is_active: true,
              created_at: "",
            }) as unknown as TopicItem
        ),
        ...firstTopicCustomLabels.map(
          (label, i) =>
            ({
              id: `custom-preview-${i}`,
              label,
              topic_id: firstTopic.topicId ?? "",
              all_time_pledged: 0,
              all_time_count: 0,
              is_canonical: false,
              is_active: true,
              created_at: "",
            }) as unknown as TopicItem
        ),
      ]
    : []

  const pollResults: PollResultItem[] = topicItems.map((item) => ({
    label: item.label,
    amount: "£0",
    widthPercent: 0,
  }))

  function saveReveal() {
    form.setValue("reveal", revealDraft, { shouldValidate: true })
    setRevealOpen(false)
  }

  if (!firstTopic) {
    return (
      <div className="pointer-events-none mt-4 space-y-4 opacity-20">
        <div className="h-5 w-36 rounded bg-foreground" />
        <div className="space-y-2.5">
          {[92, 78, 64, 58, 50].map((w) => (
            <div
              key={w}
              className="h-12 rounded-xl bg-foreground"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel title={topicTitle} />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {showReveal ? "Post-reveal" : "Pre-reveal"}
            </span>
            <Switch
              checked={showReveal}
              onCheckedChange={(v) => {
                if (v !== showReveal) onToggleReveal()
              }}
            />
          </div>
        </div>

        {showReveal && (
          <Button
            type="button"
            variant="ghost"
            className={cn(EDIT_BTN, "mt-1")}
            onClick={() => {
              setRevealDraft(reveal)
              setRevealOpen(true)
            }}
            aria-label={reveal ? "Edit reveal" : "Add reveal"}
          >
            {reveal ? (
              <p className="border-l-[2.5px] border-[#7F77DD] pl-3 text-[18px] leading-relaxed font-normal text-[#26215C] italic">
                {reveal}
              </p>
            ) : isGenerating ? (
              <div
                className="animate-pulse space-y-1.5"
                aria-label="Generating suggestion…"
              >
                <div className="h-4 rounded-full bg-muted/60" />
                <div className="h-4 w-3/4 rounded-full bg-muted/60" />
              </div>
            ) : revealPlaceholder ? (
              <p className="text-base leading-relaxed wrap-break-word text-muted-foreground/50 italic">
                {revealPlaceholder}
                {isPersonRevealExample && (
                  <span className="ml-1 text-xs text-muted-foreground/40 not-italic">
                    (example — type the real one)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground/40">Add reveal…</p>
            )}
            <EditBadge />
          </Button>
        )}

        {revealValue ? (
          <PollResults results={pollResults} />
        ) : (
          <div className="pointer-events-none opacity-40">
            <PledgePanel
              items={topicItems}
              totalAmount=""
              onSelectionsChange={() => {}}
              isInfinite={isInfinite}
              onAddItem={
                isInfinite
                  ? async () => {
                      toast.warning(
                        "Items added here won't be saved — add them to your event after publishing.",
                        {
                          style: {
                            background: "#fffbeb",
                            color: "#f59e0b",
                            border: "1px solid #f59e0b",
                          },
                          position: "top-center",
                        }
                      )
                    }
                  : undefined
              }
            />
          </div>
        )}
      </div>

      <ResponsiveOverlay
        open={revealOpen}
        onOpenChange={(o) => !o && setRevealOpen(false)}
        title="The reveal"
        hideCloseButton
        headerClassName="p-0"
        dialogClassName="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        header={
          <InputGroup className="h-auto rounded-none border-0 has-[[data-slot=input-group-control]:focus-visible]:ring-0">
            <InputGroupAddon
              align="block-start"
              className="justify-between px-5"
            >
              <InputGroupText>The reveal</InputGroupText>
              {onRegenerate && (
                <InputGroupButton
                  size="icon-xs"
                  disabled={isGenerating}
                  aria-label="Regenerate suggestion"
                  onClick={() => {
                    setRevealOpen(false)
                    onRegenerate()
                  }}
                >
                  <RefreshCw />
                </InputGroupButton>
              )}
            </InputGroupAddon>
            <InputGroupTextarea
              autoFocus
              placeholder={revealPlaceholder || "Share something they loved…"}
              value={revealDraft}
              maxLength={280}
              rows={3}
              onChange={(e) => setRevealDraft(e.target.value)}
              className="px-5 pt-2 pb-4 text-base md:text-base"
            />
            <div
              data-align="block-end"
              className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
            >
              <span>
                {isPersonRevealExample
                  ? "The example below is suggested — type the real favourite."
                  : "Disclosed after pledging — this is the payoff."}
              </span>
              <CharCounter value={revealDraft} max={280} />
            </div>
          </InputGroup>
        }
        footer={overlayFooter(saveReveal, () => setRevealOpen(false))}
      />
    </>
  )
}
