// Types for lib/actions/wizard-draft.ts, which is a "use server" module and
// so may export only async functions (a type export is erased, but the rule
// is easier to keep than to reason about each time — generate-draft-input.ts
// exists for the same reason).

export type WizardDraft = {
  id: string
  payload: unknown
  photoPath: string | null
}
