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
  showSharedFund?: boolean
}

export function FavpollPoll({
  poll,
  step,
  showSharedFund = false,
}: FavpollPollProps) {
  return (
    <div className="space-y-3">
      <PollTitle
        title={poll.topicTitle}
        protagonistFirstName={poll.protagonistFirstName}
        pledged={step === "pledged"}
      />

      {step === "choose" && (
        <>
          <PollOptions
            options={poll.options}
            selectedLabel={poll.selectedOptionLabel}
            locked={false}
            topicTitle={poll.topicTitle}
          />
        </>
      )}

      {step === "pledge" && (
        <>
          <PollOptions
            options={poll.options}
            selectedLabel={poll.selectedOptionLabel}
            locked={true}
            topicTitle={poll.topicTitle}
          />
          <FavpollPledgePanel />
          <FavpollSharedFund show={showSharedFund} />
        </>
      )}

      {step === "pledged" && (
        <>
          {/* <PollOptions
            options={poll.options}
            selectedLabel={poll.selectedOptionLabel}
            locked={true}
            topicTitle={poll.topicTitle}
          /> */}
          {poll.personalReveal && (
            <PollReveal
              personalReveal={poll.personalReveal}
              protagonistFirstName={poll.protagonistFirstName}
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
