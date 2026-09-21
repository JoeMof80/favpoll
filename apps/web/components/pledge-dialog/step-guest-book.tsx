"use client"

import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { SegmentedControl } from "@/components/ui/segmented-control"

type Props = {
  isGuest: boolean
  displayName: string
  onDisplayNameChange: (v: string) => void
  isAnonymous: boolean
  onIsAnonymousChange: (v: boolean) => void
  showGuestAmounts: boolean
  guestBookDisplay: "pick" | "amount" | "none"
  onGuestBookDisplayChange: (v: "pick" | "amount" | "none") => void
  pledgeMessage: string
  onPledgeMessageChange: (v: string) => void
}

const DISPLAY_OPTIONS: {
  value: "pick" | "amount" | "none"
  label: string
}[] = [
  { value: "pick", label: "My pick" },
  { value: "amount", label: "My donation" },
  { value: "none", label: "Neither" },
]

export function StepGuestBook({
  isGuest,
  displayName,
  onDisplayNameChange,
  isAnonymous,
  onIsAnonymousChange,
  showGuestAmounts,
  guestBookDisplay,
  onGuestBookDisplayChange,
  pledgeMessage,
  onPledgeMessageChange,
}: Props) {
  return (
    <div className="space-y-4 px-5 py-4">
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

      {/* Display choice — segmented control when show_guest_amounts is on,
          switch otherwise */}
      {showGuestAmounts ? (
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Show in the guest book
          </p>
          <SegmentedControl
            label="Show in the guest book"
            options={DISPLAY_OPTIONS}
            value={guestBookDisplay}
            onChange={(v) => {
              onGuestBookDisplayChange(v as "pick" | "amount" | "none")
              onIsAnonymousChange(v === "none")
            }}
            className="w-fit"
          />
        </div>
      ) : isGuest ? null : (
        <div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Switch
              checked={isAnonymous}
              onCheckedChange={onIsAnonymousChange}
              aria-label="Hide my name from the guest book"
            />
            Hide my name from the guest book
          </label>
        </div>
      )}

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
