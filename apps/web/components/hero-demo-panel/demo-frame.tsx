import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

// The traffic-light window bar that marks a DemoCard as a demo rather than a
// screenshot of someone's real favpoll.
//
// Extracted 2026-08-06 when the process overview needed the same chrome the
// hero demo has. Copying the markup would have set up the next drift — the
// lock card and the topic header had both already diverged that way — so the
// frame lives in one place and both callers pass a scaled DemoCard in.
//
// Note the child needs `className="rounded-t-none border-t-0"`: the bar owns
// the top corners and the seam between them.

export function DemoFrame({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn("flex h-full flex-col rounded-xl shadow-2xl", className)}
    >
      {/* SAFARI'S TOOLBAR, as near as the tokens allow (founder,
          2026-10-19: "lets try the authentic safari toolbar color just to
          see"): a neutral grey bar in light, a dark grey in dark — never the
          page's tinted muted — Safari's traffic-light hues from the nearest
          Tailwind steps, and the address in its centred pill with the
          padlock. Tailwind's palette rather than hexes: the hex check
          forbids literals, and these are not brand colours. */}
      <div
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-t-xl border border-b-0 border-neutral-200 bg-neutral-100 px-3.5 dark:border-neutral-600 dark:bg-neutral-700"
        aria-hidden="true"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="flex flex-1 justify-center">
          <span className="flex h-6 w-56 items-center justify-center gap-1 rounded-md bg-white text-xs text-neutral-600 dark:bg-neutral-600 dark:text-neutral-200">
            <Lock className="size-2.5" aria-hidden="true" />
            favpoll.com
          </span>
        </span>
        {/* Balance the dots so the pill centres optically */}
        <span className="w-9" />
      </div>
      {children}
    </div>
  )
}
