import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NewFavpollWizard } from "@/components/new-favpoll-wizard"
import { getWizardData } from "./wizard-data"

export default async function NewFavpollPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in?redirect_url=/favpolls/new")

  const data = await getWizardData()

  return <NewFavpollWizard data={data} />
}
