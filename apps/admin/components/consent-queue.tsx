"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import type { ConsentQueueRow } from "@/lib/actions/charities";
import {
  markCharityContacted,
  setCharityConsent,
} from "@/lib/actions/charities";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

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
// contact where we hold it) and stamps consent_contacted_at. Sending is
// manual — the stamp records the attempt, Approve records the reply.

function inviteMailto(row: ConsentQueueRow): string {
  const subject = `Receiving pledges through favpoll — ${row.name}`;
  const body = [
    "Hello,",
    "",
    `favpoll (https://favpoll.com) is a pledge poll for occasions — guests pick a favourite and pledge money, and everything raised goes to a chosen charity. An organiser has picked ${row.name} to receive what their favpoll raises.`,
    "",
    "Before any money is collected, we ask each charity to confirm it's happy to receive donations this way. Could you confirm by reply? We'll follow up with the details.",
    "",
    "Thank you,",
    "The favpoll team",
  ].join("\n");
  return `mailto:${encodeURIComponent(row.registered_email ?? "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// The WELCOME follows Approve (founder, 2026-09-18): the invite stays a
// single ask, and the promised "details" get an artefact — the three
// optional enrichments a charity can hand us (suggested topics, impact
// lines, logo), which otherwise nobody remembers to collect. Drafted in
// the team's own mail client like the invite; sending stays manual.
function welcomeMailto(row: ConsentQueueRow): string {
  const subject = `Welcome to favpoll — ${row.name}`;
  const body = [
    "Hello,",
    "",
    `Thank you for confirming — ${row.name} can now receive pledges through favpoll, and everything raised is passed on when each favpoll closes.`,
    "",
    "Three optional things that make your favpolls work harder — just reply with any of them:",
    "",
    "1. Suggested topics — poll topics you'd like us to suggest to organisers raising for you (some charities suit certain favourites: a hospice might pick Comfort food, a rescue might pick Dog breed).",
    "2. Impact lines — one or two short sentences like \u201c\u00a320 funds an hour of care\u201d, shown to guests as they pick an amount.",
    "3. Your logo — shown wherever your charity is named.",
    "",
    "Thank you,",
    "The favpoll team",
  ].join("\n");
  return `mailto:${encodeURIComponent(row.registered_email ?? "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function QueueRow({ row }: { row: ConsentQueueRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConsent(status: "approved" | "declined") {
    setError(null);
    startTransition(async () => {
      const result = await setCharityConsent(row.id, status);
      if (result.error) {
        setError(result.error);
      } else if (status === "approved" && row.registered_email) {
        // Approval removes the row from the queue, so the welcome email
        // drafts NOW — the one moment the ask can't be forgotten.
        window.location.href = welcomeMailto(row);
      }
    });
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

      {row.consent_contacted_at && (
        <StatusBadge tone="info">
          Invited{" "}
          {new Date(row.consent_contacted_at).toLocaleDateString("en-GB")}
        </StatusBadge>
      )}

      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline" disabled={isPending}>
          <a
            href={inviteMailto(row)}
            onClick={() => void markCharityContacted(row.id)}
          >
            <Mail className="size-3.5" aria-hidden="true" />
            {row.consent_contacted_at ? "Draft again" : "Draft invite"}
          </a>
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={isPending}
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
  );
}

export function ConsentQueue({ rows }: { rows: ConsentQueueRow[] }) {
  // No section at all when nothing is waiting — the queue only exists
  // when there is work.
  if (rows.length === 0) return null;

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
          <QueueRow key={row.id} row={row} />
        ))}
      </div>
    </section>
  );
}
