"use client"

// THE PHONE OPENS ON THE NOTE (founder, 2026-10-22: "the room ends on it and
// the phone opens on it").
//
// The room's close is a public ceremony with an audience, so its podium builds
// to a winner and the note is the LAST WORD. A guest's pledge is the opposite
// moment: private, one person, and the note is what comes BACK for what they
// just gave — the two-way act. So it answers the pledge before the worldly
// business of where their favourite ranks.
//
// This is the terminal view of the pledge sheet, not another step. It takes no
// part in the step machine: there is no back, no footer, no header. It shows,
// it is read, the sheet leaves — and the page beneath is revealed with the
// note already in place and its bars climbing.
//
// TEXTURE CARRIES IT, NOT A RECEIPT (founder, 2026-10-23, prototyped on a
// real pledge from his phone: "i wonder if we need to include anything here
// except the pledge confirmation, topic header and the note. instead maybe
// add texture or beauty"). The receipt rows were added on 2026-10-22 because
// the note alone had nothing to stand on — true, but measured off that
// screenshot the problem was ~150pt of emptiness above the note and ~200pt
// below, not a shortage of facts. The note was unheld, not uncrowded. So the
// monogram holds it instead and the facts go: they are on the page behind,
// in the charity footer, and in Stripe's own receipt by email.
//
// Three variants were built and judged on the founder's phone
// (app/prototype/ceremony, since deleted): a full-bleed wash, the note in a
// tinted panel, and a no-ornament control. The wash won — a panel made the
// note read as a widget on a screen that has no others.
//
// WHO WROTE THE NOTE IS NOT ANSWERED HERE, and deliberately (founder,
// 2026-10-23). A name on the sheet was prototyped and rejected: the guest
// has just read the hero, the About and the protagonist's name on the way
// to paying, so the referent for "Mine is Tennis" is ninety seconds old, not
// absent. The isolation is the prototype's, not the product's. And the
// ambiguity, where it exists, belongs to the NOTE — it would read the same
// on the page, in the room and on the keepsake — so the lever is the
// wizard's placeholder copy, which already teaches both voices, not a field
// and not furniture here. "A personal note" stays authorship-neutral
// (founder, 2026-09-17).
//
// Rules it keeps, taken from the podium (room-shell/podium.tsx), which settled
// them on 2026-10-01:
// - THE READER CAN MOVE ON. Any tap or key ends it; an untouched screen ends
//   on its own. Nobody is held behind their own pledge.
// - REDUCED MOTION never gets here — the caller sends those straight to the
//   page, where the note is simply present.
// - NOTHING ELSE ON SCREEN. The note had to compete with climbing bars when
//   both landed in one commit; here there is nothing to compete with.
import { useEffect, useRef } from "react"
import { TypedNote } from "@/components/poll-section/typed-note"
import { PledgeConfirmedHead } from "@/components/pledge-receipt"
import { PollHeading } from "@/components/poll-heading"
import type { MentionTarget } from "@/lib/mentions"

/** The note types over ~1.9s (TypedNote's own target). */
const TYPING_MS = 1900
/** After the note lands, how long it stands before the sheet leaves. The
 *  podium's own hold is 11s with a presenter in a room; a phone in one pair
 *  of hands needs less, and a tap ends it sooner either way. */
export const NOTE_HOLD_MS = 4500
/** What the caller must outlast before it force-unlocks the page behind
 *  (use-favpoll-content). */
export const CEREMONY_MS = TYPING_MS + NOTE_HOLD_MS

export function StepConfirmed({
  note,
  protagonistFirstName = "",
  mentions,
  topicTitle,
  onDone,
}: {
  note: string
  protagonistFirstName?: string
  topicTitle: string
  mentions?: MentionTarget[]
  onDone: () => void
}) {
  // onDone identity must not restart the clock: the caller re-renders while
  // the note types.
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    const leave = window.setTimeout(() => done.current(), CEREMONY_MS)
    return () => window.clearTimeout(leave)
  }, [])

  useEffect(() => {
    const end = () => done.current()
    window.addEventListener("keydown", end)
    return () => window.removeEventListener("keydown", end)
  }, [])

  return (
    <div
      // Tap anywhere, not a button: the whole view is the affordance, and a
      // dismiss button beside a dead person's words reads as a dialog to get
      // rid of.
      onClick={() => done.current()}
      role="presentation"
      // THE NOTE AT THE OPTICAL CENTRE (founder, 2026-10-23: "position the
      // note in the centre"). The confirmation sits at the top in flow and
      // an INVISIBLE COPY of it closes the sheet, so the middle band is
      // centred against the real height rather than against whatever is
      // left under the head — which put the note a head's-height low. The
      // mirror costs nothing and cannot drift, which a hardcoded spacer
      // would the first time the head changes.
      // ON THE BAND (founder, 2026-10-24). This was the dialog's white, the
      // same surface as the picker and the amount step — so the most
      // significant screen in the flow arrived looking like one more form
      // step, and a white sheet rising over a white page gave no sense of
      // arrival at all. It wears the hero band's surface now, and the
      // register tints the moment: a memorial note on purple, a celebration
      // on magenta, a fundraiser on green. `on-band` (globals.css) remaps the
      // light-ground tokens the shared note, topic and eyebrow components
      // hardcode.
      // The surface carries the band and the on-band remap now (the overlay's
      // surfaceClassName), so this is layout only.
      // min-h-FULL, not 70vh (founder on iOS Safari, 2026-10-24: "also not
      // central"). The overlay's body is the whole sheet; at min-h-[70vh] this
      // occupied the top 70% of it and centred the note inside THAT, which put
      // it around 40% down the screen. `on-band` lives here rather than on the
      // surface so the scope can remap --primary — mention ink is
      // `text-primary` and was magenta on magenta.
      className="on-band relative flex min-h-full flex-col sm:min-h-[32rem]"
    >
      <div className="shrink-0 px-6 pt-8">
        <PledgeConfirmedHead onBand />
      </div>

      {/* min-h-0 + overflow: a long note on a short phone scrolls HERE. */}
      <div className="relative flex min-h-0 flex-1 flex-col justify-center gap-5 overflow-y-auto px-6 py-8">
        {/* The topic in the grammar it wears everywhere else (founder,
            2026-10-23: "the topic header should match its style everywhere
            else") — PollHeading's quiet default, "Favourite" above the
            topic, separated by opacity. It does not type: typing means a
            human wrote this, and a heading is chrome. */}
        <div className="relative">
          <PollHeading topicTitle={topicTitle} />
        </div>
        <div className="relative text-[21px]">
          <TypedNote
            text={note}
            active
            protagonistFirstName={protagonistFirstName}
            mentions={mentions}
          />
        </div>
      </div>

      {/* The head again, invisible: it balances the real one so the middle
          band centres against the sheet's full height. */}
      <div className="invisible shrink-0 px-6 pb-8" aria-hidden="true">
        <PledgeConfirmedHead onBand />
      </div>
    </div>
  )
}
