import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatPounds } from "@/lib/i18n"

export const metadata = {
  title: "Charities — favpoll",
  description:
    "The charities favpoll supports. Every pledge reaches them in full — favpoll takes no fee.",
}

type Stat = { total_raised: number; live_count: number }

export default async function CharitiesIndexPage() {
  const supabase = createAdminClient()

  const [{ data: charities }, { data: statsData }] = await Promise.all([
    supabase
      .from("charities")
      .select("id, name, logo_url, verification_status")
      .eq("is_active", true)
      .order("name"),
    supabase.rpc("all_charity_stats"),
  ])

  const stats = (statsData as Record<string, Stat> | null) ?? {}

  const rows = (charities ?? [])
    .map((c) => ({
      ...c,
      total_raised: stats[c.id]?.total_raised ?? 0,
      live_count: stats[c.id]?.live_count ?? 0,
    }))
    // Charities with activity first (by raised), then the rest alphabetically.
    .sort((a, b) => {
      if (b.total_raised !== a.total_raised)
        return b.total_raised - a.total_raised
      return a.name.localeCompare(b.name)
    })

  return (
    <main className="mx-auto max-w-330 px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-foreground">Charities</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The causes favpoll supports. Every pledge reaches them in full —
          favpoll takes no fee.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No charities yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <Link
              key={c.id}
              href={`/charities/${c.id}`}
              className="group flex items-center gap-4 rounded-lg border border-border bg-card px-5 py-4 transition-colors hover:border-primary/30 hover:bg-secondary/20 focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {c.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.logo_url}
                  alt=""
                  className="size-12 shrink-0 rounded-lg object-contain"
                />
              ) : (
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-medium text-primary"
                  aria-hidden="true"
                >
                  {c.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium text-foreground">
                  <span className="truncate">{c.name}</span>
                  {c.verification_status === "verified" && (
                    <BadgeCheck
                      className="size-4 shrink-0 text-primary"
                      role="img"
                      aria-label="Verified with the Charity Commission"
                    />
                  )}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {c.total_raised > 0
                    ? `${formatPounds(c.total_raised)} raised`
                    : "No pledges yet"}
                  {c.live_count > 0 && <> · {c.live_count} live</>}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
