import { notFound } from "next/navigation"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import { RegisterScope } from "@/components/register-scope"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { formatAmount } from "@/lib/display"

// THE APPEAL PAGE (concept: references/appeals-concept-2026-09-05.md).
// An appeal is an AGGREGATION VIEW — one charity, many member favpolls,
// one total. The blurb is the one place long-form story legitimately
// lives (the 08-06 verdict keeps it off favpolls). Members are listed
// QUIETLY — alphabetical with totals shown, never a podium: appeals sit
// memorial-adjacent and "most raised" reads competitive where
// competition is wrong (founder decision, 2026-09-05).
//
// Fundraiser palette: an appeal is charity-led — the money is the
// point, the cause register's own reasoning.
export default async function AppealPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: appeal } = await supabase
    .from("appeals")
    .select(
      "id, slug, name, blurb, photo_url, closes_at, opens_at, charity_id, charities(name)"
    )
    .eq("slug", slug)
    .maybeSingle()
  if (!appeal) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charityName = (appeal.charities as any)?.name ?? ""
  const isOpen =
    new Date(appeal.opens_at) <= new Date() &&
    (!appeal.closes_at || new Date(appeal.closes_at) > new Date())

  const { data: agg } = await supabase.rpc("appeal_live_totals", {
    p_appeal_ids: [appeal.id],
  })
  const raised = Number(agg?.[0]?.raised ?? 0)

  type MemberRow = {
    id: string
    closed_at: string | null
    total_raised: number
    subject: string
    cause_label: string | null
    protagonists: { name: string } | null
    favpoll_polls: { topics: { title: string } | null } | null
  }
  const { data: rawMembers } = await supabase
    .from("favpolls")
    .select(
      `id, closed_at, total_raised, subject, cause_label,
       protagonists!favpolls_protagonist_id_fkey ( name ),
       favpoll_polls ( topics ( title ) )`
    )
    .eq("appeal_id", appeal.id)
  const members = await withLiveTotals(
    supabase,
    (rawMembers ?? []) as unknown as MemberRow[]
  )
  const rows = members
    .map((m) => ({
      id: m.id,
      name:
        m.subject === "cause"
          ? (m.cause_label ?? "")
          : (m.protagonists?.name ?? ""),
      topic: m.favpoll_polls?.topics?.title ?? null,
      raised: m.total_raised,
    }))
    // Quiet, alphabetical — deliberately not a leaderboard.
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <RegisterScope palette="fundraiser">
      <main className="min-h-screen bg-primary/5">
        <div className="mx-auto w-full max-w-3xl px-6 py-14">
          <SectionEyebrow variant="muted">
            An appeal for{" "}
            <Link
              href={`/charities/${appeal.charity_id}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {charityName}
            </Link>
          </SectionEyebrow>
          <h1 className="mt-2 text-4xl leading-tight font-light tracking-tight text-foreground">
            {appeal.name}
          </h1>
          {appeal.blurb && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {appeal.blurb}
            </p>
          )}

          <div className="mt-8 rounded-xl border border-border bg-background p-5">
            <p className="text-sm text-muted-foreground">Raised so far</p>
            <p className="mt-1 text-4xl font-light text-primary tabular-nums">
              {formatAmount(raised)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              across {rows.length} favpoll{rows.length === 1 ? "" : "s"}
              {appeal.closes_at &&
                ` · closes ${new Date(appeal.closes_at).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "long", year: "numeric" }
                )}`}
            </p>
          </div>

          {isOpen && (
            <div className="mt-6">
              <Button
                asChild
                size="lg"
                className="h-auto min-h-11 px-6 py-2 text-base"
              >
                <Link href={`/favpolls/new?appeal=${appeal.slug}`}>
                  Start your favpoll
                </Link>
              </Button>
            </div>
          )}

          {rows.length > 0 && (
            <div className="mt-10">
              <SectionEyebrow variant="muted" className="mb-3">
                The favpolls
              </SectionEyebrow>
              <ul className="divide-y divide-border rounded-xl border border-border bg-background">
                {rows.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/favpolls/${r.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-primary/5"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-foreground">
                        {r.name}
                        {r.topic && (
                          <span className="font-normal text-muted-foreground">
                            {" "}
                            · {r.topic}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-sm font-medium text-primary tabular-nums">
                        {formatAmount(r.raised)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </RegisterScope>
  )
}
