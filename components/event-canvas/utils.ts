import type { CanvasPoll } from "@/types"

export const MAX_CHARITIES = 3

export type CanvasState = {
  protagonistName: string
  protagonistBio: string
  dateLabel: string
  occasion: string
  occasionLabel: string
  description: string
  charityIds: string[]
  charitySearch: string
  closesAt: string
  isPrivate: boolean
  potAmount: string
  polls: CanvasPoll[]
}

export function newPoll(topicId = ""): CanvasPoll {
  return {
    key: Math.random().toString(36).slice(2),
    topicId,
    topicIsCustom: false,
    customTopicTitle: "",
    customTopicItems: [],
    framing: "",
    reveal: "",
    prioritizedItemIds: [],
    prioritizedCustomLabels: [],
    curatedCustomLabels: [],
    pickingTopic: !topicId,
  }
}
