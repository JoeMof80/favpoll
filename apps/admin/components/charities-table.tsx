"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import type { Charity } from "@/lib/actions/charities";
import {
  createCharity,
  updateCharity,
  deactivateCharity,
  reactivateCharity,
  getCharityTopics,
  setCharityTopics,
  searchCharityRegister,
} from "@/lib/actions/charities";
import type { RegisterSearchResult } from "@/lib/charity-commission";
import type { AdminTopic } from "@/lib/actions/topics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VALID_MARKETS = ["en-GB"];

// ─── Badges ──────────────────────────────────────────────────────────────────

const VERIFICATION_BADGES: Record<string, { label: string; tone: StatusTone }> =
  {
    verified: { label: "Verified", tone: "success" },
    name_mismatch: { label: "Name mismatch", tone: "warning" },
    not_found: { label: "Not on register", tone: "destructive" },
    removed: { label: "Removed from register", tone: "destructive" },
    error: { label: "Check failed", tone: "neutral" },
  };

function VerificationBadge({
  status,
  verifiedName,
}: {
  status: string | null;
  verifiedName: string | null;
}) {
  if (!status) return <span className="text-muted-foreground">—</span>;
  const badge = VERIFICATION_BADGES[status];
  if (!badge) return <span className="text-muted-foreground">—</span>;
  return (
    <StatusBadge
      tone={badge.tone}
      title={
        status === "name_mismatch" && verifiedName
          ? `Register name: ${verifiedName}`
          : undefined
      }
    >
      {badge.label}
    </StatusBadge>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function MarketSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {VALID_MARKETS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}

type CharityFormValues = {
  name: string;
  description: string;
  registered_number: string;
  logo_url: string;
  market: string;
};

// ─── Register typeahead ───────────────────────────────────────────────────────

function RegisterSearch({
  onPick,
}: {
  onPick: (result: RegisterSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RegisterSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      searchCharityRegister(q).then((rows) => {
        if (cancelled) return;
        setResults(rows);
        setSearching(false);
      });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const showEmpty =
    !searching && query.trim().length >= 3 && results.length === 0;

  return (
    <div>
      <label className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Search className="size-3" aria-hidden="true" />
        Add from the Register of Charities
      </label>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by charity name — fills name and number, pre-verified"
        aria-label="Search the Register of Charities"
      />
      {(results.length > 0 || searching || showEmpty) && (
        <div className="mt-1 rounded-lg border border-border bg-card p-1">
          {searching && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              Searching the register…
            </p>
          )}
          {showEmpty && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              No registered charities found — check the spelling or enter
              details manually below.
            </p>
          )}
          {!searching &&
            results.map((r) => (
              <Button
                key={r.registeredNumber}
                type="button"
                variant="ghost"
                size="sm"
                className="w-full justify-between font-normal"
                onClick={() => {
                  onPick(r);
                  setQuery("");
                  setResults([]);
                }}
              >
                <span className="truncate">{r.displayName}</span>
                <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                  {r.registeredNumber}
                </span>
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}

function CharityFields({
  form,
  set,
}: {
  form: CharityFormValues;
  set: (field: keyof CharityFormValues, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <RegisterSearch
        onPick={(r) => {
          set("name", r.displayName);
          set("registered_number", r.registeredNumber);
        }}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name *">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Cancer Research UK"
          />
        </Field>
        <Field label="Registered number">
          <Input
            value={form.registered_number}
            onChange={(e) => set("registered_number", e.target.value)}
            placeholder="1089464"
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
            className="resize-none"
          />
        </Field>
        <Field label="Logo URL">
          <Input
            value={form.logo_url}
            onChange={(e) => set("logo_url", e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field label="Market">
          <MarketSelect
            value={form.market}
            onChange={(v) => set("market", v)}
          />
        </Field>
      </div>
    </div>
  );
}

// ─── Add charity form ─────────────────────────────────────────────────────────

const EMPTY_FORM: CharityFormValues = {
  name: "",
  description: "",
  registered_number: "",
  logo_url: "",
  market: "en-GB",
};

export function AddCharityForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CharityFormValues>(EMPTY_FORM);

  function set(field: keyof CharityFormValues, value: string) {
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
        setForm(EMPTY_FORM);
      }
    });
  }

  if (!open) {
    return (
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        + Add charity
      </Button>
    );
  }

  return (
    <div className="w-full space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-medium">Add charity</h2>
      <CharityFields form={form} set={set} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isPending}
          onClick={handleSubmit}
        >
          {isPending ? "Saving…" : "Save charity"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Suggested topics editor ──────────────────────────────────────────────────

function TopicsEditor({
  charityId,
  allTopics,
}: {
  charityId: string;
  allTopics: AdminTopic[];
}) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleOpen() {
    if (!open && !loaded) {
      getCharityTopics(charityId).then(({ data }) => {
        setSelectedIds(data ?? []);
        setLoaded(true);
      });
    }
    setOpen((v) => !v);
    setSearch("");
    setError(null);
  }

  function handleSave() {
    setError(null);
    setPending(true);
    setCharityTopics(charityId, selectedIds).then(({ error: e }) => {
      setPending(false);
      if (e) {
        setError(e);
      } else {
        setOpen(false);
        setSearch("");
      }
    });
  }

  const filtered = allTopics.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          Suggested topics
          {loaded && selectedIds.length > 0 && (
            <span className="ml-1 text-foreground">({selectedIds.length})</span>
          )}
        </p>
        <Button type="button" size="xs" variant="outline" onClick={toggleOpen}>
          {open ? "Close" : "Edit"}
        </Button>
      </div>

      {open && (
        <div className="mt-2 space-y-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics…"
          />
          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {filtered.map((t) => {
              const checked = selectedIds.includes(t.id);
              return (
                <Button
                  key={t.id}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start gap-2 font-normal ${checked ? "font-medium text-foreground" : "text-muted-foreground"}`}
                  onClick={() =>
                    setSelectedIds((prev) =>
                      checked
                        ? prev.filter((id) => id !== t.id)
                        : [...prev, t.id],
                    )
                  }
                >
                  <span
                    aria-hidden="true"
                    className={`size-3.5 shrink-0 rounded-sm border ${checked ? "border-primary bg-primary" : "border-border"}`}
                  />
                  {t.title}
                </Button>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                No topics found.
              </p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={handleSave}
            >
              {pending ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={toggleOpen}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
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
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CharityFormValues>({
    name: charity.name,
    description: charity.description ?? "",
    registered_number: charity.registered_number ?? "",
    logo_url: charity.logo_url ?? "",
    market: charity.market,
  });

  function set(field: keyof CharityFormValues, value: string) {
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

  const Chevron = open ? ChevronDown : ChevronRight;

  return (
    <>
      <TableRow
        className={`cursor-pointer ${!charity.is_active ? "opacity-50" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <TableCell className="w-8 pr-0 text-muted-foreground">
          <Chevron className="size-4" aria-hidden="true" />
        </TableCell>
        <TableCell className="font-medium text-foreground">
          {charity.name}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {charity.registered_number ?? "—"}
        </TableCell>
        <TableCell>
          <VerificationBadge
            status={charity.verification_status}
            verifiedName={charity.verified_name}
          />
        </TableCell>
        <TableCell>
          <StatusBadge tone="info">{charity.market}</StatusBadge>
        </TableCell>
        <TableCell className="text-right">
          {charity.is_active ? (
            <StatusBadge tone="success">Active</StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Inactive</StatusBadge>
          )}
        </TableCell>
      </TableRow>

      {open && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={6} className="bg-muted/30 py-4">
            <div
              className="max-w-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {error && <p className="text-sm text-destructive">{error}</p>}
              {warning && <p className="text-sm text-warning">{warning}</p>}

              {editing ? (
                <div className="space-y-3">
                  <CharityFields form={form} set={set} />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending}
                      onClick={handleSave}
                    >
                      {isPending ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => {
                        setEditing(false);
                        setError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {charity.description && (
                    <p className="text-sm text-muted-foreground">
                      {charity.description}
                    </p>
                  )}

                  <TopicsEditor charityId={charity.id} allTopics={allTopics} />

                  <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => {
                        setEditing(true);
                        setConfirmDeactivate(false);
                        setError(null);
                        setWarning(null);
                      }}
                    >
                      Edit
                    </Button>

                    {charity.is_active ? (
                      confirmDeactivate ? (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={isPending}
                            onClick={handleDeactivate}
                          >
                            {isPending ? "…" : "Confirm deactivate"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() => {
                              setConfirmDeactivate(false);
                              setError(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => setConfirmDeactivate(true)}
                        >
                          Deactivate
                        </Button>
                      )
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={handleReactivate}
                      >
                        {isPending ? "…" : "Reactivate"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

// ─── Charities table ──────────────────────────────────────────────────────────

export function CharitiesTable({
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
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8" />
            <TableHead>Name</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead>Market</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {charities.map((charity) => (
            <CharityRow
              key={charity.id}
              charity={charity}
              allTopics={allTopics}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
