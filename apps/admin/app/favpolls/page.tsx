import { getAllFavpolls } from "@/lib/actions/favpolls";
import { FavpollsTable } from "@/components/favpolls-table";

export default async function FavpollsPage() {
  const { data: favpolls, error } = await getAllFavpolls();
  const webBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? null;

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
        <FavpollsTable favpolls={favpolls ?? []} webBaseUrl={webBaseUrl} />
      )}
    </div>
  );
}
