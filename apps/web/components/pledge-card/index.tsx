"use client"

import { PreviewPledgeCard } from "./preview-pledge-card"
import { LivePledgeCard } from "./live-pledge-card"
import type { LivePledgeCardProps } from "./live-pledge-card"

export { PledgeCardWrapper } from "./pledge-card-wrapper"
export { LivePledgeCard } from "./live-pledge-card"

type PrePublishProps = {
  prePublish: true
  pledgeAmount?: string
  onPledgeAmountChange?: (amount: string) => void
  charityNames?: string[]
}

type Props = PrePublishProps | LivePledgeCardProps

export function PledgeCard(props: Props) {
  if (props.prePublish) {
    return (
      <PreviewPledgeCard
        pledgeAmount={props.pledgeAmount}
        onPledgeAmountChange={props.onPledgeAmountChange}
        charityNames={props.charityNames}
      />
    )
  }
  return <LivePledgeCard {...props} />
}
