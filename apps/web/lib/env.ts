// A MISSING ENVIRONMENT VARIABLE SHOULD SAY WHICH ONE (#1106, 2026-10-20).
//
// Twelve places read a credential as `process.env.X!`. The assertion is a
// lie the moment the variable is absent, and what follows is never a
// sentence naming it: Supabase is handed `undefined` as a URL and fails
// on the first query, Stripe is constructed with `undefined` as a key and
// fails on the first charge. The request that pays for it is whichever
// one happened to arrive.
//
// This does not move WHEN the failure happens — a module-scope constant
// still fails when its module is first loaded, and a function still fails
// when it is first called. It changes what the failure SAYS. Moving the
// check to boot or to build is a larger question, recorded in
// references/audits/tech-debt-2026-10.md section 2.6 rather than guessed
// at here.
//
// The name is safe to print and the value never is: this throws the
// variable's NAME only.

export function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}
