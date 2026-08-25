import type { FavpollSubject } from "@favpoll/types"

export type WizardStep = "type" | "charity" | "topic"

export type WizardCopy = {
  rail: Record<WizardStep, string>
  charityGuidance: string
  topicGuidance: string
}

const SOMEONE: WizardCopy = {
  rail: {
    type: "Who or what is this favpoll for?",
    charity: "Every pledge goes to the charity you pick.",
    topic: "What did they love? Guests pledge on their favourites.",
  },
  charityGuidance:
    "Pick from many worthy causes, ideally a meaningful one to who you're honouring.",
  topicGuidance:
    "What did they love? Pick a topic close to their heart and let guests pledge on their favourite.",
}

const CAUSE: WizardCopy = {
  rail: {
    type: "Who or what is this favpoll for?",
    charity: "Every pledge goes to the charity you pick.",
    topic: "Pick a topic your supporters will love voting on.",
  },
  charityGuidance:
    "Which charity are you raising for? Proceeds from every pledge go straight to them.",
  topicGuidance:
    "Pick a topic that suits your cause — something supporters will enjoy voting on.",
}

export function getWizardCopy(subject: FavpollSubject): WizardCopy {
  return subject === "cause" ? CAUSE : SOMEONE
}
