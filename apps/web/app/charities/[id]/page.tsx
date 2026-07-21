import { notFound } from "next/navigation"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import {
  FavpollSummaryCard,
  type FavpollSummaryCardFavpoll,
} from "@/components/favpoll-summary-card"
import type { Charity } from "@favpoll/types"
import { formatPounds } from "@/lib/i18n"

type Props = { params: Promise<{ id: string }> }

type CharityStats = {
  total_raised: number
  favpoll_count: number
  live_count: number
}

export default async function CharityPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: charity } = await supabase
    .from("charities")
    .select(
      "id, name, description, impact_statement, logo_url, registered_number, verification_status, is_active"
    )
    .eq("id", id)
    .single()

  if (!charity || !charity.is_active) notFound()

  const { data: statsData } = await supabase.rpc("charity_stats", {
    p_charity_id: id,
  })
  const stats = (statsData as CharityStats | null) ?? {
    total_raised: 0,
    favpoll_count: 0,
    live_count: 0,
  }

  // Open favpolls supporting this charity — the "charities market favpoll
  // for you" surface. Listed, open, non-private only.
  const { data: rawLive } = await supabase
    .from("favpoll_charities")
    .select(
      `favpolls!inner (
        id, occasion_type, subject, cause_label, opening_line, closes_at,
        closed_at, total_raised, is_listed, is_private,
        protagonist:protagonists!favpolls_protagonist_id_fkey ( name ),
        favpoll_charities ( charity:charities ( id, name, logo_url, registered_number ) ),
        favpoll_polls ( topics ( title ) )
      )`
    )
    .eq("charity_id", id)
    .is("favpolls.closed_at", null)
    .eq("favpolls.is_listed", true)
    .eq("favpolls.is_private", false)
    .limit(12)

  const liveFavpolls: FavpollSummaryCardFavpoll[] = (rawLive ?? []).map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = (r as any).favpolls
    return {
      id: f.id,
      occasion_type: f.occasion_type,
      subject: f.subject,
      cause_label: f.cause_label,
      opening_line: f.opening_line ?? "",
      closes_at: f.closes_at,
      closed_at: f.closed_at,
      total_raised: f.total_raised ?? 0,
      protagonist: f.protagonist,
      charities: (f.favpoll_charities ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => ({ charity: c.charity })
      ),
      poll: { topic: f.favpoll_polls?.[0]?.topics ?? null },
    }
  })

  const isVerified = charity.verification_status === "verified"
  const contactEmail =
    process.env.PARTNERSHIPS_EMAIL ??
    process.env.SUPPORT_EMAIL ??
    "hello@favpoll.com"

  return (
    <main className="mx-auto max-w-330 px-6 py-12">
      {/* Header */}
      <div className="flex items-start gap-4">
        {charity.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={charity.logo_url}
            alt={charity.name}
            className="size-16 shrink-0 rounded-lg object-contain"
          />
        ) : (
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-2xl font-medium text-primary"
            aria-hidden="true"
          >
            {charity.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-medium text-foreground">
            {charity.name}
            {isVerified && (
              <BadgeCheck
                className="size-5 text-primary"
                role="img"
                aria-label="Verified with the Charity Commission"
              />
            )}
          </h1>
          {charity.registered_number && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Registered charity {charity.registered_number}
            </p>
          )}
        </div>
      </div>

      {charity.description && (
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {charity.description}
        </p>
      )}

      {charity.impact_statement && (
        <p className="mt-4 inline-block rounded-md bg-secondary/40 px-4 py-2 text-sm font-medium text-secondary-foreground">
          {charity.impact_statement}
        </p>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-2xl font-medium text-primary tabular-nums">
            {formatPounds(stats.total_raised)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            raised through favpoll
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-4">
          <p className="text-2xl font-medium text-foreground tabular-nums">
            {stats.favpoll_count}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            favpoll{stats.favpoll_count === 1 ? "" : "s"} in their name
          </p>
        </div>
      </div>

      {/* Open favpolls */}
      <section className="mt-12">
        <SectionEyebrow className="mb-4">
          Open favpolls supporting {charity.name}
        </SectionEyebrow>
        {liveFavpolls.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open favpolls right now — start one and every pledge reaches{" "}
            {charity.name} in full.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {liveFavpolls.map((favpoll) => (
              <FavpollSummaryCard key={favpoll.id} favpoll={favpoll} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <div className="mt-12 rounded-lg border border-border bg-secondary/30 px-6 py-8 text-center">
        <h2 className="text-lg font-medium text-foreground">
          Honour someone, and support {charity.name}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          Create a favpoll in someone&apos;s name and turn your guests&apos;
          favourites into funds. favpoll takes no fee — 100% reaches the
          charity.
        </p>
        <Button asChild className="mt-5">
          <Link href="/favpolls/new">Create a favpoll</Link>
        </Button>
      </div>

      {/* Charity claim — a manual first step before a self-service portal:
          gathers demand and starts the relationship without a verification
          system. The subject carries the charity name + id so replies are
          identifiable. */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Is this your charity?{" "}
        <a
          href={`mailto:${contactEmail}?subject=${encodeURIComponent(
            `Charity page — ${charity.name}`
          )}&body=${encodeURIComponent(
            `We'd like to help keep ${charity.name}'s favpoll page up to date (logo, description, impact statement).\n\nCharity: ${charity.name}\nReference: ${charity.id}`
          )}`}
          className="font-medium text-primary hover:underline"
        >
          Get in touch
        </a>{" "}
        to help keep this page up to date.
      </p>
    </main>
  )
}
