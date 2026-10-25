"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ExternalLink } from "lucide-react"
import type { OversightFavpoll } from "@/lib/actions/favpolls"
import { setListed, closeFavpollNow } from "@/lib/actions/favpolls"
import { setExemplar } from "@/lib/actions/exemplars"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

type StatusFilter = "all" | "open" | "closed"

function FavpollRow({
  favpoll,
  webBaseUrl,
}: {
  favpoll: OversightFavpoll
  webBaseUrl: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [confirmClose, setConfirmClose] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function run(action: () => Promise<{ error: string | null }>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.error) {
        setError(result.error)
      } else {
        setConfirmClose(false)
      }
    })
  }

  const isClosed = !!favpoll.closed_at

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          <span className="flex items-center gap-1.5">
            {favpoll.display_name}
            {webBaseUrl && (
              <a
                href={`${webBaseUrl}/favpolls/${favpoll.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${favpoll.display_name} on favpoll`}
                className="text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {favpoll.category ?? "—"}
        </TableCell>
        <TableCell className="tabular-nums">
          {GBP.format(favpoll.total_raised)}
        </TableCell>
        <TableCell className="text-muted-foreground">
          {new Date(favpoll.created_at).toLocaleDateString("en-GB")}
        </TableCell>
        <TableCell>
          {isClosed ? (
            <StatusBadge tone="neutral">Closed</StatusBadge>
          ) : (
            <StatusBadge tone="success">Open</StatusBadge>
          )}
        </TableCell>
        <TableCell>
          {favpoll.is_listed ? (
            <StatusBadge tone="info">Listed</StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Unlisted</StatusBadge>
          )}
        </TableCell>
        <TableCell className="text-right">
          <span className="flex justify-end gap-2">
            {isClosed ? (
              <Button
                type="button"
                size="xs"
                variant={favpoll.is_exemplar ? "secondary" : "ghost"}
                disabled={isPending}
                onClick={() =>
                  run(() => setExemplar(favpoll.id, !favpoll.is_exemplar))
                }
              >
                {favpoll.is_exemplar ? "Exemplar ✓" : "Set exemplar"}
              </Button>
            ) : confirmClose ? (
              <>
                <Button
                  type="button"
                  size="xs"
                  variant="destructive"
                  disabled={isPending}
                  onClick={() => run(() => closeFavpollNow(favpoll.id))}
                >
                  {isPending ? "…" : "Confirm close"}
                </Button>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={isPending}
                  onClick={() => setConfirmClose(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                disabled={isPending}
                onClick={() => setConfirmClose(true)}
              >
                Close now
              </Button>
            )}
            <Button
              type="button"
              size="xs"
              variant="ghost"
              disabled={isPending}
              onClick={() =>
                run(() => setListed(favpoll.id, !favpoll.is_listed))
              }
            >
              {favpoll.is_listed ? "Unlist" : "List"}
            </Button>
            {/* HMRC claim-schedule CSV — declarations captured at pledge;
                the charity claims. Empty file = no declarations yet.
                Multi-charity favpolls get one schedule PER charity: each
                may only claim on its penny-even share, so the route needs
                to know which charity's schedule this is. */}
            {favpoll.charities.length <= 1 ? (
              <Button size="xs" variant="ghost" asChild>
                <a href={`/api/gift-aid-schedule/${favpoll.id}`} download>
                  Gift Aid
                </a>
              </Button>
            ) : (
              favpoll.charities.map((charity) => (
                <Button key={charity.id} size="xs" variant="ghost" asChild>
                  <a
                    href={`/api/gift-aid-schedule/${favpoll.id}?charity=${charity.id}`}
                    download
                  >
                    Gift Aid ({charity.name})
                  </a>
                </Button>
              ))
            )}
          </span>
        </TableCell>
      </TableRow>
      {error && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7} className="bg-muted/30 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

export function FavpollsTable({
  favpolls,
  total,
  q,
  status,
  webBaseUrl,
}: {
  favpolls: OversightFavpoll[]
  /** Every favpoll matching the query, which may exceed the page below. */
  total: number
  q: string
  status: StatusFilter
  webBaseUrl: string | null
}) {
  // THE QUERY LIVES IN THE URL (2026-10-25). Search used to filter the rows
  // already loaded, so anything beyond the 200-row page returned nothing —
  // which looks exactly like an answer. It runs in the database now, and the
  // input only has to keep the URL up to date.
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [search, setSearch] = useState(q)
  const [navigating, startNavigate] = useTransition()

  const push = (next: { q?: string; status?: StatusFilter }) => {
    const sp = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (!v || v === "all") sp.delete(k)
      else sp.set(k, v)
    }
    startNavigate(() => router.replace(`${pathname}?${sp.toString()}`))
  }

  // Debounced: a keystroke a query would hammer the database, and an admin
  // typing a name does not need the list to chase every letter.
  useEffect(() => {
    if (search === q) return
    const id = window.setTimeout(() => push({ q: search }), 350)
    return () => window.clearTimeout(id)
  }, [search, q]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search every favpoll by name…"
          className="max-w-xs"
          aria-label="Search favpolls by name"
        />
        <div className="flex gap-1">
          {(["all", "open", "closed"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={status === value ? "secondary" : "ghost"}
              onClick={() => push({ status: value })}
            >
              {value === "all" ? "All" : value === "open" ? "Open" : "Closed"}
            </Button>
          ))}
        </div>
        <p className="ml-auto text-xs text-muted-foreground">
          {navigating
            ? "Searching…"
            : total > favpolls.length
              ? `Showing ${favpolls.length} of ${total} matches`
              : `${favpolls.length} match${favpolls.length === 1 ? "" : "es"}`}
        </p>
      </div>

      {favpolls.length === 0 ? (
        <p className="text-sm text-muted-foreground">No favpolls match.</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Raised</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favpolls.map((favpoll) => (
                <FavpollRow
                  key={favpoll.id}
                  favpoll={favpoll}
                  webBaseUrl={webBaseUrl}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
