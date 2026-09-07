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
   *  Omit to hide the register section entirely. */
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
  const visible = charities.filter(
    (c) => !trimmed || c.name.toLowerCase().includes(trimmed.toLowerCase())
  )

  // ── Charity Commission register search (debounced) ──
  const [registerResults, setRegisterResults] = useState<RegisterPick[]>([])
  const [registerLoading, setRegisterLoading] = useState(false)
  const [busyNumber, setBusyNumber] = useState<string | null>(null)
  const registerActive = !!onRegisterAdd && trimmed.length >= 3

  useEffect(() => {
    if (!registerActive) {
      setRegisterResults([])
      return
    }
    let cancelled = false
    setRegisterLoading(true)
    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/charities/register-search?q=${encodeURIComponent(trimmed)}`
        )
        const data = res.ok ? await res.json() : { results: [] }
        if (!cancelled) setRegisterResults(data.results ?? [])
      } catch {
        if (!cancelled) setRegisterResults([])
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

  return (
    <div>
      {visible.length === 0 && !registerActive ? (
        <p className="py-3 text-center text-sm text-muted-foreground">
          No results.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 px-5 py-4">
          {visible.map((c) => (
            <Chip
              key={c.id}
              size="lg"
              selected={value.includes(c.id)}
              disabled={!value.includes(c.id) && atMax}
              onClick={() => toggle(c.id)}
            >
              {c.name}
            </Chip>
          ))}
        </div>
      )}

      {/* Any UK charity, straight from the register (consent-gate PR C).
          The created charity starts consent-pending and off the public
          catalogue — the consent posture decides what pending means. */}
      {registerActive && (
        <div className="border-t border-border px-5 py-4">
          <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            From the Charity Commission register
          </p>
          {registerLoading ? (
            <p className="text-sm text-muted-foreground">
              Searching the register…
            </p>
          ) : freshResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No further registered charity matches “{trimmed}”.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {freshResults.map((r) => (
                <Chip
                  key={r.registeredNumber}
                  size="lg"
                  disabled={atMax || busyNumber !== null}
                  title={`Charity no. ${r.registeredNumber}`}
                  onClick={() => pickFromRegister(r)}
                >
                  {busyNumber === r.registeredNumber
                    ? "Adding…"
                    : r.displayName}
                </Chip>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
