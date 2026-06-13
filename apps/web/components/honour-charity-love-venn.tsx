import * as React from "react"
import { FavpollMarkGlyph } from "./favpoll-mark"

/**
 * HonourCharityLoveVenn — the hero emblem for the alt landing page.
 *
 * Three overlapping rings (Honour, Charity, Love) with the favpoll mark at
 * their intersection. Each ring is a *full circle* whose stroke fades to
 * nothing toward one side, so the venn is only ever suggested, never closed.
 * The fade is oriented per ring (outward, away from the centre) and rides
 * around with the rotation, giving a slow shimmer. Pauses for reduced motion.
 *
 * Geometry, colours and the fade-to-transparent technique are taken straight
 * from the design source; labels are live <textPath> (real text, restylable)
 * rather than baked outlines.
 *
 * Usage:
 *   <HonourCharityLoveVenn className="w-full max-w-md mx-auto" />
 */

export interface HonourCharityLoveVennProps extends Omit<
  React.SVGProps<SVGSVGElement>,
  "speed"
> {
  /** Pixel size; omit to size via CSS/className. */
  size?: number | string
  /** The three ring labels. */
  labels?: { honour: string; charity: string; love: string }
  /** Ring + label colour. */
  ringColor?: string
  /** Mark colour (heart full, inner strokes 60%). */
  markColor?: string
  /** Slowly rotate the rings. Always paused when the user prefers reduced motion. */
  animate?: boolean
  /** Seconds per full rotation, per ring. */
  speed?: { honour?: number; charity?: number; love?: number }
  /** Accessible label. */
  title?: string
}

// Ring centres + the resting orientation that points each fade outward.
// (base = degrees; dir = spin direction; dur = seconds per turn.)
const RINGS = [
  { key: "honour", cx: 282.843, cy: 282.843, base: -45, dir: 1, dur: 30 },
  { key: "love", cx: 440.812, cy: 282.843, base: 45, dir: -1, dur: 34 },
  { key: "charity", cx: 357.969, cy: 411.963, base: 180, dir: 1, dur: 38 },
] as const

const RADIUS = 194
const STROKE = 12

// Label baselines: arcs just outside each ring, on its outer curve.
const LABEL_ARCS = {
  honour: "M71.7 241.7 A215 215 0 0 1 136.2 125.6", // upper-left, ~45°
  love: "M590.2 128.2 A215 215 0 0 1 652.6 245.4", // upper-right, ~45°
  charity: "M420.8 617.5 A215 215 0 0 1 281 612.8", // bottom (badge-flip)
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener?.("change", update)
    return () => mq.removeEventListener?.("change", update)
  }, [])
  return reduced
}

export default function HonourCharityLoveVenn({
  size,
  labels = { honour: "Honour", charity: "Charity", love: "Love" },
  ringColor = "#423DB9",
  markColor = "#423DB3",
  animate = true,
  speed,
  title = "favpoll — honour, charity and love",
  ...rest
}: HonourCharityLoveVennProps) {
  const reduced = usePrefersReducedMotion()
  const spinning = animate && !reduced
  const dur = {
    honour: speed?.honour ?? 30,
    charity: speed?.charity ?? 38,
    love: speed?.love ?? 34,
  }

  return (
    <svg
      viewBox="0 0 724 712"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>{title}</title>

      <defs>
        {/* One fade per ring: transparent at the top of its own circle, solid
            at the bottom — the ring's base rotation turns that toward its
            outer edge, and the spin carries it around. */}
        {RINGS.map((r) => (
          <linearGradient
            key={r.key}
            id={`hlc-${r.key}`}
            gradientUnits="userSpaceOnUse"
            x1={r.cx}
            y1={r.cy - 200}
            x2={r.cx}
            y2={r.cy + 200}
          >
            <stop offset="0" stopColor={ringColor} stopOpacity="0" />
            <stop offset="1" stopColor={ringColor} stopOpacity="1" />
          </linearGradient>
        ))}
        <path id="hlc-arc-honour" d={LABEL_ARCS.honour} />
        <path id="hlc-arc-love" d={LABEL_ARCS.love} />
        <path id="hlc-arc-charity" d={LABEL_ARCS.charity} />
      </defs>

      {/* Rings */}
      {RINGS.map((r) => (
        <circle
          key={r.key}
          cx={r.cx}
          cy={r.cy}
          r={RADIUS}
          fill="none"
          stroke={`url(#hlc-${r.key})`}
          strokeWidth={STROKE}
          transform={`rotate(${r.base} ${r.cx} ${r.cy})`}
        >
          {spinning && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`${r.base} ${r.cx} ${r.cy}`}
              to={`${r.base + r.dir * 360} ${r.cx} ${r.cy}`}
              dur={`${dur[r.key as keyof typeof dur]}s`}
              repeatCount="indefinite"
            />
          )}
        </circle>
      ))}

      {/* Mark at the heart of the three rings */}
      <g style={{ color: markColor }}>
        <FavpollMarkGlyph />
      </g>

      {/* Labels on each ring's outer curve */}
      <g
        fill={ringColor}
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontWeight={500}
        fontSize={28}
      >
        <text>
          <textPath
            href="#hlc-arc-honour"
            startOffset="50%"
            textAnchor="middle"
          >
            {labels.honour}
          </textPath>
        </text>
        <text>
          <textPath href="#hlc-arc-love" startOffset="50%" textAnchor="middle">
            {labels.love}
          </textPath>
        </text>
        <text>
          <textPath
            href="#hlc-arc-charity"
            startOffset="50%"
            textAnchor="middle"
          >
            {labels.charity}
          </textPath>
        </text>
      </g>
    </svg>
  )
}
