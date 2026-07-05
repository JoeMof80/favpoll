import { auth, currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendExtensionRequest } from "@/lib/email"
import { isRateLimited, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId)
    return Response.json({ error: "Not authenticated" }, { status: 401 })

  // Sends support email — cap so a compromised session can't flood it.
  if (
    await isRateLimited("extension-request", userId, [
      { name: "1h", max: 10, windowSeconds: 3600 },
    ])
  ) {
    return Response.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })
  }

  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("created_by, extension_count")
    .eq("id", id)
    .single()

  if (!favpoll)
    return Response.json({ error: "Favpoll not found" }, { status: 404 })
  if (favpoll.created_by !== userId)
    return Response.json({ error: "Unauthorized" }, { status: 403 })
  if ((favpoll.extension_count ?? 0) < 2) {
    return Response.json(
      { error: "Extensions still available" },
      { status: 400 }
    )
  }

  const body = await request.json()
  const message = typeof body?.message === "string" ? body.message.trim() : ""
  if (!message)
    return Response.json({ error: "Message is required" }, { status: 400 })

  const user = await currentUser()
  const primaryEmail =
    user?.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? ""
  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ")
    : null

  await sendExtensionRequest({
    organizerEmail: primaryEmail,
    organizerName: displayName,
    favpollId: id,
    message,
  })

  return Response.json({ ok: true })
}
