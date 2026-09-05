import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { canManageAppeals } from "@/lib/appeals-admin"
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
      <div className="mx-auto w-full max-w-xl px-6 py-14">
        <h1 className="mb-8 text-3xl font-light tracking-tight text-foreground">
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
