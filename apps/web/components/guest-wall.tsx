import { SectionEyebrow } from "@/components/ui/section-eyebrow"

// The guest wall: presence, not size. Names (or "Someone") and what they
// backed — never amounts (anonymity model, decided 2026-07-05). Anonymous
// pledges appear as "Someone" but count fully everywhere.
export type GuestWallEntry = {
  id: string
  /** null = anonymous or no name given → rendered as "Someone" */
  name: string | null
  /** Favourite labels this pledge backed */
  labels: string[]
  created_at: string
}

function relativeTime(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

function backedLine(labels: string[]): string {
  if (labels.length === 0) return "pledged"
  if (labels.length === 1) return `backed ${labels[0]}`
  if (labels.length === 2) return `backed ${labels[0]} and ${labels[1]}`
  return `backed ${labels[0]} and ${labels.length - 1} more`
}

export function GuestWall({
  entries,
  teaseBacked = false,
}: {
  entries: GuestWallEntry[]
  /**
   * True for un-entitled viewers, whose entries arrive with the backed
   * favourites stripped — adds a line telling them pledging shows more.
   */
  teaseBacked?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <SectionEyebrow variant="muted" className="font-semibold">
        Guest wall
      </SectionEyebrow>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Guests appear here as they pledge.
        </p>
      ) : (
        <>
          <ul className="mt-2 space-y-1.5" aria-label="Recent pledges">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex items-baseline justify-between gap-2 text-sm"
              >
                <span className="min-w-0 truncate">
                  <span className="font-medium text-foreground">
                    {entry.name ?? "Someone"}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {backedLine(entry.labels)}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {relativeTime(entry.created_at)}
                </span>
              </li>
            ))}
          </ul>
          {teaseBacked && (
            <p className="mt-2.5 text-xs text-muted-foreground">
              Pledge to see what each guest backed.
            </p>
          )}
        </>
      )}
    </div>
  )
}
