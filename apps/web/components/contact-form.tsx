"use client"

import { useState } from "react"
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

// Matches ui/Input's resting style (native <select> has no shadcn component).
const SELECT_CLASSES =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"

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
        className="rounded-lg border border-border bg-secondary/40 px-5 py-6"
      >
        <p className="text-base font-medium text-foreground">
          Thank you — your message is on its way.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll be in touch by email.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          name="name"
          required
          autoComplete="name"
          maxLength={200}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={200}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-role">I&apos;m getting in touch as…</Label>
        <select
          id="contact-role"
          name="role"
          defaultValue=""
          className={SELECT_CLASSES}
        >
          <option value="" disabled>
            Choose one…
          </option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={status === "sending"}
        className="self-start"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  )
}
