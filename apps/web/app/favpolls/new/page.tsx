import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NewEventWizard } from "@/components/new-event-wizard"
import { getWizardData } from "./wizard-data"

export default async function NewEventPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in?redirect_url=/favpolls/new")

  const data = await getWizardData()

  return <NewEventWizard data={data} />
}
