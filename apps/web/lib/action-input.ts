import type { z } from "zod"

// WHAT A SERVER ACTION MAY BELIEVE ABOUT ITS ARGUMENT (2026-10-20).
//
// An action's parameters are typed, and that type is checked at the call
// site and nowhere else. Next serialises the argument and the action
// deserialises it, so the shape the body reads is whatever arrived in the
// request — a crafted POST, a client left over from before a deploy, or a
// plain bug in the caller all hand the body a value TypeScript has
// already blessed. `formData.get(...) as string` is the same assumption
// written down.
//
// So an action states its shape as a schema and parses its argument
// first. A failure throws the field's own sentence, which `asResult`
// (lib/action-result) turns into a result the caller renders — the two
// halves of the same idea, and the reason the message survives a
// production build.
//
// WHAT THESE SCHEMAS ARE NOT FOR: tightening anything an honest person
// could get wrong. On the money path the card has already been charged by
// the time the action runs — `verifyPledgePayment` is the first thing
// `createPledge` does, against a PaymentIntent that has already
// succeeded. A refusal here is somebody debited for nothing. So the
// schemas guard the shape, which only a crafted request or a bug gets
// wrong, and leave the rest to the dialog that collected it.

const FALLBACK = "Something about that request didn't look right."

/** The first failure as one sentence, with the whole list logged: the
 *  person gets something readable, the log keeps what broke. */
function firstMessage(error: z.ZodError, label: string): string {
  console.error(
    `[${label}] rejected its input:`,
    error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
  )
  return error.issues[0]?.message || FALLBACK
}

/** Parse a server action's argument, or throw the first failure as the
 *  sentence the caller should show. `label` names the action in the log. */
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
  label: string
): z.output<S> {
  const parsed = schema.safeParse(input)
  if (parsed.success) return parsed.data
  throw new Error(firstMessage(parsed.error, label))
}
