import { redirect } from "next/navigation"

// RETIRED (step 4, 2026-09-30): the wizard is creation only. Everything
// the edit route changed now changes in place on the manage page —
// header, story, favourites, topic, charities, settings — so the old
// address goes there. The actions file stays: updateClosesAt is the
// manage page's own close-date save.
export default async function EditFavpollPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/favpolls/${id}/manage`)
}
