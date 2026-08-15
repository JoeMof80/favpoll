import { isQuoteReveal } from "@/lib/mechanic-steps"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ScanLine } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createAdminClient } from "@/lib/supabase/admin"
import { getFavpollHeadline } from "@/lib/display"
import { PackDocument } from "@/components/print-pack/pack-document"
import { QrExport } from "@/components/print-pack/qr-export"
import { PrintButton } from "@/components/keepsake/print-button"
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
    <div className="min-h-screen bg-muted/30 py-8 print:min-h-0 print:bg-background print:py-0">
      {/* Wide enough for a full landscape A4 PAGE (297mm = 1123px) plus
          padding — every sheet renders at true page size now, so nothing is
          scaled to fit and what you see is what prints. */}
      <div className="mx-auto max-w-[1280px] px-4 print:max-w-none print:px-0">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/favpolls/${id}`}>
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Back to favpoll
            </Link>
          </Button>
          <PrintButton />
        </div>
        {/* Screen only — this is advice about printing, so it must never be
            part of what gets printed. Prompted by a real failure: a wallet
            card scanned only reluctantly off a domestic printer. */}
        <Alert className="mb-4 print:hidden">
          <ScanLine aria-hidden="true" />
          <AlertTitle>Test one before you print the batch</AlertTitle>
          <AlertDescription>
            Print a single card and scan it with a phone camera, held at the
            distance and in the light your guests will have. Home printers vary
            more than you would expect, and the wallet card carries the smallest
            code — if any card is going to struggle, it is that one.
          </AlertDescription>
        </Alert>
        <QrExport
          value={data.qrUrl}
          name={`favpoll-qr-${favpoll.short_code}`}
        />
        <PackDocument data={data} />
      </div>
    </div>
  )
}
