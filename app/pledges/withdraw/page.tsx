import { notFound } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { withdrawPledge } from "./actions"

type Props = {
  searchParams: Promise<{ token?: string }>
}

type EventPollRow = {
  event_id: string
  events: {
    closes_at: string | null
    persons: { name: string } | null
    event_charities: { charities: { name: string } }[]
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
      event_polls(
        event_id,
        events(
          closes_at,
          persons(name),
          event_charities(charities(name))
        )
      )
    `
    )
    .eq("guest_token", token)
    .maybeSingle()

  if (!pledge) notFound()

  const eventPoll = pledge.event_polls as unknown as EventPollRow
  const eventData = eventPoll?.events
  const personName: string = eventData?.persons?.name ?? "this event"
  const closesAt: string = eventData?.closes_at ?? ""
  const charityNames: string[] = (eventData?.event_charities ?? []).map(
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

  const eventId = eventPoll?.event_id

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
        <h1 className="text-xl font-medium text-foreground">Event closed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This event has closed and pledges can no longer be withdrawn.
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
        <span className="font-medium text-foreground">{personName}</span>.
      </p>
      <div className="mt-6 flex gap-3">
        <form action={withdrawPledge}>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" variant="destructive">
            Withdraw my pledge
          </Button>
        </form>
        {eventId && (
          <a
            href={`/events/${eventId}`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted focus:ring-2 focus:ring-ring focus:outline-none"
          >
            Keep my pledge
          </a>
        )}
      </div>
    </main>
  )
}
