import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { PageLayout } from "@/components/page-layout"
import { heroNameSizeClass } from "@/lib/display"
import { formatPounds } from "@/lib/i18n"
import type { PrivateCharityPage as PrivatePage } from "@/lib/charity-profile-page"

// THE PAGE A CHARITY HAS BEFORE IT HAS AN ACCOUNT (step 3 of
// references/charity-profiles-2026-09-27.md). It wears the account
// charity page's own composition — the favpoll page's sheet, the static
// hero, the facts card in the rail — so that the page a charity is shown
// at onboarding is the page it will have.
//
// What it must NOT do is imply an endorsement. So the first thing on it
// says it is not public, and the route tells the crawlers to stay away.
//
// Everything here comes from the charity's OWN words (the register's
// activities and objects) or from what we derived and are offering to
// correct. Nothing is invented: a charity reading this page must be able
// to recognise every line of it.

function websiteHref(website: string): string {
  return /^https?:\/\//.test(website) ? website : `https://${website}`
}

function websiteLabel(website: string): string {
  return website.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

/** "the year to 31st March 2026" — the register's own period, in the
 *  house date format (ordinal, never ISO). */
function financialYear(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const day = d.getUTCDate()
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th"
  const month = d.toLocaleDateString("en-GB", {
    month: "long",
    timeZone: "UTC",
  })
  return `the year to ${day}${suffix} ${month} ${d.getUTCFullYear()}`
}

export function PrivateCharityPage({
  page,
  contactEmail,
}: {
  page: PrivatePage
  contactEmail: string
}) {
  const removed =
    page.registerStatus !== null && page.registerStatus !== "Registered"
  // Why this page is private, in the words of what would change it.
  const reason = removed
    ? "The register has removed this charity."
    : page.account
      ? "This charity's agreement is still pending."
      : "This charity has no favpoll account yet."

  const factsCard = (
    <div className="flex flex-col justify-center space-y-1 rounded-lg border border-border bg-card px-5 py-4 md:h-33">
      <SectionEyebrow variant="muted" className="font-semibold">
        On the register
      </SectionEyebrow>
      {page.latestIncome !== null ? (
        <>
          <p className="text-3xl font-light text-primary tabular-nums">
            {formatPounds(page.latestIncome)}
          </p>
          <p className="text-xs text-muted-foreground">
            income{" "}
            {financialYear(page.financialYearEnd) ?? "in its last filing"}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          No income filed on the register.
        </p>
      )}
      {page.place && (
        <p className="text-xs text-muted-foreground">{page.place}</p>
      )}
    </div>
  )

  const left = (
    <>
      {/* Not public, and it says so first. */}
      <div className="mt-6 rounded-lg border border-warning/40 bg-warning-muted px-4 py-3 md:mt-10">
        <p className="text-sm font-medium text-warning-strong">
          This page is not public
        </p>
        <p className="mt-1 text-sm text-warning-strong/90">
          {reason} Nothing here is published, and nothing here is an
          endorsement.
        </p>
      </div>

      {/* The charity's own og:image, in its own shape: a sharing card is
          cut at about 1.91:1, which is what this is. Private surfaces
          only, like every other scraped image. */}
      {page.imageUrl && page.imageSource === "og" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.imageUrl}
          alt={`${page.name}, from their own site`}
          className="mt-6 aspect-[1.91/1] w-full max-w-full rounded-xl border border-border bg-background object-cover"
        />
      )}

      <header className="flex items-start gap-4 pt-6 md:gap-6 md:pt-10">
        <div className="min-w-0 flex-1">
          <SectionEyebrow
            variant="muted"
            className="mb-2 flex h-8 items-center truncate wrap-break-word"
          >
            Charity
          </SectionEyebrow>
          <h1
            className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground ${heroNameSizeClass(page.name)}`}
          >
            {page.name}
          </h1>
          <p className="mt-4 truncate text-xl font-normal whitespace-normal text-primary md:text-2xl">
            Registered charity {page.registeredNumber}
          </p>
          {page.website && (
            <a
              href={websiteHref(page.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block truncate text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {websiteLabel(page.website)}
            </a>
          )}
        </div>
        {/* The charity's own mark where the logo sits, and only on this
            private page (decision 2): it is shown to the charity itself,
            which cannot object to its own mark, and a given logo replaces
            it at onboarding rather than sitting beside it.
            A FAVICON belongs here — it is a mark, square by nature. An
            og:image does not: measured on the first real run, most of them
            are 1200x630 HERO PHOTOS (English Heritage's "home-page-open-
            graph", a university's "hero-sept-2026"), and a photo shrunk
            into a 132px square is a thin strip in a box of whitespace. So
            the og:image gets the banner above, in the shape it was cut
            for, and this slot keeps the initial tile. */}
        {page.imageUrl && page.imageSource === "favicon" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.imageUrl}
            alt={page.name}
            className="h-26 w-26 shrink-0 rounded-xl border border-border bg-background object-contain p-2 md:h-33 md:w-33"
          />
        ) : (
          <div
            className="flex h-26 w-26 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-3xl font-medium text-primary md:h-33 md:w-33"
            aria-hidden="true"
          >
            {page.name.charAt(0)}
          </div>
        )}
      </header>

      {/* Its own words, as the register publishes them. */}
      {(page.activities ?? page.objects) && (
        <p className="mt-6 line-clamp-6 text-base leading-relaxed wrap-break-word text-muted-foreground">
          {page.activities ?? page.objects}
        </p>
      )}

      <div className="mt-6 md:hidden">{factsCard}</div>
    </>
  )

  const suggested = page.suggestedSubset ?? page.suggestedTopic

  const fullWidth = (
    <>
      {/* ── What a favpoll for them would be ── */}
      <section className="mt-12">
        <SectionEyebrow as="h2" className="mb-5">
          The favourite we would suggest
        </SectionEyebrow>
        {suggested ? (
          <div className="rounded-xl border border-border bg-background p-5">
            <p className="text-2xl font-light text-primary">
              Favourite {suggested.toLowerCase()}
            </p>
            {page.suggestionReason && (
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                {page.suggestionReason}
              </p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              Guests pick their favourite, give what it is worth, and see where
              it stands. Everything raised reaches {page.name} in full.
            </p>
          </div>
        ) : page.topicFamily ? (
          <p className="text-base text-muted-foreground">
            Charities like this one suit {page.topicFamily.toLowerCase()}{" "}
            favourites. We have not picked one for {page.name} yet.
          </p>
        ) : (
          <p className="text-base text-muted-foreground">
            We have not picked a favourite for {page.name} yet. Some charities
            suit one and some honestly do not, and this page says so rather than
            guessing.
          </p>
        )}
      </section>

      {/* ── What their own site says they already run ── */}
      {page.signatureEvents.length > 0 && (
        <section className="mt-12">
          <SectionEyebrow as="h2" className="mb-5">
            Events we found on their site
          </SectionEyebrow>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {page.signatureEvents.map((event) => (
              <li
                key={`${event.name}-${event.sourceUrl}`}
                className="rounded-xl border border-border bg-background p-4"
              >
                <p className="text-sm font-medium text-foreground">
                  {event.name}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[event.kind, event.when].filter(Boolean).join(" · ")}
                </p>
                {event.topic && (
                  <p className="mt-2 text-xs text-primary">
                    Favourite {event.topic.toLowerCase()} would suit it
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The ask. No account yet, so there is nothing to create against —
          the door is a conversation, as it is on the account page. */}
      <section className="mt-12">
        <p className="text-sm text-muted-foreground">
          Is this your charity?{" "}
          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent(
              `favpoll — ${page.name}`
            )}&body=${encodeURIComponent(
              `We would like to talk about ${page.name} receiving pledges through favpoll.\n\nCharity: ${page.name}\nRegistered number: ${page.registeredNumber}`
            )}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Get in touch
          </a>{" "}
          and this page becomes yours to correct.
        </p>
        {page.registerName && page.registerName !== page.name && (
          <p className="mt-3 text-xs text-muted-foreground">
            Named on the register as {page.registerName}.
          </p>
        )}
      </section>
    </>
  )

  return (
    <PageLayout left={left} right={factsCard} rightSticky={false}>
      {fullWidth}
    </PageLayout>
  )
}
