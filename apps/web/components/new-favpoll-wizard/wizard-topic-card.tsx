"use client"

import { Edit, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { PollHeading } from "@/components/poll-heading"
import { shortTopicLabel } from "@/lib/registers"
import type { Favourite } from "@favpoll/types"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"

type Props = {
  topic: FavpollFormValues["topics"][number]
  sortedExistingItems: Favourite[]
  customLabels: string[]
  showItemsSection: boolean
  onEdit: () => void
  onOpenItemsDialog: () => void
  /** Locked mode (founder, 2026-09-06): the edit icon becomes a lock,
      the add affordances go quiet, and the reason sits under a divider
      — the WizardCharityCard treatment. */
  lockedReason?: string
}

export function WizardTopicCard({
  topic,
  sortedExistingItems,
  customLabels,
  showItemsSection,
  onEdit,
  onOpenItemsDialog,
  lockedReason,
}: Props) {
  const locked = !!lockedReason
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <PollHeading
          topicTitle={shortTopicLabel(topic.title)}
          size="lg"
          inert
        />
        {locked ? (
          <span
            className="flex size-8 items-center justify-center text-muted-foreground"
            aria-hidden="true"
          >
            <Lock className="h-4 w-4" />
          </span>
        ) : (
          <Button type="button" size="icon-sm" variant="ghost" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showItemsSection && (
        <div className="flex flex-wrap items-center gap-1.5">
          {topic.isCustom
            ? customLabels.map((label) => (
                <Chip key={label} size="lg" readOnly>
                  {label}
                </Chip>
              ))
            : sortedExistingItems.slice(0, 5).map((item) => (
                <Chip key={item.id} size="lg" readOnly>
                  {item.label}
                </Chip>
              ))}
          {!topic.isCustom &&
            customLabels.map((label) => (
              <Chip
                key={label}
                size="lg"
                readOnly
                className="border-primary bg-primary text-primary-foreground"
              >
                {label}
              </Chip>
            ))}
          {locked ? (
            !topic.isCustom &&
            sortedExistingItems.length > 5 && (
              <Chip size="lg" readOnly>
                +{sortedExistingItems.length - 5} more
              </Chip>
            )
          ) : (
            <Chip size="lg" onClick={onOpenItemsDialog}>
              {!topic.isCustom && sortedExistingItems.length > 5
                ? `+${sortedExistingItems.length - 5} more`
                : "+ Add"}
            </Chip>
          )}
          {!locked && topic.isCustom && customLabels.length < 2 && (
            <span className="text-xs text-muted-foreground">
              {customLabels.length === 0
                ? "Add at least two options."
                : "Add at least one more option."}
            </span>
          )}
        </div>
      )}
      {locked && (
        <p className="border-t border-border pt-3 text-sm text-muted-foreground">
          {lockedReason}
        </p>
      )}
    </div>
  )
}
