"use client";

import { useState, useTransition, useEffect } from "react";
import type { Charity } from "@/lib/actions/charities";
import {
  createCharity,
  updateCharity,
  deactivateCharity,
  reactivateCharity,
  getCharityTopics,
  setCharityTopics,
} from "@/lib/actions/charities";
import type { AdminTopic } from "@/lib/actions/topics";

const VALID_MARKETS = ["en-GB"];

// ─── Badges ──────────────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      Inactive
    </span>
  );
}

function MarketBadge({ market }: { market: string }) {
  return (
    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
      {market}
    </span>
  );
}

// ─── Add charity form ─────────────────────────────────────────────────────────

export function AddCharityForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    registered_number: "",
    logo_url: "",
    market: "en-GB",
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await createCharity(form);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setForm({
          name: "",
          description: "",
          registered_number: "",
          logo_url: "",
          market: "en-GB",
        });
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        + Add charity
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h2 className="text-sm font-medium">Add charity</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Cancer Research UK"
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Registered number
          </label>
          <input
            type="text"
            value={form.registered_number}
            onChange={(e) => set("registered_number", e.target.value)}
            placeholder="1089464"
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Logo URL
          </label>
          <input
            type="text"
            value={form.logo_url}
            onChange={(e) => set("logo_url", e.target.value)}
            placeholder="https://…"
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Market
          </label>
          <select
            value={form.market}
            onChange={(e) => set("market", e.target.value)}
            className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {VALID_MARKETS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving…" : "Save charity"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={isPending}
          className="rounded px-3 py-1.5 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Charity row ──────────────────────────────────────────────────────────────

function CharityRow({
  charity,
  allTopics,
}: {
  charity: Charity;
  allTopics: AdminTopic[];
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: charity.name,
    description: charity.description ?? "",
    registered_number: charity.registered_number ?? "",
    logo_url: charity.logo_url ?? "",
    market: charity.market,
  });

  // Suggested topics state
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [topicsLoaded, setTopicsLoaded] = useState(false);
  const [topicsSearch, setTopicsSearch] = useState("");
  const [topicsPending, setTopicsPending] = useState(false);
  const [topicsError, setTopicsError] = useState<string | null>(null);

  useEffect(() => {
    getCharityTopics(charity.id).then(({ data }) => {
      setSelectedTopicIds(data ?? []);
      setTopicsLoaded(true);
    });
  }, [charity.id]);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateCharity(charity.id, form);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  function handleDeactivate() {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await deactivateCharity(charity.id);
      if (result.error) {
        setError(result.error);
      } else {
        setConfirmDeactivate(false);
        if (result.warning) setWarning(result.warning);
      }
    });
  }

  function handleReactivate() {
    setError(null);
    setWarning(null);
    startTransition(async () => {
      const result = await reactivateCharity(charity.id);
      if (result.error) setError(result.error);
    });
  }

  function handleSaveTopics() {
    setTopicsError(null);
    setTopicsPending(true);
    setCharityTopics(charity.id, selectedTopicIds).then(({ error: e }) => {
      setTopicsPending(false);
      if (e) {
        setTopicsError(e);
      } else {
        setTopicsOpen(false);
        setTopicsSearch("");
      }
    });
  }

  const filteredTopics = allTopics.filter((t) =>
    t.title.toLowerCase().includes(topicsSearch.toLowerCase()),
  );

  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 space-y-3 transition-opacity ${!charity.is_active ? "opacity-50" : ""}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">{charity.name}</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {charity.registered_number ?? "—"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <MarketBadge market={charity.market} />
          <ActiveBadge active={charity.is_active} />
        </div>
      </div>

      {/* Inline feedback */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {warning && (
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          {warning}
        </p>
      )}

      {/* Edit form */}
      {editing && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1 border-t border-border">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Registered number
            </label>
            <input
              type="text"
              value={form.registered_number}
              onChange={(e) => set("registered_number", e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Logo URL
            </label>
            <input
              type="text"
              value={form.logo_url}
              onChange={(e) => set("logo_url", e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Market
            </label>
            <select
              value={form.market}
              onChange={(e) => set("market", e.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {VALID_MARKETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded px-3 py-1 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
              }}
              disabled={isPending}
              className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Suggested topics */}
      <div className="pt-1 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">
            Suggested topics
            {topicsLoaded && selectedTopicIds.length > 0 && (
              <span className="ml-1 text-foreground">
                ({selectedTopicIds.length})
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setTopicsOpen((v) => !v);
              setTopicsSearch("");
              setTopicsError(null);
            }}
            className="rounded px-2 py-0.5 text-xs font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {topicsOpen ? "Close" : "Edit"}
          </button>
        </div>

        {topicsOpen && (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={topicsSearch}
              onChange={(e) => setTopicsSearch(e.target.value)}
              placeholder="Search topics…"
              className="w-full rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {filteredTopics.map((t) => {
                const checked = selectedTopicIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setSelectedTopicIds((prev) =>
                        checked
                          ? prev.filter((id) => id !== t.id)
                          : [...prev, t.id],
                      )
                    }
                    className={`flex w-full items-center gap-2 rounded px-2 py-1 text-sm text-left transition-colors hover:bg-accent ${checked ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  >
                    <span
                      className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${checked ? "border-primary bg-primary" : "border-border"}`}
                    />
                    {t.title}
                  </button>
                );
              })}
              {filteredTopics.length === 0 && (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  No topics found.
                </p>
              )}
            </div>
            {topicsError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {topicsError}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveTopics}
                disabled={topicsPending}
                className="rounded px-3 py-1 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {topicsPending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTopicsOpen(false);
                  setTopicsSearch("");
                  setTopicsError(null);
                }}
                disabled={topicsPending}
                className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!editing && (
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setConfirmDeactivate(false);
              setError(null);
              setWarning(null);
            }}
            disabled={isPending}
            className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
          >
            Edit
          </button>

          {charity.is_active ? (
            confirmDeactivate ? (
              <>
                <button
                  type="button"
                  onClick={handleDeactivate}
                  disabled={isPending}
                  className="rounded px-3 py-1 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                >
                  {isPending ? "…" : "Confirm deactivate"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDeactivate(false);
                    setError(null);
                  }}
                  disabled={isPending}
                  className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDeactivate(true)}
                disabled={isPending}
                className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
              >
                Deactivate
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleReactivate}
              disabled={isPending}
              className="rounded px-3 py-1 text-sm font-medium border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
            >
              {isPending ? "…" : "Reactivate"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Charity list ─────────────────────────────────────────────────────────────

export function CharityList({
  charities,
  allTopics,
}: {
  charities: Charity[];
  allTopics: AdminTopic[];
}) {
  if (charities.length === 0) {
    return <p className="text-sm text-muted-foreground">No charities found.</p>;
  }

  return (
    <div className="space-y-3">
      {charities.map((charity) => (
        <CharityRow key={charity.id} charity={charity} allTopics={allTopics} />
      ))}
    </div>
  );
}
