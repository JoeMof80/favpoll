import { z } from "zod"

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

/**
 * A refusal whose message was WRITTEN FOR A PERSON, so a wrapper can tell
 * it apart from an incidental failure (#1109). The distinction matters
 * because Next redacts thrown messages in production but returns returned
 * ones verbatim: a wrapper that turned every `err.message` into a result
 * would hand the browser whatever Postgres or Stripe last said.
 */
export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "InvalidInputError"
  }
}

/**
 * An id the client hands back. `z.guid`, not `z.uuid`: a Postgres `uuid`
 * column stores any 128-bit value, while `z.uuid` enforces the RFC's
 * version and variant nibbles and would refuse an id the database itself
 * handed us. The message is the caller's, because what the id names
 * differs — a topic, a charity, a favpoll, a favourite.
 *
 * Checking the FORMAT of a machine-supplied id costs nothing and buys
 * something: ids are concatenated into cache keys and interpolated into
 * revalidation paths, where an id carrying its own separator is a value
 * that addresses something other than itself.
 */
export const actionId = (message: string) => z.guid(message)

/**
 * For an action whose contract is a RETURNED result rather than a throw —
 * `app/appeals/actions.ts` answers `{ error }` and its form renders it, so
 * throwing would break the caller rather than inform it. Same parse, same
 * log, different exit.
 */
export function tryParseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
  label: string
): { ok: true; data: z.output<S> } | { ok: false; error: string } {
  const parsed = schema.safeParse(input)
  if (parsed.success) return { ok: true, data: parsed.data }
  return { ok: false, error: firstMessage(parsed.error, label) }
}

/**
 * The same, for an action that takes FormData/**
 * The same, for an action that takes FormData — the shape the original
 * entry prescribed and #1104 had no use for, because the money actions
 * take typed objects. `uploadPersonPhoto` is the first real caller.
 *
 * `formData.get(...) as File` is the assumption this replaces: entries()
 * yields strings and Files exactly as they arrived, and the schema says
 * which it wanted. A field sent more than once collapses to its last
 * value, which no form here does on purpose.
 */
export function parseFormData<S extends z.ZodType>(
  schema: S,
  formData: FormData,
  label: string
): z.output<S> {
  return parseInput(schema, Object.fromEntries(formData.entries()), label)
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
  throw new InvalidInputError(firstMessage(parsed.error, label))
}
