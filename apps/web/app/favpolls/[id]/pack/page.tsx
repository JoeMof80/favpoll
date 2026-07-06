import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
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

  const data = {
    prefix,
    name,
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
        <div className="rounded-lg border border-border bg-background shadow-sm print:border-0 print:shadow-none">
          <PackDocument data={data} />
        </div>
      </div>
    </div>
  )
}
