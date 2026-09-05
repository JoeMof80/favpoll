"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus } from "lucide-react"
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
import { createAppeal, updateAppeal } from "./actions"

// The appeal form, in the WIZARD INFO STEP's own grammar (founder mock,
// 2026-09-06): WizardField rows, in-field CharCounters, "e.g."
// placeholders, the dashed photo square, and the wizard-nav footer —
// hairline, actions right, primary last. This IS the future charity
// portal's surface behind the temporary gate (lib/appeals-admin). Slug
// and charity are immutable after creation: members lock onto both.

export type AppealFormInitial = {
  id?: string
  name: string
  slug: string
  charityId: string
  blurb: string
  photoUrl: string
  closesAt: string
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
  const [form, setForm] = useState<AppealFormInitial>(
    initial ?? {
      name: "",
      slug: "",
      charityId: defaultCharityId ?? "",
      blurb: "",
      photoUrl: "",
      closesAt: "",
      isListed: false,
    }
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const set = (f: keyof AppealFormInitial, v: string | boolean) =>
    setForm((p) => ({ ...p, [f]: v }))

  function submit() {
    setError(null)
    startTransition(async () => {
      const closesAt = form.closesAt
        ? new Date(form.closesAt).toISOString()
        : null
      const r = editing
        ? await updateAppeal(form.id!, {
            name: form.name,
            blurb: form.blurb,
            photoUrl: form.photoUrl,
            closesAt,
            isListed: form.isListed,
          })
        : await createAppeal({
            name: form.name,
            slug: form.slug,
            charityId: form.charityId,
            blurb: form.blurb,
            photoUrl: form.photoUrl,
            closesAt,
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
            onChange={(e) => set("name", e.target.value)}
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
            : "The appeal's address: favpoll.com/appeals/…"
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

      <WizardField
        label="Charity"
        required={!editing}
        hint={
          editing
            ? "Fixed — every member favpoll raises for it."
            : "Every favpoll under this appeal raises for it, always."
        }
      >
        <select
          value={form.charityId}
          disabled={editing}
          onChange={(e) => set("charityId", e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-50 md:text-base"
        >
          <option value="">Pick a charity…</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </WizardField>

      <WizardField
        label="Blurb"
        hint="A few sentences at the top of the appeal page."
      >
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

      <WizardField label="Photo" hint="Paste an image URL — optional.">
        <div className="flex items-start gap-3">
          {/* The wizard's dashed square, as a live preview */}
          <span
            aria-hidden="true"
            className={cn(
              "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border",
              form.photoUrl
                ? "border-border"
                : "border-dashed border-border-strong text-muted-foreground"
            )}
          >
            {form.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.photoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus className="size-6" />
            )}
          </span>
          <InputGroup className={cn(WIZARD_INPUT_SIZE, "flex-1 bg-background")}>
            <InputGroupInput
              className="md:text-base"
              value={form.photoUrl}
              placeholder="e.g. https://…"
              onChange={(e) => set("photoUrl", e.target.value)}
            />
          </InputGroup>
        </div>
      </WizardField>

      <WizardField
        label="Close date"
        hint="Members inherit it. Leave blank for an evergreen appeal — members then pick their own dates."
      >
        <InputGroup className={cn(WIZARD_INPUT_SIZE, "bg-background")}>
          <InputGroupInput
            type="datetime-local"
            className="md:text-base"
            value={form.closesAt}
            onChange={(e) => set("closesAt", e.target.value)}
          />
        </InputGroup>
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
    </div>
  )
}
