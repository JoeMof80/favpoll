"use client"

import { useState, useTransition } from "react"
import { Mail } from "lucide-react"
import type { ConsentQueueRow } from "@/lib/actions/charities"
import type { AdminTopic } from "@/lib/actions/topics"
import {
  markCharityContacted,
  setCauseFamily,
  setCharityConsent,
} from "@/lib/actions/charities"
import {
  CAUSE_FAMILIES,
  CAUSE_FAMILY_LABELS,
  type CauseFamily,
} from "@favpoll/types"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { PerfectTopicSelect } from "@/components/perfect-topic-select"
// The words live in lib/outreach-email.ts so /outreach can render the
// same ones without opening a draft. Behaviour here is unchanged.
import { inviteEmail, welcomeEmail, mailtoFor } from "@/lib/outreach-email"

// ─── Consent outreach queue ──────────────────────────────────────────────────
//
// favpoll owns consent outreach — the organiser invite path was retired
// (web #868): consent_status lives on charities, one agreement per
// charity across every favpoll, so the invitation is a platform-level
// relationship and the Code 6.2.1 agreement wording is favpoll's to
// control. This queue lists PENDING charities in use on at least one
// favpoll — the ones where pledges are actually waiting.
//
// "Draft invite" opens the team's own mail client with the platform-voice
// email prefilled (recipient from the Commission register's public
// contact where we hold it) and stamps invite_drafted_at. Sending is
// manual — the stamp records the attempt, Approve records the reply.

// The cause family (references/favpoll-pairing-table §2) is confirmed
// HERE, because this is the one moment an admin already has the charity in
// front of them. The model's suggestion pre-selects; the register's own
// `activities` text sits beneath so the admin can judge it. "No cause of
// its own" is a real choice — grant-makers get it — not a missing value.
function CauseFamilySelect({ row }: { row: ConsentQueueRow }) {
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState<CauseFamily | "">(
    row.cause_family ?? row.cause_family_suggested ?? ""
  )
  const confirmed = row.cause_family != null
  const suggested = !confirmed && row.cause_family_suggested != null

  function handleChange(next: CauseFamily | "") {
    setValue(next)
    startTransition(async () => {
      await setCauseFamily(row.id, next === "" ? null : next)
    })
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Cause family</label>
        <select
          value={value}
          disabled={isPending}
          onChange={(e) => handleChange(e.target.value as CauseFamily | "")}
          className="h-8 rounded-lg border border-border bg-background px-2 text-sm focus:ring-1 focus:ring-ring focus:outline-none"
        >
          <option value="">No cause of its own</option>
          {CAUSE_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {CAUSE_FAMILY_LABELS[f]}
            </option>
          ))}
        </select>
        {suggested && (
          <>
            <StatusBadge tone="info">suggested</StatusBadge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending || value === ""}
              onClick={() => handleChange(value)}
            >
              Confirm
            </Button>
          </>
        )}
      </div>
      {row.activities && (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          Register: {row.activities}
        </p>
      )}
    </div>
  )
}

function QueueRow({
  row,
  topics,
}: {
  row: ConsentQueueRow
  topics: AdminTopic[]
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  // A charity the register has removed is neither invited nor approved:
  // the invite asks it to receive money, and approval opens the rail.
  // Decline stays available — it is the way out.
  const removed = row.register_verdict === "removed"

  function handleConsent(status: "approved" | "declined") {
    setError(null)
    startTransition(async () => {
      const result = await setCharityConsent(row.id, status)
      if (result.error) {
        setError(result.error)
      } else if (status === "approved" && row.registered_email) {
        // Approval removes the row from the queue, so the welcome email
        // drafts NOW — the one moment the ask can't be forgotten.
        window.location.href = mailtoFor(welcomeEmail(row))
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {row.name}
          {row.registered_number && (
            <span className="ml-2 font-normal text-muted-foreground">
              {row.registered_number}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          On {row.favpoll_count} favpoll{row.favpoll_count === 1 ? "" : "s"}
          {" · "}
          {row.registered_email ?? "no email on the register"}
        </p>
      </div>

      {row.invite_drafted_at && (
        <StatusBadge tone="info">
          Draft opened{" "}
          {new Date(row.invite_drafted_at).toLocaleDateString("en-GB")}
        </StatusBadge>
      )}

      {/* THE REMOVAL CHECK (profiles note §3) reaches the queue, because
          this is where a charity gets written to and emailed. Removed
          blocks both; gone only warns — a load that stopped half way
          looks the same, and the mirror is the thing to fix. */}
      {removed && (
        <StatusBadge tone="destructive">
          Removed from the register
          {row.register_removed_on
            ? ` ${new Date(row.register_removed_on).toLocaleDateString("en-GB")}`
            : ""}
        </StatusBadge>
      )}
      {row.register_verdict === "gone" && (
        <StatusBadge tone="warning">Not in the latest extract</StatusBadge>
      )}

      <CauseFamilySelect row={row} />
      <PerfectTopicSelect row={row} topics={topics} />

      <div className="flex items-center gap-2">
        {removed ? (
          <Button size="sm" variant="outline" disabled>
            <Mail className="size-3.5" aria-hidden="true" />
            Draft invite
          </Button>
        ) : (
          <Button asChild size="sm" variant="outline" disabled={isPending}>
            <a
              href={mailtoFor(inviteEmail(row))}
              onClick={() => void markCharityContacted(row.id)}
            >
              <Mail className="size-3.5" aria-hidden="true" />
              {row.invite_drafted_at ? "Draft again" : "Draft invite"}
            </a>
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          disabled={isPending || removed}
          onClick={() => handleConsent("approved")}
        >
          {isPending ? "…" : "Approve"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => handleConsent("declined")}
        >
          Decline
        </Button>
      </div>

      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </div>
  )
}

export function ConsentQueue({
  rows,
  topics = [],
}: {
  rows: ConsentQueueRow[]
  topics?: AdminTopic[]
}) {
  // No section at all when nothing is waiting — the queue only exists
  // when there is work.
  if (rows.length === 0) return null

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">
        Awaiting consent{" "}
        <span className="font-normal text-muted-foreground">
          — on live favpolls, pledges held until they agree
        </span>
      </h2>
      <div className="divide-y divide-border rounded-lg border border-border">
        {rows.map((row) => (
          <QueueRow key={row.id} row={row} topics={topics} />
        ))}
      </div>
    </section>
  )
}
