import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTopics, getTopicById } from '@/lib/actions/placeholders'
import { OccasionEditor } from '@/components/occasion-editor'

interface Props {
  params: Promise<{ topicId: string }>
}

export default async function TopicPlaceholdersPage({ params }: Props) {
  const { topicId } = await params
  const [{ data: topic, error }, { data: allTopics }] = await Promise.all([
    getTopicById(topicId),
    getTopics(),
  ])

  if (error || !topic) {
    notFound()
  }

  const topics = allTopics ?? []
  const placeholders = topic.placeholders ?? {}

  return (
    <div className="flex gap-8 min-h-0">
      {/* Sidebar */}
      <aside className="w-56 shrink-0">
        <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-3">
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
                    ? 'bg-[#EEEDFE] text-[#534AB7] font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <span className="truncate">{t.title}</span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-xs opacity-60">{count}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                      t.is_finite
                        ? 'bg-[#EEEDFE] text-[#534AB7]'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {t.is_finite ? 'F' : 'I'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </aside>

      {/* Editor */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-6">
          <h1 className="text-2xl font-semibold">{topic.title}</h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              topic.is_finite
                ? 'bg-[#EEEDFE] text-[#534AB7]'
                : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {topic.is_finite ? 'Finite' : 'Infinite'}
          </span>
        </div>

        <OccasionEditor topicId={topic.id} placeholders={placeholders} />
      </div>
    </div>
  )
}
