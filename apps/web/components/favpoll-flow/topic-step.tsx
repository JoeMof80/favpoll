"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { shortTopicLabel } from "@/lib/registers"
import { cn } from "@/lib/utils"
import type { Category, Favourite, TopicWithMeta } from "@favpoll/types"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"

type TopicStepProps = {
  topics: TopicWithMeta[]
  categories: Category[]
  value: FavpollFormValues["topics"]
  onChange: (v: FavpollFormValues["topics"]) => void
  suggestedTopics?: TopicWithMeta[]
  primaryCharityName?: string
  /** When provided, search state is controlled externally (input lives in the overlay header). */
  search?: string
  onSearchChange?: (v: string) => void
}

function sortItems(items: Favourite[]): Favourite[] {
  return [...items].sort((a, b) => {
    const aOrder = a.display_order ?? Infinity
    const bOrder = b.display_order ?? Infinity
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.label.localeCompare(b.label)
  })
}

export function TopicStep({
  topics,
  categories,
  value,
  onChange,
  suggestedTopics,
  primaryCharityName,
  search: externalSearch,
  onSearchChange,
}: TopicStepProps) {
  const [internalSearch, setInternalSearch] = useState("")
  const search = externalSearch ?? internalSearch
  const setSearch = onSearchChange ?? setInternalSearch
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<"finite" | "infinite" | null>(
    null
  )

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
        favourites: [],
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
    const matchesType =
      t.id === "__custom__" ||
      !typeFilter ||
      (typeFilter === "finite" ? t.is_finite : !t.is_finite)
    return matchesCat && matchesSearch && matchesType
  })

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
        items: t.favourites.map((i) => ({ id: i.id, label: i.label })),
        customLabels: [],
      },
    ])
    setSearch("")
  }

  const filters = [
    {
      key: "__all__",
      label: "All",
      isActive: !catFilter && !typeFilter,
      onClick: () => {
        setCatFilter(null)
        setTypeFilter(null)
      },
    },
    {
      key: "__finite__",
      label: "Finite",
      isActive: typeFilter === "finite",
      onClick: () => setTypeFilter("finite"),
    },
    {
      key: "__infinite__",
      label: "Infinite",
      isActive: typeFilter === "infinite",
      onClick: () => setTypeFilter("infinite"),
    },
    ...categories.map((c) => ({
      key: c.id,
      label: c.label,
      isActive: catFilter === c.id,
      onClick: () => setCatFilter(c.id),
    })),
  ]

  return (
    <div className="min-h-64 space-y-0">
      {/* Sticky search (when uncontrolled) + filters + suggested */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            Filters
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {filters.map(({ key, label, isActive, onClick }) => (
              <Button
                key={key}
                type="button"
                variant="outline"
                onClick={onClick}
                className={cn(
                  "shrink-0",
                  isActive &&
                    "border-primary bg-primary/5 text-primary hover:bg-primary/5 hover:text-primary"
                )}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {suggestedTopics && suggestedTopics.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="shrink-0 text-[11px] font-medium tracking-widest text-primary uppercase">
              Suggested for {primaryCharityName}
            </span>
            <div className="flex gap-1.5 overflow-x-auto">
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
      </div>

      {/* Topic chips */}
      <div className="px-5 py-4">
        {filtered.length > 0 ? (
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
        ) : (
          <p className="py-3 text-center text-sm text-muted-foreground">
            No matching topics — add your own.
          </p>
        )}
      </div>

      {/* Items panels (read-only canonical + ItemAddField custom) removed
          2026-09-17: the wizard — this component's only consumer — always
          passed hideItemsPanel, so they were dead branches keeping retired
          add-grammar alive. Items live in the card's items dialog. */}
    </div>
  )
}
