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
  return buildMechanicSteps({
    topicTitle: data.topicTitle,
    charityLine: charities === "charity" ? null : charities,
  })
}

// One card, three scales — every value that differs lives here.
export const SCALE = {
  // Landscape design, rotated 90° onto a portrait sheet (2026-08-02).
  a4: {
    stack: false,
    charityFooter: false,
    placeCard: false,
    card: "h-full w-full rounded-3xl",
    headerPad: "px-[12mm] pt-[8mm] pb-[5mm]",
    eyebrow: "text-[13pt] tracking-[0.12em]",
    name: "text-[32pt]",
    brandSvg: { width: 30, height: 27 },
    brandText: "text-[18pt]",
    brandGap: "gap-[2mm]",
    topicRow: "px-[12mm] py-[4mm]",
    topic: "text-[20pt] tracking-[0.09em]",
    topicEyebrow: "text-[13pt] tracking-[0.12em]",
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
    placeCard: false,
    card: "h-[125mm] w-full max-w-[190mm] rounded-2xl",
    headerPad: "px-[8mm] pt-[5mm] pb-[3.5mm]",
    eyebrow: "text-[10.5pt] tracking-[0.12em]",
    name: "text-[24pt]",
    brandSvg: { width: 24, height: 22 },
    brandText: "text-[14pt]",
    brandGap: "gap-[1.5mm]",
    topicRow: "px-[8mm] py-[3mm]",
    topic: "text-[16pt] tracking-[0.09em]",
    topicEyebrow: "text-[10.5pt] tracking-[0.12em]",
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
    placeCard: false,
    card: "h-[95mm] w-[138.5mm] rounded-2xl",
    headerPad: "px-[6mm] pt-[4mm] pb-[2.5mm]",
    eyebrow: "text-[8pt] tracking-[0.12em]",
    name: "text-[18pt]",
    brandSvg: { width: 18, height: 16 },
    brandText: "text-[11pt]",
    brandGap: "gap-[1.2mm]",
    topicRow: "px-[6mm] py-[2mm]",
    topic: "text-[12pt] tracking-[0.09em]",
    topicEyebrow: "text-[8pt] tracking-[0.12em]",
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
  // L4794 tent card, 120 x 45mm — TIGHTENED (founder, 2026-09-10: "reduce
  // the text size to fit every line"). 45mm is the tightest face that
  // carries steps; every mm of padding matters here.
  averyTent: {
    stack: false,
    twoColumn: true,
    charityFooter: false,
    placeCard: true,
    card: "h-[45mm] w-[120mm] rounded-none",
    headerPad: "px-[4mm] pt-[1.5mm] pb-[1mm]",
    eyebrow: "text-[5pt] tracking-[0.14em]",
    name: "text-[9pt]",
    brandSvg: { width: 18, height: 16 },
    brandText: "text-[9pt]",
    brandGap: "gap-[1mm]",
    topicRow: "px-[4mm] py-[0.8mm]",
    topic: "text-[6.5pt] tracking-[0.09em]",
    topicEyebrow: "text-[5pt] tracking-[0.14em]",
    bodyPad: "px-[4mm] pt-[1mm] pb-[0.5mm]",
    bodyGap: "gap-[3mm]",
    steps: "gap-[1mm] text-[5.5pt] leading-snug",
    stepGap: "gap-[1mm]",
    numWidth: "w-[3mm]",
    // 140px = 37mm — fills the 45mm column height (minus padding).
    // 1.13mm a module — very comfortable for print.
    // 120px = 31.7mm — ~80% of column, room for brand below.
    qr: 120,
    footer: "pb-[1mm] text-[5pt]",
    footerPad: "px-[4mm]",
  },

  // L4796 tent card, 210 x 60mm — TIGHTENED (founder, 2026-09-10). More
  // generous than L4794 (60mm face), but still reduced from the first
  // cut to keep every line single-line.
  averyTentLarge: {
    stack: false,
    twoColumn: true,
    charityFooter: false,
    placeCard: true,
    card: "h-[60mm] w-[210mm] rounded-none",
    headerPad: "px-[7mm] pt-[2mm] pb-[1.5mm]",
    eyebrow: "text-[7pt] tracking-[0.14em]",
    name: "text-[14pt]",
    brandSvg: { width: 24, height: 22 },
    brandText: "text-[12pt]",
    brandGap: "gap-[1.5mm]",
    topicRow: "px-[7mm] py-[1mm]",
    topic: "text-[10pt] tracking-[0.09em]",
    topicEyebrow: "text-[7pt] tracking-[0.14em]",
    bodyPad: "px-[7mm] pt-[1.5mm] pb-[1mm]",
    bodyGap: "gap-[6mm]",
    steps: "gap-[1.5mm] text-[7.5pt] leading-snug",
    stepGap: "gap-[1.5mm]",
    numWidth: "w-[4.5mm]",
    // 188px = 50mm — fills the 60mm column height (minus padding).
    // 1.52mm a module — generous for print.
    // 160px = 42.3mm — ~75% of column, room for brand below.
    qr: 160,
    footer: "pb-[1.5mm] text-[6.5pt]",
    footerPad: "px-[7mm]",
  },

  // C32253 place card, 110 x 40mm — TIGHTENED (founder, 2026-09-10).
  // 40mm is the absolute tightest face; every value squeezed to fit
  // header + topic + 3 steps beside a scannable QR.
  // C32253 place card, 110 x 40mm — now two-column like the tent cards
  // (founder, 2026-09-10: "repeat design of tent card for place card").
  averyPlace: {
    stack: false,
    twoColumn: true,
    charityFooter: false,
    placeCard: true,
    card: "h-[40mm] w-[110mm] rounded-none",
    headerPad: "px-[3.5mm] pt-[1mm] pb-[0.5mm]",
    eyebrow: "text-[4.5pt] tracking-[0.14em]",
    name: "text-[8pt]",
    brandSvg: { width: 14, height: 13 },
    brandText: "text-[7pt]",
    brandGap: "gap-[0.8mm]",
    topicRow: "px-[3.5mm] py-[0.5mm]",
    topic: "text-[6pt] tracking-[0.09em]",
    topicEyebrow: "text-[4.5pt] tracking-[0.14em]",
    bodyPad: "px-[3.5mm] pt-[0.8mm] pb-[0.5mm]",
    bodyGap: "gap-[2mm]",
    steps: "gap-[0.8mm] text-[5pt] leading-snug",
    stepGap: "gap-[0.8mm]",
    numWidth: "w-[2.5mm]",
    // 100px = 26.5mm — ~70% of the 40mm column, room for brand.
    // 0.81mm a module — over the ~0.4mm floor.
    qr: 100,
    footer: "pb-[0.5mm] text-[4.5pt]",
    footerPad: "px-[3.5mm]",
  },

  // L7418 wallet card, 86 x 55mm — TWO-COLUMN like tent cards (founder,
  // 2026-09-10: "normalise the design across stationery. The tent cards
  // seem good"). Proportions from the averyTent (120×45mm), scaled for
  // the wallet's 86mm width and 55mm height.
  l7418: {
    stack: false,
    twoColumn: true,
    charityFooter: false,
    placeCard: false,
    card: "h-[55mm] w-[86mm] rounded-none",
    headerPad: "px-[4mm] pt-[2mm] pb-[1mm]",
    eyebrow: "text-[5pt] tracking-[0.14em]",
    name: "text-[9pt]",
    brandSvg: { width: 14, height: 13 },
    brandText: "text-[8pt]",
    brandGap: "gap-[1mm]",
    topicRow: "px-[4mm] py-[1mm]",
    topic: "text-[7pt] tracking-[0.09em]",
    topicEyebrow: "text-[5pt] tracking-[0.14em]",
    bodyPad: "px-[4mm] pt-[2mm] pb-[1mm]",
    bodyGap: "gap-[3mm]",
    steps: "gap-[1mm] text-[6pt] leading-snug",
    stepGap: "gap-[1mm]",
    numWidth: "w-[3mm]",
    // 140px = 37mm — fills the 55mm column (minus padding/brand).
    qr: 140,
    footer: "pb-[1mm] text-[5.5pt]",
    footerPad: "px-[4mm]",
  },

  // L7160 small labels, 63.5 x 38.1mm — TWO-COLUMN like tent cards
  // (founder, 2026-09-10: "normalise the design across stationery").
  // Proportions from the averyPlace (110×40mm), scaled for 63.5mm width.
  l7160: {
    stack: false,
    twoColumn: true,
    charityFooter: false,
    placeCard: false,
    card: "h-[38.1mm] w-[63.5mm] rounded-none",
    headerPad: "px-[3mm] pt-[1.5mm] pb-[0.5mm]",
    eyebrow: "text-[4.5pt] tracking-[0.12em]",
    name: "text-[7pt]",
    brandSvg: { width: 10, height: 9 },
    brandText: "text-[6pt]",
    brandGap: "gap-[0.7mm]",
    topicRow: "px-[3mm] py-[0.5mm]",
    topic: "text-[5.5pt] tracking-[0.08em]",
    topicEyebrow: "text-[4.5pt] tracking-[0.12em]",
    bodyPad: "px-[3mm] pt-[1mm] pb-[0.5mm]",
    bodyGap: "gap-[2mm]",
    steps: "gap-[0.8mm] text-[5pt] leading-snug",
    stepGap: "gap-[0.8mm]",
    numWidth: "w-[2.5mm]",
    // 88px = 23.3mm — fills the 38mm column (minus padding/brand).
    // 0.71mm a module — comfortable for print.
    qr: 88,
    footer: "pb-[0.5mm] text-[4.5pt]",
    footerPad: "px-[3mm]",
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
  face = "content",
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
  /**
   * Which face of a folded card to render.
   *
   * - `"content"` (default) — the full favpoll content: header, topic wash,
   *    QR + branding. This is the only face non-folded cards use.
   * - `"name"` — a blank surface for the guest's name (place/tent cards).
   *    Renders just the card chrome with no content.
   */
  face?: "content" | "name"
}) {
  const s = SCALE[scale]
  // Strip the radius with the border: a rounded corner on a card you cut from
  // a shared sheet leaves a white nick at every corner.
  const box = bleed ? "h-full w-full" : `border border-border ${s.card}`

  // ── Two-line topic: app-canonical grammar (PollHeading) ──────────────────
  // Both lines UPPERCASE with tracking, same size — "Favourite" quieter by
  // OPACITY (the PollHeading settlement, founder 2026-09-01). Don't use a
  // different size for the eyebrow — that was tried and reverted on the app
  // side too (#627).
  const topicBlock = data.topicTitle ? (
    <div className={`border-y border-border ${s.topicRow}`}>
      <p
        className={`font-medium tracking-[0.09em] text-primary/55 uppercase ${s.topic}`}
      >
        Favourite
      </p>
      <p
        className={`truncate font-medium tracking-[0.09em] text-primary uppercase ${s.topic}`}
      >
        {data.topicTitle}
      </p>
    </div>
  ) : null

  // ── Name face (folded cards): blank surface for the guest's name ────────
  // Panel 1 of a tent/place card — what faces the guest's seat. Just the
  // card chrome, no content.
  if (face === "name" && s.placeCard) {
    return (
      <div
        className={`overflow-hidden bg-white [print-color-adjust:exact] ${box}`}
      />
    )
  }

  // ── Two-column layout for wide tent cards ──────────────────────────────
  // Founder, 2026-09-10: "for longer stationery, we should use a two
  // column layout and put the QR code and branding in the second column."
  // Left column: header + topic + steps + footer. Right column: QR + brand
  // centred vertically. Makes better use of the 120–210mm width.
  if ("twoColumn" in s && s.twoColumn) {
    return (
      <div
        className={`flex overflow-hidden bg-white [print-color-adjust:exact] ${box}`}
      >
        {/* Left column: all text content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <div className={`flex flex-col ${s.headerPad}`}>
            <span
              className={`min-w-0 truncate font-medium text-muted-foreground uppercase ${s.eyebrow}`}
            >
              {data.prefix}
            </span>
            <span
              className={`truncate leading-snug font-medium text-foreground ${s.name}`}
            >
              {data.name}
            </span>
          </div>
          {/* Topic wash */}
          {topicBlock}
          {/* Steps */}
          <div className={`flex flex-1 flex-col ${s.bodyPad}`}>
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
            {(data.topicTitle || s.charityFooter) && (
              <p className={`mt-auto text-muted-foreground/80 ${s.footer}`}>
                {s.charityFooter
                  ? charityLabel(data.charityNames)
                  : data.topicTitle
                    ? mechanicFooter(data.topicTitle)
                    : null}
              </p>
            )}
          </div>
        </div>
        {/* Right column: QR + brand, centred vertically */}
        <div
          className={`flex shrink-0 flex-col items-center justify-center border-l border-border ${s.bodyPad}`}
        >
          <BrandedQR
            value={data.qrUrl}
            size={s.qr}
            aria-label={`QR code to pledge for ${data.name}`}
            className="shrink-0"
          />
          <div className="mt-[1.5mm]">
            <BrandMark size={s} />
          </div>
        </div>
      </div>
    )
  }

  // ── Standard / content-face layout ──────────────────────────────────────
  // Every content face gets the same layout — steps included. The founder
  // (2026-09-10): "no reason for the tent and place cards not to include
  // instructions." The two-panel fold gives the content face the full card
  // height, so there is room.
  return (
    <div
      className={`flex flex-col overflow-hidden bg-white [print-color-adjust:exact] ${box}`}
    >
      {/* Header — eyebrow + name. Brand mark moved to the body beside the
          QR (founder, 2026-09-09). Opening line truncated (founder,
          2026-09-10 — was wrapping on wallet cards). */}
      <div className={`flex flex-col ${s.headerPad}`}>
        <span
          className={`min-w-0 truncate font-medium text-muted-foreground uppercase ${s.eyebrow}`}
        >
          {data.prefix}
        </span>
        <span
          className={`truncate leading-snug font-medium text-foreground ${s.name}`}
        >
          {data.name}
        </span>
      </div>
      {/* Topic ribbon row — two lines, primary-tinted wash */}
      {topicBlock}
      {/* Steps beside the QR + brand mark. min-h-0 constrains the body
          within the card's fixed height — without it, long charity names
          in step 2 push the brand + footer below the overflow clip
          (founder, 2026-09-10: wallet cards missing branding + footer). */}
      {/* Body: steps left, QR+brand right — brand UNDER QR, same as
          tent cards. */}
      <div
        className={`flex flex-1 border-t border-border ${s.bodyPad} ${"stack" in s && s.stack ? "flex-col items-center" : "items-start"} ${s.bodyGap}`}
      >
        {steps && (
          <div
            className={`flex min-w-0 flex-1 flex-col text-left text-muted-foreground ${s.steps}`}
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
        {/* Right: QR + brand under it */}
        <div className="flex shrink-0 flex-col items-center">
          <BrandedQR
            value={data.qrUrl}
            size={s.qr}
            aria-label={`QR code to pledge for ${data.name}`}
            className="shrink-0"
          />
          <div className="mt-[1.5mm]">
            <BrandMark size={s} />
          </div>
        </div>
      </div>
      {/* Footer at the BOTTOM of the card, full width (founder,
          2026-09-10: "move the footer to the bottom"). */}
      {data.topicTitle && (
        <p
          className={`text-left text-muted-foreground/80 ${s.footer} ${s.footerPad}`}
        >
          {mechanicFooter(data.topicTitle)}
        </p>
      )}
    </div>
  )
}
