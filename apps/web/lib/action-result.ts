// WHAT A SERVER ACTION MAY SAY TO THE ORGANISER (2026-10-15).
//
// The manage page's actions threw plain Errors carrying the sentence the
// row should show — "Keep it under 300 characters.", "Maximum extensions
// reached…", "This favpoll's close date is set by its appeal." — and the
// rows displayed e.message. That worked in development and NOWHERE ELSE:
// Next strips the message from an error thrown inside a server action in
// production builds ("The specific message is omitted in production
// builds to avoid leaking sensitive details"), so every one of those
// sentences reached the organiser as that paragraph instead. The founder
// met it changing a close date on a preview.
//
// So an EXPECTED failure is a value, not a throw: the action's body keeps
// throwing where it reads best, `asResult` turns the outcome into a
// result at the export boundary, and the caller `unwrap`s it — which
// throws a real Error on the client, where the rows and toasts already
// know what to do with one. Unexpected failures travel the same way; they
// did before too (the bodies rethrew Supabase's message), so nothing new
// is exposed, and the message is at least a message.
//
// This file is plain TypeScript, not a "use server" module: an action
// module may export only async functions (memory: use-server exports).

export type ActionResult<T = void> =
  | { ok: true; value: T }
  | { ok: false; error: string }

const FALLBACK = "Couldn't save — try again."

/** Run an action body and return its outcome as a value. */
export async function asResult<T>(
  run: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    return { ok: true, value: await run() }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : FALLBACK }
  }
}

/** On the client: the value, or the failure as a thrown Error. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (result.ok) return result.value
  throw new Error(result.error)
}
