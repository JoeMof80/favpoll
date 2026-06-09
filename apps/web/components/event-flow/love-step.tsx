"use client"

import { useState } from "react"
import { Chip } from "@/components/ui/chip"
import { shortTopicLabel } from "@/lib/registers"
import { cn } from "@/lib/utils"
import type { Category, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"

type LoveStepProps = {
  topics: TopicWithMeta[]
  categories: Category[]
  value: EventFormValues["topics"]
  onChange: (v: EventFormValues["topics"]) => void
}

export function LoveStep({
  topics,
  categories,
  value,
  onChange,
}: LoveStepProps) {
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<string | null>(null)

  const activeTopics = topics.filter((t) => t.is_active !== false)
  const selectedId = value[0]?.topicId ?? null

  // Inject any custom-created topic into the display list, sorted alphabetically
  const customEntry: TopicWithMeta | null = value[0]?.isCustom
    ? ({
        id: "__custom__",
        title: value[0].title,
        is_active: true,
        is_finite: false,
        topic_items: [],
        category_ids: [],
        placeholders: {},
      } as unknown as TopicWithMeta)
    : null
  const allDisplayTopics = customEntry
    ? [...activeTopics, customEntry].sort((a, b) =>
        a.title.localeCompare(b.title)
      )
    : activeTopics

  const filtered = allDisplayTopics.filter((t) => {
    const matchesCat =
      t.id === "__custom__" || !catFilter || t.category_ids.includes(catFilter)
    const matchesSearch =
      !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const trimmedSearch = search.trim()
  const showCreate = trimmedSearch.length > 0 && filtered.length === 0

  function handleSelect(id: string) {
    if (id === "__custom__") return
    const t = activeTopics.find((t) => t.id === id)
    if (!t) return
    onChange([
      {
        topicId: t.id,
        title: t.title,
        isCustom: false,
        items: t.topic_items.map((i) => ({ id: i.id, label: i.label })),
        customLabels: [],
      },
    ])
    setSearch("")
  }

  function handleCreateTopic() {
    if (!trimmedSearch) return
    onChange([
      {
        topicId: "",
        title: trimmedSearch,
        isCustom: true,
        items: [],
        customLabels: [],
      },
    ])
    setSearch("")
  }

  return (
    <div className="min-h-[22rem] space-y-0">
      {/* Sticky search + filter row */}
      <div className="sticky top-0 z-10 bg-background pt-1 pb-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleCreateTopic()
            }
          }}
          placeholder="Search topics…"
          autoFocus
          className="mb-2 w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring"
        />

        {/* Category filter buttons */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {[{ id: null, label: "All" }, ...categories.map((c) => ({ id: c.id, label: c.label }))].map(
            ({ id, label }) => (
              <button
                key={id ?? "__all__"}
                type="button"
                onClick={() => setCatFilter(id)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors",
                  (id === null ? !catFilter : catFilter === id)
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Separator */}
      <div className="border-b border-border" />

      {/* Topic chips */}
      <div className="pt-3">
        {showCreate ? (
          <button
            type="button"
            onClick={handleCreateTopic}
            className="flex w-full items-center gap-1.5 rounded px-2.5 py-1.5 text-sm hover:bg-muted"
          >
            <span className="text-muted-foreground">Add</span>
            <span className="gap-1 rounded-full bg-muted px-3 py-0.5 font-medium text-muted-foreground">
              {trimmedSearch}
            </span>
          </button>
        ) : filtered.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            No topics found.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((t) => (
              <Chip
                key={t.id}
                selected={t.id === selectedId || t.id === "__custom__"}
                size="lg"
                onClick={() => handleSelect(t.id)}
              >
                {shortTopicLabel(t.title)}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
