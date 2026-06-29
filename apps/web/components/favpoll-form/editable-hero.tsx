"use client"

import { useState } from "react"
import { useWatch, useFormContext } from "react-hook-form"
import { EditBadge } from "./edit-helpers"
import type { FavpollFormValues } from "./schema"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { EditableField } from "@/components/editable-field"
import { cn } from "@/lib/utils"
import { HeroCauseLabelOverlay } from "./hero-cause-label-overlay"
import { HeroNameOverlay } from "./hero-name-overlay"
import { HeroContextOverlay } from "./hero-context-overlay"
import { HeroOpeningLineOverlay } from "./hero-opening-line-overlay"
import { HeroAboutOverlay } from "./hero-about-overlay"
import { HeroPhotoOverlay } from "./hero-photo-overlay"

type Props = {
  isGenerating?: boolean
  onRegenerate?: () => void
  aboutPlaceholder?: string
}

export function EditableHero({
  isGenerating = false,
  onRegenerate,
  aboutPlaceholder = "",
}: Props) {
  const [causeLabelOpen, setCauseLabelOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [openingLineOpen, setOpeningLineOpen] = useState(false)

  const form = useFormContext<FavpollFormValues>()
  const values = useWatch({ control: form.control })

  const name = values.name ?? ""
  const context = values.context ?? ""
  const openingLine = values.openingLine ?? ""
  const about = values.about ?? ""
  const photo = values.photo as File | undefined
  const photoUrl = values.photoUrl
  const causeLabel = values.causeLabel ?? ""
  const subject = (values.subject ?? "someone") as "someone" | "cause"

  const resolvedPhotoUrl = photo
    ? URL.createObjectURL(photo)
    : (photoUrl ?? null)

  return (
    <>
      {/* ── Hero (static — no scroll animations in edit mode) ─────────────── */}
      <div className="pt-6 md:pt-16">
        <div className="flex items-start gap-4 md:gap-6">
          <div className="min-w-0 flex-1">
            {/* Opening line */}
            <EditableField
              onClick={() => setOpeningLineOpen(true)}
              className="w-full"
            >
              <SectionEyebrow
                variant="muted"
                className="flex h-8 items-center truncate wrap-break-word"
              >
                {openingLine || "Enter opening line"}
              </SectionEyebrow>
            </EditableField>

            {/* Name / Cause label */}
            <EditableField
              onClick={
                subject === "cause"
                  ? () => setCauseLabelOpen(true)
                  : () => setNameOpen(true)
              }
            >
              <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
                {subject === "cause"
                  ? causeLabel || (
                      <span className="text-muted-foreground/50">
                        What are you raising for?
                      </span>
                    )
                  : name || (
                      <span className="text-muted-foreground/50">
                        Enter Name
                      </span>
                    )}
              </h1>
            </EditableField>

            {/* Context */}
            {subject !== "cause" && (
              <EditableField
                onClick={() => setContextOpen(true)}
                className="mt-2"
              >
                <p
                  className={cn(
                    "truncate text-xl font-normal whitespace-normal md:text-2xl",
                    context ? "text-[#534AB7]" : "text-muted-foreground/40"
                  )}
                >
                  {context || "Enter dates or other context"}
                </p>
              </EditableField>
            )}
          </div>

          {/* Avatar */}
          {subject !== "cause" && (
            <Button
              type="button"
              variant="ghost"
              className="group relative h-auto shrink-0 rounded-xl border-dotted border-primary/20 p-0 hover:border-solid hover:border-primary/60 hover:bg-transparent focus-visible:border-solid focus-visible:border-primary/60 focus-visible:bg-transparent"
              onClick={() => setPhotoOpen(true)}
            >
              <ProtagonistAvatar
                name={name || "Name"}
                photoUrl={resolvedPhotoUrl}
                className="border-0"
              />
              <EditBadge className="right-0 bottom-0" />
            </Button>
          )}
        </div>
      </div>

      {/* About */}
      <div className="relative z-0 mt-4 mb-5 md:mb-10">
        <div className="flex w-full flex-col items-start">
          <EditableField
            onClick={() => setAboutOpen(true)}
            className="w-full text-left"
          >
            {about ? (
              <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
                {about}
              </p>
            ) : isGenerating ? (
              <div className="w-full animate-pulse space-y-1.5">
                <div className="h-4 w-full rounded-full bg-muted/60" />
                <div className="h-4 w-4/5 rounded-full bg-muted/60" />
              </div>
            ) : (
              <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-muted-foreground/40">
                {aboutPlaceholder || "About"}
              </p>
            )}
          </EditableField>
        </div>
      </div>

      {/* ── Field overlays ────────────────────────────────────────────────── */}

      <HeroCauseLabelOverlay
        open={causeLabelOpen}
        onOpenChange={setCauseLabelOpen}
      />
      <HeroNameOverlay open={nameOpen} onOpenChange={setNameOpen} />
      <HeroContextOverlay open={contextOpen} onOpenChange={setContextOpen} />
      <HeroOpeningLineOverlay
        open={openingLineOpen}
        onOpenChange={setOpeningLineOpen}
      />
      <HeroAboutOverlay
        open={aboutOpen}
        onOpenChange={setAboutOpen}
        isGenerating={isGenerating}
        onRegenerate={onRegenerate}
        aboutPlaceholder={aboutPlaceholder}
      />
      <HeroPhotoOverlay open={photoOpen} onOpenChange={setPhotoOpen} />
    </>
  )
}
