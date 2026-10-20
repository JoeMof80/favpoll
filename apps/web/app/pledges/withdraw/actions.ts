"use server"

import { notFound, redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { withdrawPledgeSchema } from "@/app/favpolls/[id]/pledge-input"

// NO auth() CALL, DELIBERATELY. This action is authorised by the guest
// token alone, which is correct: the withdrawal link is emailed to the
// person who pledged, and most of them have no account — requiring one
// would lock a guest out of undoing their own pledge. The token is a
// random UUID, held only in that email, cleared the moment the pledge is
// withdrawn (so a second click finds nothing), and the query additionally
// refuses an already-withdrawn pledge and a closed favpoll.
//
// Its failures are PAGES, not sentences. A form action that redirects has
// no caller to render a result, so it cannot use lib/action-result the
// way the pledge actions do (and must not: asResult's try/catch would
// swallow the redirect, which Next throws). A bad request therefore gets
// the same not-found page the withdrawal page itself gives for the same
// condition.
export async function withdrawPledge(formData: FormData) {
  const parsed = withdrawPledgeSchema.safeParse(
    Object.fromEntries(formData.entries())
  )
  if (!parsed.success || !parsed.data.token) notFound()
  const { token } = parsed.data

  const supabase = createAdminClient()

  // Verify pledge still exists, not withdrawn, and favpoll is still open
  const { data: pledge } = await supabase
    .from("pledges")
    .select("id, withdrawn_at, favpoll_polls(favpolls(closes_at, id))")
    .eq("guest_token", token)
    .is("withdrawn_at", null)
    .maybeSingle()

  if (!pledge) redirect("/pledges/withdraw/invalid")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- nested join shape
  const favpollData = (pledge.favpoll_polls as any)?.favpolls
  const closesAt = favpollData?.closes_at
  const favpollId = favpollData?.id

  if (closesAt && new Date(closesAt) < new Date()) {
    redirect(`/favpolls/${favpollId}`)
  }

  await supabase
    .from("pledges")
    .update({ withdrawn_at: new Date().toISOString(), guest_token: null })
    .eq("id", pledge.id)

  redirect(`/favpolls/${favpollId}?withdrawn=1`)
}
