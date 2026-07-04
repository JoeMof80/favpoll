import { permanentRedirect } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

// Legacy URL — the live display moved to /favpolls/[id]/live (2026-07-04)
// to match the domain vocabulary (live_display / "Live display").
export default async function LegacyDisplayRedirect({ params }: Props) {
  const { id } = await params
  permanentRedirect(`/favpolls/${id}/live`)
}
