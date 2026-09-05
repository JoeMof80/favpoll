import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { canManageAppeals } from "@/lib/appeals-admin"
import { AppealForm } from "../../appeal-form"

export default async function ManageAppealPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { userId } = await auth()
  if (!canManageAppeals(userId)) notFound()

  const { slug } = await params
  const supabase = createAdminClient()
  const { data: appeal } = await supabase
    .from("appeals")
    .select(
      "id, slug, name, blurb, photo_url, charity_id, closes_at, is_listed"
    )
    .eq("slug", slug)
    .maybeSingle()
  if (!appeal) notFound()

  const { data: charities } = await supabase
    .from("charities")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  return (
    <main className="min-h-screen bg-primary/5">
      <div className="mx-auto w-full max-w-xl px-6 py-14">
        <h1 className="mb-8 text-3xl font-light tracking-tight text-foreground">
          Manage {appeal.name}
        </h1>
        <AppealForm
          charities={charities ?? []}
          initial={{
            id: appeal.id,
            name: appeal.name,
            slug: appeal.slug,
            charityId: appeal.charity_id,
            blurb: appeal.blurb ?? "",
            photoUrl: appeal.photo_url ?? "",
            closesAt: appeal.closes_at ? appeal.closes_at.slice(0, 16) : "",
            isListed: appeal.is_listed,
          }}
        />
      </div>
    </main>
  )
}
