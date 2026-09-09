import { HEADLINE_BEATS, SITE_DESCRIPTION } from "@/lib/og/site"

// Shared shell for /sign-in and /sign-up (founder, 2026-09-09: "they
// should look more-or-less the same") — one shell, one wash, the same
// panel; the card slots in beside it (panel hides below lg, so both
// pages are an identical centred card on mobile).
//
// THE PANEL AUTHORS NOTHING (founder, same day): it consumes the
// canonical headline and brand statement (lib/og/site → the i18n
// layer), so the next copy evolution updates this page for free. The
// previous hand-written pitch rotted here unnoticed for months — down
// to a fee claim that had stopped being true. Auth pages are where
// copy goes to die; this one can no longer drift.
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid flex-1 bg-muted lg:grid-cols-2">
      <div className="hidden flex-1 items-center justify-end p-10 lg:flex">
        <div className="max-w-sm space-y-6">
          <div>
            <span className="text-base font-medium text-primary">favpoll</span>
          </div>
          <div className="space-y-1">
            {HEADLINE_BEATS.map((beat) => (
              <p key={beat} className="text-lg font-medium text-foreground">
                {beat}
              </p>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {SITE_DESCRIPTION}
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 md:p-10 lg:justify-start">
        {children}
      </div>
    </div>
  )
}
