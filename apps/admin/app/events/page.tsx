import { getClosedEvents } from "@/lib/actions/exemplars";
import { ExemplarTable } from "@/components/exemplar-table";

export default async function EventsPage() {
  const { data: events, error } = await getClosedEvents();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Events</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Mark closed events as exemplars to surface them in the inspiration door
        on the New Event form.
      </p>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <ExemplarTable events={events ?? []} />
      )}
    </div>
  );
}
