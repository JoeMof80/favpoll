import type { EventSubject } from "@favpoll/types"

export type WizardStep = "honour" | "charity" | "love"

export type WizardCopy = {
  leftPrompt: string
  rail: Record<WizardStep, string>
  charityGuidance: string
  loveGuidance: string
}

export function getWizardCopy(subject: EventSubject): WizardCopy {
  if (subject === "cause") {
    return {
      leftPrompt: "What cause are you supporting?",
      rail: {
        honour: "Who or what is this for?",
        charity: "Pick the charity your cause raises for.",
        love: "Pick a topic relevant to your cause — e.g. Birds for the RSPB.",
      },
      charityGuidance: "Pick the charity your cause raises for.",
      loveGuidance:
        "Pick a topic relevant to your cause — e.g. Birds for the RSPB.",
    }
  }
  return {
    leftPrompt: "Who are you celebrating?",
    rail: {
      honour: "Who or what is this event for?",
      charity: "Proceeds from every pledge go to charity.",
      love: "What did they love? Pick a favpoll topic.",
    },
    charityGuidance: "Proceeds from every pledge go to charity.",
    loveGuidance: "What did they love? Pick a favpoll topic.",
  }
}
