"use client";

import { useState, useTransition } from "react";
import { Button } from "@favpoll/ui";
import { createAppeal, updateAppeal, type Appeal } from "@/lib/actions/appeals";
import type { Charity } from "@/lib/actions/charities";

// The appeals manager — the charities-table idiom, smaller. Create and
// tend appeals by hand until the charity portal exists; the web app's
// /appeals/[slug] page is the public face.

type FormValues = {
  name: string;
  slug: string;
  charity_id: string;
  blurb: string;
  photo_url: string;
  closes_at: string;
  is_listed: boolean;
};

const EMPTY: FormValues = {
  name: "",
  slug: "",
  charity_id: "",
  blurb: "",
  photo_url: "",
  closes_at: "",
  is_listed: false,
};

function Fields({
  form,
  set,
  charities,
  slugLocked,
}: {
  form: FormValues;
  set: (f: keyof FormValues, v: string | boolean) => void;
  charities: Charity[];
  slugLocked?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        placeholder="Name (The Midnight Walk)"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
      />
      <input
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm disabled:opacity-50"
        placeholder="slug (midnight-walk)"
        value={form.slug}
        disabled={slugLocked}
        onChange={(e) => set("slug", e.target.value)}
      />
      <select
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm disabled:opacity-50"
        value={form.charity_id}
        disabled={slugLocked}
        onChange={(e) => set("charity_id", e.target.value)}
      >
        <option value="">Charity…</option>
        {charities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        type="datetime-local"
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        value={form.closes_at}
        onChange={(e) => set("closes_at", e.target.value)}
      />
      <textarea
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm sm:col-span-2"
        placeholder="Blurb — the appeal page's few sentences"
        rows={2}
        value={form.blurb}
        onChange={(e) => set("blurb", e.target.value)}
      />
      <input
        className="rounded-md border border-border bg-background px-2 py-1.5 text-sm sm:col-span-2"
        placeholder="Photo URL (optional)"
        value={form.photo_url}
        onChange={(e) => set("photo_url", e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.is_listed}
          onChange={(e) => set("is_listed", e.target.checked)}
        />
        Listed on the charity page
      </label>
    </div>
  );
}

export function AddAppealForm({ charities }: { charities: Charity[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(EMPTY);
  const set = (f: keyof FormValues, v: string | boolean) =>
    setForm((p) => ({ ...p, [f]: v }));

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await createAppeal({
        ...form,
        closes_at: form.closes_at
          ? new Date(form.closes_at).toISOString()
          : undefined,
      });
      if (r.error) setError(r.error);
      else {
        setOpen(false);
        setForm(EMPTY);
      }
    });
  }

  if (!open)
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        + Add appeal
      </Button>
    );
  return (
    <div className="w-full space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-medium">Add appeal</h2>
      <Fields form={form} set={set} charities={charities} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={isPending} onClick={submit}>
          {isPending ? "Saving…" : "Save appeal"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function Row({ appeal, charities }: { appeal: Appeal; charities: Charity[] }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>({
    name: appeal.name,
    slug: appeal.slug,
    charity_id: appeal.charity_id,
    blurb: appeal.blurb ?? "",
    photo_url: appeal.photo_url ?? "",
    closes_at: appeal.closes_at ? appeal.closes_at.slice(0, 16) : "",
    is_listed: appeal.is_listed,
  });
  const set = (f: keyof FormValues, v: string | boolean) =>
    setForm((p) => ({ ...p, [f]: v }));

  function save() {
    setError(null);
    startTransition(async () => {
      const r = await updateAppeal(appeal.id, {
        name: form.name,
        blurb: form.blurb,
        photo_url: form.photo_url,
        closes_at: form.closes_at
          ? new Date(form.closes_at).toISOString()
          : null,
        is_listed: form.is_listed,
      });
      if (r.error) setError(r.error);
      else setEditing(false);
    });
  }

  return (
    <li className="space-y-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {appeal.name}
            <span className="ml-2 font-normal text-muted-foreground">
              /appeals/{appeal.slug}
            </span>
          </span>
          <span className="block text-xs text-muted-foreground">
            {appeal.charity_name}
            {appeal.closes_at
              ? ` · closes ${appeal.closes_at.slice(0, 10)}`
              : " · evergreen"}
            {appeal.is_listed ? " · listed" : " · unlisted"}
          </span>
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Close" : "Edit"}
        </Button>
      </div>
      {editing && (
        <div className="space-y-2 rounded-md border border-border bg-background p-3">
          <Fields form={form} set={set} charities={charities} slugLocked />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="button" size="sm" disabled={isPending} onClick={save}>
            {isPending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      )}
    </li>
  );
}

export function AppealsTable({
  appeals,
  charities,
}: {
  appeals: Appeal[];
  charities: Charity[];
}) {
  if (appeals.length === 0)
    return <p className="text-sm text-muted-foreground">No appeals yet.</p>;
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {appeals.map((a) => (
        <Row key={a.id} appeal={a} charities={charities} />
      ))}
    </ul>
  );
}
