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

      {/* ── Table cards: cut along the lines. Each card is the guest
          page's lock card in print — same header, same numbered steps —
          so the QR opens a page the guest has already read. ── */}
      <section className="px-6 py-8">
        <p className="mb-4 text-center text-xs text-muted-foreground print:hidden">
          Table cards — print, cut along the lines, and place on tables.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-border [print-color-adjust:exact]"
            >
              <p className="bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">
                {data.topicTitle
                  ? `Favourite ${data.topicTitle.toLowerCase()}`
                  : `${data.prefix} ${data.name}`}
              </p>
              <div className="flex flex-1 flex-col px-4 py-3">
                {steps && (
                  <div className="flex flex-col gap-1 text-left text-[11px] leading-snug text-muted-foreground">
                    {steps.map((step, j) => (
                      <p key={j} className="flex gap-1.5">
                        <span className="font-semibold text-primary">
                          {j + 1}.
                        </span>
                        <span>{step}</span>
                      </p>
                    ))}
                    {data.topicTitle && (
                      <p className="pt-0.5 text-[9px] text-muted-foreground/80">
                        {mechanicFooter(data.topicTitle)}
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-center gap-3">
                  <BrandedQR
                    value={data.guestUrl}
                    size={72}
                    aria-label={`QR code to pledge for ${data.name}`}
                  />
                  <div className="text-left">
                    <p className="text-[10px] font-medium tracking-widest text-primary uppercase">
                      {data.prefix}
                    </p>
                    <p className="text-sm font-medium text-reveal-foreground">
                      {data.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Scan to pick yours · favpoll.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
