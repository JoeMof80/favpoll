import { isQuoteReveal } from "@/lib/mechanic-steps"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ScanLine } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createAdminClient } from "@/lib/supabase/admin"
import { getFavpollHeadline } from "@/lib/display"
import { buildPackSteps } from "@/components/print-pack/pack-card"
import { AverySheet, AVERY_SHEETS } from "@/components/print-pack/avery-sheet"
import type { AveryCode } from "@/components/print-pack/avery-sheet"
import { PrintButton } from "@/components/keepsake/print-button"
import { Button } from "@/components/ui/button"

// The Avery-matched pack, on its own route because every one of these sheets
// is LANDSCAPE (2026-08-10).
//
// Avery UK's tent and place card stock is laid out on landscape A4 — two
// 120mm panels side by side is 240mm and portrait A4 gives you 210. Chrome
// will not honour a per-sheet page orientation inside a mixed document, so
// these cannot share the main pack's print job. A separate route means the
// whole document is landscape and the top-level @page below actually applies.
//
// The cost is one extra click for an organiser buying Avery stock, which is
// the trade the founder took.

type Props = { params: Promise<{ id: string }> }

const CODES = Object.keys(AVERY_SHEETS) as AveryCode[]

export default async function AveryPackPage({ params }: Props) {
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
    qrUrl: `${baseUrl}/p/${favpoll.short_code}`,
  }
  const steps = buildPackSteps(data)

  return (
    <div className="paper min-h-screen bg-muted/30 py-8 print:bg-background print:py-0">
      {/* A top-level @page, which only works because this route is its own
          document. Scoped here rather than in globals.css for exactly that
          reason — anywhere shared and it would turn the whole site landscape. */}
      <style>{`@page { size: A4 landscape; margin: 10mm; }`}</style>

      <div className="mx-auto max-w-[1100px] px-4 print:max-w-none print:px-0">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/favpolls/${id}/pack`}>
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Back to the pack
            </Link>
          </Button>
          <PrintButton />
        </div>

        <Alert className="mb-4 print:hidden">
          <ScanLine aria-hidden="true" />
          <AlertTitle>Print these landscape, at 100%</AlertTitle>
          <AlertDescription>
            These sheets are laid out to Avery&rsquo;s die-cut card, so the
            print has to land on the perforations. Set the orientation to
            landscape and the scale to 100% — never &ldquo;fit to page&rdquo;,
            which shrinks everything by a few percent and puts every card off
            its cut. Run one sheet and hold it up to the light before the batch.
          </AlertDescription>
        </Alert>

        {CODES.map((code) => {
          const sheet = AVERY_SHEETS[code]
          return (
            <div key={code} className="mb-8 print:mb-0">
              <div className="mb-2 flex items-baseline justify-between print:hidden">
                <p className="text-sm font-medium text-foreground">
                  {sheet.label}{" "}
                  <span className="font-normal text-muted-foreground">
                    · Avery {sheet.code}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{sheet.note}</p>
              </div>
              <AverySheet
                data={data}
                steps={steps}
                code={code}
                className={
                  code !== CODES[CODES.length - 1] ? "break-after-page" : ""
                }
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
