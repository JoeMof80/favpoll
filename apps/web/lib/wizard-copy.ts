// The wizard's step axis. Six steps since the extended-wizard verdict
// (2026-08-31, references/extended-wizard-plan.md): the wizard carries
// the whole creation, and the rail speaks in labels and answers — the
// per-step marketing copy (WIZARD_COPY) retired with the subtext.
export type WizardStep =
  | "event"
  | "charity"
  | "topic"
  | "info"
  | "story"
  | "details"

export const STEPS: WizardStep[] = [
  "event",
  "charity",
  "topic",
  "info",
  "story",
  "details",
]

export const STEP_LABELS: Record<WizardStep, string> = {
  event: "Event",
  charity: "Charity",
  topic: "Topic",
  info: "Header",
  story: "Story",
  details: "Settings",
}
