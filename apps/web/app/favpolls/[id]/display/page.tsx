import { permanentRedirect } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

// Legacy URL. The live display now lives at /live/[slug] behind an
// unguessable slug (2026-07-08) — deliberately NOT resolved from the id
// here, or the redirect would defeat the slug. Land on the public guest
// page; organisers get the live link from their dashboard.
export default async function LegacyDisplayRedirect({ params }: Props) {
  const { id } = await params
  permanentRedirect(`/favpolls/${id}`)
}
