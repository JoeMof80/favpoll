"use client"

import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PollTitle } from "@/components/favpoll-card/poll-title"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { getPollHint } from "@/lib/display"
import type { OccasionPlaceholders } from "@/lib/occasions"

type ViewProps = {
  mode?: "view"
  pollId: string
  topicTitle: string
  reveal: string | null
  protagonistFirstName?: string
  pledged?: boolean
}

type EditProps = {
  mode: "edit"
  topicTitle: string
  hasTopicSelected: boolean
  topicIsCustom?: boolean
  reveal: string
  placeholders: Pick<OccasionPlaceholders, "reveal">
  onRevealChange: (v: string) => void
  onTopicTitleChange?: (v: string) => void
  onChangeTopic: () => void
}

type Props = ViewProps | EditProps

export function PollHeading(props: Props) {
  const isEdit = props.mode === "edit"

  return (
    <div className="space-y-3">
      {/* Topic title */}
      {isEdit ? (
        <>
          {props.hasTopicSelected ? (
            props.topicIsCustom ? (
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 text-[11px] font-medium tracking-[0.09em] text-[#7F77DD] uppercase">
                  Favourite
                </span>
                <div className="relative min-w-0 flex-1">
                  <input
                    autoFocus
                    type="text"
                    value={props.topicTitle}
                    onChange={(e) => props.onTopicTitleChange?.(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault() }}
                    placeholder="board games"
                    className="peer w-full appearance-none bg-transparent pr-5 text-[11px] font-medium tracking-[0.09em] text-[#7F77DD] uppercase outline-none placeholder:text-[#7F77DD]/30"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-dotted border-border transition-colors peer-focus:border-primary/40" />
                  <Pencil
                    className="pointer-events-none absolute top-1/2 right-0 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground/25"
                    aria-hidden
                  />
                </div>
                <Button
                  type="button"
                  variant="link"
                  onClick={props.onChangeTopic}
                  className="h-auto shrink-0 p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-baseline gap-3">
                <PollTitle title={props.topicTitle} />
                <Button
                  type="button"
                  variant="link"
                  onClick={props.onChangeTopic}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
              </div>
            )
          ) : (
            <Button
              type="button"
              variant="link"
              onClick={props.onChangeTopic}
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            >
              + Choose a topic
            </Button>
          )}
        </>
      ) : (
        <div className="flex items-baseline gap-3">
          <PollTitle title={props.topicTitle} />
          {props.protagonistFirstName && !props.pledged && (
            <p className="text-sm text-[#888780] italic">
              &ndash; {getPollHint(props.protagonistFirstName)}
            </p>
          )}
        </div>
      )}

      {/* Reveal */}
      {isEdit && props.hasTopicSelected ? (
        <div className="border-l-[2.5px] border-[#7F77DD] pl-3">
          <div className="relative">
            <p
              aria-hidden
              className="invisible w-full text-[18px] leading-relaxed font-normal wrap-break-word whitespace-pre-wrap text-[#26215C] italic"
            >
              {props.reveal || "\u00A0"}
            </p>
            <textarea
              value={props.reveal}
              onChange={(e) => props.onRevealChange(e.target.value)}
              placeholder={props.placeholders.reveal}
              className="peer absolute inset-0 h-full w-full resize-none appearance-none bg-transparent py-0 pr-5 text-[18px] leading-relaxed font-normal text-[#26215C] italic outline-none placeholder:text-muted-foreground/40"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-dotted border-border transition-colors peer-focus:border-primary/40" />
            <Pencil
              className="pointer-events-none absolute top-2 right-0 h-3.5 w-3.5 text-muted-foreground/25"
              aria-hidden
            />
          </div>
        </div>
      ) : !isEdit && props.reveal ? (
        <PollReveal
          personalReveal={props.reveal}
          protagonistFirstName={props.protagonistFirstName}
          role="status"
          aria-live="polite"
        />
      ) : null}
    </div>
  )
}
