import {
  getGeneratedDrafts,
  type DraftStatus,
} from "@/lib/actions/generated-drafts";
import { DraftRow } from "@/components/draft-row";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: DraftStatus; label: string }[] = [
  { value: "generated", label: "Generated" },
  { value: "curated", label: "Curated" },
  { value: "rejected", label: "Rejected" },
];

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function GeneratedDraftsPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const filter: DraftStatus =
    STATUS_OPTIONS.find((o) => o.value === statusParam)?.value ?? "generated";

  const { data, error } = await getGeneratedDrafts(filter);
  const drafts = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Generated Drafts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review LLM-generated About and Reveal copy. Editing or updating status
          here does not change what new events receive — the cache continues to
          serve the stored copy regardless of status. Curated status is reserved
          for future admin-first lookup.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {STATUS_OPTIONS.map(({ value, label }) => (
          <a
            key={value}
            href={`/generated-drafts?status=${value}`}
            className={cn(
              "rounded-full px-3 py-0.5 text-xs font-medium transition-colors",
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {label}
          </a>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {drafts.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">No {filter} drafts.</p>
      )}

      <div className="space-y-3">
        {drafts.map((draft) => (
          <DraftRow key={draft.id} draft={draft} />
        ))}
      </div>
    </div>
  );
}
