"use client"

import { useState } from "react"
import { useWatch, useFormContext } from "react-hook-form"
import { RefreshCw } from "lucide-react"
import { PollHeading } from "@/components/poll-heading"
import { PollResults } from "@/components/favpoll-card/poll-results"
import type { PollResultItem } from "@/components/favpoll-card/types"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { rankItems, formatAmount } from "@/components/ranking-list/utils"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { EDIT_BTN, EditBadge, CharCounter, overlayFooter } from "./edit-helpers"
import type { Favourite } from "@favpoll/types"
import type { FavpollFormValues } from "./schema"

type Props = {
  isGenerating?: boolean
  onRegenerate?: () => void
}

export function EditablePollArea({
  isGenerating = false,
  onRegenerate,
}: Props) {
  const [revealOpen, setRevealOpen] = useState(false)
  const [revealDraft, setRevealDraft] = useState("")
  const [rankingView, setRankingView] = useState<"amount" | "count">("amount")

  const form = useFormContext<FavpollFormValues>()
  const values = useWatch({ control: form.control })

  const reveal = values.reveal ?? ""
  const selectedTopics = values.topics ?? []

  const firstTopic = selectedTopics[0]

  const topicTitle = firstTopic?.title ?? "Colour"

  const firstTopicCustomLabels = firstTopic?.customLabels ?? []

  const topicItems: Favourite[] = firstTopic
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
            }) as unknown as Favourite
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
            }) as unknown as Favourite
        ),
      ]
    : []

  const rankedItems = rankItems(topicItems, rankingView)
  const maxValue = Math.max(
    ...rankedItems.map((i) =>
      rankingView === "amount" ? i.all_time_pledged : i.all_time_count
    ),
    1
  )
  const pollResults: PollResultItem[] = rankedItems.map((item) => ({
    label: item.label,
    amount:
      rankingView === "amount"
        ? formatAmount(item.all_time_pledged)
        : `${item.all_time_count} pledge${item.all_time_count !== 1 ? "s" : ""}`,
    widthPercent:
      maxValue > 0
        ? ((rankingView === "amount"
            ? item.all_time_pledged
            : item.all_time_count) /
            maxValue) *
          100
        : 0,
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
        <div className="space-y-3 py-1">
          <PollHeading topicTitle={topicTitle} />
        </div>

        <div className="space-y-4">
          <div className={reveal ? "pb-4" : undefined}>
            <Button
              type="button"
              variant="ghost"
              className={EDIT_BTN}
              onClick={() => {
                setRevealDraft(reveal)
                setRevealOpen(true)
              }}
              aria-label={reveal ? "Edit reveal" : "Add reveal"}
            >
              {reveal ? (
                <p className="border-l-[2.5px] border-primary-muted pl-3 text-[18px] leading-relaxed font-normal text-reveal-foreground italic">
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
              ) : (
                <p className="border-l-[2.5px] border-primary-muted pl-3 text-[18px] leading-relaxed font-normal text-muted-foreground/40 italic">
                  What did they love? Name it, and the detail only you&apos;d
                  know.
                </p>
              )}
              <EditBadge />
            </Button>
          </div>
          <div className="flex items-center justify-end">
            <Tabs
              value={rankingView}
              onValueChange={(v: string) =>
                setRankingView(v as "amount" | "count")
              }
            >
              <TabsList className="h-7">
                <TabsTrigger value="amount" className="px-3 text-xs">
                  By amount
                </TabsTrigger>
                <TabsTrigger value="count" className="px-3 text-xs">
                  By pledges
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <PollResults results={pollResults} />
        </div>
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
              aria-describedby="reveal-helper"
              placeholder="Share something they loved…"
              value={revealDraft}
              maxLength={280}
              rows={2}
              onChange={(e) => setRevealDraft(e.target.value)}
              className="px-5 pt-2 pb-4 text-base md:text-base"
            />
            <div
              data-align="block-end"
              className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
            >
              <span id="reveal-helper">
                Name the thing they loved — and a detail only you&apos;d know.
                The personal touch is what makes it land.
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
