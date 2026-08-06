import { notFound, redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"

// Short-link resolver — the target of every printed QR code.
//
// WHY THIS EXISTS. /favpolls/<uuid> is 65 characters, which at error-correction
// level H is a 49x49 QR; on the credit-card print card that put each module at
// 0.313mm, under the ~0.4mm floor printed codes need, and domestic printers'
// ink spread merged adjacent modules. /p/<12 chars> is 34 characters -> 33x33,
// so every module is 48% bigger at the same physical size. See the migration
// 20260806100000_favpoll_short_code.sql for the measurements.
//
// QR-ONLY (decision 2026-08-06): this is the QR target, not the link an
// organiser copies. Random hex is no more memorable than a UUID, so the human
// win only arrives with a meaningful slug — keeping this off the public face
// leaves that option open.
//
// Deliberately dumb: it resolves the code and hands off. Privacy is the
// target page's job (it gates is_private on sign-in), so there is one place
// that decides who may read a favpoll, not two that can disagree.
//
// Temporary redirect, not permanent: a 308 is cached by browsers indefinitely,
// which would make it impossible to ever serve something else at /p/<code>
// (an interstitial, a scan-count, a register-flavoured landing). The mapping
// is stable; our freedom to change what sits in front of it is worth more than
// the saved round trip.

type Props = { params: Promise<{ code: string }> }

export default async function ShortLinkPage({ params }: Props) {
  const { code } = await params

  // Codes are exactly 12 hex characters (see the migration). Rejecting
  // anything else keeps junk and probe traffic off the database.
  if (!/^[0-9a-f]{12}$/.test(code)) notFound()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("favpolls")
    .select("id")
    .eq("short_code", code)
    .maybeSingle()

  if (!data) notFound()

  redirect(`/favpolls/${data.id}`)
}
