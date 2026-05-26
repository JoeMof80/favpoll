"use client"

import { shortTopicLabel } from "@/lib/occasions"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import type { Category, CanvasPoll, TopicWithMeta } from "@favpoll/types"

type Props = {
  poll: CanvasPoll
  topics: TopicWithMeta[]
  categories: Category[]
  topicCategory: string | null
  topicFinite: "finite" | "infinite" | "custom" | null
  topicSearch: string
  onSelectTopic: (topic: TopicWithMeta) => void
  onSetCustom: () => void
  onCancel: () => void
  onTopicCategoryChange: (cat: string | null) => void
  onTopicFiniteChange: (val: "finite" | "infinite" | "custom" | null) => void
  onTopicSearchChange: (v: string) => void
}

export function TopicPicker({
  poll,
  topics,
  categories,
  topicCategory,
  topicFinite,
  topicSearch,
  onSelectTopic,
  onSetCustom,
  onCancel,
  onTopicCategoryChange,
  onTopicFiniteChange,
  onTopicSearchChange,
}: Props) {
  const activeTopics = topics.filter((t) => t.is_active !== false)
  const customTopics = topics.filter((t) => t.is_active === false)
  const showingCustom = topicFinite === "custom"

  const visibleTopics = showingCustom
    ? customTopics.filter(
        (t) =>
          !topicSearch ||
          t.title.toLowerCase().includes(topicSearch.toLowerCase())
      )
    : activeTopics.filter((t) => {
        const matchesCat =
          !topicCategory || t.category_ids.includes(topicCategory)
        const matchesFinite =
          !topicFinite ||
          (topicFinite === "finite" ? t.is_finite : !t.is_finite)
        const matchesSearch =
          !topicSearch ||
          t.title.toLowerCase().includes(topicSearch.toLowerCase())
        return matchesCat && matchesFinite && matchesSearch
      })

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={topicSearch}
        onChange={(e) => onTopicSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault()
        }}
        placeholder={
          showingCustom ? "Search your favpolls…" : "Search favpolls…"
        }
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        autoFocus
      />

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <small className="text-xs tracking-wide text-muted-foreground uppercase">
          Filter
        </small>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onTopicCategoryChange(null)
            onTopicFiniteChange(null)
          }}
          className={`rounded-md px-3 py-1 text-xs ${
            topicCategory === null && topicFinite === null
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
          }`}
        >
          All
        </Button>
        {(["finite", "infinite"] as const).map((val) => (
          <Button
            key={val}
            type="button"
            size="sm"
            onClick={() => {
              onTopicFiniteChange(topicFinite === val ? null : val)
            }}
            className={`rounded-md px-3 py-1 text-xs ${
              topicFinite === val
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
            }`}
          >
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </Button>
        ))}
        {categories.map((cat) => (
          <Button
            key={cat.id}
            type="button"
            size="sm"
            onClick={() => {
              onTopicFiniteChange(null)
              onTopicCategoryChange(topicCategory === cat.id ? null : cat.id)
            }}
            className={`rounded-md px-3 py-1 text-xs ${
              topicCategory === cat.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat.label}
          </Button>
        ))}
        {customTopics.length > 0 && (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onTopicCategoryChange(null)
              onTopicFiniteChange(topicFinite === "custom" ? null : "custom")
            }}
            className={`rounded-md px-3 py-1 text-xs ${
              topicFinite === "custom"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
            }`}
          >
            My polls
          </Button>
        )}
      </div>

      {/* Result count */}
      <p className="pt-4 text-xs text-muted-foreground uppercase">
        {showingCustom
          ? `${visibleTopics.length} custom favpoll${visibleTopics.length === 1 ? "" : "s"}`
          : visibleTopics.length === activeTopics.length
            ? `${activeTopics.length} favpolls`
            : `${visibleTopics.length} of ${activeTopics.length} favpolls`}
      </p>

      {/* Topic pills */}
      <div className="flex flex-wrap gap-2">
        {visibleTopics.map((t) => (
          <Chip
            key={t.id}
            selected={poll.topicId === t.id}
            onClick={() => onSelectTopic(t)}
          >
            {shortTopicLabel(t.title)}
          </Chip>
        ))}
      </div>

      <div className="flex items-center justify-between">
        {!showingCustom && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSetCustom}
            className="h-auto rounded-full border-dashed px-3 py-1.5 text-xs text-muted-foreground"
          >
            Create your own favpoll
          </Button>
        )}
        {(poll.topicId || poll.topicIsCustom) && (
          <Button
            type="button"
            variant="link"
            onClick={onCancel}
            className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
