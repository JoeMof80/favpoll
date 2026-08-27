"use client"

// Client because Button and CharityRow are. Nothing here is interactive —
// the hints are inert and aria-hidden.

import { Button } from "@/components/ui/button"
import { CharityRow } from "@/components/charity-row"
import { PledgeBreakdown } from "@/components/pledge-card/pledge-breakdown"
import { formatPoundsExact } from "@/lib/i18n"
import { RankingBar } from "@/components/ui/ranking-bar"
import { MEMORIAL_SCENE } from "@/components/landing/demo-fixture"
import type { Charity } from "@favpoll/types"

// A HINT OF EACH BEAT (founder, 2026-08-27), built from the app's own
// Button, CharityRow and RankingBar — so a hint cannot show a control the
// product has not got, while staying small enough to sit beside three lines
// of text.
//
// Two passes were rejected on the way here, both worth recording. FULL
// VIGNETTES — the whole topic dialog, the whole of StepAmount — were
// neither small nor legible in a 397px column. CROPPED CORNERS of those
// same components were worse: a control sliced down the middle reads as a
// rendering fault rather than as a detail.
//
// STATIC. No cycling, no growing bars ("i don't see any need to animate").
//
// THE CHARITY APPEARS IN TWO OF THE THREE, because it is the point and the
// controls alone do not carry it: a row of amounts is a payment form until
// something says where the money goes, and a ranked list is a leaderboard
// until the same. Marie Curie is the memorial scene's own charity, so these
// agree with the phone in the hero and the pack below it.

const CHARITY = MEMORIAL_SCENE.charities[0] as Charity

// FAVOURITES, NOT TOPICS (founder, 2026-08-27). The beat is the GUEST
// picking, not the organiser choosing what the poll is about — the same
// correction the home page's own How It Works made when it reframed itself
// as one guest journey ("numbering all six would mix two actors in one
// list"). Topic pills illustrated the organiser's move and so contradicted
// the words beside them.
//
// The scene's own six colours, and BLUE picked — the scene's selectedIndex,
// and deliberately not Purple: purple is Belinda's answer, and showing the
// guest land on it would give the reveal away two columns before the
// standings do.
//
// Colours are the memorial scene's topic. /celebrations and /fundraisers
// borrow them for now; the component takes a per-step media override, so
// each can pass its own when its turn in the rework comes.
// Eight of the topic's thirteen. The hint column is 192px and a pill at
// text-xs is ~90px, so TWO fit a row whatever the count — the only lever
// on height is how many there are. Thirteen was seven rows against four
// lines of text; ten was five. Eight is four, level with the text.
//
// Chosen rather than sliced, because a contiguous slice cannot hold all
// three colours the rest of the band depends on: Blue is the pill lit
// here, and Purple, Blue and Red are the standings two columns along.
// Filtered from the topic so the labels stay the product's own, in the
// order the real picker shows them.
const SHOWN = new Set([
  "Black",
  "Blue",
  "Green",
  "Grey",
  "Pink",
  "Purple",
  "Red",
  "Yellow",
])
const TOPICS = MEMORIAL_SCENE.poll.topic.favourites
  .map((f) => f.label)
  .filter((l) => SHOWN.has(l))
const PICKED = "Blue"

export function PickHint() {
  return (
    <div className="flex flex-wrap gap-1.5" aria-hidden="true">
      {TOPICS.map((t) => (
        <Button
          key={t}
          type="button"
          tabIndex={-1}
          variant={t === PICKED ? "default" : "outline"}
          size="sm"
          className="pointer-events-none rounded-full text-xs"
        >
          {t}
        </Button>
      ))}
    </div>
  )
}

// StepAmount's own preset values, so the row is the one a guest meets.
const PRESETS = [5, 10, 20, 50]
const PICKED_AMOUNT = 20

export function PledgeHint() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="grid grid-cols-4 gap-1.5">
        {PRESETS.map((p) => (
          <Button
            key={p}
            type="button"
            tabIndex={-1}
            variant={p === PICKED_AMOUNT ? "default" : "outline"}
            size="sm"
            className="pointer-events-none px-0 text-xs"
          >
            £{p}
          </Button>
        ))}
      </div>
      {/* The favourite row, as StepAmount lays it out — above the bill
          rather than inside it, where it would double-count against "To
          Marie Curie". WITHOUT the real step's "Your favourite · its
          worth" label (founder, 2026-08-27): it wrapped to two lines at
          this width and the cell got too tall, and the row is legible
          without it — a colour and an amount over an itemised bill reads
          as what was picked. Blue, because that is the pill lit one column
          to the left. */}
      {/* Favourite row and bill in ONE block, so the only gap between them
          is PledgeBreakdown's own border-t/pt-3. As siblings of the outer
          space-y-3 they got that PLUS 12px, which read as a break between
          two unrelated things rather than a rule under a heading. */}
      <div>
        <div className="flex justify-between">
          <span className="text-xs">{PICKED}</span>
          <span className="text-xs font-semibold tabular-nums">
            {formatPoundsExact(PICKED_AMOUNT)}
          </span>
        </div>
        {/* The REAL PledgeBreakdown — the itemised bill a guest sees before
          confirming, with the same line/total grammar and the same labels
          ("To <charity>", "Total charged"). A charity row alone said where
          the money went; this says how it splits (founder, 2026-08-27). */}
        <PledgeBreakdown
          lines={[
            { label: `To ${CHARITY.name}`, amount: PICKED_AMOUNT },
            // £0, deliberately (founder, 2026-08-27). A non-zero shared-fund
            // line reads as money diverted AWAY from the charity, directly
            // against the sentence beside it — "Every penny goes to the
            // chosen charity" — and against the 0% promise. The line still
            // earns its place at zero: it shows the split exists without
            // showing it taking anything.
            { label: "Shared fund", amount: 0 },
          ]}
          total={{ label: "Total charged", amount: PICKED_AMOUNT }}
        />
      </div>
    </div>
  )
}

export function RankHint() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <div className="space-y-2">
        {MEMORIAL_SCENE.results.slice(0, 3).map((r, i) => (
          <RankingBar
            key={r.label}
            label={r.label}
            amount={r.amount}
            widthPercent={r.widthPercent}
            emphasis={i === 0}
            barClassName={i === 0 ? "bg-primary" : "bg-chart-3"}
          />
        ))}
      </div>
      {/* The scene's settled total — the same £1,005 the hero's phone and
          the keepsake below both show. */}
      <div className="border-t border-border pt-3">
        <CharityRow
          charity={CHARITY}
          amountRaised={Number(MEMORIAL_SCENE.total.replace(/[^0-9.]/g, ""))}
          size="sm"
        />
      </div>
    </div>
  )
}
