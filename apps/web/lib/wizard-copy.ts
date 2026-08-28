export type WizardStep = "event" | "charity" | "topic"

export type WizardCopy = {
  rail: Record<WizardStep, string>
  charityGuidance: string
  topicGuidance: string
}

// ONE set of words, not two. The wizard used to branch this on `subject`,
// which it knew because Cause was picked in step 1. Cause now moves to the
// form's Generate control (2026-08-25), so by the time an organiser is in
// the wizard nobody knows yet whether this is a person or a cause — and
// copy that assumes a person ("What did they love?", "who you're
// honouring") would address a cause organiser wrongly for two steps.
//
// So these lean on the favpoll rather than on its subject. DRAFT: awaiting
// the founder's wording.
export const WIZARD_COPY: WizardCopy = {
  rail: {
    event: "Celebration, memorial or fundraiser.",
    charity: "Every pledge goes to the charity you pick.",
    topic: "Pick a topic, and guests pledge on their favourite.",
  },
  charityGuidance:
    "Every pledge goes straight to the charity you pick, so pick one that means something here.",
  topicGuidance:
    "Pick a topic that fits, and let guests pledge on their favourite.",
}

export function getWizardCopy(): WizardCopy {
  return WIZARD_COPY
}
