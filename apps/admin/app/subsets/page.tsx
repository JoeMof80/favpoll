import { getHomemadeTopics, getSubsets } from "@/lib/actions/subsets";
import { getTopics } from "@/lib/actions/topics";
import { SubsetsTable } from "@/components/subsets-table";
import { HomemadeTopicsTable } from "@/components/homemade-topics-table";

// SUBSETS (favpoll-topic-rules §1): the admin's door. The scan proposes,
// the admin approves; only approved subsets reach the picker.
export default async function SubsetsPage() {
  const [{ data, error }, { data: homemade }, { data: topics }] =
    await Promise.all([getSubsets(), getHomemadeTopics(), getTopics()]);
  const rows = data ?? [];
  // Parents are catalogue topics only.
  const parents = (topics ?? []).filter((t) => t.is_catalogue);
  const proposed = rows.filter((r) => r.status === "proposed");
  const approved = rows.filter((r) => r.status === "approved");
  const rejected = rows.filter((r) => r.status === "rejected");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Subsets</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          A named subset of one topic&rsquo;s items, for a cause or an occasion
          that pulls for it: Farm animal on Animal. Six to sixteen items already
          on the parent&rsquo;s list; a name an ordinary person would put after
          &ldquo;favourite&rdquo; without thinking. Approved subsets sit beside
          their parent in the picker.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Proposed ({proposed.length})
        </h2>
        {proposed.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing waiting. The scan proposes them: scripts/propose-subsets.ts.
          </p>
        ) : (
          <SubsetsTable rows={proposed} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Approved ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <SubsetsTable rows={approved} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Homemade topics ({(homemade ?? []).length})
        </h2>
        <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
          Organisers&rsquo; own topics still in the picker. One whose items all
          sit on a catalogue topic&rsquo;s list is a subset that arrived by the
          wrong door: promote it and it becomes one for the next organiser,
          while the favpoll that made it keeps its own topic and items. The
          homemade row leaves the picker.
        </p>
        {(homemade ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">None in the picker.</p>
        ) : (
          <HomemadeTopicsTable rows={homemade ?? []} parents={parents} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Rejected ({rejected.length})
        </h2>
        {rejected.length === 0 ? (
          <p className="text-sm text-muted-foreground">None.</p>
        ) : (
          <SubsetsTable rows={rejected} />
        )}
      </section>
    </div>
  );
}
