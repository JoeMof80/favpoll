import { LibraryIndex } from "@/components/library-index"
import { LIBRARY, slugFor } from "@/lib/library"

// THE LIBRARY: the documents that matter, newest first, each readable here
// or one click away. The registry is lib/library.ts; this page only lays it
// out. Sorting and grouping live in the index component.
export default function LibraryPage() {
  const entries = LIBRARY.map((e) => ({
    ...e,
    href: e.kind === "reference" ? `/library/${slugFor(e)}` : e.source,
  }))

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
        {/* No "Most recent" line any more: the list is newest first, so the
            first row is the answer. */}
      </div>
      <LibraryIndex entries={entries} />
    </div>
  )
}
