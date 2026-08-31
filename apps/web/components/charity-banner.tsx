import { Pencil, Target } from "lucide-react"
import type { Charity } from "@favpoll/types"
import { Button } from "@/components/ui/button"
import { CharityRow } from "./charity-row"
import { GoalProgress } from "./goal-progress"
import { formatPounds } from "@/lib/i18n"

type Props = {
  charities: Charity[]
  totalRaised: number
  /** Optional pledge goal in pounds — renders an understated progress bar. */
  goalAmount?: number | null
  /**
   * Organiser form only: makes the goal editable in place — a "Set a goal"
   * button when unset, a pencil beside the progress caption when set. The
   * guest page omits this and the banner stays read-only.
   */
  onEditGoal?: () => void
}

export function CharityBanner({
  charities,
  totalRaised,
  goalAmount,
  onEditGoal,
}: Props) {
  const perCharity = charities.length > 0 ? totalRaised / charities.length : 0

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="space-y-3">
        {charities.map((charity) => (
          <CharityRow
            key={charity.id}
            charity={charity}
            amountRaised={perCharity}
            linkToCharity
          />
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-3 text-right">
        <p className="text-lg font-medium text-primary">
          {formatPounds(totalRaised)}
        </p>
        <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
          {/* SAID IN WORDS, not colour alone (open item, PROJECT.md): a
              fundraiser page's brand green is one hue-step from --success,
              so the bar turning green cannot carry the state there. */}
          {goalAmount
            ? totalRaised >= goalAmount
              ? `${formatPounds(goalAmount)} goal reached — every pledge still counts`
              : `raised of the ${formatPounds(goalAmount)} goal`
            : "raised so far"}
          {goalAmount && onEditGoal ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Edit the pledge goal"
              onClick={onEditGoal}
            >
              <Pencil />
            </Button>
          ) : null}
        </p>
        {goalAmount ? (
          <GoalProgress
            totalRaised={totalRaised}
            goalAmount={goalAmount}
            className="mt-2"
          />
        ) : null}
        {!goalAmount && onEditGoal ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 flex w-full"
            onClick={onEditGoal}
          >
            <Target data-icon="inline-start" aria-hidden="true" />
            Set a goal
          </Button>
        ) : null}
      </div>
    </div>
  )
}
