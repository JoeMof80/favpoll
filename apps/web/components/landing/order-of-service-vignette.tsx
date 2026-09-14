"use client"

import { InsertCard } from "@/components/print-pack/insert-card"
import { Vignette } from "@/components/landing/vignette"
import { MEMORIAL_PACK_DATA } from "@/components/landing/demo-fixture"

// The insert card, shown as itself.
//
// THE TORN SHEET IS RETIRED (founder, 2026-09-14: "I wonder if it would
// be better just showing the card"). The tear existed to say "this is a
// block your printer sets into the family's own page" — honest while
// favpoll shipped nothing but the raw QR. The card is now a REAL
// downloadable artefact on the stationery page, so the honest picture
// is the card itself: what a family downloads and hands to their
// printer, or slips into the order of service as printed.
//
// THE REAL COMPONENT, as everywhere on these pages — the same
// InsertCard the stationery page exports, fed by MEMORIAL_PACK_DATA so
// it cannot drift from the reveal, display and keepsake beside it.
//
// mx-auto, NOT flex justify-center: a flex item sizes to max-content
// and the ShareVignette spilled both screen edges that way (#863).
export function OrderOfServiceVignette() {
  return (
    <Vignette>
      <div data-artefact-box className="mx-auto w-fit drop-shadow-lg">
        <InsertCard data={MEMORIAL_PACK_DATA} />
      </div>
    </Vignette>
  )
}
