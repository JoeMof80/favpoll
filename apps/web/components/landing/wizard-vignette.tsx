import { Chip } from "@/components/ui/chip"

// The wizard, in miniature — the four overlays an organiser fills in, stacked
// in creation order, fanning on hover.
//
// Salvaged from HowItWorksThreeBeat when that section was retired from the
// homepage (2026-08-09). The section was a third telling of an arc the page
// had already given twice, but this one vignette was not duplicated anywhere:
// it is the only glimpse on the site of what CREATING a favpoll looks like,
// and "is this fiddly to set up?" is a real organiser anxiety that nothing
// else answers. /features#organisers had no artefact at all, which is where
// it now lives — beside the list of what you set.
//
// Real product idioms in miniature rather than a screenshot, per the hero
// demo's rule: screenshots rot silently and do not theme.
//
// No "use client": the fan is CSS group-hover, motion-safe only. The original
// needed state for the Watch vignette's live standings, not for this one.

// Belinda · Colour · Marie Curie — the same scene the demos use, so the site
// tells one story throughout. The About card carries the signature sentence
// that sets up the demo's reveal, shown freshly typed with the caret still
// blinking.
const ABOUT_SIGNATURE = "She had a signature colour that she loved."

// Mini overlay-dialog chrome — the wizard's field overlays in miniature.
const DIALOG =
  "absolute rounded-xl border border-border bg-background p-3 shadow-lg transition-transform duration-300"

export function WizardVignette() {
  return (
    <div
      aria-hidden="true"
      className="group relative h-80 max-w-2xl overflow-hidden rounded-xl border border-border bg-primary/5 select-none"
    >
      {/* Fixed-width canvas, centred — the deck holds its shape at any card
          width, single-column mobile included. */}
      <div inert className="relative mx-auto h-full w-[22rem]">
        {/* Charity — first pick, back of the deck */}
        <div
          className={`${DIALOG} top-4 left-2 w-60 -rotate-2 motion-safe:group-hover:-translate-x-3 motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:-rotate-4`}
        >
          <p className="mb-1.5 text-sm font-medium text-foreground">
            Pick a charity
          </p>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm text-secondary-foreground">
              M
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-foreground">
                Marie Curie
              </span>
              <span className="text-xs text-muted-foreground">
                Charity no. 207994
              </span>
            </span>
          </div>
        </div>

        {/* Topic */}
        <div
          className={`${DIALOG} top-20 left-10 w-60 rotate-1 motion-safe:group-hover:translate-x-3 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:rotate-3`}
        >
          <p className="mb-1.5 text-sm font-medium text-foreground">
            Pick a topic
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Chip readOnly selected size="sm">
              Colour
            </Chip>
            <Chip readOnly size="sm">
              Season
            </Chip>
            <Chip readOnly size="sm">
              Song
            </Chip>
          </div>
        </div>

        {/* Name */}
        <div
          className={`${DIALOG} top-[8.25rem] left-4 w-64 -rotate-1 motion-safe:group-hover:-translate-x-3 motion-safe:group-hover:translate-y-1 motion-safe:group-hover:-rotate-3`}
        >
          <p className="mb-1.5 text-sm font-medium text-foreground">Name</p>
          <p className="rounded-lg border border-border px-3 py-2 text-base text-foreground">
            Belinda Hartley
          </p>
        </div>

        {/* About — last written, front of the deck */}
        <div
          className={`${DIALOG} top-[12.25rem] left-14 w-64 rotate-2 motion-safe:group-hover:translate-x-3 motion-safe:group-hover:translate-y-2 motion-safe:group-hover:rotate-4`}
        >
          <p className="mb-1.5 text-sm font-medium text-foreground">About</p>
          <p className="rounded-lg border border-border px-3 py-2 text-sm leading-relaxed text-foreground">
            {ABOUT_SIGNATURE}
            <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[2px] animate-caret-blink bg-foreground" />
          </p>
        </div>
      </div>
    </div>
  )
}
