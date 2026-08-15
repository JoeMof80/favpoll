import { isQuoteReveal } from "@/lib/mechanic-steps"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { getFavpollHeadline } from "@/lib/display"
import { PackDocument } from "@/components/print-pack/pack-document"
import { QrExport } from "@/components/print-pack/qr-export"
import { Button } from "@/components/ui/button"

type Props = { params: Promise<{ id: string }> }

export default async function PackPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      `id, short_code, subject, cause_label, occasion_type, opening_line, is_private,
       protagonists!favpolls_protagonist_id_fkey ( name ),
       favpoll_polls ( personal_reveal, topics ( title ) ),
       favpoll_charities ( charities ( name ) )`
    )
    .eq("id", id)
    .single()

  if (!favpoll || favpoll.is_private) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const protagonist = favpoll.protagonists as any
  const isCause = favpoll.subject === "cause"
  const name = isCause ? (favpoll.cause_label ?? "") : (protagonist?.name ?? "")
  const { prefix } = getFavpollHeadline({
    occasionType: favpoll.occasion_type,
    name,
    subject: isCause ? "cause" : "someone",
    openingLine: favpoll.opening_line,
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://favpoll.com"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polls = (favpoll.favpoll_polls ?? []) as any[]
  const firstPoll = Array.isArray(polls) ? polls[0] : polls

  const data = {
    prefix,
    name,
    isCause,
    topicTitle: firstPoll?.topics?.title ?? null,
    hasReveal: Boolean(firstPoll?.personal_reveal),
    revealIsQuote: isQuoteReveal(firstPoll?.personal_reveal),
    charityNames: (favpoll.favpoll_charities ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ec: any) => ec.charities.name
    ),
    // Short form — this feeds the QR only. /favpolls/<uuid> is 65 chars and
    // renders 49x49, which put each module under the printable floor on the
    // wallet card; /p/<12> is 34 chars and 33x33. See app/p/[code]/page.tsx.
    qrUrl: `${baseUrl}/p/${favpoll.short_code}`,
  }

  return (
    // The desk is the TOOLBAR's surface, continued (founder, 2026-08-15) —
    // bg-muted, the same token ToolbarBand uses, so the band and the desk read
    // as one surface with the paper laid on it rather than as a bar sitting on
    // a differently-tinted page. It was bg-muted/30: close enough to look like
    // a mistake, far enough to show a seam under the band.
    <div className="min-h-screen bg-muted pb-8 print:min-h-0 print:bg-background print:pb-0">
      {/* Wide enough for a full landscape A4 PAGE (297mm = 1123px) plus
          padding — every sheet renders at true page size now, so nothing is
          scaled to fit and what you see is what prints. */}
      <div className="print:max-w-none">
        <PackDocument
          data={data}
          leading={
            <Button asChild variant="ghost" size="sm">
              <Link href={`/favpolls/${id}`}>
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
                Back
              </Link>
            </Button>
          }
          qrExport={
            <QrExport
              value={data.qrUrl}
              name={`favpoll-qr-${favpoll.short_code}`}
            />
          }
        />
      </div>
    </div>
  )
}
