"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createAppeal, updateAppeal } from "./actions"

// The appeal form — creation and editing share it. This IS the future
// charity portal's core surface; today it sits behind the temporary
// env gate (lib/appeals-admin). Slug and charity are immutable after
// creation: members lock onto both.

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

export function AppealForm({
  initial,
  charities,
}: {
  initial?: AppealFormInitial
  charities: { id: string; name: string }[]
}) {
  const router = useRouter()
  const editing = !!initial?.id
  const [form, setForm] = useState<AppealFormInitial>(
    initial ?? {
      name: "",
      slug: "",
      charityId: "",
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

  const row = "block space-y-1.5 text-sm"
  return (
    <div className="space-y-5">
      <label className={row}>
        <span className="font-medium">Name</span>
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="The Midnight Walk"
          className="h-11 md:text-base"
        />
      </label>
      <label className={row}>
        <span className="font-medium">
          Link name{" "}
          <span className="font-normal text-muted-foreground">
            — /appeals/…{editing && " (fixed)"}
          </span>
        </span>
        <Input
          value={form.slug}
          disabled={editing}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="midnight-walk"
          className="h-11 md:text-base"
        />
      </label>
      <label className={row}>
        <span className="font-medium">
          Charity
          {editing && (
            <span className="font-normal text-muted-foreground"> (fixed)</span>
          )}
        </span>
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
      </label>
      <label className={row}>
        <span className="font-medium">
          Blurb{" "}
          <span className="font-normal text-muted-foreground">
            — a few sentences on the appeal page
          </span>
        </span>
        <Textarea
          value={form.blurb}
          onChange={(e) => set("blurb", e.target.value)}
          rows={3}
        />
      </label>
      <label className={row}>
        <span className="font-medium">
          Close date{" "}
          <span className="font-normal text-muted-foreground">
            — blank for an evergreen appeal
          </span>
        </span>
        <Input
          type="datetime-local"
          value={form.closesAt}
          onChange={(e) => set("closesAt", e.target.value)}
          className="h-11 md:text-base"
        />
      </label>
      <label className="flex items-center gap-3 text-sm">
        <Switch
          checked={form.isListed}
          onCheckedChange={(v) => set("isListed", v)}
        />
        <span className="font-medium">Listed on the charity page</span>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        type="button"
        disabled={isPending}
        onClick={submit}
        className="h-11 px-6 md:text-base"
      >
        {isPending ? "Saving…" : editing ? "Save changes" : "Create appeal"}
      </Button>
    </div>
  )
}
