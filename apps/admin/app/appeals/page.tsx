import { getAppeals } from "@/lib/actions/appeals";
import { getCharities } from "@/lib/actions/charities";
import { AppealsTable, AddAppealForm } from "@/components/appeals-table";

export default async function AppealsPage() {
  const [{ data: appeals, error }, { data: charities }] = await Promise.all([
    getAppeals(),
    getCharities(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Appeals</h1>
        <AddAppealForm charities={charities ?? []} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <AppealsTable appeals={appeals ?? []} charities={charities ?? []} />
    </div>
  );
}
