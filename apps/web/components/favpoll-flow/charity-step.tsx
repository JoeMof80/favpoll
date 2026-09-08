"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
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
  /** Seed a search from the empty-shelf prompts (fills the header input). */
  onSeedSearch?: (q: string) => void
  /** Flavours the seed prompts — the wizard already knows the Event. */
  eventCategory?: "celebration" | "memorial" | "fundraiser" | null
}

// SEED SEARCHES (founder, 2026-09-09): an undecided organiser faces an
// empty box, so offer cause-WORDS — queries, not organisations — that
// convert "I don't know who" into "oh, the hospice". Zero endorsement:
// nothing specific is privileged, the earned-shelf doctrine holds.
const SEED_SEARCHES: Record<string, string[]> = {
  memorial: ["hospice", "air ambulance", "cancer research", "alzheimer"],
  celebration: ["children", "animal rescue", "dogs", "wildlife"],
  fundraiser: ["foodbank", "hospice", "rescue", "community"],
  default: ["hospice", "foodbank", "animal rescue", "cancer research"],
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
  onSeedSearch,
  eventCategory,
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
  const [registerLimit, setRegisterLimit] = useState(20)
  const [busyNumber, setBusyNumber] = useState<string | null>(null)
  const registerActive = !!onRegisterAdd && trimmed.length >= 3

  // A new query starts back at the first window.
  useEffect(() => {
    setRegisterLimit(20)
  }, [trimmed])

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
          `/api/charities/register-search?q=${encodeURIComponent(trimmed)}&limit=${registerLimit}`
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
  }, [trimmed, registerActive, registerLimit])

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

  // FULL-BLEED ROWS (founder, 2026-09-08): rows hug the dialog's edges —
  // hairline dividers, pale tint on hover, the register-ink idiom
  // (#587/#588) rather than cards-inside-a-card. The whole row is the
  // hit area (an overlay button); the website link floats above it so
  // identity stays one click away. Avatar sits at the right.
  const rowClass = (selected: boolean, dimmed: boolean) =>
    `relative flex items-center gap-3 px-5 py-3 transition-colors ${
      selected ? "bg-primary/10" : "hover:bg-secondary/40"
    } ${dimmed ? "opacity-50" : ""}`

  const overlayButton = (
    label: string,
    disabled: boolean,
    onClick: () => void
  ) => (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="absolute inset-0 h-auto rounded-none p-0 hover:bg-transparent"
    />
  )

  const siteLink = (website: string) => (
    <a
      href={websiteHref(website)}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 hover:text-foreground hover:underline"
      title={`Visit ${websiteLabel(website)}`}
    >
      {websiteLabel(website)}
    </a>
  )

  return (
    <div>
      {/* The searching indicator lives at the TOP (founder, 2026-09-09) —
          at the bottom it hid below the fold while stale results filled
          the list. The stale list dims until the register answers. */}
      {registerActive && registerLoading && (
        <p className="flex items-center gap-2 border-b border-border px-5 py-2.5 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Searching…
        </p>
      )}
      {noMatches && (trimmed || !onRegisterAdd) ? (
        <p className="py-3 text-center text-sm text-muted-foreground">
          {registerActive
            ? `No registered charity matches “${trimmed}”.`
            : "No results."}
        </p>
      ) : noMatches ? (
        /* The empty shelf — a cold start, so the prompt comes with seed
           searches, wearing the topic dialog's suggestion grammar. */
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Search any UK charity — the whole Charity Commission register.
          </p>
          {onSeedSearch && (
            <div className="mt-3 flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-medium tracking-widest text-primary uppercase">
                Not sure? Try
              </span>
              <div className="flex gap-1.5 overflow-x-auto">
                {(
                  SEED_SEARCHES[eventCategory ?? "default"] ??
                  SEED_SEARCHES.default
                ).map((q) => (
                  <Chip
                    key={q}
                    size="lg"
                    className="rounded-lg"
                    onClick={() => onSeedSearch(q)}
                  >
                    {q}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`flex flex-col divide-y divide-border transition-opacity ${
            registerLoading ? "opacity-60" : ""
          }`}
        >
          {visible.map((c) => {
            const selected = value.includes(c.id)
            return (
              <div
                key={c.id}
                className={rowClass(selected, !selected && atMax)}
              >
                {overlayButton(c.name, !selected && atMax, () => toggle(c.id))}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">
                    {c.name}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {c.registered_number
                      ? `Charity no. ${c.registered_number}`
                      : "On favpoll"}
                    {c.registered_website && (
                      <> · {siteLink(c.registered_website)}</>
                    )}
                  </span>
                </span>
                <Avatar name={c.name} logoUrl={c.logo_url} />
              </div>
            )
          })}
          {registerActive &&
            freshResults.map((r) => (
              <div
                key={r.registeredNumber}
                className={rowClass(false, atMax || busyNumber !== null)}
              >
                {overlayButton(
                  r.displayName,
                  atMax || busyNumber !== null,
                  () => void addFromRegister(r)
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-foreground">
                    {busyNumber === r.registeredNumber
                      ? "Adding…"
                      : r.displayName}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Charity no. {r.registeredNumber}
                    {r.place && <> · {r.place}</>}
                    {r.website && <> · {siteLink(r.website)}</>}
                  </span>
                </span>
                <Avatar name={r.displayName} />
              </div>
            ))}
          {/* MORE (founder, 2026-09-09): the caption becomes a working
              row — same query, wider window. Remaining count says what
              a tap buys. Register attribution lives in the empty-state
              prompt. */}
          {registerActive &&
            !registerLoading &&
            registerTotal > registerResults.length && (
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-center rounded-none px-5 py-3 text-sm font-normal text-muted-foreground hover:bg-secondary/40"
                onClick={() => setRegisterLimit((l) => l + 20)}
              >
                More · {registerTotal - registerResults.length}
              </Button>
            )}
        </div>
      )}
    </div>
  )
}
