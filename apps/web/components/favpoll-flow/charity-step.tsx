"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
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
   *  picks a charity from the Charity Commission register results.
   *  Omit to hide the register results entirely. */
  onRegisterAdd?: (pick: RegisterPick) => Promise<void>
}

function websiteHref(website: string): string {
  return /^https?:\/\//.test(website) ? website : `https://${website}`
}

function websiteLabel(website: string): string {
  return website.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

/** Logo when we hold one, initial tile otherwise — the charity-row idiom,
 * sized for the picker. Register results never have a logo (the register
 * holds no imagery); the tile keeps every row's geometry identical. */
function Avatar({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt=""
      className="size-10 shrink-0 rounded object-contain"
    />
  ) : (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded bg-primary/10 text-sm font-medium text-primary"
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  )
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
    : // THE EARNED SHELF (founder, 2026-09-08): the default list shows
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
  const registerActive = !!onRegisterAdd && trimmed.length >= 3

  useEffect(() => {
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

  // A tap selects (founder, 2026-09-08: "if we're clicking, we're
  // selecting") — the row itself already carries the identity line
  // (number · place · website), so there is no confirm step.
  async function addFromRegister(pick: RegisterPick) {
    if (!onRegisterAdd || atMax || busyNumber) return
    setBusyNumber(pick.registeredNumber)
    try {
      await onRegisterAdd(pick)
    } finally {
      setBusyNumber(null)
    }
  }

  const noMatches =
    visible.length === 0 &&
    (!registerActive || (freshResults.length === 0 && !registerLoading))

  // ONE row grammar everywhere (founder, 2026-09-08): the pill cloud is
  // gone — the default list is the onboarded charities in the SAME row
  // form as search results (avatar, identity line, website link), so
  // typing filters the list rather than switching layouts. The website
  // link lives INSIDE the card (a sibling of the pick button, never
  // nested), so websiteless rows leave no ragged edge.
  const rowCard = (selected: boolean) =>
    `flex items-center rounded-lg border ${
      selected ? "border-primary bg-primary/5" : "border-border bg-card"
    }`

  const siteLink = (website: string) => (
    <a
      href={websiteHref(website)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 items-center gap-1 self-stretch px-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
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
      {noMatches ? (
        <p className="py-3 text-center text-sm text-muted-foreground">
          {registerActive
            ? `No registered charity matches “${trimmed}”.`
            : trimmed || !onRegisterAdd
              ? "No results."
              : "Search any UK charity — the whole Charity Commission register."}
        </p>
      ) : (
        <div className="flex flex-col gap-1.5 px-5 py-4">
          {visible.map((c) => {
            const selected = value.includes(c.id)
            return (
              <div key={c.id} className={rowCard(selected)}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!selected && atMax}
                  aria-label={c.name}
                  className="h-auto min-w-0 flex-1 items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left whitespace-normal hover:bg-transparent"
                  onClick={() => toggle(c.id)}
                >
                  <Avatar name={c.name} logoUrl={c.logo_url} />
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
              <div key={r.registeredNumber} className={rowCard(false)}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={atMax || busyNumber !== null}
                  aria-label={r.displayName}
                  className="h-auto min-w-0 flex-1 items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left whitespace-normal hover:bg-transparent"
                  onClick={() => void addFromRegister(r)}
                >
                  <Avatar name={r.displayName} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">
                      {busyNumber === r.registeredNumber
                        ? "Adding…"
                        : r.displayName}
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

      {registerActive && !noMatches && (
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
