import { protagonistShortName } from "@/lib/display"
import { BrandedQR } from "@/components/branded-qr"
import { buildMechanicSteps, mechanicFooter } from "@/lib/mechanic-steps"

// The card itself, at its three scales — split out of pack-document
// (2026-08-06) so surfaces that only want to SHOW a card do not import the
// print document, which carries "use client", the print-target state and a
// window.print() effect. The landing page's process overview shows the
// wallet card as a still; the pack prints all three.
//
// Same reason the DemoFrame and LockCardContent came out a day earlier: a
// second copy of this markup would be a second definition of the same
// object, and the two would drift.

export type PackData = {
  prefix: string
  name: string
  isCause: boolean
  /** First poll's topic title; null when no poll exists yet. */
  topicTitle: string | null
  hasReveal: boolean
  revealIsQuote?: boolean
  revealIsMessage?: boolean
  charityNames: string[]
  /**
   * What the QR encodes — the SHORT form (/p/<code>), not the shareable
   * /favpolls/<uuid>. Named for its job so it is obvious this is machine-
   * facing: see app/p/[code]/page.tsx for why the two differ.
   */
  qrUrl: string
}

export function charityLabel(names: string[]): string {
  if (names.length === 0) return "charity"
  if (names.length === 1) return names[0]
  return names.slice(0, -1).join(", ") + " and " + names.at(-1)!
}

/**
 * The numbered steps a card carries, derived from its data. Exported so the
 * pack and any still of the card build them the SAME way — the steps are
 * already shared with the guest page's lock card via lib/mechanic-steps, and
 * this keeps the pack-shaped derivation in one place too.
 */
export function buildPackSteps(data: PackData): string[] | null {
  if (!data.topicTitle) return null
  const charities = charityLabel(data.charityNames)
  const firstName = data.isCause
    ? null
    : protagonistShortName(data.name) || null
  return buildMechanicSteps({
    topicTitle: data.topicTitle,
    charityLine: charities === "charity" ? null : charities,
    firstName,
    isCause: data.isCause,
    hasReveal: data.hasReveal,
    revealIsQuote: data.revealIsQuote,
    revealIsMessage: data.revealIsMessage,
  })
}

// One card, three scales — every value that differs lives here.
export const SCALE = {
  // Landscape design, rotated 90° onto a portrait sheet (2026-08-02).
  a4: {
    stack: false,
    charityFooter: false,
    card: "h-full w-full rounded-3xl",
    headerPad: "px-[12mm] pt-[8mm] pb-[5mm]",
    eyebrow: "text-[13pt] tracking-[0.12em]",
    name: "text-[32pt]",
    brandSvg: { width: 30, height: 27 },
    brandText: "text-[18pt]",
    brandGap: "gap-[2mm]",
    topicRow: "px-[12mm] py-[4mm]",
    topic: "text-[20pt] tracking-[0.09em]",
    bodyPad: "px-[12mm] pt-[8mm] pb-[6mm]",
    bodyGap: "gap-[12mm]",
    steps: "gap-[5mm] text-[15pt] leading-relaxed",
    stepGap: "gap-[4mm]",
    numWidth: "w-[10mm]",
    qr: 280,
    footer: "pb-[5mm] text-[12pt]",
    footerPad: "px-[12mm]",
  },
  a5: {
    stack: false,
    charityFooter: false,
    card: "h-[125mm] w-full max-w-[190mm] rounded-2xl",
    headerPad: "px-[8mm] pt-[5mm] pb-[3.5mm]",
    eyebrow: "text-[10.5pt] tracking-[0.12em]",
    name: "text-[24pt]",
    brandSvg: { width: 24, height: 22 },
    brandText: "text-[14pt]",
    brandGap: "gap-[1.5mm]",
    topicRow: "px-[8mm] py-[3mm]",
    topic: "text-[16pt] tracking-[0.09em]",
    bodyPad: "px-[8mm] pt-[5mm] pb-[4mm]",
    bodyGap: "gap-[6mm]",
    steps: "gap-[3.5mm] text-[13pt] leading-relaxed",
    stepGap: "gap-[3mm]",
    numWidth: "w-[8mm]",
    qr: 170,
    footer: "pb-[4mm] text-[10.5pt]",
    footerPad: "px-[8mm]",
  },
  // A6 postcard, LANDSCAPE (founder, 2026-08-10). It was portrait, because
  // four portrait A6 tile a portrait A4 — but the sheet can be landscape now
  // that the pack sets @page per sheet, and a landscape postcard is both the
  // commoner shape and the one this card design was drawn for. `stack` goes
  // with it: at 138mm wide the steps sit beside the code again.
  //
  // 138.5 x 95mm is a quarter of the landscape printable area, so a few mm
  // under a true A6. Royal Mail's letter limit is 240 x 165mm, so it still
  // takes a stamp.
  //
  // Values are a5's at ~0.77, the ratio of the two card widths.
  a6: {
    stack: false,
    charityFooter: false,
    card: "h-[95mm] w-[138.5mm] rounded-2xl",
    headerPad: "px-[6mm] pt-[4mm] pb-[2.5mm]",
    eyebrow: "text-[8pt] tracking-[0.12em]",
    name: "text-[18pt]",
    brandSvg: { width: 18, height: 16 },
    brandText: "text-[11pt]",
    brandGap: "gap-[1.2mm]",
    topicRow: "px-[6mm] py-[2mm]",
    topic: "text-[12pt] tracking-[0.09em]",
    bodyPad: "px-[6mm] pt-[3.5mm] pb-[2.5mm]",
    bodyGap: "gap-[4.5mm]",
    steps: "gap-[2.5mm] text-[10pt] leading-relaxed",
    stepGap: "gap-[2.5mm]",
    numWidth: "w-[6mm]",
    // 128px = 33.9mm — 1.03mm a module.
    qr: 128,
    footer: "pb-[2.5mm] text-[8pt]",
    footerPad: "px-[6mm]",
  },

  // ── AVERY-MATCHED FACES ──────────────────────────────────────────────────
  // Sizes are Avery UK's own, read off their Word templates (2026-08-09/10).
  // These print on LANDSCAPE A4 and so live on their own route — see
  // app/favpolls/[id]/pack/avery. Nothing here draws a cut or fold line: the
  // stock is already die-cut and scored, and a printed rule would land on the
  // card rather than between them.

  // L4794 tent card, 120 x 45mm. Two panels make a card, 4 cards to a sheet.
  averyTent: {
    stack: false,
    charityFooter: false,
    card: "h-[45mm] w-[120mm] rounded-none",
    headerPad: "px-[5mm] pt-[2mm] pb-[1.5mm]",
    eyebrow: "text-[6pt] tracking-[0.14em]",
    name: "text-[11pt]",
    brandSvg: { width: 12, height: 11 },
    brandText: "text-[8pt]",
    brandGap: "gap-[1mm]",
    topicRow: "px-[5mm] py-[1mm]",
    topic: "text-[8.5pt] tracking-[0.09em]",
    bodyPad: "px-[5mm] pt-[1.5mm] pb-[1mm]",
    bodyGap: "gap-[4mm]",
    steps: "gap-[1.5mm] text-[7pt] leading-snug",
    stepGap: "gap-[1.5mm]",
    numWidth: "w-[4mm]",
    // 60px = 15.9mm — 0.48mm a module, over the ~0.4mm printed floor.
    qr: 60,
    footer: "pb-[1.5mm] text-[6pt]",
    footerPad: "px-[5mm]",
  },

  // L4796 tent card, 210 x 60mm. Two panels, 1 card to a sheet — the big one,
  // for a welcome table.
  averyTentLarge: {
    stack: false,
    charityFooter: false,
    card: "h-[60mm] w-[210mm] rounded-none",
    headerPad: "px-[8mm] pt-[2.5mm] pb-[2mm]",
    eyebrow: "text-[8pt] tracking-[0.14em]",
    name: "text-[17pt]",
    brandSvg: { width: 18, height: 16 },
    brandText: "text-[11pt]",
    brandGap: "gap-[1.5mm]",
    topicRow: "px-[8mm] py-[1.5mm]",
    topic: "text-[12pt] tracking-[0.09em]",
    bodyPad: "px-[8mm] pt-[2mm] pb-[1.5mm]",
    bodyGap: "gap-[8mm]",
    steps: "gap-[2mm] text-[9pt] leading-snug",
    stepGap: "gap-[2mm]",
    numWidth: "w-[5mm]",
    // 84px = 22.2mm — 0.67mm a module.
    qr: 84,
    footer: "pb-[2mm] text-[7.5pt]",
    footerPad: "px-[8mm]",
  },

  // C32253 place card, 110 x 40mm. Two panels, 4 cards to a sheet. Same
  // reduced content as the plain place card: no steps in a 40mm face.
  averyPlace: {
    stack: false,
    charityFooter: false,
    card: "h-[40mm] w-[110mm] rounded-none",
    headerPad: "px-[5mm] pt-[1.5mm] pb-[1mm]",
    eyebrow: "text-[6pt] tracking-[0.14em]",
    name: "text-[11pt]",
    brandSvg: { width: 13, height: 12 },
    brandText: "text-[8.5pt]",
    brandGap: "gap-[1mm]",
    topicRow: "px-[5mm] py-[1mm]",
    topic: "text-[8.5pt] tracking-[0.09em]",
    bodyPad: "px-[5mm] pt-[1mm] pb-[0.5mm]",
    bodyGap: "gap-[3mm]",
    steps: "gap-[1.5mm] text-[7pt] leading-snug",
    stepGap: "gap-[1.5mm]",
    numWidth: "w-[4mm]",
    // 52px = 13.8mm — 0.42mm a module. That is the tightest code favpoll
    // prints: over the ~0.4mm floor, but only just. The face is 40mm and the
    // shared-fund line is worth keeping, so this is where the millimetres
    // went. Test one before a batch.
    qr: 52,
    footer: "pb-[1.5mm] text-[6pt]",
    footerPad: "px-[5mm]",
  },

  // L7418 label, 86 x 55mm, 8 to a sheet. Avery's self-adhesive business
  // card — the wallet card that sticks to things: an order of service, a
  // favour bag, a menu, a bottle. Portrait sheet, so no orientation problem.
  // Wallet's density, since the face is within a millimetre of it.
  l7418: {
    stack: false,
    charityFooter: false,
    card: "h-[55mm] w-[86mm] rounded-none",
    headerPad: "px-[3mm] pt-[2.5mm] pb-[2mm]",
    eyebrow: "text-[6pt] tracking-[0.14em]",
    name: "text-[10pt]",
    brandSvg: { width: 12, height: 11 },
    brandText: "text-[8pt]",
    brandGap: "gap-[1mm]",
    topicRow: "px-[3mm] py-[1.5mm]",
    topic: "text-[8.5pt] tracking-[0.09em]",
    bodyPad: "px-[3mm] pt-[3mm] pb-[1mm]",
    bodyGap: "gap-[3mm]",
    steps: "gap-[1.5mm] text-[6.5pt] leading-snug",
    stepGap: "gap-[1.5mm]",
    numWidth: "w-[3.5mm]",
    // 92px = 24.3mm — 0.74mm a module, the same as the wallet card.
    qr: 92,
    footer: "pb-[2mm] text-[5.5pt]",
    footerPad: "px-[3mm]",
  },

  // L7160 label, 63.5 x 38.1mm, 21 to a sheet. The small one — for favour
  // bags and place settings, where you want a lot of them.
  //
  // NO STEPS at this size: 38mm holds the name, the topic, a scannable code
  // and one line. That line is the CHARITY — see charityFooter below.
  l7160: {
    stack: false,
    charityFooter: true,
    // THE CHARITY, not the shared-fund line. This face is 38mm and cannot
    // hold the steps, and the steps are where every other format names where
    // the money goes. A public artefact that shows a code and a topic but
    // never says which charity is not one favpoll should print.
    card: "h-[38.1mm] w-[63.5mm] rounded-none",
    headerPad: "px-[2.5mm] pt-[2mm] pb-[1mm]",
    eyebrow: "text-[5pt] tracking-[0.12em]",
    name: "text-[8pt]",
    brandSvg: { width: 9, height: 8 },
    brandText: "text-[6pt]",
    brandGap: "gap-[0.7mm]",
    topicRow: "px-[2.5mm] py-[0.8mm]",
    topic: "text-[6.5pt] tracking-[0.08em]",
    bodyPad: "px-[2.5mm] pt-[1.5mm] pb-[1mm]",
    bodyGap: "gap-[2mm]",
    steps: "gap-[1mm] text-[5pt] leading-snug",
    stepGap: "gap-[1mm]",
    numWidth: "w-[2.5mm]",
    // 56px = 14.8mm — 0.45mm a module. Over the ~0.4mm floor; the smallest
    // code favpoll prints after C32253.
    qr: 56,
    footer: "pb-[1mm] text-[4.5pt]",
    footerPad: "px-[2.5mm]",
  },
} as const

function BrandMark({ size }: { size: (typeof SCALE)[keyof typeof SCALE] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center ${size.brandGap} leading-none text-primary`}
    >
      <svg
        width={size.brandSvg.width}
        height={size.brandSvg.height}
        viewBox="0 0 24 22"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M13 21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21C11 20.4477 11.4477 20 12 20C12.5523 20 13 20.4477 13 21Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
        <path
          d="M22.8939 7.37611C23.5594 7.37611 24 6.82571 24 6.14676C23.4264 2.65821 20.4515 0 16.8692 0C15.0175 0 13.3473 0.692853 12.0682 1.86083L11.5693 1.44305C10.3604 0.526775 8.85215 0 7.22965 0C3.23683 0 0 3.3024 0 7.37611C0 9.39831 0.798074 11.23 2.08982 12.5624L6.08526 16.6399C6.55582 17.12 7.31874 17.12 7.7893 16.6399C8.25986 16.1598 8.25986 15.3815 7.7893 14.9014L3.79368 10.8241C2.9355 9.93401 2.40988 8.72017 2.40988 7.37611C2.40988 4.6603 4.56777 2.4587 7.22965 2.4587C8.4932 2.4587 9.62539 2.92576 10.4609 3.69046L12.0682 5.16232L13.6756 3.69286C14.5231 2.91899 15.6243 2.4587 16.8692 2.4587C19.1138 2.4587 21.0045 4.0261 21.5387 6.14676C21.5387 6.82571 22.2284 7.37611 22.8939 7.37611Z"
          fill="currentColor"
        />
        <path
          d="M11 11C11 11.5523 11.5373 12 12.2 12H21.8C22.4627 12 23 11.5523 23 11C23 10.4477 22.4627 10 21.8 10H12.2C11.5373 10 11 10.4477 11 11Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
        <path
          d="M11 16C11 16.5523 11.5223 17 12.1667 17H16.8333C17.4777 17 18 16.5523 18 16C18 15.4477 17.4777 15 16.8333 15H12.1667C11.5223 15 11 15.4477 11 16Z"
          fill="currentColor"
          fillOpacity="0.6"
        />
      </svg>
      <span className={`${size.brandText} tracking-tight`}>
        fav<span className="opacity-60">poll</span>
      </span>
    </span>
  )
}

export function PackCard({
  data,
  steps,
  scale,
  bleed = false,
}: {
  data: PackData
  steps: string[] | null
  scale: keyof typeof SCALE
  /**
   * Fill the cell rather than draw a card (founder, 2026-08-10). Sheets that
   * are cut into halves and quarters do not want a border round each card:
   * the cut IS the edge, and a printed border only shows how badly you cut.
   * The dashed guides live on the sheet, so the card drops its own chrome and
   * its fixed size and fills whatever it is given.
   *
   * The wallet sheet keeps borders, because eight cards on a sheet are cut
   * individually and there is nothing else to aim at.
   */
  bleed?: boolean
}) {
  const s = SCALE[scale]
  // Strip the radius with the border: a rounded corner on a card you cut from
  // a shared sheet leaves a white nick at every corner.
  const box = bleed ? "h-full w-full" : `border border-border ${s.card}`
  return (
    <div
      className={`flex flex-col overflow-hidden bg-white [print-color-adjust:exact] ${box}`}
    >
      {/* Header — eyebrow + name, brand bottom-aligned with the eyebrow */}
      <div className={`flex flex-col ${s.headerPad}`}>
        <div className="flex items-end justify-between gap-2">
          <span
            className={`font-medium text-muted-foreground uppercase ${s.eyebrow}`}
          >
            {data.prefix}
          </span>
          <BrandMark size={s} />
        </div>
        <span
          className={`truncate leading-snug font-medium text-foreground ${s.name}`}
        >
          {data.name}
        </span>
      </div>
      {/* Topic ribbon row */}
      {data.topicTitle && (
        <div className={`border-t border-border ${s.topicRow}`}>
          <p
            className={`truncate font-medium text-primary uppercase ${s.topic}`}
          >
            Favourite {data.topicTitle.toLowerCase()}
          </p>
        </div>
      )}
      {/* Steps beside the QR */}
      <div
        className={`flex flex-1 flex-col border-t border-border ${s.bodyPad}`}
      >
        {/* Portrait cards stack: the steps and a 34mm code will not sit side
            by side in a 95mm-wide card. */}
        <div
          className={`flex flex-1 ${"stack" in s && s.stack ? "flex-col items-center" : "items-start"} ${s.bodyGap}`}
        >
          {steps && (
            <div
              className={`flex flex-1 flex-col text-left text-muted-foreground ${s.steps}`}
            >
              {steps.map((step, j) => (
                <p key={j} className={`flex ${s.stepGap}`}>
                  <span
                    className={`shrink-0 text-right font-semibold text-primary ${s.numWidth}`}
                  >
                    {j + 1}.
                  </span>
                  <span className="flex-1">{step}</span>
                </p>
              ))}
            </div>
          )}
          <BrandedQR
            value={data.qrUrl}
            size={s.qr}
            aria-label={`QR code to pledge for ${data.name}`}
            className="shrink-0"
          />
        </div>
        {(data.topicTitle || s.charityFooter) && (
          <p
            className={`mt-auto text-center text-muted-foreground/80 ${s.footer}`}
          >
            {s.charityFooter
              ? charityLabel(data.charityNames)
              : data.topicTitle
                ? mechanicFooter(data.topicTitle)
                : null}
          </p>
        )}
      </div>
    </div>
  )
}
