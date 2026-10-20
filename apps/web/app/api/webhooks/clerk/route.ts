import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"
import { Webhook } from "svix"
import { sendPledgesClaimed } from "@/lib/email"

type ClerkUserEventData = {
  id: string
  email_addresses: {
    email_address: string
    id: string
    verification?: { status: string } | null
  }[]
  primary_email_address_id: string | null
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

type ClerkWebhookEvent = {
  type: string
  data: ClerkUserEventData
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const payload = await req.text()
  const wh = new Webhook(webhookSecret)

  let event: ClerkWebhookEvent
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent
  } catch {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { type, data } = event

  const primaryEmail = data.primary_email_address_id
    ? (data.email_addresses.find((e) => e.id === data.primary_email_address_id)
        ?.email_address ?? null)
    : null

  const displayName =
    [data.first_name, data.last_name].filter(Boolean).join(" ") || null

  if (type === "user.created") {
    const { error } = await supabase.from("users").insert({
      id: data.id,
      email: primaryEmail,
      display_name: displayName,
      avatar_url: data.image_url,
    })
    if (error) return new Response("Failed to create user", { status: 500 })

    // Claim guest pledges made with this address — EXACT match on the
    // Clerk-VERIFIED primary email only. Inbox control already held the
    // withdrawal links, so claiming grants nothing the inbox didn't;
    // guest_email and guest_token stay on the rows so old links keep
    // working, and refunds only ever return to the original card.
    const primary = data.primary_email_address_id
      ? data.email_addresses.find((e) => e.id === data.primary_email_address_id)
      : null
    if (primary?.email_address && primary.verification?.status === "verified") {
      const { data: claimed } = await supabase
        .from("pledges")
        .update({ clerk_user_id: data.id })
        .eq("guest_email", primary.email_address)
        .is("clerk_user_id", null)
        .is("withdrawn_at", null)
        .select("id")
      if (claimed && claimed.length > 0) {
        // The shared-inbox safeguard: make the claim visible to whoever
        // holds the address. Never fail the webhook over a courtesy email.
        try {
          await sendPledgesClaimed(primary.email_address, claimed.length)
        } catch {
          // best effort
        }
      }
    }
  }

  if (type === "user.updated") {
    const { error } = await supabase
      .from("users")
      .update({
        email: primaryEmail,
        display_name: displayName,
        avatar_url: data.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
    if (error) return new Response("Failed to update user", { status: 500 })
  }

  if (type === "user.deleted") {
    const { error } = await supabase.from("users").delete().eq("id", data.id)
    if (error) return new Response("Failed to delete user", { status: 500 })
  }

  return new Response("OK", { status: 200 })
}
