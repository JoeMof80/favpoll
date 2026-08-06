"use client"

import { useEffect, useState } from "react"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandedQR } from "@/components/branded-qr"
import { buildMechanicSteps, mechanicFooter } from "@/lib/mechanic-steps"

// Pre-event material for an organiser to print and place at the venue:
// one A4 sheet of two A5 cards (table/easel size) and one A4 sheet of
// eight wallet cards (credit-card size, 85.6 × 54 mm — they slip into a
// wallet or an order of service). Both are the SAME card at two scales
// (founder, 2026-08-02): the favpoll-card grammar — eyebrow + name with
// the brand top-right, topic ribbon row, the numbered mechanic steps
// beside the QR, and the shared-fund escape hatch. Steps come from
// lib/mechanic-steps, the single source shared with the guest page's
// lock card, so print and page always match.

export type PackData = {
  prefix: string
  name: string
  isCause: boolean
  /** First poll's topic title; null when no poll exists yet. */
  topicTitle: string | null
  hasReveal: boolean
  revealIsQuote?: boolean
  charityNames: string[]
  /**
   * What the QR encodes — the SHORT form (/p/<code>), not the shareable
   * /favpolls/<uuid>. Named for its job so it is obvious this is machine-
   * facing: see app/p/[code]/page.tsx for why the two differ.
   */
  qrUrl: string
}

function charityLabel(names: string[]): string {
  if (names.length === 0) return "charity"
  if (names.length === 1) return names[0]
  return names.slice(0, -1).join(", ") + " and " + names.at(-1)!
}

// One card, three scales — every value that differs lives here.
const SCALE = {
  // Landscape design, rotated 90° onto a portrait sheet (2026-08-02).
  a4: {
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
  wallet: {
    card: "h-[54mm] w-[85.6mm] rounded-xl",
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
    // 58 → 92 (2026-08-06). The guest URL is https://favpoll.com/favpolls/<uuid>
    // = 65 chars, which at error-correction H is a 49x49 QR; at 58px (15.35mm)
    // that put each module at 0.313mm, under the ~0.4mm floor printed codes
    // need, so domestic printers' ink spread merged adjacent modules and the
    // card scanned only reluctantly.
    //
    // 92px = 24.3mm, and the QR now encodes the SHORT /p/<code> URL (34
    // chars = 33x33, not 65 chars = 49x49), so each module is 0.737mm —
    // 2.35x the 0.313mm that failed. 92 is the CEILING: measured, the steps
    // column does not reflow down to a 51.9mm track and nothing spills the
    // fixed 54mm card, but past 92 the row itself starts to grow.
    //
    // The code grows LEFTWARD, since it is the last item in the flex row and
    // its right edge is pinned by the card padding. That is why enlarging it
    // reads as "moved towards the centre" rather than "got bigger".
    qr: 92,
    footer: "pb-[2mm] text-[5.5pt]",
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

function PackCard({
  data,
  steps,
  scale,
}: {
  data: PackData
  steps: string[] | null
  scale: keyof typeof SCALE
}) {
  const s = SCALE[scale]
  return (
    <div
      className={`flex flex-col overflow-hidden border border-border bg-white [print-color-adjust:exact] ${s.card}`}
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
        <div className={`flex flex-1 items-start ${s.bodyGap}`}>
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
        {data.topicTitle && (
          <p
            className={`mt-auto text-center text-muted-foreground/80 ${s.footer}`}
          >
            {mechanicFooter(data.topicTitle)}
          </p>
        )}
      </div>
    </div>
  )
}

// Sits OUTSIDE the sheet, like the top Save-as-PDF button. Module scope, not
// nested in PackDocument: a component declared during render is a NEW type on
// every render, so React unmounts and remounts the subtree each time instead
// of updating it (react-hooks/static-components). The print target it sets
// comes in as a prop rather than closing over the parent's setter.
function SheetPrintButton({
  target,
  onPrint,
}: {
  target: keyof typeof SCALE
  onPrint: (target: keyof typeof SCALE) => void
}) {
  return (
    <div className="mb-2 flex w-full justify-end print:hidden">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onPrint(target)}
      >
        <Printer data-icon="inline-start" aria-hidden="true" />
        Print this page
      </Button>
    </div>
  )
}

export function PackDocument({ data }: { data: PackData }) {
  const charities = charityLabel(data.charityNames)
  const firstName = data.isCause ? null : data.name.split(/[\s&]+/)[0] || null
  const steps = data.topicTitle
    ? buildMechanicSteps({
        topicTitle: data.topicTitle,
        charityLine: charities === "charity" ? null : charities,
        firstName,
        isCause: data.isCause,
        hasReveal: data.hasReveal,
        revealIsQuote: data.revealIsQuote,
      })
    : null

  // Per-page printing (founder, 2026-08-02): each sheet has its own
  // button; while one prints, the others hide.
  const [printTarget, setPrintTarget] = useState<keyof typeof SCALE | null>(
    null
  )
  useEffect(() => {
    if (!printTarget) return
    const reset = () => setPrintTarget(null)
    window.addEventListener("afterprint", reset)
    const id = requestAnimationFrame(() => window.print())
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener("afterprint", reset)
    }
  }, [printTarget])

  const hideWhenOtherPrints = (key: keyof typeof SCALE) =>
    printTarget && printTarget !== key ? "print:hidden" : ""

  // Each section is one A4 sheet: distinct pages on screen (border +
  // shadow + gap), seamless in print where break-after-page splits them.
  const sheet =
    "bg-background border border-border rounded-lg shadow-sm print:border-0 print:rounded-none print:shadow-none"

  return (
    // .paper pins the light token values across the whole pack, so the cards
    // print the same whatever theme the organiser is viewing in — see the
    // block in globals.css for the measurements that forced it.
    <div className="paper flex flex-col gap-8 print:block">
      {/* ── A4 card: landscape design ROTATED 90° on a portrait sheet
          (founder, 2026-08-02) — every sheet stays portrait, one print
          job covers the pack, and the poster comes out landscape when
          the paper is turned. The card keeps real mm dimensions in the
          pre-rotation box. ── */}
      <div className={hideWhenOtherPrints("a4")}>
        <SheetPrintButton target="a4" onPrint={setPrintTarget} />
        <section
          className={`${sheet} flex min-h-[277mm] break-after-page items-center justify-center p-6 print:min-h-0 print:break-inside-avoid print:p-2`}
        >
          {/* Print fragmentation uses PRE-transform boxes, so a rotated
              250mm-wide element split across pages in the print dialog
              (founder-caught twice, 2026-08-02; headless zero-margin
              PDFs masked it). The half-size/scale(2) sandwich keeps the
              layout box at 125 × 90 mm — far inside any printable area,
              one fragment — while painting at the full 250 × 180.
              -rotate-90: the poster reads by turning the page clockwise. */}
          <div className="flex h-[250mm] w-[180mm] max-w-full break-inside-avoid items-center justify-center">
            <div className="h-[90mm] w-[125mm] [transform:rotate(-90deg)_scale(2)]">
              <div className="h-[180mm] w-[250mm] origin-top-left scale-50">
                <PackCard data={data} steps={steps} scale="a4" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── A5 cards: two per sheet, for tables and easels ── */}
      <div className={hideWhenOtherPrints("a5")}>
        <SheetPrintButton target="a5" onPrint={setPrintTarget} />
        <section
          className={`${sheet} flex min-h-[277mm] break-after-page flex-col items-center px-6 py-6 print:min-h-0`}
        >
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-[6mm]">
            <PackCard data={data} steps={steps} scale="a5" />
            <PackCard data={data} steps={steps} scale="a5" />
          </div>
        </section>
      </div>

      {/* ── Wallet cards: credit-card size (85.6 × 54 mm) ── */}
      <div className={hideWhenOtherPrints("wallet")}>
        <SheetPrintButton target="wallet" onPrint={setPrintTarget} />
        <section className={`${sheet} min-h-[277mm] px-6 py-8 print:min-h-0`}>
          <div className="grid grid-cols-2 justify-items-center gap-x-[4mm] gap-y-[4mm]">
            {Array.from({ length: 8 }).map((_, i) => (
              <PackCard key={i} data={data} steps={steps} scale="wallet" />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
