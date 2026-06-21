import type { FavpollSubject } from "@favpoll/types"

export type WizardStep = "honour" | "charity" | "love"

export type WizardCopy = {
  leftPrompt: string
  rail: Record<WizardStep, string>
  charityGuidance: string
  loveGuidance: string
}

const SOMEONE: WizardCopy = {
  leftPrompt:
    "Someone you love, a cause that matters, and the things they loved — that's a favpoll.",
  rail: {
    honour: "Who or what is this favpoll for?",
    charity: "Every pledge goes to the charity you choose.",
    love: "What did they love? Guests pledge on their favourites.",
  },
  charityGuidance:
    "Pick from many worthy causes, ideally a meaningful one to who you're honouring.",
  loveGuidance:
    "What did they love? Pick a topic close to their heart and let guests pledge on their favourite.",
}

const CAUSE: WizardCopy = {
  leftPrompt:
    "A cause that matters, and a question people will love answering — that's a favpoll.",
  rail: {
    honour: "Who or what is this favpoll for?",
    charity: "Every pledge goes to the charity you choose.",
    love: "Pick a topic your supporters will love voting on.",
  },
  charityGuidance:
    "Which charity are you raising for? Proceeds from every pledge go straight to them.",
  loveGuidance:
    "Pick a topic that suits your cause — something supporters will enjoy voting on.",
}

export function getWizardCopy(subject: FavpollSubject): WizardCopy {
  return subject === "cause" ? CAUSE : SOMEONE
}
