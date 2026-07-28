import type { FavpollCardSize } from "./types"

type SectionLabelProps = {
  title: string
  size?: FavpollCardSize
}

export function SectionLabel({ title, size = "lg" }: SectionLabelProps) {
  // Long titles step DOWN in size (and tighten tracking) before they ever
  // wrap or truncate — PollHeading's rule, applied here after "PART OF A
  // ROAST DINNER" wrapped the summary card's topic row to two lines and
  // broke row alignment across the shelf (found on prod, 2026-07-29).
  const fit = title.length > 24 ? 2 : title.length > 16 ? 1 : 0
  const SCALE: Record<string, string[]> = {
    lg: ["text-[17px]", "text-[15px]", "text-[13px]"],
    md: ["text-[15px]", "text-[13px]", "text-[12px]"],
    sm: ["text-[11px]", "text-[10px]", "text-[10px]"],
  }
  const textClass = SCALE[size][fit]
  const trackingClass = fit > 0 ? "tracking-[0.05em]" : "tracking-[0.09em]"

  return (
    <h3
      className={`${textClass} ${trackingClass} truncate font-medium text-primary-muted uppercase`}
    >
      {title}
    </h3>
  )
}
