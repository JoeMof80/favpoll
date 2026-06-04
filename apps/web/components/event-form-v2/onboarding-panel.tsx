"use client"

import { CalendarIcon, Clock2Icon, EyeIcon } from "lucide-react"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function MockLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground">{children}</p>
}

function MockField({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-[#D3D1C7] bg-white px-3 text-sm",
        className
      )}
    >
      {children}
    </div>
  )
}

function MockFieldGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <MockLabel>{label}</MockLabel>
      {children}
    </div>
  )
}

export function OnboardingPanel({
  onHowItWorks,
}: {
  onHowItWorks: () => void
}) {
  return (
    <div className="mx-auto min-h-full max-w-5xl space-y-8 bg-background p-16 drop-shadow-lg">
      <header className="space-y-3">
        <h2 className="text-[20px] leading-tight font-medium">
          Honour. Love. Charity.
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          favpoll intersects three virtues — who to <em>honour</em>, what they{" "}
          <em>love</em>, and which <em>charity</em> to gift, in their name.
        </p>
      </header>

      <Separator className="bg-[#AFA9EC]/40" />

      <section
        aria-labelledby="section-honour"
        className="grid items-start gap-8 md:grid-cols-2"
      >
        <div className="space-y-2">
          <SectionEyebrow>HONOUR</SectionEyebrow>
          <h3 id="section-honour" className="text-base font-medium">
            Tell their story
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Their name, photo and a few lines about the occasion. Hint at their
            favpoll topic and chosen cause, if you like. Placeholders are there
            to help if you need inspiration along the way.
          </p>
        </div>
        <div className="space-y-3 rounded-lg bg-muted p-6">
          <MockFieldGroup label="Name">
            <MockField className="h-9">
              <span>Mary Poppins</span>
            </MockField>
          </MockFieldGroup>
          <MockFieldGroup label="Photo">
            <MockField className="h-9">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mary-poppins.png"
                alt="Mary Poppins"
                className="h-6 w-6 shrink-0 rounded-full object-cover object-top"
              />
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                business-portrait-woman.jpg
              </span>
              <EyeIcon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted-foreground/50"
              />
            </MockField>
          </MockFieldGroup>
          <MockFieldGroup label="About">
            <div className="rounded-lg border border-[#D3D1C7] bg-white px-3 py-2 text-sm leading-relaxed">
              Mary arrived by umbrella when the wind changed, with a cheery
              disposition and rosy cheeks. She has a surprising number of
              favourite things and helps the medicine go down at Great Ormond
              Street Hospital.
            </div>
          </MockFieldGroup>
          <MockFieldGroup label="Context">
            <MockField className="h-9">
              <span className="flex-1">Practically perfect in every way</span>
              <EyeIcon
                className="h-4 w-4 shrink-0 text-muted-foreground/50"
                aria-hidden="true"
              />
            </MockField>
          </MockFieldGroup>
        </div>
      </section>

      <Separator className="bg-[#AFA9EC]/20" />

      <section
        aria-labelledby="section-love"
        className="grid items-start gap-8 md:grid-cols-2"
      >
        <div className="space-y-2">
          <SectionEyebrow>LOVE</SectionEyebrow>
          <h3 id="section-love" className="text-base font-medium">
            Pick a topic
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Something meaningful to them, the occasion and the cause. If you
            know their favourite, share it in the reveal field — guests see it
            after pledging, as a personal gift from whoever is being celebrated.
          </p>
        </div>
        <div className="space-y-3 rounded-lg bg-muted p-6">
          <MockFieldGroup label="Topic">
            <MockField className="h-9">
              <span className="rounded-full bg-[#534AB7] px-3 py-1 text-xs text-white">
                Favourite Things
              </span>
            </MockField>
          </MockFieldGroup>
          <MockFieldGroup label="The reveal">
            <div className="rounded-lg border border-[#D3D1C7] bg-white px-3 py-2 text-sm leading-relaxed text-[#26215C]">
              Raindrops on roses. We don&apos;t know why. She never explained.
            </div>
          </MockFieldGroup>
        </div>
      </section>

      <Separator className="bg-[#AFA9EC]/20" />

      <section
        aria-labelledby="section-charity"
        className="grid items-start gap-8 md:grid-cols-2"
      >
        <div className="space-y-2">
          <SectionEyebrow>CHARITY</SectionEyebrow>
          <h3 id="section-charity" className="text-base font-medium">
            Choose a cause
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            All pledges go directly to your charity on the close date — up to
            three per event.
          </p>
        </div>
        <div className="space-y-3 rounded-lg bg-muted p-6">
          <MockFieldGroup label="Charity">
            <MockField className="h-9">
              <span className="rounded-full bg-[#534AB7] px-3 py-1 text-xs text-white">
                Great Ormond Street Hospital
              </span>
            </MockField>
          </MockFieldGroup>
          <MockFieldGroup label="Close date">
            <div className="flex gap-2">
              <MockField className="h-9 flex-1">
                <CalendarIcon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted-foreground/50"
                />
                <span>9 Jun 2026</span>
              </MockField>
              <MockField className="h-9 w-28">
                <span className="flex-1 tabular-nums">19:32</span>
                <Clock2Icon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-muted-foreground/50"
                />
              </MockField>
            </div>
          </MockFieldGroup>
        </div>
      </section>

      <div className="pt-2 text-center">
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-[13px] text-muted-foreground hover:text-foreground"
          onClick={onHowItWorks}
        >
          How favpoll works →
        </Button>
      </div>
    </div>
  )
}
