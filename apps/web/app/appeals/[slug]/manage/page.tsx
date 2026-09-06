import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { canManageAppeals } from "@/lib/appeals-admin"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { PageSheet } from "@/components/page-sheet"
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
    <PageSheet>
      <div className="mx-auto w-full max-w-2xl pt-10 md:pt-16">
        <SectionEyebrow variant="muted">Appeal</SectionEyebrow>
        <h1 className="mt-2 mb-8 text-4xl leading-tight font-light tracking-tight text-foreground">
          {appeal.name}
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
    </PageSheet>
  )
}
