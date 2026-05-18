"use client"

import { Pencil } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { OccasionPlaceholders } from "@/lib/occasions"

type ViewProps = {
  mode?: "view"
  pollId: string
  topicTitle: string
  framing: string | null
  reveal: string | null
}

type EditProps = {
  mode: "edit"
  topicTitle: string
  hasTopicSelected: boolean
  topicIsCustom?: boolean
  framing: string
  reveal: string
  placeholders: Pick<OccasionPlaceholders, "framing" | "reveal">
  onFramingChange: (v: string) => void
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
        <div>
          {props.hasTopicSelected ? (
            props.topicIsCustom ? (
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 text-3xl font-medium tracking-tight text-foreground">
                  Favourite
                </span>
                <div className="relative min-w-0 flex-1">
                  <input
                    autoFocus
                    type="text"
                    value={props.topicTitle}
                    onChange={(e) => props.onTopicTitleChange?.(e.target.value)}
                    placeholder="board games"
                    className="w-full appearance-none border-0 border-b-2 border-dotted border-border bg-transparent pr-5 text-3xl font-medium tracking-tight text-foreground transition-colors outline-none placeholder:text-muted-foreground/30 focus:border-primary/40"
                  />
                  <Pencil
                    className="pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/25"
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
                <h2 className="text-3xl font-medium tracking-tight text-foreground">
                  Favourite {props.topicTitle}
                </h2>
                <Button
                  type="button"
                  variant="link"
                  onClick={props.onChangeTopic}
                  className="hove r:text-foreground -foreground h-auto p-0 text-xs text-muted"
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
              className="h-auto p-0 text-lg text-muted-foreground hover:text-foreground"
            >
              + Choose a topic
            </Button>
          )}
        </div>
      ) : (
        <h2
          id={`poll-heading-${props.pollId}`}
          className="text-3xl font-medium tracking-tight text-foreground"
        >
          {props.topicTitle}
        </h2>
      )}

      {/* Framing */}
      {isEdit && props.hasTopicSelected ? (
        <div className="relative">
          <input
            type="text"
            value={props.framing}
            onChange={(e) => props.onFramingChange(e.target.value)}
            placeholder={props.placeholders.framing}
            className="w-full appearance-none border-0 border-b-2 border-dotted border-border bg-transparent py-0 pr-5 text-lg leading-7 text-muted-foreground transition-colors outline-none placeholder:text-muted-foreground/40 focus:border-primary/40"
          />
          <Pencil
            className="pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/25"
            aria-hidden
          />
        </div>
      ) : !isEdit && props.framing ? (
        <p className="border-b border-transparent text-lg leading-7 text-muted-foreground">
          {props.framing}
        </p>
      ) : null}

      {/* Reveal — edit mode only */}
      {isEdit && props.hasTopicSelected ? (
        <div className="border-l-4 border-primary/40 pl-4">
          <p className="mb-1.5 text-[11px] text-muted-foreground">
            The reveal (optional)
          </p>
          <div className="relative">
            <p
              aria-hidden
              className="invisible w-full text-base wrap-break-word whitespace-pre-wrap text-primary/80 italic"
            >
              {props.reveal || "\u00A0"}
            </p>
            <textarea
              value={props.reveal}
              onChange={(e) => props.onRevealChange(e.target.value)}
              placeholder={props.placeholders.reveal}
              className="absolute inset-0 h-full w-full resize-none appearance-none border-0 border-b-2 border-dotted border-border bg-transparent py-0 pr-5 text-base text-primary/60 italic transition-colors outline-none placeholder:text-muted-foreground/40 focus:border-primary/40 focus:text-primary/80"
            />
            <Pencil
              className="pointer-events-none absolute top-2 right-0 h-3.5 w-3.5 text-muted-foreground/25"
              aria-hidden
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Shown to each guest after they pledge — write it as if speaking to
            them directly.
          </p>
        </div>
      ) : null}
    </div>
  )
}
