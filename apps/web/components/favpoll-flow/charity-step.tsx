"use client"

import { useEffect, useState } from "react"
import { Chip } from "@/components/ui/chip"
import type { Charity } from "@favpoll/types"

const MAX_CHARITIES = 3

export type RegisterPick = {
  registeredNumber: string
  displayName: string
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

  async function pickFromRegister(pick: RegisterPick) {
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
        /* ONE ranked list (founder, 2026-09-07): catalogue matches lead
           wearing a small ready-mark, register results follow seamlessly.
           A register pick creates the charity consent-pending and off the
           public catalogue — the consent posture decides what that means. */
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
              {registerActive && isApproved(c) ? `✓ ${c.name}` : c.name}
            </Chip>
          ))}
          {registerActive &&
            freshResults.map((r) => (
              <Chip
                key={r.registeredNumber}
                size="lg"
                disabled={atMax || busyNumber !== null}
                title={`Charity no. ${r.registeredNumber}`}
                onClick={() => pickFromRegister(r)}
              >
                {busyNumber === r.registeredNumber ? "Adding…" : r.displayName}
              </Chip>
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
