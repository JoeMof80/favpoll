import type { SVGProps } from "react"

// Custom icons in lucide's visual language (24-box, stroke 2, round
// caps/joins) — lucide's Users/UsersRound are both two-person
// silhouettes that don't distinguish couple from group, and it has no
// couple metaphor at all (founder direction, 2026-07-30).

function iconProps(props: SVGProps<SVGSVGElement>) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  } as const
}

/** A single ring, gem up — the couple. */
export function CoupleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="14" r="6.5" />
      <path d="M9.5 5 12 2.5 14.5 5 12 7.5 9.5 5Z" />
    </svg>
  )
}

/** lucide UsersRound with the side figure mirrored — three figures. */
export function GroupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="8" r="4.5" />
      <path d="M19 21a7 7 0 0 0-14 0" />
      <path d="M22.5 20c0-3-1.8-5.8-3.6-7.1a4.5 4.5 0 0 0-.4-7.5" />
      <path d="M1.5 20c0-3 1.8-5.8 3.6-7.1a4.5 4.5 0 0 1 .4-7.5" />
    </svg>
  )
}
