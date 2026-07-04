"use client"

// Monogram texture for the purple hero band: the favpoll mark itself,
// tiled as a lattice in all four orientations (founder's design, 2026-07 —
// replaced an earlier interlocked-pair monogram). A slow diagonal shimmer
// band sweeps across and momentarily reveals the pattern more strongly.
// Static under prefers-reduced-motion.
//
// FavpollMarkGlyph and MonogramTiles are deliberately self-contained so the
// pattern can be lifted straight out for print/merch use later.
import { motion, useReducedMotion } from "framer-motion"

// The favpoll mark, exactly as authored by the founder (10×9 viewBox).
// Fills are currentColor so the pattern inherits its colour from context.
export function FavpollMarkGlyph() {
  return (
    <g>
      <circle cx="5" cy="8.5" r="0.5" fill="currentColor" fillOpacity="0.5" />
      <path
        d="M9.5 3C9.77614 3 9.95898 2.77614 9.95898 2.5C9.72095 1.08114 8.4865 0 7 0C6.23165 0 5.53857 0.281796 5.00781 0.756836L4.80078 0.586914C4.29913 0.214249 3.67327 0 3 0C1.34315 0 0 1.34315 0 3C0 3.82247 0.331167 4.56744 0.867188 5.10938L2.52512 6.76777C2.72039 6.96303 3.03697 6.96303 3.23223 6.76777C3.42749 6.5725 3.42749 6.25592 3.23223 6.06066L1.57422 4.40234C1.21811 4.04035 1 3.54665 1 3C1 1.89543 1.89543 1 3 1C3.52432 1 3.99413 1.18996 4.34082 1.50098L5.00781 2.09961L5.6748 1.50195C6.02647 1.18721 6.48342 1 7 1C7.9314 1 8.71599 1.63749 8.93766 2.5C8.93766 2.77614 9.22386 3 9.5 3Z"
        fill="currentColor"
      />
      <path
        d="M4.5 4.5C4.5 4.77614 4.72386 5 5 5H9C9.27614 5 9.5 4.77614 9.5 4.5C9.5 4.22386 9.27614 4 9 4H5C4.72386 4 4.5 4.22386 4.5 4.5Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M4.5 6.5C4.5 6.77614 4.72386 7 5 7H7C7.27614 7 7.5 6.77614 7.5 6.5C7.5 6.22386 7.27614 6 7 6H5C4.72386 6 4.5 6.22386 4.5 6.5Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </g>
  )
}

// Lattice canvas (founder's design): a checkerboard of orientations.
// Vertical hearts (0/180, alternating along both axes) in one set of
// columns; horizontal hearts (90/270) in the offset columns at the
// midpoint rows; small dots fill the remaining crossings, so every grid
// intersection holds a mark or a dot and no orientation repeats along any
// row or column.
export function MonogramTiles({ patternId }: { patternId: string }) {
  const S = 1.6 // overall pattern scale; geometry below is in glyph units
  const mark = (x: number, y: number, rotate: number) => (
    <g
      key={`m${x}-${y}`}
      transform={`translate(${x} ${y}) rotate(${rotate}) translate(-5 -4.5)`}
    >
      <FavpollMarkGlyph />
    </g>
  )
  const dot = (x: number, y: number) => (
    <circle
      key={`d${x}-${y}`}
      cx={x}
      cy={y}
      r="1"
      fill="currentColor"
      fillOpacity="0.7"
    />
  )
  // 76×76 unit: vertical-heart columns at x=28/66 (rows y=12/50),
  // horizontal-heart columns at x=9/47 (rows y=31/69).
  const marks = [
    mark(28, 12, 0),
    mark(28, 50, 180),
    mark(66, 12, 180),
    mark(66, 50, 0),
    mark(9, 31, 90),
    mark(9, 69, 270),
    mark(47, 31, 270),
    mark(47, 69, 90),
  ]
  const dots = [
    dot(28, 31),
    dot(28, 69),
    dot(66, 31),
    dot(66, 69),
    dot(9, 12),
    dot(9, 50),
    dot(47, 12),
    dot(47, 50),
  ]
  return (
    <svg className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern
          id={patternId}
          width={76 * S}
          height={76 * S}
          patternUnits="userSpaceOnUse"
        >
          <g transform={`scale(${S})`}>
            {marks}
            {dots}
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  )
}

const SHIMMER_MASK =
  "linear-gradient(105deg, transparent 38%, black 50%, transparent 62%)"

export function HeroTexture() {
  const reduced = useReducedMotion()

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden text-primary-foreground"
      aria-hidden="true"
    >
      {/* Constant faint monogram canvas */}
      <div className="absolute inset-0 opacity-[0.05]" data-fp-texture="base">
        <MonogramTiles patternId="fp-monogram-base" />
      </div>
      {/* Shimmer band sweeping across, revealing the pattern more strongly */}
      {!reduced && (
        <motion.div
          className="absolute inset-0 opacity-[0.11]"
          style={{
            maskImage: SHIMMER_MASK,
            WebkitMaskImage: SHIMMER_MASK,
            maskSize: "300% 100%",
            WebkitMaskSize: "300% 100%",
          }}
          initial={{ maskPosition: "120% 0%" }}
          animate={{ maskPosition: "-20% 0%" }}
          transition={{
            duration: 7,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut",
          }}
        >
          <MonogramTiles patternId="fp-monogram-shimmer" />
        </motion.div>
      )}
    </div>
  )
}
