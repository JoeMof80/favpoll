"use client"

// PROTOTYPE — monogram texture for the purple hero band. Two favpoll marks
// interlocked point-symmetrically (the classic luxury-monogram move) on a
// half-drop canvas with small diamond accents, tiled at ~5% opacity. A slow
// diagonal shimmer band sweeps across and momentarily reveals the pattern
// more strongly. Static under prefers-reduced-motion.
//
// FavpollMonogramGlyph and MonogramTiles are deliberately self-contained so
// the pattern can be lifted straight out for print/merch use later.
import { motion, useReducedMotion } from "framer-motion"

// The interlocked monogram pair, authored by the founder (13×15 viewBox):
// two marks point-symmetric in a vertical weave — hearts top-right /
// bottom-left, bars interleaving, a dot nested in each heart's curl.
// Fills are currentColor so the pattern inherits its colour from context.
export function FavpollMonogramGlyph() {
  return (
    <g>
      <circle
        cx="7.08244"
        cy="8.5"
        r="0.5"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M11.5824 3C11.8586 3 12.0414 2.77614 12.0414 2.5C11.8034 1.08114 10.5689 0 9.08244 0C8.31408 0 7.621 0.281796 7.09025 0.756836L6.88322 0.586914C6.38157 0.214249 5.7557 0 5.08244 0C3.42558 0 2.08244 1.34315 2.08244 3C2.08244 3.82247 2.4136 4.56744 2.94962 5.10938L4.60756 6.76777C4.80282 6.96303 5.1194 6.96303 5.31467 6.76777C5.50993 6.5725 5.50993 6.25592 5.31467 6.06066L3.65665 4.40234C3.30054 4.04035 3.08244 3.54665 3.08244 3C3.08244 1.89543 3.97787 1 5.08244 1C5.60675 1 6.07656 1.18996 6.42326 1.50098L7.09025 2.09961L7.75724 1.50195C8.1089 1.18721 8.56585 1 9.08244 1C10.0138 1 10.7984 1.63749 11.0201 2.5C11.0201 2.77614 11.3063 3 11.5824 3Z"
        fill="currentColor"
      />
      <path
        d="M6.58244 4.5C6.58244 4.77614 6.80629 5 7.08244 5H11.0824C11.3586 5 11.5824 4.77614 11.5824 4.5C11.5824 4.22386 11.3586 4 11.0824 4H7.08244C6.80629 4 6.58244 4.22386 6.58244 4.5Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M6.58244 6.5C6.58244 6.77614 6.80629 7 7.08244 7H9.08244C9.35858 7 9.58244 6.77614 9.58244 6.5C9.58244 6.22386 9.35858 6 9.08244 6H7.08244C6.80629 6 6.58244 6.22386 6.58244 6.5Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <circle
        cx="4.95898"
        cy="6.40733"
        r="0.5"
        transform="rotate(-180 4.95898 6.40733)"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M0.458985 11.9073C0.182843 11.9073 2.42698e-07 12.1312 2.18557e-07 12.4073C0.238039 13.8262 1.47249 14.9073 2.95898 14.9073C3.72734 14.9073 4.42042 14.6255 4.95117 14.1505L5.1582 14.3204C5.65985 14.6931 6.28572 14.9073 6.95898 14.9073C8.61584 14.9073 9.95898 13.5642 9.95898 11.9073C9.95898 11.0849 9.62782 10.3399 9.0918 9.79795L7.43386 8.13956C7.2386 7.9443 6.92202 7.9443 6.72675 8.13956C6.53149 8.33482 6.53149 8.6514 6.72675 8.84667L8.38477 10.505C8.74088 10.867 8.95898 11.3607 8.95898 11.9073C8.95898 13.0119 8.06355 13.9073 6.95898 13.9073C6.43467 13.9073 5.96486 13.7174 5.61816 13.4063L4.95117 12.8077L4.28418 13.4054C3.93252 13.7201 3.47557 13.9073 2.95898 13.9073C2.02759 13.9073 1.24299 13.2698 1.02132 12.4073C1.02132 12.1312 0.735127 11.9073 0.458985 11.9073Z"
        fill="currentColor"
      />
      <path
        d="M5.45898 10.4073C5.45898 10.1312 5.23513 9.90733 4.95898 9.90733L0.958984 9.90733C0.682842 9.90733 0.458984 10.1312 0.458984 10.4073C0.458984 10.6835 0.682842 10.9073 0.958984 10.9073L4.95898 10.9073C5.23513 10.9073 5.45898 10.6835 5.45898 10.4073Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      <path
        d="M5.45898 8.40733C5.45898 8.13118 5.23513 7.90733 4.95898 7.90733L2.95898 7.90733C2.68284 7.90733 2.45898 8.13118 2.45898 8.40733C2.45898 8.68347 2.68284 8.90733 2.95898 8.90733L4.95898 8.90733C5.23513 8.90733 5.45898 8.68347 5.45898 8.40733Z"
        fill="currentColor"
        fillOpacity="0.5"
      />
    </g>
  )
}

// Classic half-drop monogram canvas: interlocked pairs on one diagonal,
// diamond accents on the other.
function MonogramTiles({ patternId }: { patternId: string }) {
  // Glyph is authored in a 13×15 box; centre it on (x, y) at ~21×24px.
  // Alternate rows rotate 90° so the weave changes direction row by row.
  const pair = (x: number, y: number, rotate = 0) => (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(1.6) translate(-6.5 -7.45)`}
    >
      <FavpollMonogramGlyph />
    </g>
  )
  const diamond = (x: number, y: number) => (
    <rect
      width="4"
      height="4"
      rx="0.8"
      transform={`translate(${x} ${y}) rotate(45) translate(-2 -2)`}
      fill="currentColor"
      fillOpacity="0.7"
    />
  )
  return (
    <svg className="h-full w-full" aria-hidden="true">
      <defs>
        <pattern
          id={patternId}
          width="76"
          height="76"
          patternUnits="userSpaceOnUse"
        >
          {pair(19, 19)}
          {pair(57, 57, 90)}
          {diamond(57, 19)}
          {diamond(19, 57)}
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
