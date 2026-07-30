import { useId } from "react"
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

/**
 * Three figures in the user-round grammar: front figure wedged between
 * two near-complete back figures, whose strokes break around it (masked
 * occlusion — matches the founder's reference, 2026-07-30).
 */
export function GroupIcon(props: SVGProps<SVGSVGElement>) {
  const maskId = useId()
  return (
    <svg {...iconProps(props)}>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <circle
          cx="12"
          cy="10.2"
          r="3.7"
          fill="black"
          stroke="black"
          strokeWidth="4"
        />
        <path
          d="M17.7 21.5a5.7 5.7 0 0 0-11.4 0"
          fill="none"
          stroke="black"
          strokeWidth="4"
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <circle cx="5.6" cy="6.2" r="3.5" />
        <path d="M1 21.8a6.4 6.4 0 0 1 5-6.25" />
        <circle cx="18.4" cy="6.2" r="3.5" />
        <path d="M23 21.8a6.4 6.4 0 0 0-5-6.25" />
      </g>
      <circle cx="12" cy="10.2" r="3.7" />
      <path d="M17.7 21.5a5.7 5.7 0 0 0-11.4 0" />
    </svg>
  )
}
