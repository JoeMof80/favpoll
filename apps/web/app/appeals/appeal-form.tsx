"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { FormProvider, useForm } from "react-hook-form"
import { ChevronDown, ImagePlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  WizardField,
  WIZARD_INPUT_SIZE,
} from "@/components/new-favpoll-wizard/wizard-field"
import { CharCounter } from "@/components/favpoll-form/edit-helpers"
import { HeroPhotoOverlay } from "@/components/favpoll-form/hero-photo-overlay"
import { DateTimePicker } from "@/components/favpoll-form/date-time-picker"
import { CLOSE_DATE_PRESETS } from "@/components/favpoll-form/date-helpers"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"
import { uploadPersonPhoto } from "@/app/favpolls/new/actions"
import { createAppeal, updateAppeal } from "./actions"

// The appeal form, in the WIZARD INFO STEP's own grammar (founder mock,
// 2026-09-06): WizardField rows, in-field CharCounters, "e.g."
// placeholders, and the REAL wizard controls — the dashed photo square
// opens HeroPhotoOverlay (crop and all; the file uploads on submit via
// uploadPersonPhoto, same bucket as favpoll heroes), the close date is
// the wizard's DateTimePicker (appeals add a clear-to-evergreen link the
// wizard doesn't need). Footer = wizard-nav: hairline, actions right,
// primary last. This IS the future charity portal's surface behind the
// temporary gate (lib/appeals-admin). Slug and charity are immutable
// after creation: members lock onto both.

export type AppealFormInitial = {
  id?: string
  name: string
  slug: string
  charityId: string
  blurb: string
  photoUrl: string
  closesAt: string // ISO or ""
  isListed: boolean
}

const NAME_MAX = 60
const SLUG_MAX = 40
const BLURB_MAX = 240

export function AppealForm({
  initial,
  charities,
  defaultCharityId,
}: {
  initial?: AppealFormInitial
  charities: { id: string; name: string }[]
  /** The charity-page door arrives with its charity preselected. */
  defaultCharityId?: string
}) {
  const router = useRouter()
  const editing = !!initial?.id
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    charityId: initial?.charityId ?? defaultCharityId ?? "",
    blurb: initial?.blurb ?? "",
    // Listed by default (founder, 2026-09-06): creation is gated and
    // charity-led, appeals are few, and the charity page is their shop
    // window — no flood risk (unlike member favpolls). The toggle
    // stays: unlisting is the retire mechanism (no delete) and the
    // quiet-launch lever.
    isListed: initial?.isListed ?? true,
  })
  const [closesAt, setClosesAt] = useState<Date | null>(
    initial?.closesAt ? new Date(initial.closesAt) : null
  )
  // The charity-page door preselects the charity — the dropdown is a
  // question already answered, so it hides and the charity lives in
  // the page eyebrow instead (founder, 2026-09-06). The row survives
  // only for the bare-URL fallback and edit mode.
  const charityKnown =
    !editing &&
    !!defaultCharityId &&
    charities.some((c) => c.id === defaultCharityId)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const set = (f: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [f]: v }))

  // The photo flow (HeroPhotoOverlay + crop) reads a form context; this
  // scoped form carries just photo/photoUrl/name for it — the wizard's
  // own arrangement (wizard-info-step.tsx).
  const photoForm = useForm<FavpollFormValues>({
    defaultValues: {
      name: initial?.name ?? "",
      photoUrl: initial?.photoUrl || undefined,
    },
  })
  const [photoOpen, setPhotoOpen] = useState(false)
  const photoFile = photoForm.watch("photo") as File | undefined
  const photoPreview = photoForm.watch("photoUrl") ?? null

  function submit() {
    setError(null)
    startTransition(async () => {
      let photoUrl = ""
      if (photoFile) {
        const fd = new FormData()
        fd.append("photo", photoFile)
        try {
          photoUrl = await uploadPersonPhoto(fd)
        } catch {
          setError("The photo failed to upload — try again.")
          return
        }
      } else if (photoPreview && !photoPreview.startsWith("blob:")) {
        photoUrl = photoPreview
      }
      const closes = closesAt ? closesAt.toISOString() : null
      const r = editing
        ? await updateAppeal(initial!.id!, {
            name: form.name,
            blurb: form.blurb,
            photoUrl,
            closesAt: closes,
            isListed: form.isListed,
          })
        : await createAppeal({
            name: form.name,
            slug: form.slug,
            charityId: form.charityId,
            blurb: form.blurb,
            photoUrl,
            closesAt: closes,
            isListed: form.isListed,
          })
      if (r.error) setError(r.error)
      else
        router.push(
          `/appeals/${editing ? form.slug : (r as { slug: string }).slug}`
        )
    })
  }

  return (
    <div className="space-y-5">
      <WizardField label="Name" required>
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            className="md:text-base"
            value={form.name}
            maxLength={NAME_MAX}
            placeholder="e.g. The Midnight Walk"
            onChange={(e) => {
              set("name", e.target.value)
              photoForm.setValue("name", e.target.value)
            }}
          />
          <InputGroupAddon align="inline-end">
            <CharCounter value={form.name} max={NAME_MAX} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      <WizardField
        label="Link name"
        required={!editing}
        hint={
          editing
            ? "Fixed — members carry this link."
            : `favpoll.com/appeals/${form.slug || "…"}`
        }
      >
        <InputGroup
          className={cn(
            WIZARD_INPUT_SIZE,
            "bg-background",
            editing && "opacity-50"
          )}
        >
          <InputGroupInput
            className="font-mono md:text-base"
            value={form.slug}
            maxLength={SLUG_MAX}
            disabled={editing}
            placeholder="e.g. midnight-walk"
            onChange={(e) => set("slug", e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <CharCounter value={form.slug} max={SLUG_MAX} />
          </InputGroupAddon>
        </InputGroup>
      </WizardField>

      {(editing || !charityKnown) && (
        <WizardField
          label="Charity"
          required={!editing}
          hint={
            editing
              ? "Fixed — every member favpoll raises for it."
              : "Every favpoll under this appeal raises for it, always."
          }
        >
          <div className="relative">
            <select
              value={form.charityId}
              disabled={editing}
              onChange={(e) => set("charityId", e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-border bg-background pr-10 pl-3 text-sm disabled:opacity-50 md:text-base"
            >
              <option value="">Pick a charity…</option>
              {charities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </WizardField>
      )}

      <WizardField label="About">
        <div className="relative">
          <Textarea
            value={form.blurb}
            maxLength={BLURB_MAX}
            onChange={(e) => set("blurb", e.target.value)}
            rows={3}
            className="bg-background pr-14 md:text-base"
          />
          <CharCounter
            value={form.blurb}
            max={BLURB_MAX}
            className="absolute right-3 bottom-2.5"
          />
        </div>
      </WizardField>

      {/* The wizard's own photo control: the square IS the button
          (founder, 2026-09-01) — tap it to open the crop overlay. */}
      <div className="block space-y-1.5 text-sm sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:space-y-0 sm:gap-x-6">
        <span className="block font-medium">Photo</span>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPhotoOpen(true)}
          aria-label={photoPreview ? "Change photo" : "Add a photo"}
          className={cn(
            "h-20 w-20 shrink-0 overflow-hidden rounded-xl p-0",
            !photoPreview &&
              "border-dashed border-border-strong text-muted-foreground"
          )}
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="size-6" aria-hidden="true" />
          )}
        </Button>
      </div>

      <WizardField
        label="Close date"
        hint="Leave blank for an evergreen appeal."
      >
        <div className="flex flex-wrap items-center gap-3">
          <DateTimePicker
            value={closesAt ?? undefined}
            onChange={setClosesAt}
            size="lg"
            presets={CLOSE_DATE_PRESETS}
          />
          {closesAt && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setClosesAt(null)}
            >
              Clear — evergreen
            </Button>
          )}
        </div>
      </WizardField>

      <WizardField
        label="Listed"
        hint={
          form.isListed
            ? "Appears on the charity's page."
            : "Reachable only by its link."
        }
      >
        <div className="flex min-h-11 items-center">
          <Switch
            checked={form.isListed}
            onCheckedChange={(v) => set("isListed", v)}
            aria-label="Listed on the charity page"
          />
        </div>
      </WizardField>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* The wizard-nav footer: hairline, actions right, primary last */}
      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => router.back()}
          className="h-11 px-6 md:text-base"
        >
          Cancel
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="h-11 px-6 md:text-base"
        >
          {isPending ? "Saving…" : editing ? "Save changes" : "Create appeal"}
        </Button>
      </div>

      <FormProvider {...photoForm}>
        <HeroPhotoOverlay open={photoOpen} onOpenChange={setPhotoOpen} />
      </FormProvider>
    </div>
  )
}
