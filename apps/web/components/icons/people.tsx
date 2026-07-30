import { useId } from "react"
import type { SVGProps } from "react"

// Custom people icons in lucide's user-round grammar (24-box, stroke 2,
// round caps/joins). Back figures share the front figure's semicircular
// body shape; their strokes break around the front silhouette via an
// SVG mask, and the shoulder arcs exit through the bottom corners so
// nothing shows a cut cap (founder-referenced composition, 2026-07-30).

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
        <path d="M0.7 24.6A11 11 0 0 1 13 12.6" />
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
        <circle cx="5.7" cy="7" r="3.2" />
        <path d="M0.6 24.4A10.5 10.5 0 0 1 12 13.3" />
        <circle cx="18.3" cy="7" r="3.2" />
        <path d="M23.4 24.4A10.5 10.5 0 0 0 12 13.3" />
      </g>
      <circle cx="12" cy="10.2" r="3.7" />
      <path d="M17.7 21.5a5.7 5.7 0 0 0-11.4 0" />
    </svg>
  )
}
