import { getClosedFavpolls } from "@/lib/actions/exemplars";
import { ExemplarTable } from "@/components/exemplar-table";

export default async function FavpollsPage() {
  const { data: favpolls, error } = await getClosedFavpolls();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Favpolls</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Mark closed favpolls as exemplars to surface them in the inspiration
        door on the New Favpoll form.
      </p>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <ExemplarTable favpolls={favpolls ?? []} />
      )}
    </div>
  );
}
