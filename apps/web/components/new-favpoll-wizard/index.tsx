"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputGroupButton } from "@/components/ui/input-group"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { TypeStep } from "@/components/favpoll-flow/type-step"
import { TopicStep } from "@/components/favpoll-flow/topic-step"
import { CharityStep } from "@/components/favpoll-flow/charity-step"
import { TopicItemsDialog } from "@/components/favpoll-flow/topic-items-dialog"
import { useWizardState } from "./use-wizard-state"
import { WizardStepRail } from "./wizard-step-rail"
import { WizardProgressStrip } from "./wizard-progress-strip"
import { WizardNav } from "./wizard-nav"
import { WizardCharityCard } from "./wizard-charity-card"
import { WizardTopicCard } from "./wizard-topic-card"
import { WizardStepShell } from "./wizard-step-shell"
import type { WizardData } from "./use-wizard-state"

type Props = {
  data: WizardData
}

export function NewFavpollWizard({ data }: Props) {
  const w = useWizardState(data)
  const [topicSearch, setTopicSearch] = useState("")
  const [charitySearch, setCharitySearch] = useState("")

  const trimmedTopicSearch = topicSearch.trim()
  const topicShowCreate =
    trimmedTopicSearch.length > 0 &&
    !data.topics
      .filter((t) => t.is_active !== false)
      .some((t) => t.title.toLowerCase() === trimmedTopicSearch.toLowerCase())

  function handleCreateTopic() {
    if (!trimmedTopicSearch) return
    w.setTopics([
      {
        topicId: "",
        title: trimmedTopicSearch,
        isCustom: true,
        items: [],
        customLabels: [],
      },
    ])
    w.setTopicOpen(false)
    setTopicSearch("")
  }

  return (
    <main>
      <div className="md:grid md:min-h-[calc(100vh-4rem)] md:grid-cols-[320px_1fr] md:items-stretch">
        <WizardStepRail currentStep={w.step} copy={w.copy} />

        <div className="px-6 pt-12 pb-10 md:px-12 md:pt-20">
          <div className="mx-auto w-full max-w-2xl">
            <WizardProgressStrip currentStep={w.step} />

            {/* Type step */}
            {w.step === "type" && (
              <WizardStepShell guidance="What kind of favpoll is this?">
                <TypeStep
                  value={{
                    category: w.category,
                    grouping: w.grouping,
                    subject: w.subject,
                    pronoun: w.pronoun,
                  }}
                  onChange={({ category, grouping, subject, pronoun }) => {
                    w.setCategory(category)
                    w.setGrouping(grouping)
                    w.setSubject(subject)
                    w.setPronoun(pronoun)
                  }}
                />
              </WizardStepShell>
            )}

            {/* Charity step */}
            {w.step === "charity" && (
              <WizardStepShell guidance={w.copy.charityGuidance}>
                {w.selectedCharities.length > 0 ? (
                  <WizardCharityCard
                    charities={w.selectedCharities}
                    onEdit={() => w.setCharityOpen(true)}
                    onRemove={(id) =>
                      w.setCharityIds((ids) => ids.filter((i) => i !== id))
                    }
                    onPickAnother={() => w.setCharityOpen(true)}
                  />
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => w.setCharityOpen(true)}
                  >
                    Pick a charity
                  </Button>
                )}
              </WizardStepShell>
            )}

            {/* Topic step */}
            {w.step === "topic" && (
              <WizardStepShell guidance={w.copy.topicGuidance}>
                {w.topics.length > 0 ? (
                  <WizardTopicCard
                    topic={w.topics[0]}
                    sortedExistingItems={w.sortedExistingItems}
                    customLabels={w.customLabels}
                    showItemsSection={w.showItemsSection}
                    onEdit={() => w.setTopicOpen(true)}
                    onOpenItemsDialog={() => w.setItemsDialogOpen(true)}
                  />
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => w.setTopicOpen(true)}
                  >
                    Pick a topic
                  </Button>
                )}
              </WizardStepShell>
            )}

            <WizardNav
              isFirst={w.isFirst}
              isLast={w.isLast}
              nextDisabled={w.nextDisabled}
              onBack={w.handleBack}
              onNext={w.handleNext}
              onFinish={w.handleFinish}
            />
          </div>
        </div>
      </div>

      {/* Love overlay */}
      <ResponsiveOverlay
        open={w.topicOpen}
        onOpenChange={(o) => {
          w.setTopicOpen(o)
          if (!o) setTopicSearch("")
        }}
        title="Pick a topic"
        hideCloseButton
        headerClassName="px-5 pt-4 pb-2"
        bodyClassName="p-0"
        fullscreenOnMobile
        mobileSave={{
          label: "Done",
          onClick: () => {
            w.setTopicOpen(false)
            setTopicSearch("")
          },
        }}
        header={
          <div className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder="Search topics…"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && topicShowCreate) {
                  e.preventDefault()
                  handleCreateTopic()
                }
              }}
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
            />
            {topicShowCreate && (
              <InputGroupButton variant="secondary" onClick={handleCreateTopic}>
                Add
              </InputGroupButton>
            )}
          </div>
        }
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                w.setTopicOpen(false)
                setTopicSearch("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                w.setTopicOpen(false)
                setTopicSearch("")
              }}
            >
              Done
            </Button>
          </div>
        }
      >
        <TopicStep
          topics={data.topics}
          categories={data.categories}
          value={w.topics}
          onChange={(v) => {
            w.setTopics(v)
            w.setTopicOpen(false)
            setTopicSearch("")
          }}
          hideItemsPanel
          suggestedTopics={w.suggestedTopics}
          primaryCharityName={w.primaryCharity?.name}
          search={topicSearch}
          onSearchChange={setTopicSearch}
        />
      </ResponsiveOverlay>

      {/* Charity overlay */}
      <ResponsiveOverlay
        open={w.charityOpen}
        onOpenChange={(o) => {
          w.setCharityOpen(o)
          if (!o) setCharitySearch("")
        }}
        title="Pick a charity"
        hideCloseButton
        headerClassName="px-5 pt-4 pb-2"
        bodyClassName="p-0"
        fullscreenOnMobile
        mobileSave={{
          label: "Done",
          onClick: () => {
            w.setCharityOpen(false)
            setCharitySearch("")
          },
        }}
        header={
          <input
            type="text"
            autoFocus
            placeholder="Search charities…"
            value={charitySearch}
            onChange={(e) => setCharitySearch(e.target.value)}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
          />
        }
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                w.setCharityOpen(false)
                setCharitySearch("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                w.setCharityOpen(false)
                setCharitySearch("")
              }}
            >
              Done
            </Button>
          </div>
        }
      >
        <CharityStep
          charities={data.charities}
          value={w.charityIds}
          onChange={w.setCharityIds}
          search={charitySearch}
        />
      </ResponsiveOverlay>

      {/* Items dialog */}
      {w.topics.length > 0 && (
        <TopicItemsDialog
          open={w.itemsDialogOpen}
          onOpenChange={w.setItemsDialogOpen}
          topicTitle={w.topics[0].title}
          existingItems={w.dialogExistingItems}
          addedItems={w.customLabels}
          onAdd={w.handleAddItem}
          onRemove={w.handleRemoveItem}
          isNewTopic={w.topics[0].isCustom ?? false}
        />
      )}
    </main>
  )
}
