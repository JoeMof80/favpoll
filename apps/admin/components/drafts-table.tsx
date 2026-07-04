"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type {
  GeneratedDraft,
  DraftStatus,
} from "@/lib/actions/generated-drafts";
import {
  updateGeneratedDraft,
  setGeneratedDraftStatus,
} from "@/lib/actions/generated-drafts";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function DraftStatusBadge({ status }: { status: DraftStatus }) {
  if (status === "curated")
    return <StatusBadge tone="success">Curated</StatusBadge>;
  if (status === "rejected")
    return <StatusBadge tone="destructive">Rejected</StatusBadge>;
  return <StatusBadge tone="warning">Generated</StatusBadge>;
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
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <Textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="xs"
          disabled={isPending || !dirty}
          onClick={handleSave}
        >
          {isPending ? "Saving…" : "Save"}
        </Button>
        {saved && <span className="text-xs text-success">Saved</span>}
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}

function DraftRow({ draft }: { draft: GeneratedDraft }) {
  const [open, setOpen] = useState(false);
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
  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <TableCell className="w-8 pr-0 text-muted-foreground">
          <Chevron className="size-4" aria-hidden="true" />
        </TableCell>
        <TableCell className="font-medium text-foreground">
          {draft.topic_title}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {draft.register}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {draft.subject === "cause" ? "cause" : "person"}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {draft.charity_name ?? "—"}
        </TableCell>
        <TableCell className="max-w-md truncate text-muted-foreground">
          {draft.about}
        </TableCell>
        <TableCell className="text-right">
          <DraftStatusBadge status={draft.status} />
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="bg-muted/30 py-4">
            <div className="max-w-2xl space-y-4">
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
              {isGenerated && (
                <div className="space-y-1.5 border-t border-border pt-3">
                  {statusError && (
                    <p className="text-sm text-destructive">{statusError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending}
                      onClick={() => handleStatus("curated")}
                    >
                      {isPending ? "…" : "Curate"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => handleStatus("rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function DraftsTable({ drafts }: { drafts: GeneratedDraft[] }) {
  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8" />
            <TableHead>Topic</TableHead>
            <TableHead>Register</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Charity</TableHead>
            <TableHead>About</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drafts.map((draft) => (
            <DraftRow key={draft.id} draft={draft} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
