"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import type { Charity } from "@favpoll/types"

const MAX_CHARITIES = 3

export type RegisterPick = {
  registeredNumber: string
  displayName: string
  /** Row identity (founder, 2026-09-08) — enriched by the search route. */
  place?: string | null
  website?: string | null
}

type CharityStepProps = {
  charities: Charity[]
  value: string[]
  onChange: (v: string[]) => void
  search?: string
  /** Any-charity picker (consent-gate PR C): called when the organiser
   *  confirms a charity from the Charity Commission register results.
   *  Omit to hide the register results entirely. */
  onRegisterAdd?: (pick: RegisterPick) => Promise<void>
}

function websiteHref(website: string): string {
  return /^https?:\/\//.test(website) ? website : `https://${website}`
}

function websiteLabel(website: string): string {
  return website.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

export function CharityStep({
  charities,
  value,
  onChange,
  search,
  onRegisterAdd,
}: CharityStepProps) {
  const atMax = value.length >= MAX_CHARITIES
  const trimmed = (search ?? "").trim()
  const isApproved = (c: Charity) => c.consent_status === "approved"
  const visible = trimmed
    ? charities.filter((c) =>
        c.name.toLowerCase().includes(trimmed.toLowerCase())
      )
    : // THE EARNED SHELF (founder, 2026-09-08): the default cloud shows
      // only charities that have AGREED to receive pledges — privilege is
      // earned by consent, never by dev-era seeding. Everything else is
      // reachable by search (catalogue and the whole register). Selected
      // charities always stay visible so a pick can be reviewed or undone.
      charities.filter((c) => isApproved(c) || value.includes(c.id))

  // ── Charity Commission register search (debounced) ──
  const [registerResults, setRegisterResults] = useState<RegisterPick[]>([])
  const [registerTotal, setRegisterTotal] = useState(0)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [busyNumber, setBusyNumber] = useState<string | null>(null)
  // The confirm step (founder, 2026-09-08): a pick routes money, so a
  // register row shows its identity line once more before anything is
  // created. The row data already carries place + website, so the card
  // renders instantly — no second fetch.
  const [confirm, setConfirm] = useState<RegisterPick | null>(null)
  const registerActive = !!onRegisterAdd && trimmed.length >= 3

  useEffect(() => {
    setConfirm(null)
    if (!registerActive) {
      setRegisterResults([])
      setRegisterTotal(0)
      return
    }
    let cancelled = false
    setRegisterLoading(true)
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/charities/register-search?q=${encodeURIComponent(trimmed)}`
        )
        const data = res.ok ? await res.json() : { results: [], total: 0 }
        if (!cancelled) {
          setRegisterResults(data.results ?? [])
          setRegisterTotal(data.total ?? 0)
        }
      } catch {
        if (!cancelled) {
          setRegisterResults([])
          setRegisterTotal(0)
        }
      } finally {
        if (!cancelled) setRegisterLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed, registerActive])

  // Results already in the catalogue dedupe away (by number, then name)
  const knownNumbers = new Set(
    charities.map((c) => c.registered_number).filter(Boolean)
  )
  const knownNames = new Set(charities.map((c) => c.name.toLowerCase()))
  const freshResults = registerResults.filter(
    (r) =>
      !knownNumbers.has(r.registeredNumber) &&
      !knownNames.has(r.displayName.toLowerCase())
  )

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else if (!atMax) {
      onChange([...value, id])
    }
  }

  async function addFromRegister(pick: RegisterPick) {
    if (!onRegisterAdd || atMax || busyNumber) return
    setBusyNumber(pick.registeredNumber)
    try {
      await onRegisterAdd(pick)
      setConfirm(null)
    } finally {
      setBusyNumber(null)
    }
  }

  const noMatches =
    visible.length === 0 &&
    (!registerActive || (freshResults.length === 0 && !registerLoading))

  const rowClass = (selected: boolean) =>
    `h-auto min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left whitespace-normal ${
      selected ? "border-primary bg-primary/5" : "border-border bg-card"
    }`

  const siteLink = (website: string) => (
    <a
      href={websiteHref(website)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-card px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
      title={`Visit ${websiteLabel(website)}`}
    >
      <span className="hidden max-w-40 truncate sm:block">
        {websiteLabel(website)}
      </span>
      <ExternalLink className="size-3.5" aria-hidden="true" />
      <span className="sr-only">Visit {websiteLabel(website)}</span>
    </a>
  )

  return (
    <div>
      {confirm ? (
        /* CONFIRM (founder, 2026-09-08): the identity line once more —
           the last look before a charity is wired into the money path. */
        <div className="px-5 py-4">
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="font-medium text-foreground">{confirm.displayName}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {[`Charity no. ${confirm.registeredNumber}`, confirm.place]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {confirm.website && (
              <a
                href={websiteHref(confirm.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                {websiteLabel(confirm.website)}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={busyNumber !== null}
                onClick={() => void addFromRegister(confirm)}
              >
                {busyNumber ? "Adding…" : "Add this charity"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busyNumber !== null}
                onClick={() => setConfirm(null)}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      ) : noMatches ? (
        <p className="py-3 text-center text-sm text-muted-foreground">
          {registerActive
            ? `No registered charity matches “${trimmed}”.`
            : trimmed || !onRegisterAdd
              ? "No results."
              : "Search any UK charity — the whole Charity Commission register."}
        </p>
      ) : !trimmed ? (
        /* The approved shelf — a small known set, where pills belong. */
        <div className="flex flex-wrap gap-1.5 px-5 py-4">
          {visible.map((c) => (
            <Chip
              key={c.id}
              size="lg"
              selected={value.includes(c.id)}
              disabled={!value.includes(c.id) && atMax}
              title={
                isApproved(c)
                  ? "Has agreed to receive pledges through favpoll"
                  : undefined
              }
              onClick={() => toggle(c.id)}
            >
              {c.name}
            </Chip>
          ))}
        </div>
      ) : (
        /* SEARCH RESULTS AS ROWS (founder, 2026-09-08): names alone are
           ambiguous, so every row carries its charity number, place and
           website — the website link is the quickest identity check —
           and a register pick passes through the confirm step above. */
        <div className="flex flex-col gap-1.5 px-5 py-4">
          {visible.map((c) => {
            const selected = value.includes(c.id)
            return (
              <div key={c.id} className="flex items-stretch gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!selected && atMax}
                  className={rowClass(selected)}
                  onClick={() => toggle(c.id)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {c.name}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {c.registered_number
                        ? `Charity no. ${c.registered_number}`
                        : "On favpoll"}
                      {isApproved(c) && " · has agreed to receive pledges"}
                    </span>
                  </span>
                  {isApproved(c) && (
                    <span aria-hidden="true" className="shrink-0 text-primary">
                      ✓
                    </span>
                  )}
                </Button>
                {c.registered_website && siteLink(c.registered_website)}
              </div>
            )
          })}
          {registerActive &&
            freshResults.map((r) => (
              <div
                key={r.registeredNumber}
                className="flex items-stretch gap-1.5"
              >
                <Button
                  type="button"
                  variant="ghost"
                  disabled={atMax || busyNumber !== null}
                  className={rowClass(false)}
                  onClick={() => setConfirm(r)}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {r.displayName}
                    </span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {[`Charity no. ${r.registeredNumber}`, r.place]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </Button>
                {r.website && siteLink(r.website)}
              </div>
            ))}
        </div>
      )}

      {!confirm && registerActive && !noMatches && (
        <p className="px-5 pb-3 text-xs text-muted-foreground">
          {registerLoading
            ? "Searching the Charity Commission register…"
            : registerTotal > freshResults.length
              ? `Results from the Charity Commission register · ${registerTotal} matches — keep typing to narrow`
              : freshResults.length > 0
                ? "Results from the Charity Commission register"
                : null}
        </p>
      )}
    </div>
  )
}
