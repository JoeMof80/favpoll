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

// The topic steps DOWN as it grows (founder, 2026-09-14: "larger in
// this example where there are fewer characters") — the hero's
// step-down grammar (heroNameSizeClass), not continuous scaling.
// FAVOURITE steps with it: the two lines share one size by decision
// (same day), split by ink alone. Thresholds against the 200px content
// column: 16px tracked uppercase runs ~13 chars a line, 13px ~17.
// Beyond the last step the line simply wraps and the card extends.
function topicSizeClass(topic: string): string {
  if (topic.length <= 12) return "text-base"
  if (topic.length <= 18) return "text-[13px]"
  return "text-[11px]"
}

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
      className="paper paper-screen relative rounded-lg border border-border bg-background px-5 pt-4 pb-5"
      style={{ width: INSERT_CARD_WIDTH }}
    >
      {/* ABSOLUTE, not a flex sibling: a transform paints smaller but
          the logo's LAYOUT box stays full size, and as a flex item it
          squeezed the text column until "IN MEMORY OF" wrapped
          (founder screenshot, 2026-09-14). Pinned to the corner it
          costs the text nothing; origin-top-right keeps the shrink
          anchored there. Scaled, not set smaller: the mark is a fixed
          24x22 svg, so a transform shrinks mark and wordmark
          together. */}
      <FavpollLogo className="absolute top-4 right-5 origin-top-right scale-[0.4] text-xs font-medium" />
      <div className="pr-10">
        <p className="text-[9px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {data.prefix}
        </p>
        <p className="mt-1 text-lg leading-tight font-medium text-foreground">
          {data.name}
        </p>
      </div>
      {data.topicTitle && (
        <div className="mt-3 border-t border-b border-border py-2">
          <p
            className={`${topicSizeClass(data.topicTitle)} leading-snug font-medium tracking-[0.14em] text-primary/70 uppercase`}
          >
            Favourite
          </p>
          <p
            className={`${topicSizeClass(data.topicTitle)} leading-snug font-medium tracking-[0.14em] text-primary uppercase`}
          >
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
