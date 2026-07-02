"use client";

import { useState, useTransition } from "react";
import {
  VALID_REGISTERS,
  REGISTER_LABELS,
  type PlaceholdersMap,
  type RegisterKey,
} from "@/lib/occasions";
import { updatePlaceholder } from "@/lib/actions/placeholders";

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
    <div className="border border-neutral-200 rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-neutral-900">
            {REGISTER_LABELS[register]}
          </h3>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            {register}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          About
        </label>
        <textarea
          rows={4}
          value={about}
          onChange={(e) => {
            setAbout(e.target.value);
            setStatus("idle");
          }}
          className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Placeholder text shown in the protagonist about field…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Reveal
        </label>
        <textarea
          rows={3}
          value={reveal}
          onChange={(e) => {
            setReveal(e.target.value);
            setStatus("idle");
          }}
          className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Placeholder text shown in the poll reveal field…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {status === "saving"
            ? "Saving…"
            : status === "saved"
              ? "Saved"
              : "Save"}
        </button>
        {status === "saved" && (
          <span className="text-xs text-green-600">Changes saved</span>
        )}
        {status === "error" && (
          <span className="text-xs text-red-600">{errorMsg}</span>
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
