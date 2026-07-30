import { useId } from "react"
import type { SVGProps } from "react"

// Custom people icons in lucide's user-round grammar (24-box, stroke 2,
// round caps/joins), built to the founder's gridded sketch (2026-07-30):
// open shoulder arcs with visible leg caps; back figures' inner legs end
// inside the front figure's mask band so they vanish behind it; heads
// near-equal with a small bite where the front head passes.

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

/** Two figures — one behind-left, one in front. */
export function PairIcon(props: SVGProps<SVGSVGElement>) {
  const maskId = useId()
  return (
    <svg {...iconProps(props)}>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <circle
          cx="14.6"
          cy="7.6"
          r="3.7"
          fill="black"
          stroke="black"
          strokeWidth="4"
        />
        <path
          d="M21 21a6.4 6.4 0 0 0-12.8 0"
          fill="none"
          stroke="black"
          strokeWidth="4"
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <circle cx="7.6" cy="6.6" r="3.3" />
        <path d="M1.6 20A5.2 5.2 0 0 1 9.5 15.6" />
      </g>
      <circle cx="14.6" cy="7.6" r="3.7" />
      <path d="M21 21a6.4 6.4 0 0 0-12.8 0" />
    </svg>
  )
}

/** Three figures — front figure between two behind. */
export function GroupIcon(props: SVGProps<SVGSVGElement>) {
  const maskId = useId()
  return (
    <svg {...iconProps(props)}>
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <circle
          cx="12"
          cy="8"
          r="3.6"
          fill="black"
          stroke="black"
          strokeWidth="4"
        />
        <path
          d="M18.5 21a6.5 6.5 0 0 0-13 0"
          fill="none"
          stroke="black"
          strokeWidth="4"
        />
      </mask>
      <g mask={`url(#${maskId})`}>
        <circle cx="5.9" cy="6.7" r="3.1" />
        <path d="M1.4 19.8A4.9 4.9 0 0 1 8.4 15.5" />
        <circle cx="18.1" cy="6.7" r="3.1" />
        <path d="M22.6 19.8A4.9 4.9 0 0 0 15.6 15.5" />
      </g>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M18.5 21a6.5 6.5 0 0 0-13 0" />
    </svg>
  )
}
