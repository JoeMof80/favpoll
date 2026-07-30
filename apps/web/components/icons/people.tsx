import type { SVGProps } from "react"

// Custom people icons in lucide's visual language (24-box, stroke 2,
// round caps/joins) — lucide's Users/UsersRound are both two-person
// silhouettes that don't distinguish couple from group (founder,
// 2026-07-30). Couple = two figures sharing a small heart; group = a
// three-figure cluster.

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

/** Two figures with a heart between them. */
export function CoupleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="6.5" cy="6" r="2.75" />
      <circle cx="17.5" cy="6" r="2.75" />
      <path d="M1.5 20a5 5 0 0 1 10 0" />
      <path d="M12.5 20a5 5 0 0 1 10 0" />
      <path d="M12 6.8c-.7-1.3-2.5-1-2.5.55 0 1 1.4 1.9 2.5 2.65 1.1-.75 2.5-1.65 2.5-2.65 0-1.55-1.8-1.85-2.5-.55Z" />
    </svg>
  )
}

/** Three-figure cluster — two behind, one in front. */
export function GroupIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="7.5" cy="5.5" r="2.4" />
      <circle cx="16.5" cy="5.5" r="2.4" />
      <circle cx="12" cy="9.5" r="3" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  )
}
