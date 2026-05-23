import { getPendingContributions, getReviewedContributions } from '@/lib/actions/contributions'
import { ContributionRow } from '@/components/contribution-row'

export default async function ContributionsPage() {
  const [pending, reviewed] = await Promise.all([
    getPendingContributions(),
    getReviewedContributions(),
  ])

  const pendingItems = pending.data ?? []
  const acceptedItems = (reviewed.data ?? []).filter((i) => i.review_status === 'accepted')
  const rejectedItems = (reviewed.data ?? []).filter((i) => i.review_status === 'rejected')

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Contributions</h1>

      {/* Pending */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Pending ({pendingItems.length})
        </h2>
        {pending.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{pending.error}</p>
        )}
        {pendingItems.length === 0 && !pending.error && (
          <p className="text-sm text-muted-foreground">No pending contributions.</p>
        )}
        <div className="space-y-3">
          {pendingItems.map((item) => (
            <ContributionRow key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Accepted */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Accepted ({acceptedItems.length})
        </h2>
        {acceptedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <div className="space-y-3">
            {acceptedItems.map((item) => (
              <ContributionRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Rejected */}
      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Rejected ({rejectedItems.length})
        </h2>
        {rejectedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <div className="space-y-3">
            {rejectedItems.map((item) => (
              <ContributionRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
