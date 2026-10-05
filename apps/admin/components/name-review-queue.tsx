"use client";

import { useState, useTransition } from "react";
import { BadgeCheck } from "lucide-react";
import type { NameReviewRow } from "@/lib/actions/charities";
import { acceptCharityName } from "@/lib/actions/charities";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

// ─── Names the register does not recognise ──────────────────────────────────
//
// The verified tick means "we checked the number, the register says this
// charity is live, and the name is accounted for". Most names account for
// themselves: the register publishes working and previous names, so COMIC
// RELIEF answers for CHARITY PROJECTS. What is left is a short queue of
// judgements — our WWF against their "WWF - UK" — where the honest answer
// is a person saying yes, rather than a looser rule that would also make
// "Age" match "Age UK".
//
// So this is not an error list. It shows what the register calls them,
// and asks. Accepting records who and when; it lapses by itself if the
// register's name later changes.

function Row({ row }: { row: NameReviewRow }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {row.name}
          {row.registered_number && (
            <span className="ml-2 font-normal text-muted-foreground">
              {row.registered_number}
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          The register calls it{" "}
          <span className="font-medium text-foreground">
            {row.verified_name ?? "—"}
          </span>
        </p>
        {row.register_knows.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Also known as: {row.register_knows.join(" · ")}
          </p>
        )}
        {row.register_knows.length === 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            The register knows it by no other name.
          </p>
        )}
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>

      {!row.is_active && <StatusBadge tone="neutral">inactive</StatusBadge>}
      {row.consent_status && (
        <StatusBadge
          tone={row.consent_status === "approved" ? "success" : "info"}
        >
          consent {row.consent_status}
        </StatusBadge>
      )}

      <Button
        type="button"
        size="sm"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await acceptCharityName(row.id);
            if (result.error) setError(result.error);
          });
        }}
      >
        <BadgeCheck className="size-3.5" aria-hidden="true" />
        {isPending ? "…" : "That's them"}
      </Button>
    </div>
  );
}

export function NameReviewQueue({ rows }: { rows: NameReviewRow[] }) {
  // No section when every name is accounted for.
  if (rows.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">
        Names the register doesn&apos;t recognise{" "}
        <span className="font-normal text-muted-foreground">
          — the number is live; it is the name that wants a yes
        </span>
      </h2>
      <div className="divide-y divide-border rounded-lg border border-border">
        {rows.map((row) => (
          <Row key={row.id} row={row} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Accepting records who and when, and lapses by itself if the register
        changes that charity&apos;s name. A charity the register has REMOVED
        never appears here — that is not a name problem.
      </p>
    </section>
  );
}
