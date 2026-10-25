import { getAllFavpolls } from "@/lib/actions/favpolls"
import { FavpollsTable } from "@/components/favpolls-table"

// The query lives in the URL: the search runs in the database now, so a
// result is a page you can send to someone or reload into.
export default async function FavpollsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const sp = await searchParams
  const status =
    sp.status === "open" || sp.status === "closed" ? sp.status : "all"
  const {
    data: favpolls,
    error,
    total,
  } = await getAllFavpolls({ q: sp.q, status })
  const webBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Favpolls</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every favpoll on the platform. Close early, list/unlist, and mark
          closed favpolls as exemplars for the inspiration door on the New
          Favpoll form.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <FavpollsTable
          favpolls={favpolls ?? []}
          total={total}
          q={sp.q ?? ""}
          status={status}
          webBaseUrl={webBaseUrl}
        />
      )}
    </div>
  )
}
