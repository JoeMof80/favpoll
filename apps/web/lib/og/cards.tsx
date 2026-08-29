import {
  FAVPOLL_MARK_PATHS,
  FAVPOLL_MARK_VIEWBOX,
} from "@/components/favpoll-logo"
import { joinCharities, type FavpollOgCard } from "./favpoll-og"
import { OG_PALETTE as P } from "./palette"
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
function Wordmark({ size }: { size: number }) {
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
        color: P.primary,
      }}
    >
      <Mark size={size} color={P.primary} />
      <div style={{ display: "flex" }}>
        <span>fav</span>
        <span style={{ color: alpha(P.primary, 0.6) }}>poll</span>
      </div>
    </div>
  )
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        display: "flex",
        background: P.background,
        fontFamily: FONT,
        color: P.foreground,
      }}
    >
      {children}
    </div>
  )
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: PANEL_WIDTH,
        height: OG_SIZE.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: P.secondary,
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
}: {
  card: FavpollOgCard
  photo: string | null
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
      <div style={{ ...tile, background: P.background, padding: 8 }}>
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
        background: P.background,
        border: `2px solid ${P.borderStrong}`,
      }}
    >
      {card.isCause ? (
        <Mark size={168} color={P.primary} />
      ) : (
        <span
          style={{
            fontSize: card.initials.length > 1 ? 120 : 140,
            fontWeight: 500,
            letterSpacing: -4,
            color: P.primary,
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
}: {
  card: FavpollOgCard
  photo: string | null
}) {
  const longName = card.name.length > 22
  return (
    <Frame>
      <Panel>
        <Portrait card={card} photo={photo} />
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
                color: P.primaryMuted,
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
              color: P.foreground,
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
              color: P.foreground,
              lineClamp: 2,
            }}
          >
            {card.isClosed
              ? card.topic
                ? `Favourite ${card.topic} — closed`
                : "This favpoll has closed"
              : card.topic
                ? `Pick your favourite ${card.topic}`
                : "Pick your favourite"}
          </div>
          {card.charities.length > 0 && (
            <div
              style={{
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.3,
                color: P.mutedForeground,
                lineClamp: 2,
              }}
            >
              {`Every pound ${card.isClosed ? "raised " : ""}goes to ${joinCharities(card.charities)}`}
            </div>
          )}
        </div>
        <Wordmark size={36} />
      </div>
    </Frame>
  )
}

export function BrandCard() {
  return (
    <Frame>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 64px 60px 72px",
        }}
      >
        <Wordmark size={56} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 56,
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: -1.4,
            color: P.foreground,
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
            color: P.mutedForeground,
          }}
        >
          {SITE_DESCRIPTION}
        </div>
      </div>
      <Panel>
        <Mark size={260} color={P.primary} />
      </Panel>
    </Frame>
  )
}
