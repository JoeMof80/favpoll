import Link from "next/link";
import {
  getDashboardStats,
  getRecentFavpolls,
  getRecentPledges,
} from "@/lib/actions/dashboard";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const GBP_EXACT = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function StatTile({
  label,
  value,
  hint,
  href,
  alert,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  alert?: boolean;
}) {
  const inner = (
    <div
      className={`h-full rounded-lg border bg-card p-4 transition-colors ${
        alert ? "border-warning/50" : "border-border"
      } ${href ? "hover:bg-muted/50" : ""}`}
    >
      <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default async function DashboardPage() {
  const [stats, favpolls, pledges] = await Promise.all([
    getDashboardStats(),
    getRecentFavpolls(),
    getRecentPledges(),
  ]);

  if (stats.error || !stats.data) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-destructive">
          {stats.error ?? "Failed to load stats."}
        </p>
      </div>
    );
  }

  const s = stats.data;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Platform stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Live favpolls"
          value={String(s.favpolls_open)}
          hint={`${s.favpolls_closed} closed · ${s.favpolls_total} all-time`}
        />
        <StatTile
          label="Pledged to charity"
          value={GBP.format(s.total_pledged)}
          hint={`${s.pledges_count.toLocaleString("en-GB")} pledges`}
        />
        <StatTile
          label="For favpoll"
          value={GBP_EXACT.format(s.total_tips)}
          hint="optional contributions"
        />
        <StatTile
          label="Active charities"
          value={String(s.active_charities)}
          href="/charities"
        />
      </div>

      {/* Needs attention */}
      <section>
        <h2 className="mb-3 text-sm font-medium tracking-wider text-muted-foreground uppercase">
          Needs attention
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile
            label="Pending contributions"
            value={String(s.pending_contributions)}
            href="/contributions"
            alert={s.pending_contributions > 0}
          />
          <StatTile
            label="Charity issues"
            value={String(s.charity_issues)}
            hint="mismatch / removed / not found"
            href="/charities"
            alert={s.charity_issues > 0}
          />
          <StatTile
            label="Drafts to review"
            value={String(s.drafts_to_review)}
            href="/generated-drafts"
            alert={s.drafts_to_review > 0}
          />
        </div>
      </section>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-medium tracking-wider text-muted-foreground uppercase">
            Recent favpolls
          </h2>
          {favpolls.data && favpolls.data.length > 0 ? (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Raised</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {favpolls.data.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-medium text-foreground">
                        {ev.display_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {ev.category ?? "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {GBP.format(ev.total_raised)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(ev.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {ev.closed_at ? (
                          <StatusBadge tone="neutral">Closed</StatusBadge>
                        ) : (
                          <StatusBadge tone="success">Open</StatusBadge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {favpolls.error ?? "No favpolls yet."}
            </p>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium tracking-wider text-muted-foreground uppercase">
            Recent pledges
          </h2>
          {pledges.data && pledges.data.length > 0 ? (
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Favpoll</TableHead>
                    <TableHead>Pledge</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pledges.data.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">
                        {p.favpoll_name}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {GBP_EXACT.format(p.total_amount)}
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {p.tip_amount > 0
                          ? GBP_EXACT.format(p.tip_amount)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(p.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {pledges.error ?? "No pledges yet."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
