import Link from "next/link"
import { segmentMentions, type MentionTarget } from "@/lib/mentions"
import { cn } from "@/lib/utils"

// MENTIONS rendered (lib/mentions): the About and the note with the
// charity, the topic and the favourite lit in register ink — the
// register-as-ink idiom, no underline. A charity links to its page, a
// topic to its record; an item is ink alone. With no targets, or none
// found, this is the plain text.
//
// `quiet` is for the note: it is a quotation in italic, so the mention
// keeps the ink and drops the tint, and the words stay a quote.

type Props = {
  text: string
  mentions?: MentionTarget[]
  quiet?: boolean
  className?: string
}

export function MentionText({ text, mentions = [], quiet, className }: Props) {
  const segments = segmentMentions(text, mentions)
  if (!segments.some((s) => s.target)) return <>{text}</>
  const ink = cn(
    "font-medium text-primary",
    !quiet && "-mx-0.5 rounded-sm bg-primary/10 px-0.5",
    className
  )
  return (
    <>
      {segments.map((s, i) => {
        if (!s.target) return <span key={i}>{s.text}</span>
        const href =
          s.target.kind === "charity" && s.target.id
            ? `/charities/${s.target.id}`
            : s.target.kind === "topic" && s.target.id
              ? `/topics/${s.target.id}`
              : null
        return href ? (
          <Link
            key={i}
            href={href}
            className={cn(ink, "hover:bg-primary/15")}
            data-mention={s.target.kind}
          >
            {s.text}
          </Link>
        ) : (
          <span key={i} className={ink} data-mention={s.target.kind}>
            {s.text}
          </span>
        )
      })}
    </>
  )
}
