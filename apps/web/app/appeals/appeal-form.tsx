"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createAppeal, updateAppeal } from "./actions"

// The appeal form — creation and editing share it, in the wizard
// Details step's own row grammar (180px label column, 44px controls,
// hint sentences under). This IS the future charity portal's surface;
// today it sits behind the temporary gate (lib/appeals-admin). Slug
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

const ROW =
  "block space-y-1.5 text-sm sm:grid sm:min-h-11 sm:grid-cols-[180px_1fr] sm:items-start sm:space-y-0 sm:gap-x-6"
const LABEL = "font-medium sm:flex sm:min-h-11 sm:items-center"

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
    <div className="space-y-6">
      <div className={ROW}>
        <span className={LABEL}>Name</span>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="The Midnight Walk"
          className="h-11 bg-background md:text-base"
        />
      </div>

      <div className={ROW}>
        <span className={LABEL}>Link name{editing && " *"}</span>
        <div className="space-y-1.5">
          <Input
            value={form.slug}
            disabled={editing}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="midnight-walk"
            className="h-11 bg-background font-mono md:text-base"
          />
          <p className="text-muted-foreground">
            {editing
              ? "Fixed — members carry this link."
              : `The appeal's address: /appeals/…`}
          </p>
        </div>
      </div>

      <div className={ROW}>
        <span className={LABEL}>Charity{editing && " *"}</span>
        <div className="space-y-1.5">
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
          <p className="text-muted-foreground">
            {editing
              ? "Fixed — every member favpoll raises for it."
              : "Every favpoll under this appeal raises for it, always."}
          </p>
        </div>
      </div>

      <div className={ROW}>
        <span className={LABEL}>Blurb</span>
        <div className="space-y-1.5">
          <Textarea
            value={form.blurb}
            onChange={(e) => set("blurb", e.target.value)}
            rows={3}
            className="bg-background md:text-base"
          />
          <p className="text-muted-foreground">
            A few sentences at the top of the appeal page.
          </p>
        </div>
      </div>

      <div className={ROW}>
        <span className={LABEL}>Photo</span>
        <Input
          value={form.photoUrl}
          onChange={(e) => set("photoUrl", e.target.value)}
          placeholder="https://… (optional)"
          className="h-11 bg-background md:text-base"
        />
      </div>

      <div className={ROW}>
        <span className={LABEL}>Close date</span>
        <div className="space-y-1.5">
          <Input
            type="datetime-local"
            value={form.closesAt}
            onChange={(e) => set("closesAt", e.target.value)}
            className="h-11 bg-background md:text-base"
          />
          <p className="text-muted-foreground">
            Members inherit it. Leave blank for an evergreen appeal — members
            then pick their own dates.
          </p>
        </div>
      </div>

      <div className={ROW}>
        <span className={LABEL}>Listed</span>
        <div className="space-y-1.5">
          <div className="sm:flex sm:min-h-11 sm:items-center">
            <Switch
              checked={form.isListed}
              onCheckedChange={(v) => set("isListed", v)}
              aria-label="Listed on the charity page"
            />
          </div>
          <p className="text-muted-foreground">
            {form.isListed
              ? "Appears on the charity's page."
              : "Reachable only by its link."}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <Button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="h-11 px-6 md:text-base"
        >
          {isPending ? "Saving…" : editing ? "Save changes" : "Create appeal"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={isPending}
          onClick={() => router.back()}
          className="h-11 px-6 md:text-base"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
