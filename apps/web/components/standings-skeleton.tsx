// The pre-pledge placeholders: a note skeleton and skeleton standings bars.
// Lifted out of poll-section on 2026-10-15 so the hero's DemoCard can show
// the SAME thing the real guest page shows behind the lock card. It had kept
// the blurred decoy that #911 retired from the product (founder, 2026-09-21:
// "I quite like the skeleton — replace the decoy with it"), so the homepage
// vignettes advertised a lock the product no longer draws.

// --skeleton / --skeleton-soft (globals): register-safe neutrals that
// flip with the theme — chroma 0, so bg-muted's register tint (pink on a
// celebration) can never reach a placeholder.

// Skeleton personal note — a left-bordered block of neutral lines matching
// the real TypedNote's blockquote style. Only rendered when hasNote is true.
// Uses fixed neutral grey (not bg-muted, which inherits the register palette
// and turns pink/green/purple — founder, 2026-09-21).
export function NoteSkeleton() {
  return (
    <div
      data-testid="note-skeleton"
      className="mb-4 border-l-2 border-skeleton-soft py-1 pl-4"
    >
      <div className="space-y-2">
        <div className="h-4 w-4/5 rounded bg-skeleton-soft" />
        <div className="h-4 w-3/5 rounded bg-skeleton-soft" />
      </div>
    </div>
  )
}

// Skeleton standings bars — used behind the lock card (pre-pledge) and
// in the organiser's zero-pledges state. Fixed neutral grey so it reads
// as a placeholder on every register palette (bg-muted turns pink on
// celebrations — founder, 2026-09-21).
const SKELETON_WIDTHS = [1, 0.82, 0.65, 0.48, 0.32, 0.18]
export function StandingsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div data-testid="standings-skeleton" className="space-y-4 py-2">
      {SKELETON_WIDTHS.slice(0, rows).map((w, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-3.5 w-24 rounded bg-skeleton" />
            <div className="h-3.5 w-10 rounded bg-skeleton" />
          </div>
          <div
            className="h-1.5 rounded-full bg-skeleton-soft"
            style={{ width: `${w * 100}%` }}
          />
        </div>
      ))}
    </div>
  )
}
