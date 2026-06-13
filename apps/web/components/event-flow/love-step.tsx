"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { ItemAddField } from "@/components/event-form-v2/item-add-field"
import { shortTopicLabel } from "@/lib/registers"
import { cn } from "@/lib/utils"
import type { Category, TopicItem, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "@/components/event-form-v2/schema"

type LoveStepProps = {
  topics: TopicWithMeta[]
  categories: Category[]
  value: EventFormValues["topics"]
  onChange: (v: EventFormValues["topics"]) => void
  hideItemsPanel?: boolean
  suggestedTopics?: TopicWithMeta[]
  primaryCharityName?: string
}

function sortItems(items: TopicItem[]): TopicItem[] {
  return [...items].sort((a, b) => {
    const aOrder = a.display_order ?? Infinity
    const bOrder = b.display_order ?? Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.label.localeCompare(b.label)
  })
}

export function LoveStep({
  topics,
  categories,
  value,
  onChange,
  hideItemsPanel = false,
  suggestedTopics,
  primaryCharityName,
}: LoveStepProps) {
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<string | null>(null)

  const activeTopics = topics.filter((t) => t.is_active !== false)
  const selectedId = value[0]?.topicId ?? null
  const isCustomSelected = value[0]?.isCustom ?? false

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

  // Items panel: show for canonical (non-custom) selected topic
  const selectedTopic =
    selectedId && !isCustomSelected
      ? (activeTopics.find((t) => t.id === selectedId) ?? null)
      : null

  const customLabels = value[0]?.customLabels ?? []

  function handleSelect(id: string) {
    if (id === "__custom__") return
    if (id === selectedId) {
      onChange([])
      return
    }
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

  function handleAddItem(label: string) {
    const current = value[0]
    if (!current) return
    const existing = current.customLabels ?? []
    if (existing.some((l) => l.toLowerCase() === label.toLowerCase())) return
    onChange([{ ...current, customLabels: [...existing, label] }])
  }

  function handleRemoveItem(label: string) {
    const current = value[0]
    if (!current) return
    onChange([
      {
        ...current,
        customLabels: (current.customLabels ?? []).filter((l) => l !== label),
      },
    ])
  }

  return (
    <div className="min-h-64 space-y-0">
      {/* Sticky search + filter row */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
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
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {[
            { id: null, label: "All" },
            ...categories.map((c) => ({ id: c.id, label: c.label })),
          ].map(({ id, label }) => {
            const active = id === null ? !catFilter : catFilter === id
            return (
              <Button
                key={id ?? "__all__"}
                type="button"
                variant="outline"
                onClick={() => setCatFilter(id)}
                className={cn(
                  "shrink-0",
                  active &&
                    "border-primary bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary"
                )}
              >
                {label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Topic chips */}
      <div className="px-5 py-4">
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
          <div className="space-y-4">
            {!search && suggestedTopics && suggestedTopics.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
                  Suggested for {primaryCharityName}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTopics.map((t) => (
                    <Chip
                      key={t.id}
                      selected={t.id === selectedId}
                      size="lg"
                      onClick={() => handleSelect(t.id)}
                    >
                      {shortTopicLabel(t.title)}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
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
          </div>
        )}
      </div>

      {/* Read-only items panel — shown when a canonical topic is selected */}
      {!hideItemsPanel && selectedTopic && (
        <div
          className="border-t border-border px-5 py-4"
          data-testid="items-panel"
        >
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
              What people vote on
            </p>
            {!selectedTopic.is_finite && (
              <p className="text-xs text-muted-foreground">
                Guests can add their own
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sortItems(selectedTopic.topic_items).map((item) => (
              <Chip key={item.id} size="lg" readOnly>
                {item.label}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {/* Editable items panel — shown when a custom (new) topic is selected */}
      {!hideItemsPanel && isCustomSelected && (
        <div
          className="border-t border-border px-5 py-4"
          data-testid="items-panel"
        >
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-medium tracking-widest text-[#534AB7] uppercase">
              What people can pledge against
            </p>
          </div>
          <ItemAddField
            canonicalItems={[]}
            customLabels={customLabels}
            topicTitle={value[0]?.title ?? ""}
            isFinite={false}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
            size="sm"
          />
          {customLabels.length < 2 && (
            <p
              className="mt-2 text-xs text-muted-foreground"
              data-testid="items-validation"
            >
              Add at least two options people can pledge against
            </p>
          )}
        </div>
      )}
    </div>
  )
}
