"use client"

// One point, one artifact: pair a favpoll with the day itself and the live
// display puts it in the room. (It also runs anywhere on a bare link — that
// fact fits in the line; the live component is the star.)
import { BrandedQR } from "@/components/branded-qr"
import { RankingBar } from "@/components/ui/ranking-bar"

const MOCK_BARS = [
  ["Purple", "£350", 78],
  ["Blue", "£220", 51],
  ["Red", "£165", 38],
] as const

export function InTheRoom() {
  return (
    <div className="grid items-center gap-6 sm:grid-cols-2">
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        A favpoll runs anywhere on a link alone. Pair it with the day and it
        comes alive — the live display on a screen, the printable pack's QR on
        every table, and purple climbing because Belinda loved purple.
      </p>

      {/* Mini live-display mock */}
      <div
        className="flex items-center gap-5 rounded-xl border border-border bg-background p-5"
        aria-hidden="true"
      >
        <div className="min-w-0 flex-1 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-primary uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Live display
          </p>
          {MOCK_BARS.map(([label, amount, width], i) => (
            <RankingBar
              key={label}
              label={label}
              amount={amount}
              widthPercent={width}
              barClassName={i === 0 ? "bg-primary" : "bg-chart-3"}
            />
          ))}
        </div>
        <div className="shrink-0 rounded-md border border-border bg-background p-2">
          <BrandedQR value="https://favpoll.com" size={72} />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            scan to pledge
          </p>
        </div>
      </div>
    </div>
  )
}
