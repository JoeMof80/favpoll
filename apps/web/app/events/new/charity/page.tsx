import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Charity } from "@favpoll/types"
import { CharityFlowPage } from "./charity-flow-page"

type Props = { searchParams: Promise<Record<string, string>> }

export default async function CharityPage({ searchParams }: Props) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const params = await searchParams
  const occasionType = params.occasionType ?? ""
  if (!occasionType) redirect("/events/new/honour")

  const topicId = params.topicId ?? ""
  const topicIsCustom = params.topicIsCustom === "true"
  const topicTitle = params.topicTitle ?? ""
  if (!topicId && !topicIsCustom)
    redirect(
      "/events/new/love?" +
        new URLSearchParams({
          occasionType,
          isPlural: params.isPlural ?? "false",
        })
    )

  const supabase = createAdminClient()
  const { data: charities } = await supabase
    .from("charities")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <CharityFlowPage
      charities={(charities ?? []) as Charity[]}
      initialParams={{
        occasionType,
        isPlural: params.isPlural === "true",
        topicId,
        topicIsCustom,
        topicTitle,
        charityIds: params.charityIds
          ? params.charityIds.split(",").filter(Boolean)
          : [],
      }}
    />
  )
}
