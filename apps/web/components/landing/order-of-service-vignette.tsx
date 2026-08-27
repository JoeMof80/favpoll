import { PackCard } from "@/components/print-pack/pack-card"
import { Vignette } from "@/components/landing/vignette"
import { MEMORIAL_PACK_DATA } from "@/components/landing/demo-fixture"

// The corner of an order of service, with favpoll's small label on it.
//
// WHY THIS EXISTS (founder, 2026-08-27). The idea beside it is "QR-coded
// order of service", and what stood here was PackVignette — a fan of A4/A5
// sheets and two Avery label sheets. The words described the FAMILY'S paper
// and the picture showed FAVPOLL'S stationery, which was the one outright
// mismatch in the Ideas section.
//
// THE INFORMATION IS ON THE DESIGNED STATIONERY (founder, 2026-08-27), not
// set by hand on the page. The first pass typed its own footer — a name, an
// instruction, a URL — which was a lookalike of PackCard with none of its
// decisions: no charity footer, no brand mark, a QR sized by eye. This is the
// REAL PackCard at `l7160`, favpoll's smallest face (63.5 x 38.1mm, 21 to an
// Avery sheet, self-adhesive), so what a family reads here is what a family
// prints. Its QR is that face's own 56px — 0.45mm a module, over the ~0.4mm
// floor, which is a decision this file has no business re-taking.
//
// The small label is also the honest format for the claim. An order of
// service is set by the funeral director weeks ahead; favpoll has no template
// for one and never will. What it can do is give the family something to put
// ON that page, at a size a printed programme can spare — which is exactly
// what the copy promises, and why it can replace the collection box.
//
// FADED ON TWO EDGES (founder, 2026-08-27), because this is a corner and not
// a leaflet. A crop with four crisp edges reads as the whole artefact; the
// page has to run off the frame for the label to read as sitting on
// something larger. Soft rather than sliced — a hard cut across paper reads
// as a rendering fault, the finding that killed the cropped dialog corners in
// the How It Works hints.
//
// The data is MEMORIAL_PACK_DATA — Belinda, favourite colour, Marie Curie —
// so this cannot drift from the reveal, the display and the keepsake beside
// it. One favpoll, one set of facts, every artefact built from the same
// scene.

// Authored at the size it renders at on a large screen and scaled DOWN for
// small ones — the reverse of the pack and keepsake fans, which author at
// full A4 and scale to a fifth. Those show WHICH sheets are in the pack, a
// job a sliver does; this one has to be read, so lg renders at scale 1.
const SHEET_W = 500
const CROP_H = 370

export function OrderOfServiceVignette() {
  return (
    <Vignette className="flex justify-center">
      <div
        data-artefact-box
        className="h-[218px] w-[294px] sm:h-[326px] sm:w-[440px] lg:h-[370px] lg:w-[500px]"
      >
        {/* .paper pins the light token values and .paper-screen keeps the
            app's border weight — the pairing the pack and keepsake fans use,
            for the reason that class exists: this is ink on paper, so it must
            not follow the viewer's theme (#535). */}
        <div
          className="paper paper-screen relative origin-top-left scale-[0.588] overflow-hidden bg-background shadow-xl sm:scale-[0.88] lg:scale-100"
          style={{ width: SHEET_W, height: CROP_H }}
        >
          {/* The service items above the thanks exist to be EATEN by the top
              fade: a crop needs something disappearing into it, or the blank
              half of the sheet reads as a short page rather than a long one. */}
          <div className="flex h-full flex-col items-center justify-end px-12 pb-11 text-center">
            <p className="text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              The Commendation
            </p>
            <p className="mt-7 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Music on Leaving
            </p>
            <p className="mt-4 font-serif text-[15px] leading-relaxed text-foreground">
              The family thank you for your
              <br />
              kindness and support today.
            </p>
            {/* The label, at its real 63.5 x 38.1mm. Not `bleed`: that is for
                cards cut from a shared sheet, where the cut is the edge. A
                single label has its own. */}
            <div className="mt-7">
              <PackCard data={MEMORIAL_PACK_DATA} steps={null} scale="l7160" />
            </div>
          </div>

          {/* The open edge, fading to the paper's own background so the page
              dissolves upward rather than stopping.
              ONE FADE, NOT TWO. A left gradient was tried alongside it, to
              make this read as a corner rather than a bottom edge, and it is
              INVISIBLE: it fades white paper into white paper, so it dissolved
              nothing and cost the layout its centring — with the content
              pushed clear of it, the sheet read as a page with a freak left
              margin. Whatever crops the left has to be an edge, not a
              gradient. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        </div>
      </div>
    </Vignette>
  )
}
