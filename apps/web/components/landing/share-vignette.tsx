import { ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShareFavpollButton } from "@/components/share-favpoll-button"
import { Vignette } from "@/components/landing/vignette"

// How a favpoll with no room reaches people: a link.
//
// IT REPLACED THE POSTER (founder, 2026-08-29: "since this is an offline
// favpoll, maybe we should promote sharing the link rather than QR code?" —
// then "replace the poster with the share artefact"). The A4 poster was the
// weakest of this page's four and for a structural reason: a QR code needs
// somebody to walk past it. A memorial has a wake and a wedding has a room,
// so their paper is handed to people who are already there. Marcus's marathon
// has no venue at all — his sponsorship arrives in a group chat — so a
// noticeboard was the wrong picture of how this favpoll actually spreads.
//
// The print pack is still shown twice on the site, on /memorials and
// /celebrations, so nothing is lost by this page not showing it.
//
// THE REAL COMPONENTS, as everywhere else on these pages. The link row is
// OrganizerRow's, down to the mono type, the truncate and the ghost copy
// button; the button is the real ShareFavpollButton in its inline variant.
// Nothing here is a drawing of the product.
//
// THE LONG LINK, NOT /p/<code>. OrganizerRow is explicit that the short form
// exists for the QR alone — it fits a printable code where a 65-character
// uuid does not — and that the link an organiser copies stays the long one.
// Showing the pretty short link here would depict a flow the product does not
// offer: there is no copy button for it anywhere.
//
// INERT. pointer-events-none on the wrapper, the same technique RevealLockPill
// uses, so the real button cannot actually write a demo URL into a reader's
// clipboard.

// A plausible favpoll URL at the length the real one runs to. The row
// truncates exactly as the organiser's does, which is the honest picture:
// this is what an organiser copies today.
const DEMO_GUEST_URL =
  "https://favpoll.com/favpolls/8f2a91c4-0e5b-4d7a-9c31-6ab4e2f70d18"

export function ShareVignette() {
  return (
    <Vignette className="flex justify-center">
      <div
        data-artefact-box
        className="w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-lg"
      >
        <p className="text-xs font-medium text-foreground">favpoll</p>
        <div className="mt-1 flex items-center gap-1.5">
          <ExternalLink
            size={11}
            className="shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            {DEMO_GUEST_URL}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            aria-hidden="true"
            className="size-6 shrink-0 text-muted-foreground"
          >
            <Copy size={12} aria-hidden="true" />
          </Button>
        </div>
        <div className="pointer-events-none mt-6 flex justify-center">
          <ShareFavpollButton
            shareTitle="Marcus Bell's favpoll"
            url={DEMO_GUEST_URL}
          />
        </div>
      </div>
    </Vignette>
  )
}
