import Link from "next/link"
import { notFound } from "next/navigation"
import {
  getTopics,
  getTopicById,
  getTopicItems,
} from "@/lib/actions/placeholders"
import { OccasionEditor } from "@/components/occasion-editor"
import { DisplayOrderEditor } from "@/components/display-order-editor"

interface Props {
  params: Promise<{ topicId: string }>
}

export default async function TopicPlaceholdersPage({ params }: Props) {
  const { topicId } = await params
  const [{ data: topic, error }, { data: allTopics }, { data: topicItems }] =
    await Promise.all([
      getTopicById(topicId),
      getTopics(),
      getTopicItems(topicId),
    ])

  if (error || !topic) {
    notFound()
  }

  const topics = allTopics ?? []
  const placeholders = topic.placeholders ?? {}

  return (
    <div className="flex min-h-0 gap-8">
      {/* Sidebar */}
      <aside className="w-56 shrink-0">
        <h2 className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Topics
        </h2>
        <div className="flex flex-col gap-0.5">
          {topics.map((t) => {
            const count = Object.keys(t.placeholders ?? {}).length
            const isActive = t.id === topicId
            return (
              <Link
                key={t.id}
                href={`/placeholders/${t.id}`}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-secondary text-secondary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <span className="truncate">{t.title}</span>
                <div className="ml-2 flex shrink-0 items-center gap-1.5">
                  <span className="text-xs opacity-60">{count}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none font-medium ${
                      t.is_finite
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.is_finite ? "F" : "I"}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Editor */}
      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold">{topic.title}</h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              topic.is_finite
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {topic.is_finite ? "Finite" : "Infinite"}
          </span>
        </div>

        {topic.is_finite && (
          <div className="mb-8">
            <h2 className="mb-4 text-sm font-medium text-foreground">
              Display order
            </h2>
            <DisplayOrderEditor topicId={topic.id} items={topicItems ?? []} />
          </div>
        )}

        <OccasionEditor topicId={topic.id} placeholders={placeholders} />
      </div>
    </div>
  )
}
