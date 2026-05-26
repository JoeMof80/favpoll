import type { CanvasPoll } from "@favpoll/types"

export const MAX_CHARITIES = 3

export type CanvasState = {
  protagonistName: string
  protagonistAbout: string
  dateLabel: string
  occasion: string
  occasionLabel: string
  description: string
  charityIds: string[]
  charitySearch: string
  closesAt: string
  isPrivate: boolean
  potAmount: string
  poll: CanvasPoll
}

export function newPoll(topicId = ""): CanvasPoll {
  return {
    topicId,
    topicIsCustom: false,
    customTopicTitle: "",
    customTopicItems: [],
    reveal: "",
    curatedCustomLabels: [],
    pickingTopic: !topicId,
  }
}
