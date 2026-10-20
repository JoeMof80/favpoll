import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ArrowLeft } from "lucide-react"
import { readReference } from "@/lib/library-read"

// A reference note as a reading page: one column, the markdown rendered
// with the `reading` styles in globals.css. The file comes off the disk at
// request time (lib/library-read), so it is always the checked-out version.
export const dynamic = "force-dynamic"

export default async function LibraryReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const found = await readReference(slug)
  if (!found) notFound()
  const { entry, markdown } = found

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Library
        </Link>
        <span className="text-xs text-muted-foreground">
          references/{entry.source} · {entry.date}
        </span>
      </div>
      <p className="mb-6 text-sm text-muted-foreground">{entry.summary}</p>
      <article className="reading">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </article>
    </div>
  )
}
