"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, AlertTriangle } from "lucide-react";
import type { OutreachPreviewRow } from "@/lib/actions/charities";
import {
  outreachEmail,
  mailtoFor,
  OUTREACH_KINDS,
  type OutreachKind,
} from "@/lib/outreach-email";
import { titleCaseCharityName } from "@/lib/charity-commission";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

// ─── Outreach preview ────────────────────────────────────────────────────────
//
// Founder, 2026-10-07: "we should make it possible to cycle though what the
// email looks like for every charity so we can preview any issues."
//
// Both emails are built by interpolating live data — a charity's own
// signature event, its perfect topic, the reason text, its stored name — and
// until now the only way to see one was to open a draft in a mail client. So
// the failures were invisible by construction: an empty recipient, a missing
// paragraph, a half-sentence spliced into a numbered list. One at a time,
// through a send button.
//
// This renders them as the recipient would read them, across every charity,
// and counts the failures. The copy itself is unchanged and parked — the
// invite still says "An organiser has picked <charity>", which is false for a
// cold approach and waits on the rail. Reading the rewrite against all 42
// before it goes out is the point of building this first.

/** A problem worth seeing before the email is sent. `blocking` means the
 *  email cannot do its job at all, not merely that it reads worse. */
type Flag = { blocking: boolean; label: string; detail: string };

function flagsFor(row: OutreachPreviewRow, kind: OutreachKind): Flag[] {
  const flags: Flag[] = [];

  if (!row.registered_email) {
    flags.push({
      blocking: true,
      label: "No address",
      detail:
        "The register holds no public email for this number, so the draft opens with an empty To field. Nothing warns you — the mailto is simply addressed to nobody.",
    });
  }

  if (row.register_verdict === "removed") {
    flags.push({
      blocking: true,
      label: "Removed from the register",
      detail:
        "Do not invite: the email asks it to receive money, and setCharityConsent refuses approval anyway.",
    });
  }

  // The stored name goes into the subject line verbatim. Fixing
  // titleCaseCharityName never rewrote the rows it was fixed for.
  const cased = titleCaseCharityName(row.name);
  if (cased !== row.name) {
    flags.push({
      blocking: false,
      label: "Stored casing",
      detail: `The subject will read "${row.name}". Title-casing it now would give "${cased}".`,
    });
  }

  if (kind === "welcome") {
    const hook = row.signature_events?.find((e) => e.topic) ?? null;
    if (!hook) {
      const read = row.website_read_at;
      const count = row.signature_events?.length ?? 0;
      flags.push({
        blocking: false,
        label: "No event hook",
        detail: !read
          ? "Its website was never read, so the strongest paragraph — naming the charity's own event — is missing entirely."
          : count === 0
            ? "Its website was read and no events were found, so the event paragraph is missing."
            : `${count} event${count === 1 ? "" : "s"} were found but none carries a topic, so the paragraph is dropped silently.`,
      });
    }

    if (!row.perfect_topic_title) {
      flags.push({
        blocking: false,
        label: "No topic",
        detail:
          "Item 1 falls back to the generic wording that asks THEM to suggest topics, rather than offering one.",
      });
    }

    // The reason is spliced mid-sentence after one trailing full stop is
    // stripped. Two sentences become a run-on inside a numbered item.
    const reason = row.perfect_topic_reason?.replace(/\.$/, "") ?? "";
    if (/[.!?]\s/.test(reason)) {
      flags.push({
        blocking: false,
        label: "Multi-sentence reason",
        detail:
          "The reason is spliced into item 1 after its final full stop is stripped. More than one sentence reads as a run-on.",
      });
    }
  }

  return flags;
}

export function OutreachPreview({ rows }: { rows: OutreachPreviewRow[] }) {
  const [kind, setKind] = useState<OutreachKind>("invite");
  const [index, setIndex] = useState(0);

  const flagged = useMemo(
    () => rows.map((r) => flagsFor(r, kind)),
    [rows, kind],
  );

  const tally = useMemo(() => {
    let blocking = 0;
    let soft = 0;
    for (const f of flagged) {
      if (f.some((x) => x.blocking)) blocking++;
      else if (f.length > 0) soft++;
    }
    return { blocking, soft, clean: rows.length - blocking - soft };
  }, [flagged, rows.length]);

  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No charities yet.</p>;
  }

  const row = rows[index];
  const flags = flagged[index];
  const email = outreachEmail(kind, row);

  function step(by: number) {
    setIndex((i) => (i + by + rows.length) % rows.length);
  }

  /** The next charity with anything wrong — the reason this beats scrolling. */
  function nextIssue() {
    for (let n = 1; n <= rows.length; n++) {
      const i = (index + n) % rows.length;
      if (flagged[i].length > 0) {
        setIndex(i);
        return;
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* Readiness as a number, not a hope. */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge tone={tally.blocking > 0 ? "destructive" : "success"}>
          {tally.blocking} cannot send
        </StatusBadge>
        <StatusBadge tone={tally.soft > 0 ? "warning" : "neutral"}>
          {tally.soft} send worse
        </StatusBadge>
        <StatusBadge tone="neutral">{tally.clean} clean</StatusBadge>
        <span className="text-muted-foreground">of {rows.length}</span>
        {(tally.blocking > 0 || tally.soft > 0) && (
          <Button type="button" size="sm" variant="ghost" onClick={nextIssue}>
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            Next issue
          </Button>
        )}
      </div>

      {/* Which email, and which charity. */}
      <div className="flex flex-wrap items-center gap-2 border-y border-border py-3">
        <div
          role="radiogroup"
          aria-label="Which email"
          className="flex gap-1 pr-2"
        >
          {OUTREACH_KINDS.map((k) => (
            <Button
              key={k}
              type="button"
              size="sm"
              role="radio"
              aria-checked={kind === k}
              variant={kind === k ? "secondary" : "ghost"}
              className="capitalize"
              onClick={() => setKind(k)}
            >
              {k}
            </Button>
          ))}
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Previous charity"
          onClick={() => step(-1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Next charity"
          onClick={() => step(1)}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>

        <label className="sr-only" htmlFor="outreach-charity">
          Charity
        </label>
        <select
          id="outreach-charity"
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        >
          {rows.map((r, i) => (
            <option key={r.id} value={i}>
              {i + 1}. {r.name}
              {flagged[i].length > 0
                ? flagged[i].some((f) => f.blocking)
                  ? "  ✕"
                  : "  !"
                : ""}
            </option>
          ))}
        </select>

        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {index + 1}/{rows.length}
        </span>
      </div>

      {/* What is wrong with this one. */}
      {flags.length > 0 && (
        <ul className="space-y-2">
          {flags.map((f) => (
            <li key={f.label} className="flex flex-wrap items-baseline gap-2">
              <StatusBadge tone={f.blocking ? "destructive" : "warning"}>
                {f.label}
              </StatusBadge>
              <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                {f.detail}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* The email, as it will be read. */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="space-y-1 border-b border-border bg-muted/40 px-4 py-3">
          <p className="text-sm">
            <span className="text-muted-foreground">To: </span>
            {email.to ? (
              <span className="font-mono text-xs">{email.to}</span>
            ) : (
              <span className="text-destructive">(nobody)</span>
            )}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Subject: </span>
            <span className="font-medium text-foreground">{email.subject}</span>
            <span className="ml-2 font-mono text-xs text-muted-foreground tabular-nums">
              {email.subject.length} chars
            </span>
          </p>
        </div>
        <pre className="overflow-x-auto px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {email.body}
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild size="sm" variant="outline" disabled={!email.to}>
          <a href={mailtoFor(email)}>
            <Mail className="size-3.5" aria-hidden="true" />
            Open draft
          </a>
        </Button>
        <span className="text-xs text-muted-foreground">
          Opens your mail client. Nothing is sent, and nothing is stamped — the
          queue&rsquo;s Draft invite is what records an attempt.
        </span>
      </div>
    </div>
  );
}
