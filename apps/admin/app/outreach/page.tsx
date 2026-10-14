import { getOutreachPreviewRows } from "@/lib/actions/charities";
import { OutreachPreview } from "@/components/outreach-preview";

// RENDERED PER REQUEST, unlike /contributions and /favpolls which are
// prerendered and kept fresh by revalidatePath from their own mutating
// actions. That pattern cannot work here: this page's data moves when the
// REGISTER MIRROR is reloaded, when a profile backfill writes signature
// events, and when the nightly verify-charities cron runs — none of which is
// an action in this app, so none of which could revalidate the path. Without
// this the page would serve whatever was true at build time, which for a page
// whose entire job is reporting what is missing would be worse than useless.
export const dynamic = "force-dynamic";

// The outreach email, read before it is sent (founder, 2026-10-07). The
// consent queue is the list to WORK; this is the list to CHECK, and it takes
// every charity rather than the queue's narrower set — on production that set
// is currently empty while 42 accounts wait to be written to.
export default async function OutreachPage() {
  const { data, error } = await getOutreachPreviewRows();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Outreach</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Both emails as the charity will read them, for every charity in the
          catalogue. Each is built by interpolating live data — its own event,
          its topic, the reason text, its stored name — so this is where a
          missing address, a dropped paragraph or a spliced half-sentence shows
          up, instead of inside a draft nobody opened.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The words are not final. The invite still says an organiser has picked
          this charity, which is true in the consent queue and false for a cold
          approach — rewriting it waits on the disbursement rail.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <OutreachPreview rows={data ?? []} />
    </div>
  );
}
