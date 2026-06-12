"use client";

import { useState, useTransition } from "react";
import type {
  GeneratedDraft,
  DraftStatus,
} from "@/lib/actions/generated-drafts";
import {
  updateGeneratedDraft,
  setGeneratedDraftStatus,
} from "@/lib/actions/generated-drafts";

function StatusBadge({ status }: { status: DraftStatus }) {
  if (status === "curated") {
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
        Curated
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
        Rejected
      </span>
    );
  }
  return (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
      Generated
    </span>
  );
}

function EditableField({
  label,
  initial,
  draftId,
  field,
}: {
  label: string;
  initial: string;
  draftId: string;
  field: "about" | "reveal";
}) {
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateGeneratedDraft(draftId, { [field]: value });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  const dirty = value !== initial;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={3}
        className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !dirty}
          className="rounded px-3 py-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
        {saved && (
          <span className="text-xs text-green-600 dark:text-green-400">
            Saved
          </span>
        )}
        {error && (
          <span className="text-xs text-red-600 dark:text-red-400">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}

export function DraftRow({ draft }: { draft: GeneratedDraft }) {
  const [isPending, startTransition] = useTransition();
  const [statusError, setStatusError] = useState<string | null>(null);

  function handleStatus(status: "curated" | "rejected") {
    setStatusError(null);
    startTransition(async () => {
      const result = await setGeneratedDraftStatus(draft.id, status);
      if (result.error) setStatusError(result.error);
    });
  }

  const isGenerated = draft.status === "generated";

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">
            {draft.topic_title}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {draft.register} · {draft.subject === "cause" ? "cause" : "person"}{" "}
            · {draft.charity_name ?? "—"}
          </p>
        </div>
        <StatusBadge status={draft.status} />
      </div>

      {/* Editable copy */}
      <EditableField
        label="About"
        initial={draft.about}
        draftId={draft.id}
        field="about"
      />
      <EditableField
        label="Reveal"
        initial={draft.reveal}
        draftId={draft.id}
        field="reveal"
      />

      {/* Status actions — only for generated rows */}
      {isGenerated && (
        <div className="space-y-1.5 pt-1">
          {statusError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {statusError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleStatus("curated")}
              disabled={isPending}
              className="rounded px-3 py-1 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? "…" : "Curate"}
            </button>
            <button
              type="button"
              onClick={() => handleStatus("rejected")}
              disabled={isPending}
              className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
