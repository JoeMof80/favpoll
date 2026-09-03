import { cn } from "@/lib/utils"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"

export type Idea = {
  key: string
  label: string
  body: string
  artefact: React.ReactNode
}

/**
 * The register pages' "A few ideas" band — four artefacts, alternating sides.
 *
 * Extracted 2026-08-28, when /celebrations needed the same section. It had
 * been ~85 lines inline on /memorials carrying four separate hard-won layout
 * decisions, every one of which a second copy would have had to rediscover.
 * Same reasoning as HowItWorksSteps: the words stay with the pages, the
 * layout lives once.
 *
 * COPY AND ARTEFACTS STAY WITH THE PAGES. A memorial's four are an order of
 * service, a reveal, a quiet display and a tribute keepsake; a celebration's
 * are place names, a reveal, a display with its goal bar, and a celebration
 * keepsake; a fundraiser's are a poster, a reveal, that same goal on a big
 * screen, and the fundraiser keepsake that leads on the total. Only the frame
 * is shared — each register's paper is the paper it actually has.
 *
 * The eyebrow takes the page palette's primary — each register page wears
 * its own (RegisterScope), so nothing is passed in (2026-08-30).
 */
export function IdeasSection({
  title,
  ideas,
}: {
  title: string
  ideas: Idea[]
}) {
  return (
    // overflow-x-clip is LOAD-BEARING. The live artefact deliberately does
    // not clip its own box, so TvFrame's atmosphere can finish instead of
    // being cut off square — but the box it stops clipping is the still's
    // UNSCALED 1960px one, and with nothing containing that the document grew
    // 11px wider than a 320px phone. The e2e overflow guard caught it.
    // The section is the right place: it spans the full viewport, so the clip
    // edge is the screen edge rather than anything near the set. `clip` not
    // `hidden` — hidden on one axis makes the other a scroll container.
    <section
      id="artefacts"
      className="w-full scroll-mt-20 overflow-x-clip bg-primary/5"
    >
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <SectionEyebrow className="mb-10">{title}</SectionEyebrow>
        {/* The homepage's text-left / media-right row (see "The record" on
            the landing page): grid, items-center, gap-8, two columns from lg.

            NOT grid-cols-2. Equal halves give each column ~472px at 1024, and
            PackVignette is a FIXED 624px at lg — a grid item cannot shrink
            below its min-content, so equal halves would grow the page by
            ~150px at exactly the width the two-column layout switches on.
            #567, #571 and the memorial hero have all been this bug. The media
            track is sized to the media instead (39rem = 624px), and the text
            track takes what is left, with minmax(0,·) so IT can shrink rather
            than the page. */}
        <div className="space-y-16 lg:space-y-24">
          {ideas.map(({ key, label, body, artefact }, i) => {
            // ALTERNATING SIDES. Four rows the same way round is a column of
            // text with a column of pictures beside it; the eye stops reading
            // and starts scanning. Swapping every other row makes each one
            // its own beat (founder, 2026-08-26).
            //
            // Implemented as grid ORDER, not source order: the caption stays
            // first in the DOM on every row, so the reading and tab order
            // never depend on which way the row is facing. Below lg both
            // columns stack and the flag does nothing — text always first,
            // which is the order that makes sense when the image is
            // underneath it.
            const mediaLeft = i % 2 === 1
            return (
              <figure
                key={key}
                className={cn(
                  "grid items-center gap-8 lg:gap-16",
                  mediaLeft
                    ? "lg:grid-cols-[39rem_minmax(0,1fr)]"
                    : "lg:grid-cols-[minmax(0,1fr)_39rem]"
                )}
              >
                <figcaption
                  className={cn("max-w-md min-w-0", mediaLeft && "lg:order-2")}
                >
                  <p className="mb-3 text-3xl font-light tracking-tight text-foreground">
                    {label}
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </figcaption>
                <div
                  className={cn(
                    // Vignette lost its visible chrome globally (2026-09-03),
                    // so only the width release is still this page's own:
                    // beside a column of text the artefact takes the column.
                    "min-w-0 [&_[data-vignette]]:max-w-none",
                    mediaLeft && "lg:order-1"
                  )}
                >
                  {artefact}
                </div>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
