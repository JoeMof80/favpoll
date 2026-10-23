import type { Charity } from "@favpoll/types"
import { FavpollMarkGlyph } from "@/components/landing/hero-texture"
import { Chip } from "@/components/ui/chip"
import { CharityRow } from "@/components/charity-row"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

// A RECEIPT THAT LEADS INTO THE NOTE (founder, 2026-10-19: "it feels weak.
// Should we replace the tick with the favpoll brandmark?"). The mark in a
// register-ink circle — favpoll did this — with the status in words; the
// pledge as REAL rows, the favourite as the picker's own chip and the charity
// as the real charity row with the amount. NO BUTTON (founder: "get rid of the
// button") — the sheet simply slides away onto the note.
//
// SHARED, because it had already drifted the other way (2026-10-22). This was
// drawn in the landing demo on 2026-10-19 and the product never got it: a
// guest's sheet closed on nothing. The demo was advertising a receipt that did
// not exist, exactly as its climbing bars advertised a climb the real page
// never played. Same reason LockCardContent was extracted on 2026-08-06 —
// one component so the two cannot say different things.
// SPLIT IN TWO (2026-10-22). The demo shows the whole thing as one centred
// block, but the guest's sheet now sets the note between the halves: the
// confirmation at the top answers "did my card work", the note owns the
// middle, and the rows sit at the foot as what a receipt actually is — the
// small print. Stacked above the note they buried it (founder: "the note
// needs to be front and centre").

/** The mark and the words. Answers the only urgent question. */
export function PledgeConfirmedHead({
  onBand = false,
}: {
  /** On the register band the disc inverts: pale ground, register glyph. */
  onBand?: boolean
} = {}) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* The mark, not a tick (founder, 2026-10-19: "it feels weak. Should we
          replace the tick with the favpoll brandmark?") — favpoll did this.
          Smaller below sm: at 64px it ate the top of a phone and pushed the
          note down the screen. */}
      {/* NO DISC ON THE BAND (founder, 2026-10-24: "Don't put brandmark in a
          circle"). The disc existed to give the mark a ground on white; on
          the band the mark simply IS the ink, the way the wordmark sits in
          the header. Larger, because without the disc it has to hold the top
          of the sheet on its own. */}
      {onBand ? (
        <svg
          viewBox="0 0 10 9"
          className="size-10 text-primary-foreground sm:size-12"
          aria-hidden="true"
        >
          <FavpollMarkGlyph />
        </svg>
      ) : (
        <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground sm:size-16">
          <svg
            viewBox="0 0 10 9"
            className="size-6 sm:size-8"
            aria-hidden="true"
          >
            <FavpollMarkGlyph />
          </svg>
        </div>
      )}
      {/* `brand` is text-primary, which is invisible ON primary — the status
          line disappeared entirely the first time this went on the band.
          `muted` is text-muted-foreground, which .on-band remaps to the
          band's ink. */}
      <SectionEyebrow variant={onBand ? "muted" : "brand"}>
        Pledge confirmed
      </SectionEyebrow>
    </div>
  )
}

/** The record: what they picked, and where the money went. Two rows, the
 *  favourite above the charity — their own pick is the more personal of the
 *  two (founder, 2026-10-22: "two rows on the footer i think"). */
export function PledgeReceiptRows({
  topicTitle,
  favourites,
  charities,
  amount,
}: {
  topicTitle: string
  favourites: { id: string; label: string }[]
  charities: Charity[]
  /** The total going to charity. Split equally — at most three (brand). */
  amount: number
}) {
  const share = charities.length > 0 ? amount / charities.length : amount
  return (
    <div className="w-full space-y-4 text-left">
      {favourites.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {/* Plural only when they picked more than one — the wizard allows
                several and the sentence has to survive it. */}
            {favourites.length > 1
              ? `Your favourite ${topicTitle.toLowerCase()}s`
              : `Your favourite ${topicTitle.toLowerCase()}`}
          </span>
          <span className="flex flex-wrap justify-end gap-1.5">
            {favourites.map((f) => (
              <Chip
                key={f.id}
                selected
                tabIndex={-1}
                className="pointer-events-none"
              >
                {f.label}
              </Chip>
            ))}
          </span>
        </div>
      )}
      {charities.map((charity) => (
        <CharityRow key={charity.id} charity={charity} amountRaised={share} />
      ))}
    </div>
  )
}

/** Both halves together, centred — the landing demo, which has no note to
 *  set between them. */
export function PledgeReceipt(
  props: React.ComponentProps<typeof PledgeReceiptRows>
) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <PledgeConfirmedHead />
      <PledgeReceiptRows {...props} />
    </div>
  )
}
