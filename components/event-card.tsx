import Link from "next/link"
import { cn } from "@/lib/utils"
import { occasionLabel, charityNames, formatAmount, formatRelativeDate } from "@/lib/display"
import { OccasionTag } from "@/components/ui/occasion-tag"

type EventCardEvent = {
  id: string
  occasion: string
  description: string | null
  closes_at: string
  total_raised: number
  protagonist: { name: string }
  charities: { charity: { name: string } }[]
  polls: { topic: { title: string } | null }[]
}

type Props = {
  event: EventCardEvent
  className?: string
}

export function EventCard({ event, className }: Props) {
  const firstPoll = event.polls?.[0]
  const topicTitle = firstPoll?.topic?.title

  return (
    <li className={cn("list-none", className)}>
      <Link href={`/events/${event.id}`}>
        <div className="group flex h-full cursor-pointer flex-col rounded-xl border border-border bg-background p-5 transition-colors duration-200 hover:border-[#AFA9EC]">

          {/* Occasion tag */}
          <OccasionTag label={occasionLabel(event.occasion)} className="mb-2" />

          {/* Heading — topic if available, else protagonist name */}
          <h2 className="mb-2 text-[20px] font-medium tracking-tight text-foreground transition-colors duration-200 group-hover:text-[#534AB7]">
            {topicTitle ? `Favourite ${topicTitle}` : event.protagonist.name}
          </h2>

          {/* Description */}
          {event.description && (
            <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
            <div>
              <p className="text-[12px] font-medium text-foreground">
                {event.protagonist.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {charityNames(event.charities)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-medium text-[#534AB7]">
                {formatAmount(event.total_raised)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                raised · closes {formatRelativeDate(event.closes_at)}
              </p>
            </div>
          </div>

        </div>
      </Link>
    </li>
  )
}
