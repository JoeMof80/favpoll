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

/** lucide Users with the side figure mirrored — three figures. */
export function GroupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="7" r="4" />
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <path d="M17 3.4a3.8 3.8 0 0 1 0 7.4" />
      <path d="M23 21v-1.8a4 4 0 0 0-3-3.87" />
      <path d="M7 3.4a3.8 3.8 0 0 0 0 7.4" />
      <path d="M1 21v-1.8a4 4 0 0 1 3-3.87" />
    </svg>
  )
}
