"use client"

// Client because Button and CharityRow are. Nothing here is interactive —
// the hints are inert and aria-hidden.

import { Button } from "@/components/ui/button"
import { CharityRow } from "@/components/charity-row"
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

// The scene's own topic plus the ones the register copy names, so the pills
// and the sentence beside them agree.
const TOPICS = [
  "Colour",
  "Song",
  "Flower",
  "Walk",
  "Seaside town",
  "Dog breed",
  "Film",
  "Comfort food",
]
const PICKED = "Song"

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
      <div className="border-t border-border pt-3">
        <CharityRow charity={CHARITY} amountRaised={PICKED_AMOUNT} size="sm" />
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
