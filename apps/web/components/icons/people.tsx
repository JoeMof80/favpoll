import { useId } from "react"
import type { SVGProps } from "react"

// Custom people icons in lucide's user-round grammar (24-box, stroke 2,
// round caps/joins). Back figures' strokes break around the front
// figure via an SVG mask (occlusion per the founder's reference,
// 2026-07-30) — lucide itself has no pair/trio compositions.

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

/** Two figures — one behind, one in front. */
export function PairIcon(props: SVGProps<SVGSVGElement>) {
  const maskId = useId()
  return (
    <svg {...iconProps(props)}>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <circle
          cx="13.5"
          cy="9.2"
          r="4"
          fill="black"
          stroke="black"
          strokeWidth="4"
        />
        <path
          d="M19.7 21.5a6.2 6.2 0 0 0-12.4 0"
          fill="none"
          stroke="black"
          strokeWidth="4"
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <circle cx="6.8" cy="5.4" r="3.6" />
        <path d="M2 21v-4a4.6 4.6 0 0 1 4.6-4.6h3.5" />
      </g>
      <circle cx="13.5" cy="9.2" r="4" />
      <path d="M19.7 21.5a6.2 6.2 0 0 0-12.4 0" />
    </svg>
  )
}

/** Three figures — front figure wedged between two behind. */
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
        <path d="M1.6 21v-3.4a4.4 4.4 0 0 1 4.4-4.4h3.5" />
        <circle cx="18.4" cy="6.2" r="3.5" />
        <path d="M22.4 21v-3.4a4.4 4.4 0 0 0-4.4-4.4h-3.5" />
      </g>
      <circle cx="12" cy="10.2" r="3.7" />
      <path d="M17.7 21.5a5.7 5.7 0 0 0-11.4 0" />
    </svg>
  )
}
