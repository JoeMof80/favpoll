import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { withdrawPledge } from "./actions"

type Props = {
  searchParams: Promise<{ token?: string }>
}

type FavpollPollRow = {
  favpoll_id: string
  favpolls: {
    closes_at: string | null
    protagonists: { name: string } | null
    favpoll_charities: { charities: { name: string } }[]
  } | null
} | null

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

export default async function WithdrawPage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) notFound()

  const supabase = createAdminClient()

  const { data: pledge } = await supabase
    .from("pledges")
    .select(
      `
      id,
      total_amount,
      withdrawn_at,
      guest_token,
      favpoll_polls(
        favpoll_id,
        favpolls(
          closes_at,
          protagonists(name),
          favpoll_charities(charities(name))
        )
      )
    `
    )
    .eq("guest_token", token)
    .maybeSingle()

  if (!pledge) notFound()

  const favpollPoll = pledge.favpoll_polls as unknown as FavpollPollRow
  const favpollData = favpollPoll?.favpolls
  const protagonistName: string =
    favpollData?.protagonists?.name ?? "this favpoll"
  const closesAt: string = favpollData?.closes_at ?? ""
  const charityNames: string[] = (favpollData?.favpoll_charities ?? []).map(
    (ec) => ec.charities.name
  )
  const charityLabel =
    charityNames.length === 0
      ? "charity"
      : charityNames.length === 1
        ? charityNames[0]
        : charityNames.slice(0, -1).join(", ") + " & " + charityNames.at(-1)!

  const isClosed = closesAt ? new Date(closesAt) < new Date() : false
  const isWithdrawn = !!pledge.withdrawn_at

  const favpollId = favpollPoll?.favpoll_id

  if (isWithdrawn) {
    return (
      <main className="mx-auto max-w-md px-6 pt-16 pb-16 text-center">
        <h1 className="text-xl font-medium text-foreground">
          Pledge already withdrawn
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This pledge has already been withdrawn and this link is no longer
          valid.
        </p>
      </main>
    )
  }

  if (isClosed) {
    return (
      <main className="mx-auto max-w-md px-6 pt-16 pb-16 text-center">
        <h1 className="text-xl font-medium text-foreground">favpoll closed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This favpoll has closed and pledges can no longer be withdrawn.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-md px-6 pt-16 pb-16">
      <h1 className="text-xl font-medium text-foreground">
        Withdraw your pledge?
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        You pledged{" "}
        <span className="font-medium text-foreground">
          {GBP.format(pledge.total_amount)}
        </span>{" "}
        to <span className="font-medium text-foreground">{charityLabel}</span>{" "}
        in honour of{" "}
        <span className="font-medium text-foreground">{protagonistName}</span>.
      </p>
      <div className="mt-6 flex gap-3">
        <form action={withdrawPledge}>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" variant="destructive">
            Withdraw my pledge
          </Button>
        </form>
        {favpollId && (
          <a
            href={`/favpolls/${favpollId}`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:ring-2 focus:ring-ring focus:outline-none"
          >
            Keep my pledge
          </a>
        )}
      </div>
    </main>
  )
}
