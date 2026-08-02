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
  charityNames: string[]
  guestUrl: string
}

function charityLabel(names: string[]): string {
  if (names.length === 0) return "charity"
  if (names.length === 1) return names[0]
  return names.slice(0, -1).join(", ") + " and " + names.at(-1)!
}

// One card, three scales — every value that differs lives here.
const SCALE = {
  a4: {
    card: "min-h-[255mm] w-full max-w-[190mm] rounded-3xl",
    headerPad: "px-[12mm] pt-[10mm] pb-[6mm]",
    eyebrow: "text-[13pt] tracking-[0.12em]",
    name: "text-[32pt]",
    brandSvg: { width: 30, height: 27 },
    brandText: "text-[18pt]",
    brandGap: "gap-[2mm]",
    topicRow: "px-[12mm] py-[5mm]",
    topic: "text-[20pt] tracking-[0.09em]",
    bodyPad: "px-[12mm] pt-[10mm] pb-[8mm]",
    bodyGap: "gap-[10mm]",
    steps: "gap-[6mm] text-[15pt] leading-relaxed",
    stepGap: "gap-[4mm]",
    numWidth: "w-[10mm]",
    qr: 300,
    footer: "pb-[6mm] text-[12pt]",
    footerPad: "px-[12mm]",
  },
  a5: {
    card: "h-[125mm] w-full max-w-[190mm] rounded-2xl",
    headerPad: "px-[8mm] pt-[5mm] pb-[3.5mm]",
    eyebrow: "text-[9pt] tracking-[0.12em]",
    name: "text-[20pt]",
    brandSvg: { width: 22, height: 20 },
    brandText: "text-[13pt]",
    brandGap: "gap-[1.5mm]",
    topicRow: "px-[8mm] py-[3mm]",
    topic: "text-[14pt] tracking-[0.09em]",
    bodyPad: "px-[8mm] pt-[5mm] pb-[4mm]",
    bodyGap: "gap-[6mm]",
    steps: "gap-[3mm] text-[11.5pt] leading-relaxed",
    stepGap: "gap-[3mm]",
    numWidth: "w-[7mm]",
    qr: 170,
    footer: "pb-[4mm] text-[9pt]",
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
    qr: 58,
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
            value={data.guestUrl}
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
      })
    : null

  // Each section is one A4 sheet: distinct pages on screen (border +
  // shadow + gap), seamless in print where break-after-page splits them.
  const sheet =
    "bg-background border border-border rounded-lg shadow-sm print:border-0 print:rounded-none print:shadow-none"

  return (
    <div className="flex flex-col gap-8 print:block">
      {/* ── A4 card: the poster-scale version of the same design ── */}
      <section
        className={`${sheet} flex min-h-[277mm] break-after-page flex-col items-center justify-center px-6 py-6`}
      >
        <PackCard data={data} steps={steps} scale="a4" />
      </section>

      {/* ── A5 cards: two per sheet, for tables and easels ── */}
      <section
        className={`${sheet} flex min-h-[277mm] break-after-page flex-col items-center px-6 py-6`}
      >
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-[6mm]">
          <PackCard data={data} steps={steps} scale="a5" />
          <PackCard data={data} steps={steps} scale="a5" />
        </div>
      </section>

      {/* ── Wallet cards: credit-card size (85.6 × 54 mm) ── */}
      <section className={`${sheet} min-h-[277mm] px-6 py-8 print:min-h-0`}>
        <div className="grid grid-cols-2 justify-items-center gap-x-[4mm] gap-y-[4mm]">
          {Array.from({ length: 8 }).map((_, i) => (
            <PackCard key={i} data={data} steps={steps} scale="wallet" />
          ))}
        </div>
      </section>
    </div>
  )
}
