import Link from 'next/link'
import { getTopics } from '@/lib/actions/placeholders'

export default async function PlaceholdersPage() {
  const { data: topics, error } = await getTopics()

  if (error || !topics) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Placeholders</h1>
        <p className="text-red-600 text-sm">{error ?? 'Failed to load topics.'}</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Placeholders</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Select a topic to edit its occasion placeholder text.
      </p>
      <div className="flex flex-col gap-1 max-w-sm">
        {topics.map((topic) => {
          const count = Object.keys(topic.placeholders ?? {}).length
          return (
            <Link
              key={topic.id}
              href={`/placeholders/${topic.id}`}
              className="flex items-center justify-between rounded-md px-4 py-3 text-sm hover:bg-neutral-100 transition-colors border border-neutral-200 bg-white"
            >
              <span className="font-medium text-neutral-900">{topic.title}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">
                  {count} {count === 1 ? 'occasion' : 'occasions'}
                </span>
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
            </Link>
          )
        })}
      </div>
    </div>
  )
}
