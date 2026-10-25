"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  withdrawAllPledges,
  restoreWithdrawnPledges,
  deleteE2eFavpolls,
  type ResetResult,
} from "@/lib/actions/pledges"

// PUT STAGING BACK. Two clicks to fire, following the access table's inline
// confirm rather than a dialog — the house pattern in this app.
//
// The undo lives in component state on purpose: it holds the exact stamp the
// reset used, so it restores those rows and nothing else. Reload the page and
// the undo is gone, which is correct — a stamp you can no longer see is not
// one you should be able to reverse blind.

export function ResetPledges({ e2eCount }: { e2eCount: number }) {
  const [confirming, setConfirming] = useState(false)
  const [confirmingPurge, setConfirmingPurge] = useState(false)
  const [purge, setPurge] = useState<{
    error: string | null
    count: number
  } | null>(null)
  const [result, setResult] = useState<ResetResult | null>(null)
  const [undone, setUndone] = useState(false)
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<ResetResult>, isUndo: boolean) =>
    startTransition(async () => {
      const r = await fn()
      setResult(r)
      setUndone(isUndo && !r.error)
      setConfirming(false)
    })

  return (
    <div className="flex flex-wrap items-center gap-3">
      {confirming ? (
        <>
          <Button
            type="button"
            size="xs"
            variant="destructive"
            disabled={pending}
            onClick={() => run(withdrawAllPledges, false)}
          >
            {pending ? "…" : "Confirm — withdraw every pledge"}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={pending}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button
          type="button"
          size="xs"
          variant="destructive"
          onClick={() => setConfirming(true)}
        >
          Reset pledges
        </Button>
      )}

      {result?.at && !result.error && !undone && (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          disabled={pending}
          onClick={() => run(() => restoreWithdrawnPledges(result.at!), true)}
        >
          Undo
        </Button>
      )}

      {/* THE E2E DÉBRIS, separately — it DELETES and cascades, where the
          reset above only withdraws. Different blast radius, so a different
          confirm rather than one button that does both. */}
      {e2eCount > 0 &&
        (confirmingPurge ? (
          <>
            <Button
              type="button"
              size="xs"
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setPurge(await deleteE2eFavpolls())
                  setConfirmingPurge(false)
                })
              }
            >
              {pending ? "…" : `Confirm — delete ${e2eCount} permanently`}
            </Button>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              disabled={pending}
              onClick={() => setConfirmingPurge(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setConfirmingPurge(true)}
          >
            Delete {e2eCount} E2E favpolls
          </Button>
        ))}

      {purge && (
        <span
          className={
            purge.error
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {purge.error ?? `${purge.count} E2E favpolls deleted.`}
        </span>
      )}

      {result && (
        <span
          className={
            result.error
              ? "text-xs text-destructive"
              : "text-xs text-muted-foreground"
          }
        >
          {result.error
            ? result.error
            : undone
              ? `${result.count} pledge${result.count === 1 ? "" : "s"} restored.`
              : `${result.count} pledge${result.count === 1 ? "" : "s"} withdrawn — every favpoll is locked again.`}
        </span>
      )}
    </div>
  )
}
