import type { Metadata } from "next"
import Link from "next/link"
import { LandingHero } from "@/components/landing/hero"
import { OrderOfServiceVignette } from "@/components/landing/order-of-service-vignette"
import { MEMORIAL_SCENE } from "@/components/landing/demo-fixture"
import { LiveVignette } from "@/components/landing/live-vignette"
import { RevealVignettePhone } from "@/components/landing/reveal-vignette"
import { KeepsakeVignetteDetail } from "@/components/landing/keepsake-vignette"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { HowItWorksSteps } from "@/components/landing/how-it-works-steps"
import { cn } from "@/lib/utils"
import { t } from "@/lib/i18n"

// The first register landing page (sequencing decision 2026-08-01:
// memorial FIRST — the warm channel is Joy, funeral directors, St
// Luke's). This page is the FORWARDING ARTEFACT for those gatekeepers:
// everything a celebrant needs to hand a family, in the memorial
// register — wake-first placement, the presence dial at its quiet
// settings, and the reveal as keepsake, never quiz. Copy lives in
// messages/en-GB.json (memorials.*); bands follow the landing's
// alternating grammar (purple hero · white · bg-primary/5 · purple
// close). Moving How it works above the tailoring band on 2026-08-26 put
// two tinted sections next to each other, so the tint moved down one:
// reassurances went plain and the gatekeeper block took the tint, which
// also stops it reading as an afterthought before the close.

export const metadata: Metadata = {
  title: "Memorials — favpoll",
  description:
    "Honour them by sharing what they loved. Give to charity in their memory. A favpoll turns everyone's favourites into pledges to a charity the family names.",
}

const STEPS = [
  { label: t("memorials.how.pick.label"), body: t("memorials.how.pick.body") },
  {
    label: t("memorials.how.pledge.label"),
    body: t("memorials.how.pledge.body"),
  },
  {
    label: t("memorials.how.reveal.label"),
    body: t("memorials.how.reveal.body"),
  },
]

const ASSURANCES = [
  {
    label: t("memorials.assure.free.label"),
    body: t("memorials.assure.free.body"),
  },
  {
    label: t("memorials.assure.charity.label"),
    body: t("memorials.assure.charity.body"),
  },
  {
    label: t("memorials.assure.nofave.label"),
    body: t("memorials.assure.nofave.body"),
  },
  {
    label: t("memorials.assure.phone.label"),
    body: t("memorials.assure.phone.body"),
  },
]

// Paper -> phone -> room -> paper: the order of service a guest scans, the
// reveal it opens, the display in the room, the keepsake afterwards. The
// same arc How It Works closes on (#569), and the sequence a celebrant needs
// to picture handing to a family.
//
// ONE OBJECT PER IDEA, EACH AT A SIZE IT CAN BE READ AT (founder,
// 2026-08-27). Three of these four used to shrink a whole document to fit —
// a four-sheet pack fan, two A4 keepsakes, a screen stepping through pledges
// — and the section's shared defect was that you could see THAT there was a
// sheet without seeing what was on it. Each now crops to the part carrying
// the meaning, at a scale that reads, and none of them move.
//
// The vignettes are shared with /features, which is register-neutral and
// keeps the fuller versions: the pack fan, the paired keepsake, the reveal's
// locked-then-given arc, the display with pledges landing. Every change here
// arrived as a prop or a sibling export rather than an edit to what that
// page shows.
const ARTEFACTS = [
  {
    key: "pack",
    label: t("memorials.artefacts.pack.label"),
    body: t("memorials.artefacts.pack.body"),
    // NOT PackVignette, which showed favpoll's own A4/A5 and Avery sheets
    // beside copy about the family's order of service — the one place in
    // this section where the picture contradicted the words. This is that
    // page's footer with the QR on it, which is what the idea describes.
    // NOTE the print pack is no longer depicted anywhere on /memorials.
    artefact: <OrderOfServiceVignette />,
  },
  {
    // The PHONE beat, and the reason the arc was incomplete without it:
    // the comment below claimed paper -> phone -> room -> paper while the
    // list ran paper -> room -> paper. On a memorial the reveal is not one
    // artefact among four, it is the one the whole thing is for.
    //
    // RevealVignette already uses the MEMORIAL scene by its own design —
    // "a personal reveal needs a person: the cause scene has no
    // protagonist" — so unlike the pack and the display it needs no
    // memorial twin.
    key: "reveal",
    label: t("memorials.artefacts.reveal.label"),
    body: t("memorials.artefacts.reveal.body"),
    // The hero's own PhoneFrame at half size, still, holding the reveal
    // already given — so the device at the top of this page and the device
    // here are one object at two scales.
    artefact: <RevealVignettePhone />,
  },
  {
    key: "display",
    label: t("memorials.artefacts.display.label"),
    body: t("memorials.artefacts.display.body"),
    // Belinda's screen, not the celebration default — the last object on
    // the page that was still showing someone else's birthday.
    artefact: <LiveVignette scene={MEMORIAL_SCENE} still room />,
  },
  {
    key: "keepsake",
    label: t("memorials.artefacts.keepsake.label"),
    body: t("memorials.artefacts.keepsake.body"),
    // Cropped to the tribute's head — the prefix, her name, the topic and
    // the reveal. The data was always hers; two whole sheets at 0.28 put it
    // at 5px.
    artefact: <KeepsakeVignetteDetail />,
  },
]

export default function MemorialsPage() {
  return (
    <main>
      {/* ── The opening — the REAL landing hero, register-configured.
          Hand-rolling a band here lost the two things the component
          actually does: HeroTexture's monogram shimmer, and
          min-h-[calc(100vh-3.5rem)] so it fills the screen (founder,
          2026-08-26). It is the hero; use the hero.

          `still` replaces the looping demo with a phone at phase "reveal"
          — the state a guest is left holding, and the same handset size as
          the homepage's guest arc, from the shared PHONE_SCALE.

          The children slot carries the consolidation: "Made for the wake"
          and "As quiet or as present as the family wants" were two sections
          asking one question — where in the day does this go, and at what
          volume. The wake HEADING is gone but not lost; its body opens "The
          service isn't the moment — the wake is", which is the heading in a
          sentence. ── */}
      <LandingHero
        sceneKind="memorial"
        still
        eyebrow={t("memorials.eyebrow")}
        headline={t("memorials.headline")}
        subheader={t("memorials.subheader")}
        ctaLabel={t("memorials.cta.primary")}
        ctaSecondaryLabel={t("memorials.cta.secondary")}
        accentVar="memorial"
        hideStats
      />

      {/* ── How it works ─────────────────────────────────────────────────
          DIRECTLY BELOW THE HERO (founder, 2026-08-26), which is where
          /celebrations and /fundraisers already had it. Memorials became the
          outlier earlier today when the tailoring band was inserted above it.

          Three reasons, the last of them a defect: the mechanic has to come
          before the application, because "include the QR code on the order of
          service" means nothing until you know what scanning it leads to; and
          the hero's second CTA says "See how it works" and targets #how, so
          with a band in between it skipped the largest section on the page
          and landed the reader two sections down. ── */}
      <HowItWorksSteps title={t("memorials.how.title")} steps={STEPS} />

      {/* ── How to tailor it to a memorial ─────────────────────────────────
          NOT a gallery of objects (founder, 2026-08-26). These four say how
          an organiser might USE a favpoll at a memorial — where the code
          goes, why the reveal lands hardest here, how quiet to keep the
          room, what the family is left holding. Advice, with the thing
          itself beside it.

          It absorbed the two sections that used to sit above: "Made for the
          wake" and "As quiet or as present as the family wants". The order
          of service and the tribute display both said the same things at
          less use, so the page said them twice. ── */}
      <section id="artefacts" className="w-full scroll-mt-20 bg-primary/5">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <SectionEyebrow className="mb-10 text-memorial">
            {t("memorials.artefacts.title")}
          </SectionEyebrow>
          {/* The homepage's text-left / media-right row (see "The record"
              on the landing page): grid, items-center, gap-8, two columns
              from lg.

              NOT grid-cols-2. Equal halves give each column ~472px at 1024,
              and PackVignette is a FIXED 624px at lg — a grid item cannot
              shrink below its min-content, so equal halves would grow the
              page by ~150px at exactly the width the two-column layout
              switches on. #567, #571 and this page's own hero have all been
              this bug. The media track is sized to the media instead
              (39rem = 624px), and the text track takes what is left, with
              minmax(0,·) so IT can shrink rather than the page.

              The frame comes off: the vignettes wrap themselves in
              Vignette's tinted, bordered box, which reads as a card on
              /features where each sits alone in a section. Beside a column
              of text it reads as a widget. The vignettes take no props, so
              the frame is stripped here rather than there — /features keeps
              its cards. */}
          <div className="space-y-16 lg:space-y-24">
            {ARTEFACTS.map(({ key, label, body, artefact }, i) => {
              // ALTERNATING SIDES. Four rows the same way round is a
              // column of text with a column of pictures beside it; the
              // eye stops reading and starts scanning. Swapping every
              // other row makes each one its own beat (founder,
              // 2026-08-26).
              //
              // Implemented as grid ORDER, not source order: the caption
              // stays first in the DOM on every row, so the reading and
              // tab order never depend on which way the row is facing.
              // Below lg both columns stack and the flag does nothing —
              // text always first, which is the order that makes sense
              // when the image is underneath it.
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
                    className={cn(
                      "max-w-md min-w-0",
                      mediaLeft && "lg:order-2"
                    )}
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
                      "min-w-0 [&_[data-vignette]]:max-w-none [&_[data-vignette]]:rounded-none [&_[data-vignette]]:border-0 [&_[data-vignette]]:bg-transparent",
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

      {/* ── Reassurances ── */}
      <section className="w-full">
        <div className="mx-auto grid w-full max-w-330 gap-8 px-6 py-16 sm:grid-cols-2 md:grid-cols-4">
          {ASSURANCES.map((item) => (
            <div key={item.label}>
              <p className="mb-1 font-medium text-foreground">{item.label}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For the gatekeepers this page is forwarded by ── */}
      <section className="w-full bg-primary/5">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
            {t("memorials.pro.title")}
          </h2>
          <p className="mb-6 max-w-2xl leading-relaxed text-muted-foreground">
            {t("memorials.pro.body")}
          </p>
          <Button asChild variant="outline">
            <a href="mailto:joseph.moffatt@favpoll.com">
              {t("memorials.pro.cta")}
            </a>
          </Button>
        </div>
      </section>

      {/* ── Close — the landing's purple monogram close, one line ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-330 px-6 py-16">
          <p className="mb-6 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            {t("memorials.close.headline")}
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/favpolls/new">{t("memorials.close.cta")}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
