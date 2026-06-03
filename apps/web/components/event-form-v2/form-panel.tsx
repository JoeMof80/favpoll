"use client"

import type { Category, Charity, TopicWithMeta } from "@favpoll/types"
import { StepSection } from "./step-section"
import { StepOccasion } from "./steps/step-occasion"
import { StepProfile } from "./steps/step-profile"
import { StepTopic } from "./steps/step-topic"
import { StepReveal } from "./steps/step-reveal"
import { StepEvent } from "./steps/step-event"
import type { PickerSize } from "./constants"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  previewSuffix: boolean
  onToggleSuffix: () => void
  previewPhoto: boolean
  onTogglePhoto: () => void
  onRevealFocus: () => void
  onRevealBlur: () => void
  photoFileName: string | null
  onPhotoFileChange: (name: string | null) => void
  size?: PickerSize
}

export function FormPanel({
  charities,
  topics,
  categories,
  previewSuffix,
  onToggleSuffix,
  previewPhoto,
  onTogglePhoto,
  onRevealFocus,
  onRevealBlur,
  photoFileName,
  onPhotoFileChange,
  size = "md",
}: Props) {
  return (
    <div className="p-6">
      <StepSection number={1} title="Occasion" size={size}>
        <StepOccasion size={size} />
      </StepSection>

      <StepSection number={2} title="Profile" size={size}>
        <StepProfile
          topics={topics}
          previewSuffix={previewSuffix}
          onToggleSuffix={onToggleSuffix}
          previewPhoto={previewPhoto}
          onTogglePhoto={onTogglePhoto}
          photoFileName={photoFileName}
          onPhotoFileChange={onPhotoFileChange}
          size={size}
        />
      </StepSection>

      <StepSection number={3} title="Topic" size={size}>
        <StepTopic topics={topics} categories={categories} size={size} />
      </StepSection>

      <StepSection number={4} title="Reveal" size={size}>
        <StepReveal
          topics={topics}
          onRevealFocus={onRevealFocus}
          onRevealBlur={onRevealBlur}
          size={size}
        />
      </StepSection>

      <StepSection number={5} title="Event" isLast size={size}>
        <StepEvent charities={charities} size={size} />
      </StepSection>
    </div>
  )
}
