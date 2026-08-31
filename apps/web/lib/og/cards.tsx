import {
  FAVPOLL_MARK_PATHS,
  FAVPOLL_MARK_VIEWBOX,
} from "@/components/favpoll-logo"
import { ogCopy } from "./copy"
import { joinCharities, type FavpollOgCard } from "./favpoll-og"
import { OG_PALETTES, type OgPalette } from "./palette"
import type { RegisterPalette } from "@/lib/register-palette"
import { HEADLINE_BEATS, SITE_DESCRIPTION } from "./site"

// The share cards, as Satori JSX. Satori is not a browser: every box with
// more than one child must be display:flex, styles are inline only, and
// colours come from lib/og/palette.ts (hex mirrors of the tokens). Both
// cards share one structure — a tinted panel on one side, type on the
// other, the wordmark anchoring a corner — so a favpoll's preview and the
// site's read as the same family.

export const OG_SIZE = { width: 1200, height: 630 } as const

const FONT = "Plus Jakarta Sans"
const PANEL_WIDTH = 440
const TILE = 300

function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function Mark({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={(size * 22) / 24}
      viewBox={FAVPOLL_MARK_VIEWBOX}
      fill="none"
    >
      {FAVPOLL_MARK_PATHS.map((p) => (
        <path key={p.d} d={p.d} fill={color} fillOpacity={p.opacity} />
      ))}
    </svg>
  )
}

// The FavpollLogo lockup — mark, then "fav" with "poll" at 60%.
function Wordmark({ size, p }: { size: number; p: OgPalette }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.32,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 400,
        letterSpacing: -size * 0.025,
        color: p.primary,
      }}
    >
      <Mark size={size} color={p.primary} />
      <div style={{ display: "flex" }}>
        <span>fav</span>
        <span style={{ color: alpha(p.primary, 0.6) }}>poll</span>
      </div>
    </div>
  )
}

function Frame({ children, p }: { children: React.ReactNode; p: OgPalette }) {
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        background: p.background,
        fontFamily: FONT,
        color: p.foreground,
      }}
    >
      {children}
    </div>
  )
}

function Panel({ children, p }: { children: React.ReactNode; p: OgPalette }) {
  return (
    <div
      style={{
        width: PANEL_WIDTH,
        height: OG_SIZE.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: p.secondary,
      }}
    >
      {children}
    </div>
  )
}

// The photo, or what stands in for it: a person's initials, a cause's mark.
function Portrait({
  card,
  photo,
  p,
}: {
  card: FavpollOgCard
  photo: string | null
  p: OgPalette
}) {
  const tile = {
    width: TILE,
    height: TILE,
    borderRadius: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as const

  if (photo) {
    return (
      <div style={{ ...tile, background: p.background, padding: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          width={TILE - 16}
          height={TILE - 16}
          alt=""
          style={{ objectFit: "cover", borderRadius: 22 }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        ...tile,
        background: p.background,
        border: `2px solid ${p.borderStrong}`,
      }}
    >
      {card.isCause ? (
        <Mark size={168} color={p.primary} />
      ) : (
        <span
          style={{
            fontSize: card.initials.length > 1 ? 120 : 140,
            fontWeight: 500,
            letterSpacing: -4,
            color: p.primary,
          }}
        >
          {card.initials}
        </span>
      )}
    </div>
  )
}

export function FavpollCard({
  card,
  photo,
  palette,
}: {
  card: FavpollOgCard
  photo: string | null
  /** The favpoll's register palette — null/omitted = the blue default. */
  palette?: RegisterPalette | null
}) {
  const p = OG_PALETTES[palette ?? "default"]
  const longName = card.name.length > 22
  return (
    <Frame p={p}>
      <Panel p={p}>
        <Portrait card={card} photo={photo} p={p} />
      </Panel>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px 52px 64px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {card.eyebrow && (
            <div
              style={{
                fontSize: 24,
                fontWeight: 500,
                letterSpacing: 2.4,
                textTransform: "uppercase",
                color: p.primaryMuted,
                marginBottom: 16,
              }}
            >
              {card.eyebrow}
            </div>
          )}
          <div
            style={{
              fontSize: longName ? 52 : 66,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: longName ? -1 : -1.5,
              color: p.foreground,
              lineClamp: 2,
            }}
          >
            {card.name}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 400,
              lineHeight: 1.25,
              color: p.foreground,
              lineClamp: 2,
            }}
          >
            {card.isClosed
              ? card.topic
                ? ogCopy("og.card.closed", { topic: card.topic })
                : ogCopy("og.card.closedNoTopic")
              : card.topic
                ? ogCopy("og.pick", { topic: card.topic })
                : ogCopy("og.pickNoTopic")}
          </div>
          {card.charities.length > 0 && (
            <div
              style={{
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.3,
                color: p.mutedForeground,
                lineClamp: 2,
              }}
            >
              {ogCopy(card.isClosed ? "og.card.goesClosed" : "og.card.goes", {
                charities: joinCharities(card.charities),
              })}
            </div>
          )}
        </div>
        <Wordmark size={36} p={p} />
      </div>
    </Frame>
  )
}

export function BrandCard() {
  const p = OG_PALETTES.default
  return (
    <Frame p={p}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 64px 60px 72px",
        }}
      >
        <Wordmark size={56} p={p} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: -1.4,
            color: p.foreground,
          }}
        >
          {HEADLINE_BEATS.map((beat) => (
            <span key={beat}>{beat}</span>
          ))}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            lineHeight: 1.4,
            color: p.mutedForeground,
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
      <Panel p={p}>
        <Mark size={260} color={p.primary} />
      </Panel>
    </Frame>
  )
}
