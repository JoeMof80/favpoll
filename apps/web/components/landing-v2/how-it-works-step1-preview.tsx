import { FavpollHeader } from "@/components/favpoll-card/favpoll-header"
import { PreviewCard } from "./how-it-works-preview-card"
import { EXAMPLE } from "./example"

export function Step1Preview() {
  return (
    <PreviewCard>
      <FavpollHeader
        protagonist={{ name: EXAMPLE.protagonist.name }}
        eyebrow={EXAMPLE.occasion}
        size="md"
      />
    </PreviewCard>
  )
}
