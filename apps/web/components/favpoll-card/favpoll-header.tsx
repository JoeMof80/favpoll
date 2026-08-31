import { ChevronRight } from "lucide-react"
import type { CardProtagonist, FavpollCardSize } from "./types"

type FavpollHeaderProps = {
  protagonist: CardProtagonist
  eyebrow?: string
  size?: FavpollCardSize
  /** List cards: the header is a link to the favpoll page — show the
   * goes-somewhere chevron (works on touch, where hover cues don't). */
  linkCue?: boolean
  /** Public cards: no photo → no avatar at all (founder, 2026-08-02),
   * matching the hero's no-empty-avatar rule. */
  hideEmptyAvatar?: boolean
}

function getInitials(name: string, override?: string): string {
  if (override) return override.slice(0, 2)
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export function FavpollHeader({
  protagonist,
  eyebrow,
  size = "lg",
  linkCue = false,
  hideEmptyAvatar = false,
}: FavpollHeaderProps) {
  const avatarSize = size === "lg" ? 56 : size === "md" ? 36 : 32
  // Rounded square, matching the favpoll page hero (rounded-xl) and the
  // charity chips — radius scaled to the avatar size
  const avatarRadius = size === "lg" ? "rounded-xl" : "rounded-lg"
  const nameClass =
    size === "lg"
      ? "text-[22px] font-medium text-foreground"
      : size === "md"
        ? "text-[16px] font-medium text-foreground"
        : "text-[14px] font-medium text-foreground"
  const initialsTextClass =
    size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[10px]"

  const initials = getInitials(protagonist.name, protagonist.initials)

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        {/* min-w-0: without it the column refuses to shrink and truncate
            never engages — long names ran under the avatar */}
        <div className="flex min-w-0 flex-1 flex-col">
          {eyebrow && (
            /* text-primary, not muted (founder, 2026-08-31: the shelf cards
               "need to be theme coloured"). Both consumers — the list card
               and the summary card — wear data-register, so the eyebrow is
               the card's header line in its register's ink: purple on a
               memorial, magenta on a celebration, green on a fundraiser,
               brand blue on a neutral favpoll. */
            <span className="text-[11px] font-medium tracking-[0.08em] text-primary uppercase">
              {eyebrow}
            </span>
          )}
          {/* One line always — "Winter Appeal for the Trussell Trust"
              wrapped and pushed sibling cards' rows out of alignment.
              Names may truncate (unlike topic labels); the full name is
              on the favpoll page one tap away. */}
          <span
            title={protagonist.name}
            className={
              linkCue
                ? `${nameClass} flex min-w-0 items-center gap-0.5 transition-colors group-hover:text-primary`
                : `${nameClass} block min-w-0 truncate`
            }
          >
            {linkCue ? (
              <span className="min-w-0 truncate">{protagonist.name}</span>
            ) : (
              protagonist.name
            )}
            {linkCue && (
              <ChevronRight
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
              />
            )}
          </span>
          {protagonist.context && (
            <span className="text-[12px] text-muted-foreground">
              {protagonist.context}
            </span>
          )}
        </div>

        {(protagonist.photo_url || !hideEmptyAvatar) && (
          <div
            className="shrink-0"
            style={{ width: avatarSize, height: avatarSize }}
          >
            {protagonist.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={protagonist.photo_url}
                alt={protagonist.name}
                className={`h-full w-full ${avatarRadius} object-cover`}
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center ${avatarRadius} border border-border-strong bg-secondary`}
                aria-label={protagonist.name}
              >
                <span
                  className={`font-medium text-primary ${initialsTextClass}`}
                  aria-hidden="true"
                >
                  {initials}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
