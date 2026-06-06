"use client";

import { useState, useTransition } from "react";
import { VALID_OCCASION_TYPES, type PlaceholdersMap } from "@/lib/occasions";
import {
  updatePlaceholder,
  deleteOccasion,
  addOccasion,
} from "@/lib/actions/placeholders";

// Display order matches VALID_OCCASION_TYPES; "default" shown last
const OCCASION_ORDER: string[] = [
  "Memorial",
  "Tribute",
  "Birthday",
  "Retirement",
  "Leaving do",
  "Graduation",
  "Christening",
  "Achievement",
  "Recovery",
  "Award",
  "Promotion",
  "Wedding",
  "Engagement",
  "Anniversary",
  "default",
];

function sortOccasions(keys: string[]): string[] {
  const ordered = OCCASION_ORDER.filter((o) => keys.includes(o));
  const rest = keys.filter((k) => !OCCASION_ORDER.includes(k)).sort();
  return [...ordered, ...rest];
}

// ─────────────────────────────────────────────────────────────────────────────
// Single occasion row
// ─────────────────────────────────────────────────────────────────────────────

function OccasionRow({
  topicId,
  occasion,
  about: initialAbout,
  reveal: initialReveal,
}: {
  topicId: string;
  occasion: string;
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
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleSave() {
    setStatus("saving");
    setErrorMsg("");
    startTransition(async () => {
      const result = await updatePlaceholder(topicId, occasion, about, reveal);
      if (result.error) {
        setStatus("error");
        setErrorMsg(result.error);
      } else {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2000);
      }
    });
  }

  function handleDelete() {
    if (
      !confirm(`Remove "${occasion}" from this topic?`)
    )
      return;
    startDeleteTransition(async () => {
      const result = await deleteOccasion(topicId, occasion);
      if (result.error) {
        setErrorMsg(result.error);
      }
    });
  }

  const isDefault = occasion === "default";

  return (
    <div className="border border-neutral-200 rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-900">
          {isDefault ? "Default (fallback)" : occasion}
        </h3>
        <div className="flex items-center gap-2">
          {isDefault ? (
            <span
              className="text-xs text-neutral-400 cursor-default select-none"
              title="The default fallback cannot be deleted"
            >
              Cannot delete
            </span>
          ) : (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
            >
              {isDeleting ? "Removing…" : "Remove"}
            </button>
          )}
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
          className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]"
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
          className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]"
          placeholder="Placeholder text shown in the poll reveal field…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-[#534AB7] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#3C3489] disabled:opacity-50 transition-colors"
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
// Add occasion section
// ─────────────────────────────────────────────────────────────────────────────

function AddOccasionSection({
  topicId,
  existingOccasions,
}: {
  topicId: string;
  existingOccasions: string[];
}) {
  const available = VALID_OCCASION_TYPES.filter(
    (o) => !existingOccasions.includes(o),
  );
  const [selected, setSelected] = useState<string>(available[0] ?? "");
  const [about, setAbout] = useState("");
  const [reveal, setReveal] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (available.length === 0) return null;

  function handleAdd() {
    setError("");
    startTransition(async () => {
      const result = await addOccasion(topicId, selected, about, reveal);
      if (result.error) {
        setError(result.error);
      } else {
        setAbout("");
        setReveal("");
        setSelected(
          available.filter((o) => o !== selected)[0] ?? ("" as string),
        );
      }
    });
  }

  return (
    <div className="border border-dashed border-neutral-300 rounded-lg p-5 flex flex-col gap-3">
      <h3 className="text-sm font-medium text-neutral-700">Add occasion</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Occasion
        </label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]"
        >
          {available.map((o) => (
            <option key={o} value={o}>
              {o === "default" ? "Default (fallback)" : o}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          About
        </label>
        <textarea
          rows={4}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]"
          placeholder="About placeholder text…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Reveal
        </label>
        <textarea
          rows={3}
          value={reveal}
          onChange={(e) => setReveal(e.target.value)}
          className="w-full resize-y rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#534AB7]/30 focus:border-[#534AB7]"
          placeholder="Reveal placeholder text…"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending || !selected}
          className="inline-flex items-center rounded-md bg-[#534AB7] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#3C3489] disabled:opacity-50 transition-colors"
        >
          {isPending ? "Adding…" : "Add occasion"}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
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
  // Show all 15 valid occasion types — empty ones are shown as blank rows
  const existingKeys = Object.keys(placeholders);

  // Occasions to show: all valid occasions (even if empty) + any unexpected keys
  const orderedExisting = sortOccasions(existingKeys);
  const emptyOccasions = OCCASION_ORDER.filter(
    (o) => !existingKeys.includes(o),
  );

  const allToShow = [...orderedExisting, ...emptyOccasions];

  return (
    <div className="flex flex-col gap-4">
      {allToShow.map((occasion) => (
        <OccasionRow
          key={occasion}
          topicId={topicId}
          occasion={occasion}
          about={placeholders[occasion]?.about ?? ""}
          reveal={placeholders[occasion]?.reveal ?? ""}
        />
      ))}

      <AddOccasionSection topicId={topicId} existingOccasions={existingKeys} />
    </div>
  );
}
