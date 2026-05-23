import { PollTitle } from "./poll-title"
import { PollOptions } from "./poll-options"
import { PollReveal } from "./poll-reveal"
import { PollResults } from "./poll-results"
import { FavpollPledgePanel } from "./favpoll-pledge-panel"
import { FavpollSharedFund } from "./favpoll-shared-fund"
import type { PollData, PollStep } from "./types"

type FavpollPollProps = {
  poll: PollData
  step: PollStep
  protagonistName?: string
  showSharedFund?: boolean
}

export function FavpollPoll({
  poll,
  step,
  protagonistName,
  showSharedFund = false,
}: FavpollPollProps) {
  const topicTitle = poll.topic?.title ?? ""
  const topicItems = poll.topic?.topic_items ?? []

  return (
    <div className="space-y-3">
      {topicTitle && <PollTitle title={topicTitle} />}

      {step === "choose" && (
        <PollOptions
          options={topicItems}
          selectedItemId={poll.selectedItemId}
          locked={false}
          topicTitle={topicTitle}
        />
      )}

      {step === "pledge" && (
        <>
          <PollOptions
            options={topicItems}
            selectedItemId={poll.selectedItemId}
            locked={true}
            topicTitle={topicTitle}
          />
          <FavpollPledgePanel />
          <FavpollSharedFund show={showSharedFund} />
        </>
      )}

      {step === "pledged" && (
        <>
          {poll.personal_reveal && (
            <PollReveal
              personalReveal={poll.personal_reveal}
              protagonistFirstName={protagonistName?.split(" ")[0]}
              role="status"
              aria-live="polite"
            />
          )}
          {poll.results && poll.results.length > 0 && (
            <PollResults results={poll.results} />
          )}
        </>
      )}
    </div>
  )
}
