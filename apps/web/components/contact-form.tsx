"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const ROLES = [
  "a charity",
  "a partner",
  "press",
  "a will writer",
  "something else",
]

// A comfortable, roomier field than the app's dense h-8 default — this is a
// public form on a marketing page, not a packed dialog.
const FIELD = "h-11 text-base"
// Native <select> (no shadcn Select component) styled to match, with room for
// the chevron overlay.
const SELECT_CLASSES =
  "h-11 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent px-3 pr-10 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type Status = "idle" | "sending" | "sent" | "error"

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("sending")
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      role: String(data.get("role") ?? ""),
      message: String(data.get("message") ?? ""),
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => null)
        setError(b?.error ?? "Something went wrong. Please try again.")
        setStatus("error")
        return
      }
      form.reset()
      setStatus("sent")
    } catch {
      setError("Something went wrong. Please try again.")
      setStatus("error")
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-xl border border-border bg-card p-8 text-center"
      >
        <p className="text-lg font-medium text-foreground">
          Thank you — your message is on its way.
        </p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          We&apos;ll be in touch by email.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            maxLength={200}
            className={FIELD}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            className={FIELD}
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="contact-role">I&apos;m getting in touch as…</Label>
          <div className="relative">
            <select
              id="contact-role"
              name="role"
              defaultValue=""
              className={SELECT_CLASSES}
            >
              <option value="" disabled>
                Pick one…
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            maxLength={5000}
            className="min-h-32 text-base"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6">
        <Button
          type="submit"
          size="lg"
          disabled={status === "sending"}
          className="w-full sm:w-auto"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  )
}
