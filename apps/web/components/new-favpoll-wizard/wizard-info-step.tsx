"use client"

import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { Check, Mars, NonBinary, Ribbon, UserRound, Venus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { GroupIcon, PairIcon } from "@/components/icons/people"
import { CharCounter } from "@/components/favpoll-form/edit-helpers"
import { HeroPhotoOverlay } from "@/components/favpoll-form/hero-photo-overlay"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"
import type { WhoValue } from "@/components/favpoll-form/generate-example-dialog"
import { WizardField, WIZARD_INPUT_SIZE } from "./wizard-field"
import { ghostsFor } from "./wizard-placeholders"
import type { WizardState } from "./use-wizard-state"
import { cn } from "@/lib/utils"

// The gendered who icons (f8bff8f) and the founder-drawn Pair/Group
// figures (components/icons/people.tsx). The TRIGGER reflects the
// selection — the neutral single person until a who is chosen; the menu
// items carry their glyphs (founder, prototype round 36).
const WHO_ICONS: Record<WhoValue, React.ElementType> = {
  he: Mars,
  she: Venus,
  they: NonBinary,
  couple: PairIcon,
  group: GroupIcon,
  cause: Ribbon,
}

const WHO_LABELS: Record<WhoValue, string> = {
  he: "He",
  she: "She",
  they: "They",
  couple: "Pair",
  group: "Group",
  cause: "Cause",
}

const PRONOUN_ORDER: WhoValue[] = ["he", "she", "they", "couple", "group"]

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

  const ph = ghostsFor(w.category, w.who)
  const WhoIcon = w.who ? WHO_ICONS[w.who] : UserRound
  const nameLabel =
    w.who === "cause"
      ? "Cause"
      : w.category === "fundraiser"
        ? "Name or cause"
        : "Name"

  return (
    <div className="space-y-5">
      <WizardField
        label="Opening line"
        info="Replaces the default opening prefix."
      >
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

      <WizardField
        label={nameLabel}
        required
        info="Shown throughout the favpoll."
      >
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            className="md:text-base"
            value={w.name}
            maxLength={40}
            placeholder={ph.name}
            onChange={(e) => w.setName(e.target.value)}
          />
          {/* !mr-0: the inline-end addon pulls itself -0.3rem right when
              it holds a button, which misaligns the counter with its
              neighbours (measured, prototype round 41). */}
          <InputGroupAddon align="inline-end" className="!mr-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={
                    w.who
                      ? `Who: ${WHO_LABELS[w.who]}`
                      : "Who is this favpoll for?"
                  }
                  className="text-muted-foreground/60 hover:text-foreground"
                >
                  <WhoIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {PRONOUN_ORDER.map((k) => {
                  const Icon = WHO_ICONS[k]
                  return (
                    <DropdownMenuItem key={k} onClick={() => w.handleWho(k)}>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{WHO_LABELS[k]}</span>
                      {w.who === k && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => w.handleWho("cause")}>
                  <Ribbon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">Cause</span>
                  {w.who === "cause" && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CharCounter value={w.name} max={40} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      <WizardField label="Context" info="Dates, years, or other context.">
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
        <span className="flex items-center gap-3">
          {w.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={w.photoUrl}
              alt=""
              className="h-11 w-11 rounded-lg border border-border object-cover"
            />
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setPhotoOpen(true)}
          >
            {w.photoUrl ? "Change photo" : "Add a photo"}
          </Button>
        </span>
      </div>

      <FormProvider {...photoForm}>
        <HeroPhotoOverlay open={photoOpen} onOpenChange={setPhotoOpen} />
      </FormProvider>
    </div>
  )
}
