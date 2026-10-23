import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { addGuestItem, addOrganizerItem } from "@/app/favpolls/[id]/actions"
import type {
  FavpollWithDetails,
  FavpollPollWithItems,
  Favourite,
} from "@favpoll/types"

/** THE HOSTAGE RULE (founder, 2026-10-22). The sheet holds after payment so
 *  the note can be read on it — but the money is already taken, so the
 *  ceremony must never trap anyone behind a slow request. Past this, the
 *  sheet closes and the page unlocks exactly as it did before the ceremony
 *  existed: the note types in place. */
export const NOTE_FETCH_TIMEOUT_MS = 2500

/** THE STRANDING GUARD. The page is held locked while the sheet reads the
 *  note out, so nothing is revealed around a desktop modal before the sheet
 *  has gone (founder, 2026-10-22 — the standings and the note were plainly
 *  visible behind it). That hold is the one place a bug could leave a guest
 *  who has PAID looking at a lock card, so it is not trusted: the page
 *  unlocks on its own this long after the fetch returns, whatever the sheet
 *  does or fails to do. Comfortably past the ceremony's own length
 *  (pledge-dialog/step-confirmed.tsx CEREMONY_MS). */
export const UNLOCK_ANYWAY_MS = 12_000

type UseFavpollContentOptions = {
  favpoll: FavpollWithDetails
  pollWithItems: FavpollPollWithItems | null
  isClosed: boolean
  clerkUserId: string | null
  entitled: boolean
}

export function useFavpollContent({
  favpoll,
  pollWithItems,
  isClosed,
  clerkUserId,
  entitled,
}: UseFavpollContentOptions) {
  const router = useRouter()
  const [pledgeConfirmed, setPledgeConfirmed] = useState(false)
  // Set by the pledge sheet when it has read the note out on its way off
  // screen, so the page shows the note standing instead of typing it again.
  const [noteReadOnSheet, setNoteReadOnSheet] = useState(false)
  // Raised when the sheet has gone, however it went — note read, no note,
  // reduced motion, or the hostage timeout. It is what lets the standings
  // climb: entitlement arrives while the sheet is still up (guaranteed, in a
  // `finally`, so a paid-up guest is never stranded behind a lock card), and
  // a climb tied to that would play behind the sheet.
  const [pledgeFlowDone, setPledgeFlowDone] = useState(false)
  const [localEntitled, setLocalEntitled] = useState(entitled)
  // undefined = fall back to server value; null/string = guest override
  const [localNote, setLocalReveal] = useState<string | null | undefined>(
    undefined
  )
  const [localItems, setLocalItems] = useState<Favourite[] | undefined>(
    undefined
  )

  const unlockTimer = useRef<number | undefined>(undefined)
  const unlock = useCallback(() => {
    window.clearTimeout(unlockTimer.current)
    setLocalEntitled(true)
  }, [])
  useEffect(() => () => window.clearTimeout(unlockTimer.current), [])

  // Sync when server refresh brings entitled=true (signed-in users post-pledge)
  useEffect(() => {
    if (entitled && !localEntitled) setLocalEntitled(true)
  }, [entitled, localEntitled])

  // RETURNS THE NOTE (2026-10-22), so the sheet that is still on screen can
  // read it out before it leaves — the phone OPENS on the note where the room
  // ENDS on it (founder, 2026-10-22). Null means there is nothing to read:
  // no note on this favpoll, the request failed, or it passed the hostage
  // timeout — in every one of those the caller simply closes as it always did.
  //
  // The DATA path below is unchanged on purpose. A guest still takes the local
  // override and a signed-in user still takes fresh server props, because
  // localItems never falls back once set and a signed-in page goes on
  // receiving router.refresh()es that would then never reach the list. The
  // signed-in branch's fetch is for the ceremony only and writes no state.
  const handlePledgeSuccess = useCallback(
    async (guestToken?: string): Promise<string | null> => {
      setPledgeConfirmed(true)
      if (!pollWithItems?.id) {
        unlock()
        return null
      }
      const controller = new AbortController()
      const timer = window.setTimeout(
        () => controller.abort(),
        NOTE_FETCH_TIMEOUT_MS
      )
      const noteUrl = `/api/polls/${encodeURIComponent(pollWithItems.id)}/note${
        guestToken ? `?guest_token=${encodeURIComponent(guestToken)}` : ""
      }`
      try {
        if (clerkUserId) {
          // Signed-in: server refresh re-runs page with hasPledged=true → real
          // data. The read is only so the sheet has something to type.
          router.refresh()
          const res = await fetch(noteUrl, { signal: controller.signal })
          return res.ok ? ((await res.json()).personal_note ?? null) : null
        }
        if (!guestToken) return null
        // Guest: fetch real reveal + items from gated endpoint
        const res = await fetch(noteUrl, { signal: controller.signal })
        if (!res.ok) return null
        const data = await res.json()
        const note: string | null = data.personal_note ?? null
        setLocalReveal(note)
        setLocalItems(data.items ?? [])
        return note
      } catch {
        // best effort — they've pledged, and the guard below still unlocks
        return null
      } finally {
        window.clearTimeout(timer)
        // NOT unlocked here any more. The sheet is still on screen reading
        // the note out, and on a desktop it is a centred modal with the page
        // in full view around it — unlocking now spent the reveal before the
        // sheet had left. markPledgeFlowDone does it; this is only the guard.
        unlockTimer.current = window.setTimeout(unlock, UNLOCK_ANYWAY_MS)
      }
    },
    [router, clerkUserId, pollWithItems?.id, unlock]
  )

  function addItemHandler(poll: FavpollPollWithItems) {
    // No clerkUserId check on the GUEST path (2026-08-13). Guests pledge with
    // an email and no account, so gating this on sign-in withheld it from
    // almost everyone it was for. The server action rate-limits by IP and
    // flags the favourite for review instead.
    if (poll.topics.is_finite || isClosed) return undefined
    const isOrganiser = clerkUserId === favpoll.created_by
    // Returns the favourite's id so the pledge picker can auto-pick it
    // (tap-advance grammar, 2026-09-16) — router.refresh reconciles the
    // optimistic local item with the real row.
    if (isOrganiser) {
      return async (label: string) => {
        const id = await addOrganizerItem(favpoll.id, label)
        router.refresh()
        return id
      }
    }
    return async (label: string) => {
      const id = await addGuestItem(poll.id, poll.topic_id, label)
      router.refresh()
      return id
    }
  }

  // Must be stable (useCallback + [] deps) — usePollSection's effects include
  // onViewChange in their deps and have cleanup that cancels timeouts; an
  // unstable reference causes re-fires that cancel the showRankings timer.
  const handleViewChange = useCallback((view: "pledge" | "results") => {
    if (view === "pledge") setPledgeConfirmed(false)
  }, [])

  // Effective reveal: guest override takes precedence; signed-in gets it from pollWithItems after refresh
  const effectiveNote =
    localNote !== undefined ? localNote : (pollWithItems?.personal_note ?? null)

  // Effective items: guest override takes precedence; signed-in gets real values after refresh
  const effectiveItems =
    localItems !== undefined
      ? localItems
      : (pollWithItems?.topics.favourites ?? [])

  // The sheet has gone, however it went. Unlock now: the page is revealed
  // with the note already standing and the standings climbing from zero.
  const markPledgeFlowDone = useCallback(
    (noteWasRead: boolean) => {
      setNoteReadOnSheet(noteWasRead)
      setPledgeFlowDone(true)
      unlock()
    },
    [unlock]
  )

  return {
    markPledgeFlowDone,
    noteReadOnSheet,
    pledgeFlowDone,
    handlePledgeSuccess,
    pledgeConfirmed,
    addItemHandler,
    handleViewChange,
    localEntitled,
    effectiveNote,
    effectiveItems,
  }
}
