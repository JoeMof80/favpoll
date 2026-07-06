"use client"

// The two modes of a favpoll: complete on its own, or paired with the day
// itself — where the live display and a QR code put it in the room.
import { BrandedQR } from "@/components/branded-qr"
import { Link2, MonitorPlay } from "lucide-react"
import { RankingBar } from "@/components/ui/ranking-bar"

const MOCK_BARS = [
  ["Purple", "£350", 78],
  ["Blue", "£220", 51],
  ["Red", "£165", 38],
] as const

export function InTheRoom() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* On its own */}
      <div className="flex flex-col rounded-xl border border-border bg-background p-5">
        <div className="mb-3 flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            On its own
          </h3>
        </div>
        <p className="text-base leading-relaxed text-muted-foreground">
          Create it and share the link. Guests pledge from wherever they are,
          the reveal waits for each of them, and the poll closes on the date you
          choose. Nothing else to organise.
        </p>
      </div>

      {/* At the event */}
      <div className="flex flex-col rounded-xl border border-border bg-background p-5">
        <div className="mb-3 flex items-center gap-2">
          <MonitorPlay className="h-4 w-4 text-primary" aria-hidden="true" />
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            In the room
          </h3>
        </div>
        <p className="mb-5 text-base leading-relaxed text-muted-foreground">
          Pair it with the day itself. The live display goes on a screen, the QR
          code goes on the tables, and guests pledge from their phones. The
          rankings update in real time as pledges come in — purple climbs
          because Belinda loved purple.
        </p>

        {/* Mini live-display mock */}
        <div
          className="mt-auto flex items-center gap-5 rounded-lg border border-border bg-muted/40 p-4"
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
    </div>
  )
}
