import { BrandedQR } from "@/components/branded-qr"
import { FavpollMarkGlyph } from "@/components/landing/hero-texture"

// Pre-event promotional material for an organiser to print and place at
// the venue: an A4 poster and a sheet of cut-out table cards, each with a
// QR to the guest page. The counterpart to the post-close keepsake.
// Register-aware framing (prefix), neutral action copy that works for a
// funeral and a birthday alike.

export type PackData = {
  prefix: string
  name: string
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

      {/* ── Table cards: cut along the lines ── */}
      <section className="px-6 py-8">
        <p className="mb-4 text-center text-xs text-muted-foreground print:hidden">
          Table cards — print, cut along the lines, and place on tables.
        </p>
        <div className="grid grid-cols-2 gap-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center border border-dashed border-border px-6 py-8 text-center"
            >
              <BrandedQR
                value={data.guestUrl}
                size={104}
                aria-label={`QR code to pledge for ${data.name}`}
              />
              <p className="mt-3 text-xs font-medium tracking-widest text-primary uppercase">
                {data.prefix}
              </p>
              <p className="text-base font-medium text-reveal-foreground">
                {data.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan to add your favourite
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
