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
      <div
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-t-xl border border-b-0 border-border bg-muted px-3.5"
        aria-hidden="true"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="flex-1 text-center text-xs text-muted-foreground">
          favpoll.com · demo
        </span>
        {/* Balance the dots so the label centres optically */}
        <span className="w-9" />
      </div>
      {children}
    </div>
  )
}
