import { MentionText } from "@/components/mention-text"
import type { MentionTarget } from "@/lib/mentions"

type PollNoteProps = {
  personalNote?: string | null
  protagonistFirstName?: string
  /** The charity, topic and favourite, lit in ink without a tint: the
   *  note is a quotation (lib/mentions). */
  mentions?: MentionTarget[]
  role?: string
  "aria-label"?: string
  "aria-live"?: "polite" | "assertive" | "off"
}

export function PollNote({
  personalNote,
  protagonistFirstName,
  mentions,
  role,
  "aria-label": ariaLabel,
  "aria-live": ariaLive,
}: PollNoteProps) {
  if (!personalNote) return null

  return (
    // h-full is inert in normal auto-height flow; in reserved-height
    // typewriter overlays it lets the quote border span the final height
    // from the first keystroke instead of growing with the text.
    <div
      className="h-full"
      aria-label={ariaLabel ?? `${protagonistFirstName ?? "Their"}'s reveal`}
    >
      <blockquote
        className="h-full border-l-[2.5px] border-primary-muted pl-3 text-[18px] leading-relaxed font-normal text-muted-foreground italic"
        role={role}
        aria-live={ariaLive}
      >
        <MentionText text={personalNote} mentions={mentions} quiet />
      </blockquote>
    </div>
  )
}
