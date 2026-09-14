import { BrandedQR } from "@/components/branded-qr"
import { FavpollLogo } from "@/components/favpoll-logo"
import type { PackData } from "./pack-card"

// THE INSERT CARD — the block a family or their printer sets into the
// page they already have (an order of service, a menu, a place
// setting). Extracted from the order-of-service vignette (founder,
// 2026-09-14) and made a REAL artefact: the stationery page renders it
// with the favpoll's own data and exports it as an image, and the
// vignette shows this same component — the LockCardContent pattern, so
// the picture and the product cannot drift.
//
// TOPIC ON TWO LINES — the PollHeading grammar ("FAVOURITE" over the
// topic), matching everywhere else. The old vignette block ran
// "FAVOURITE COLOUR" as one line, which no other surface does.
//
// SCALES WITH THE TOPIC: the width is fixed, the topic and name WRAP
// (print is a record surface — wrap, never truncate) and the card
// grows downward. "HOLIDAY DESTINATION" takes two lines; the QR keeps
// its fixed size regardless, because the code's legibility must not
// depend on the topic's length.

/** Layout width — the export captures at 2x this (html-to-image). */
export const INSERT_CARD_WIDTH = 240

export function InsertCard({ data }: { data: PackData }) {
  return (
    // .paper pins light tokens: ink on paper must not follow the
    // viewer's theme (#535) — this card leaves the app as a file.
    // The favpoll-card grammar (founder, 2026-09-14): text left-aligned,
    // BRAND TOP-RIGHT like everywhere else (and smaller), QR centred.
    // FAVOURITE and the topic share ONE size — the split is ink, not
    // scale (the PollHeading pattern). Long topics WRAP and the card
    // extends downward; nothing here truncates — print is a record
    // surface.
    <div
      className="paper paper-screen rounded-lg border border-border bg-background px-5 pt-4 pb-5"
      style={{ width: INSERT_CARD_WIDTH }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[9px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
            {data.prefix}
          </p>
          <p className="mt-1 text-lg leading-tight font-medium text-foreground">
            {data.name}
          </p>
        </div>
        {/* Scaled, not just set smaller: FavpollLogo's mark is a fixed
            24x22 svg, so a transform shrinks mark and wordmark together
            (the vignette's hard-won footnote sizing). origin-top-right
            keeps it hugging the corner at half size. */}
        <div className="flex h-4 shrink-0 items-center">
          <FavpollLogo className="origin-top-right scale-[0.5] text-xs font-medium" />
        </div>
      </div>
      {data.topicTitle && (
        <div className="mt-3 border-t border-b border-border py-2">
          <p className="text-[11px] leading-snug font-medium tracking-[0.14em] text-primary/70 uppercase">
            Favourite
          </p>
          <p className="text-[11px] leading-snug font-medium tracking-[0.14em] text-primary uppercase">
            {data.topicTitle}
          </p>
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <BrandedQR
          value={data.qrUrl}
          size={160}
          aria-label="QR code for the favpoll"
        />
      </div>
    </div>
  )
}
