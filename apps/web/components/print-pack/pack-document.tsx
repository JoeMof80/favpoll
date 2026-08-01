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

  return (
    <>
      {/* ── A4 poster ── */}
      <section className="flex min-h-[277mm] break-after-page flex-col items-center justify-center px-12 py-16 text-center">
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
                <span className="font-semibold text-primary">{i + 1}.</span>
                <span>{step}</span>
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
      <section className="px-6 py-8">
        <p className="mb-4 text-center text-xs text-muted-foreground print:hidden">
          Wallet cards — print, cut along the borders. Credit-card sized, so
          they slip into a wallet or an order of service.
        </p>
        <div className="grid grid-cols-2 justify-items-center gap-x-[4mm] gap-y-[4mm]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex h-[54mm] w-[85.6mm] flex-col overflow-hidden rounded-[3mm] border border-border bg-white [print-color-adjust:exact]"
            >
              <div className="flex items-start justify-between gap-[3mm] px-[4mm] pt-[2.5mm] pb-[1.5mm]">
                <div className="min-w-0">
                  <p className="truncate text-[5.5pt] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {data.prefix}
                  </p>
                  <p className="truncate text-[10pt] leading-tight font-medium text-foreground">
                    {data.name}
                  </p>
                </div>
                <BrandedQR
                  value={data.guestUrl}
                  size={56}
                  aria-label={`QR code to pledge for ${data.name}`}
                  className="shrink-0"
                />
              </div>
              <div className="border-t border-border" />
              {data.topicTitle && (
                <p className="px-[4mm] pt-[1.5mm] text-[8pt] font-semibold tracking-wide text-primary uppercase">
                  Favourite {data.topicTitle.toLowerCase()}
                </p>
              )}
              {steps && (
                <div className="flex flex-col gap-[1mm] px-[4mm] pt-[1.5mm] text-left text-[6.5pt] leading-snug text-muted-foreground">
                  {steps.map((step, j) => (
                    <p key={j} className="flex gap-[1.5mm]">
                      <span className="font-semibold text-primary">
                        {j + 1}.
                      </span>
                      <span>{step}</span>
                    </p>
                  ))}
                </div>
              )}
              {data.topicTitle && (
                <p className="mt-auto px-[4mm] pb-[2mm] text-center text-[5.5pt] text-muted-foreground/80">
                  {mechanicFooter(data.topicTitle)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
