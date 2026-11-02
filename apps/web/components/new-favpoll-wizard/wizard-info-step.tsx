"use client"

import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { ImagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { CharCounter } from "@/components/favpoll-form/edit-helpers"
import { HeroPhotoOverlay } from "@/components/favpoll-form/hero-photo-overlay"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"
import { WizardField, WIZARD_INPUT_SIZE } from "./wizard-field"
import { ghostsFor } from "./wizard-placeholders"
import type { WizardState } from "./use-wizard-state"
import { cn } from "@/lib/utils"
import { FIELD_LABELS, FIELD_LIMITS, nameLabel } from "@/lib/favpoll-fields"

export function WizardInfoStep({ w }: { w: WizardState }) {
  const [photoOpen, setPhotoOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)

  // The photo flow (HeroPhotoOverlay + crop) reads a form context; this
  // scoped form carries just photo/photoUrl/name for it.
  const photoForm = useForm<FavpollFormValues>({
    defaultValues: { name: "" },
  })
  const {
    setName: syncName,
    setPhoto,
    setPhotoUrl,
  } = {
    setName: (v: string) => photoForm.setValue("name", v),
    setPhoto: w.setPhoto,
    setPhotoUrl: w.setPhotoUrl,
  }
  useEffect(() => {
    syncName(w.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w.name])
  useEffect(() => {
    const sub = photoForm.watch((v) => {
      setPhoto((v.photo as File | undefined) ?? null)
      setPhotoUrl(v.photoUrl ?? null)
    })
    return () => sub.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoForm])

  // THE BANNER's own scoped form. The overlay only speaks in
  // photo/photoUrl, so the banner borrows those names and this watch
  // translates — the same trick manage/banner-row uses. Its File waits
  // for an account like the photo's: the wizard runs signed out (#1160).
  const bannerForm = useForm<FavpollFormValues>({
    defaultValues: { name: "" },
  })
  useEffect(() => {
    const sub = bannerForm.watch((v) => {
      w.setBannerFile((v.photo as File | undefined) ?? null)
      w.setBannerUrl(v.photoUrl ?? null)
    })
    return () => sub.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerForm])

  /** What the organiser has chosen, before any upload has happened.
   *  Made once per File and revoked after: calling createObjectURL in
   *  render mints a new blob on every keystroke elsewhere on the step and
   *  never releases one. */
  const [bannerObjectUrl, setBannerObjectUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!w.bannerFile) {
      setBannerObjectUrl(null)
      return
    }
    const url = URL.createObjectURL(w.bannerFile)
    setBannerObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [w.bannerFile])
  const bannerPreview = bannerObjectUrl ?? w.bannerUrl

  const ph = ghostsFor(w.category)
  const nameLabelText = nameLabel(w.who, w.category)

  return (
    <div className="space-y-5">
      <WizardField label={FIELD_LABELS.openingLine}>
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            className="md:text-base"
            value={w.openingLine}
            maxLength={FIELD_LIMITS.openingLine}
            placeholder={ph.openingLine}
            onChange={(e) => w.setOpeningLine(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <CharCounter value={w.openingLine} max={FIELD_LIMITS.openingLine} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      <WizardField label={nameLabelText} required>
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            className="md:text-base"
            value={w.name}
            maxLength={FIELD_LIMITS.name}
            placeholder={ph.name}
            onChange={(e) => w.setName(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <CharCounter value={w.name} max={FIELD_LIMITS.name} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      <WizardField label={FIELD_LABELS.context}>
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            className="md:text-base"
            value={w.context}
            maxLength={FIELD_LIMITS.context}
            placeholder={ph.context}
            onChange={(e) => w.setContext(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <CharCounter value={w.context} max={FIELD_LIMITS.context} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
        <span className="block font-medium">{FIELD_LABELS.photo}</span>
        {/* The avatar IS the button (founder, 2026-09-01): tap the photo —
            or the empty slot — to open the crop overlay. Same rounded-xl
            shape the page's ProtagonistAvatar wears, so what you press is
            what the favpoll shows. */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setPhotoOpen(true)}
          aria-label={w.photoUrl ? "Change photo" : "Add a photo"}
          // No bespoke hover — the outline button's own quiet hover, the
          // same as the date trigger's (founder, 2026-09-01: the ring and
          // tint read as foreign next to the rest of the form).
          className={cn(
            "h-20 w-20 shrink-0 overflow-hidden rounded-xl p-0",
            !w.photoUrl &&
              "border-dashed border-border-strong text-muted-foreground"
          )}
        >
          {w.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={w.photoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="size-6" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* THE BANNER, cause favpolls only and never required: the subject
          of a cause is a hall, a band, a room — the shapes the 80px square
          cannot hold — while a person's subject is a face, which it can.
          One mandatory crop per favpoll is enough (the photo became
          mandatory 2026-10-29), so this says "Optional" and means it:
          a favpoll without one renders exactly as it did before banners
          existed. See references/hero-banner-2026-10-29.md. */}
      {w.isCause && (
        <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
          <span className="block font-medium">
            {FIELD_LABELS.banner}
            <span className="ml-1 font-normal text-muted-foreground">
              Optional
            </span>
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={() => setBannerOpen(true)}
            aria-label={bannerPreview ? "Change banner" : "Add a banner"}
            className={cn(
              "h-16 w-48 shrink-0 overflow-hidden rounded-lg p-0",
              !bannerPreview &&
                "border-dashed border-border-strong text-muted-foreground"
            )}
          >
            {bannerPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerPreview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus className="size-6" aria-hidden="true" />
            )}
          </Button>
        </div>
      )}

      <FormProvider {...photoForm}>
        <HeroPhotoOverlay open={photoOpen} onOpenChange={setPhotoOpen} />
      </FormProvider>

      <FormProvider {...bannerForm}>
        <HeroPhotoOverlay
          open={bannerOpen}
          onOpenChange={setBannerOpen}
          aspect={3}
          label="Banner"
        />
      </FormProvider>
    </div>
  )
}
