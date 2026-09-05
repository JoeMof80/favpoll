import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { canManageAppeals } from "@/lib/appeals-admin"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { AppealForm } from "../appeal-form"

// Appeal creation — in the MAIN app, its long-term home (founder,
// 2026-09-05), behind the temporary gate. When charity accounts exist
// the gate becomes a role check and this page is already the portal.
export default async function NewAppealPage({
  searchParams,
}: {
  searchParams: Promise<{ charity?: string }>
}) {
  const { userId } = await auth()
  if (!canManageAppeals(userId)) notFound()
  const { charity: defaultCharityId } = await searchParams

  const supabase = createAdminClient()
  const { data: charities } = await supabase
    .from("charities")
    .select("id, name")
    .eq("is_active", true)
    .order("name")

  return (
    <main className="min-h-screen bg-primary/5">
      <div className="mx-auto w-full max-w-2xl px-6 py-14">
        <SectionEyebrow variant="muted">Appeal</SectionEyebrow>
        <h1 className="mt-2 mb-8 text-4xl leading-tight font-light tracking-tight text-foreground">
          New appeal
        </h1>
        <AppealForm
          charities={charities ?? []}
          defaultCharityId={defaultCharityId}
        />
      </div>
    </main>
  )
}
