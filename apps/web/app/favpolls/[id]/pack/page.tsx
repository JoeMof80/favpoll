import { isQuoteReveal } from "@/lib/mechanic-steps"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ScanLine } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createAdminClient } from "@/lib/supabase/admin"
import { getFavpollHeadline } from "@/lib/display"
import { PackDocument } from "@/components/print-pack/pack-document"
import { PrintButton } from "@/components/keepsake/print-button"
import { Button } from "@/components/ui/button"

type Props = { params: Promise<{ id: string }> }

export default async function PackPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      `id, subject, cause_label, occasion_type, opening_line, is_private,
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
    guestUrl: `${baseUrl}/favpolls/${id}`,
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 print:bg-background print:py-0">
      <div className="mx-auto max-w-[820px] px-4 print:px-0">
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
        <PackDocument data={data} />
      </div>
    </div>
  )
}
