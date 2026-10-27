// Types for lib/actions/wizard-draft.ts, which is a "use server" module and
// so may export only async functions (a type export is erased, but the rule
// is easier to keep than to reason about each time — generate-draft-input.ts
// exists for the same reason).

export type WizardDraft = {
  id: string
  payload: unknown
  photoPath: string | null
}

/**
 * What a claim hands back. `photoUrl` is the organiser-scoped URL once the
 * draft's photo has moved, or null when there was no photo.
 */
export type DraftClaim = {
  claimed: boolean
  photoUrl: string | null
}
