import { BrandedQR } from "@/components/branded-qr"
import { FavpollMarkGlyph } from "@/components/landing/hero-texture"
import { buildMechanicSteps, mechanicFooter } from "@/lib/mechanic-steps"

// Pre-event promotional material for an organiser to print and place at
// the venue: an A4 poster and a sheet of cut-out table cards, each with a
// QR to the guest page. The counterpart to the post-close keepsake.
// Register-aware framing (prefix), neutral action copy that works for a
// funeral and a birthday alike. The table cards carry the SAME numbered
// mechanic steps as the guest page's lock card (lib/mechanic-steps) —
// the guest reads them on the table, then again on scan (founder,
// 2026-08-01).

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
  // shadow + gap, founder 2026-08-02 — one long white run read as a
  // single page), seamless in print where break-after-page splits them.
  const sheet =
    "bg-background border border-border rounded-lg shadow-sm print:border-0 print:rounded-none print:shadow-none"

  return (
    <div className="flex flex-col gap-8 print:block">
      {/* ── A4 poster ── */}
      <section
        className={`${sheet} flex min-h-[277mm] break-after-page flex-col items-center justify-center px-12 py-16 text-center`}
      >
        <span className="mb-8 inline-flex text-primary">
          <svg width="52" height="47" viewBox="0 0 10 9" aria-hidden="true">
            <FavpollMarkGlyph />
          </svg>
        </span>
        <p className="text-sm font-medium tracking-widest text-primary uppercase">
          {data.prefix}
        </p>
        <h1 className="mt-2 text-5xl font-medium tracking-tight text-reveal-foreground">
          {data.name}
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
          Scan to add your favourite — every pledge honours {data.name} and
          supports {charities}.
        </p>

        {steps && (
          <div className="mt-8 flex max-w-md flex-col gap-2 text-left">
            {steps.map((step, i) => (
              <p key={i} className="flex gap-2.5 text-base text-foreground">
                <span className="w-5 shrink-0 text-right font-semibold text-primary">
                  {i + 1}.
                </span>
                <span className="flex-1">{step}</span>
              </p>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-border p-4">
          <BrandedQR
            value={data.guestUrl}
            size={220}
            aria-label={`QR code to pledge for ${data.name}`}
          />
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          favpoll takes no fee — 100% reaches {charities}.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">favpoll.com</p>
      </section>

      {/* ── Wallet cards: credit-card size (85.6 × 54 mm), full white
          for printer-friendliness, favpoll-card format — eyebrow + name
          with the QR in the corner, topic as the section heading, then
          the same numbered steps as the guest page's lock card. Cut
          along the borders; they slip into a wallet (founder, 2026-08-02). ── */}
      <section className={`${sheet} min-h-[277mm] px-6 py-8 print:min-h-0`}>
        <p className="mb-4 text-center text-xs text-muted-foreground print:hidden">
          Wallet cards — print, cut along the borders. Credit-card sized, so
          they slip into a wallet or an order of service.
        </p>
        <div className="grid grid-cols-2 justify-items-center gap-x-[4mm] gap-y-[4mm]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[54mm] w-[85.6mm] flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm [print-color-adjust:exact]"
            >
              {/* Header — the list card's FavpollHeader, compact, with
                  the favpoll brand top-right */}
              <div className="flex flex-col px-[3mm] pt-[2.5mm] pb-[2mm]">
                {/* Brand bottom-aligns with the opening line (founder,
                    2026-08-02) — one items-end row shared by both */}
                <div className="flex items-end justify-between gap-2">
                  <span className="text-[6pt] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                    {data.prefix}
                  </span>
                  {/* The real logo at card scale: heart accents and
                      "poll" at 60% opacity, like FavpollLogo */}
                  <span className="inline-flex shrink-0 items-center gap-[1mm] leading-none text-primary">
                    <svg
                      width="12"
                      height="11"
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
                    <span className="text-[8pt] tracking-tight">
                      fav<span className="opacity-60">poll</span>
                    </span>
                  </span>
                </div>
                <span className="truncate text-[11pt] leading-snug font-medium text-foreground">
                  {data.name}
                </span>
              </div>
              {/* Topic row — the list card's poll ribbon */}
              {data.topicTitle && (
                <div className="border-t border-border px-[3mm] py-[1.5mm]">
                  <p className="truncate text-[8.5pt] font-medium tracking-[0.09em] text-primary uppercase">
                    Favourite {data.topicTitle.toLowerCase()}
                  </p>
                </div>
              )}
              {/* Steps section — steps left, QR right (moved out of the
                  header, which sat too tall with it; founder 2026-08-02) */}
              <div className="flex flex-1 flex-col border-t border-border px-[3mm] pt-[3mm] pb-[2mm]">
                <div className="flex flex-1 items-start gap-[3mm]">
                  {steps && (
                    <div className="flex flex-1 flex-col gap-[1.5mm] text-left text-[6.5pt] leading-snug text-muted-foreground">
                      {steps.map((step, j) => (
                        <p key={j} className="flex gap-[1.5mm]">
                          <span className="w-[3.5mm] shrink-0 text-right font-semibold text-primary">
                            {j + 1}.
                          </span>
                          <span className="flex-1">{step}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  <BrandedQR
                    value={data.guestUrl}
                    size={58}
                    aria-label={`QR code to pledge for ${data.name}`}
                    className="shrink-0"
                  />
                </div>
                {data.topicTitle && (
                  <p className="mt-auto pt-[1mm] text-center text-[5.5pt] text-muted-foreground/80">
                    {mechanicFooter(data.topicTitle)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
