"use client";

import { useState, useTransition } from "react";
import {
  VALID_REGISTERS,
  REGISTER_LABELS,
  type PlaceholdersMap,
  type RegisterKey,
} from "@/lib/occasions";
import { updatePlaceholder } from "@/lib/actions/placeholders";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ─────────────────────────────────────────────────────────────────────────────
// Single register row
// ─────────────────────────────────────────────────────────────────────────────

function RegisterRow({
  topicId,
  register,
  about: initialAbout,
  reveal: initialReveal,
}: {
  topicId: string;
  register: RegisterKey;
  about: string;
  reveal: string;
}) {
  const [about, setAbout] = useState(initialAbout);
  const [reveal, setReveal] = useState(initialReveal);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    startTransition(async () => {
      const result = await updatePlaceholder(topicId, register, about, reveal);
      if (result.error) {
        setStatus("error");
        setErrorMsg(result.error);
      } else {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-medium text-foreground">
          {REGISTER_LABELS[register]}
        </h3>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {register}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          About
        </label>
        <Textarea
          rows={4}
          value={about}
          onChange={(e) => {
            setAbout(e.target.value);
            setStatus("idle");
          }}
          placeholder="Placeholder text shown in the protagonist about field…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Reveal
        </label>
        <Textarea
          rows={3}
          value={reveal}
          onChange={(e) => {
            setReveal(e.target.value);
            setStatus("idle");
          }}
          placeholder="Placeholder text shown in the poll reveal field…"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={handleSave}
        >
          {status === "saving"
            ? "Saving…"
            : status === "saved"
              ? "Saved"
              : "Save"}
        </Button>
        {status === "saved" && (
          <span className="text-xs text-success">Changes saved</span>
        )}
        {status === "error" && (
          <span className="text-xs text-destructive">{errorMsg}</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main OccasionEditor
// ─────────────────────────────────────────────────────────────────────────────

export function OccasionEditor({
  topicId,
  placeholders,
}: {
  topicId: string;
  placeholders: PlaceholdersMap;
}) {
  return (
    <div className="flex flex-col gap-4">
      {VALID_REGISTERS.map((register) => (
        <RegisterRow
          key={register}
          topicId={topicId}
          register={register}
          about={placeholders[register]?.about ?? ""}
          reveal={placeholders[register]?.reveal ?? ""}
        />
      ))}
    </div>
  );
}
