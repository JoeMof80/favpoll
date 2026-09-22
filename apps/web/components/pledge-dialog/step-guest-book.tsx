"use client"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

type Props = {
  isGuest: boolean
  displayName: string
  onDisplayNameChange: (v: string) => void
  isAnonymous: boolean
  onIsAnonymousChange: (v: boolean) => void
  pledgeMessage: string
  onPledgeMessageChange: (v: string) => void
  /** Show the "Show my donation" toggle (card pledges + show_guest_amounts on) */
  showAmountToggle?: boolean
  hideAmount?: boolean
  onHideAmountChange?: (v: boolean) => void
}

export function StepGuestBook({
  isGuest,
  displayName,
  onDisplayNameChange,
  isAnonymous,
  onIsAnonymousChange,
  pledgeMessage,
  onPledgeMessageChange,
  showAmountToggle = false,
  hideAmount = false,
  onHideAmountChange,
}: Props) {
  return (
    <div className="space-y-4 px-5 py-4">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
        Guest book
      </p>
      {/* Guest name — signed-in users resolve from their account */}
      {isGuest && (
        <div>
          <label
            htmlFor="guestbook-name"
            className="mb-1 block text-sm text-foreground"
          >
            Your name <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="guestbook-name"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
            aria-label="Name shown in the guest book — leave blank to appear as Someone"
            placeholder="Leave blank to appear as Someone"
            className="h-11 rounded-[10px] md:text-base"
          />
        </div>
      )}

      {/* Visibility switches — consistent positive framing, both
          default on. Signed-in users get the name switch; guests
          control name via the blank-name field above. */}
      <div className="space-y-3">
        {!isGuest && (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch
              checked={!isAnonymous}
              onCheckedChange={(v) => onIsAnonymousChange(!v)}
              aria-label="Show my name in the guest book"
            />
            Show my name
          </label>
        )}
        {showAmountToggle && onHideAmountChange && (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch
              checked={!hideAmount}
              onCheckedChange={(v) => onHideAmountChange(!v)}
              aria-label="Show my donation in the guest book"
            />
            Show my donation
          </label>
        )}
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="guestbook-message"
          className="mb-1 block text-sm text-foreground"
        >
          Add a message{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="guestbook-message"
          value={pledgeMessage}
          onChange={(e) => onPledgeMessageChange(e.target.value.slice(0, 100))}
          maxLength={100}
          placeholder="Thinking of you"
          className="h-11 rounded-[10px] md:text-base"
        />
        <p className="mt-1 text-right text-[11px] text-muted-foreground">
          {pledgeMessage.length}/100
        </p>
      </div>
    </div>
  )
}
