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

export function WizardInfoStep({ w }: { w: WizardState }) {
  const [photoOpen, setPhotoOpen] = useState(false)

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

  const ph = ghostsFor(w.category)
  const nameLabel =
    w.who === "cause"
      ? "Cause"
      : w.category === "fundraiser"
        ? "Name or cause"
        : "Name"

  return (
    <div className="space-y-5">
      <WizardField label="Opening line">
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            className="md:text-base"
            value={w.openingLine}
            maxLength={50}
            placeholder={ph.openingLine}
            onChange={(e) => w.setOpeningLine(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <CharCounter value={w.openingLine} max={50} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      <WizardField label={nameLabel} required>
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            className="md:text-base"
            value={w.name}
            maxLength={40}
            placeholder={ph.name}
            onChange={(e) => w.setName(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <CharCounter value={w.name} max={40} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      <WizardField label="Context">
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            className="md:text-base"
            value={w.context}
            maxLength={40}
            placeholder={ph.context}
            onChange={(e) => w.setContext(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <CharCounter value={w.context} max={40} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
        <span className="font-medium">Photo</span>
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

      <FormProvider {...photoForm}>
        <HeroPhotoOverlay open={photoOpen} onOpenChange={setPhotoOpen} />
      </FormProvider>
    </div>
  )
}
