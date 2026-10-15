import { LibraryIndex } from "@/components/library-index";
import { LIBRARY, SECTIONS, entriesIn, slugFor } from "@/lib/library";

// THE LIBRARY: the documents that matter, in the sections the founder
// reaches for them by, each readable here or one click away. The registry
// is lib/library.ts; this page only lays it out.
export default function LibraryPage() {
  const sections = SECTIONS.map((section) => ({
    section,
    entries: entriesIn(section).map((e) => ({
      ...e,
      href:
        e.kind === "reference"
          ? `/library/${slugFor(e)}`
          : e.kind === "pdf"
            ? `/library/file/${e.source}`
            : e.source,
    })),
  }));
  const latest = [...LIBRARY].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Library</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The documents that matter, in one place. Reference notes open here as
          a reading page; the Rail Decision, the Seeded Stories and the
          use-cases doc open on claude.ai. To add one, add a line to{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            apps/admin/lib/library.ts
          </code>
          .
        </p>
        {latest && (
          <p className="mt-2 text-xs text-muted-foreground">
            Most recent: {latest.title} · {latest.date}
          </p>
        )}
      </div>
      <LibraryIndex sections={sections} />
    </div>
  );
}
