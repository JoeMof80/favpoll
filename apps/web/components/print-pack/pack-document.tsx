import { QRCodeSVG } from "qrcode.react"
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

// favpoll logo centred in the QR, matching OrganizerCard.
const QR_LOGO =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjI5OCAyODIgMTIwIDEwOSI+PHBhdGggZD0iTTQxMS4zNDkgMzE4LjI0OEM0MTQuNjEgMzE4LjI0OCA0MTYuNzY5IDMxNS42MDYgNDE2Ljc2OSAzMTIuMzQ3QzQxMy45NTggMjk1LjYwMiAzOTkuMzgxIDI4Mi44NDMgMzgxLjgyOCAyODIuODQzQzM3Mi43NTUgMjgyLjg0MyAzNjQuNTcxIDI4Ni4xNjkgMzU4LjMwMyAyOTEuNzc1TDM1NS44NTkgMjg5Ljc2OUMzNDkuOTM1IDI4NS4zNzEgMzQyLjU0NSAyODIuODQzIDMzNC41OTQgMjgyLjg0M0MzMTUuMDI5IDI4Mi44NDMgMjk5LjE2OSAyOTguNjk0IDI5OS4xNjkgMzE4LjI0OEMyOTkuMTY5IDMyNy45NTQgMzAzLjA4IDMzNi43NDcgMzA5LjQwOSAzNDMuMTQyTDMyOC45ODcgMzYyLjcxNEMzMzEuMjkyIDM2NS4wMTkgMzM1LjAzMSAzNjUuMDE5IDMzNy4zMzcgMzYyLjcxNEMzMzkuNjQzIDM2MC40MSAzMzkuNjQzIDM1Ni42NzQgMzM3LjMzNyAzNTQuMzY5TDMxNy43NTggMzM0Ljc5OEMzMTMuNTUzIDMzMC41MjYgMzEwLjk3OCAzMjQuNjk5IDMxMC45NzggMzE4LjI0OEMzMTAuOTc4IDMwNS4yMTIgMzIxLjU1MSAyOTQuNjQ1IDMzNC41OTQgMjk0LjY0NUMzNDAuNzg2IDI5NC42NDUgMzQ2LjMzMyAyOTYuODg2IDM1MC40MjcgMzAwLjU1N0wzNTguMzAzIDMwNy42MjJMMzY2LjE3OSAzMDAuNTY5QzM3MC4zMzIgMjk2Ljg1NCAzNzUuNzI4IDI5NC42NDUgMzgxLjgyOCAyOTQuNjQ1QzM5Mi44MjcgMjk0LjY0NSA0MDIuMDkxIDMwMi4xNjggNDA0LjcwOSAzMTIuMzQ3QzQwNC43MDkgMzE1LjYwNiA0MDguMDg4IDMxOC4yNDggNDExLjM0OSAzMTguMjQ4WiIgZmlsbD0iIzUzNEFCNyIvPjxwYXRoIGQ9Ik0zNTIuNTY5IDMzNS45NDNDMzUyLjU2OSAzMzkuMDkxIDM1NS4yMDIgMzQxLjY0MyAzNTguNDQ5IDM0MS42NDNINDA1LjQ4OUM0MDguNzM3IDM0MS42NDMgNDExLjM2OSAzMzkuMDkxIDQxMS4zNjkgMzM1Ljk0M0M0MTEuMzY5IDMzMi43OTUgNDA4LjczNyAzMzAuMjQzIDQwNS40ODkgMzMwLjI0M0gzNTguNDQ5QzM1NS4yMDIgMzMwLjI0MyAzNTIuNTY5IDMzMi43OTUgMzUyLjU2OSAzMzUuOTQzWiIgZmlsbD0iIzUzNEFCNyIgZmlsbC1vcGFjaXR5PSIwLjYiLz48cGF0aCBkPSJNMzUyLjU2OSAzNTkuNjQzQzM1Mi41NjkgMzYyLjk1NiAzNTUuMjExIDM2NS42NDMgMzU4LjQ2OSAzNjUuNjQzSDM4Mi4wN0MzODUuMzI4IDM2NS42NDMgMzg3Ljk2OSAzNjIuOTU2IDM4Ny45NjkgMzU5LjY0M0MzODcuOTY5IDM1Ni4zMjkgMzg1LjMyOCAzNTMuNjQzIDM4Mi4wNyAzNTMuNjQzSDM1OC40NjlDMzU1LjIxMSAzNTMuNjQzIDM1Mi41NjkgMzU2LjMyOSAzNTIuNTY5IDM1OS42NDNaIiBmaWxsPSIjNTM0QUI3IiBmaWxsLW9wYWNpdHk9IjAuNiIvPjxwYXRoIGQ9Ik0zNjMuOTY5IDM4My4wNDNDMzYzLjk2OSAzODYuMzU3IDM2MS40MTggMzg5LjA0MyAzNTguMjY5IDM4OS4wNDNDMzU1LjEyMSAzODkuMDQzIDM1Mi41NjkgMzg2LjM1NyAzNTIuNTY5IDM4My4wNDNDMzUyLjU2OSAzNzkuNzI5IDM1NS4xMjEgMzc3LjA0MyAzNTguMjY5IDM3Ny4wNDNDMzYxLjQxOCAzNzcuMDQzIDM2My45NjkgMzc5LjcyOSAzNjMuOTY5IDM4My4wNDNaIiBmaWxsPSIjNTM0QUI3IiBmaWxsLW9wYWNpdHk9IjAuNiIvPjwvc3ZnPg=="

function qrLogo(size: number) {
  return {
    src: QR_LOGO,
    height: size,
    width: size,
    excavate: true,
  }
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
          <QRCodeSVG
            value={data.guestUrl}
            size={220}
            bgColor="transparent"
            aria-label={`QR code to pledge for ${data.name}`}
            imageSettings={qrLogo(48)}
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
              <QRCodeSVG
                value={data.guestUrl}
                size={104}
                bgColor="transparent"
                aria-label={`QR code to pledge for ${data.name}`}
                imageSettings={qrLogo(24)}
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
