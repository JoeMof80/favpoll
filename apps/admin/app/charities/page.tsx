import { getCharities } from "@/lib/actions/charities";
import { CharityList, AddCharityForm } from "@/components/charity-list";

const MARKETS = ["en-GB"];

type Props = {
  searchParams: Promise<{ market?: string }>;
};

export default async function CharitiesPage({ searchParams }: Props) {
  const { market } = await searchParams;
  const activeMarket = MARKETS.includes(market ?? "") ? market : undefined;

  const { data: charities, error } = await getCharities(activeMarket);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Charities</h1>
        <AddCharityForm />
      </div>

      {/* Market filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Market
        </span>
        <a
          href="/charities"
          className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
            !activeMarket
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          All
        </a>
        {MARKETS.map((m) => (
          <a
            key={m}
            href={`/charities?market=${m}`}
            className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ${
              activeMarket === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {m}
          </a>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <CharityList charities={charities ?? []} />
    </div>
  );
}
