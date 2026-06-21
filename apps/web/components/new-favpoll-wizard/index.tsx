"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { HonourStep } from "@/components/favpoll-flow/honour-step"
import { LoveStep } from "@/components/favpoll-flow/love-step"
import { CharityStep } from "@/components/favpoll-flow/charity-step"
import { TopicItemsDialog } from "@/components/favpoll-flow/topic-items-dialog"
import { useWizardState } from "./use-wizard-state"
import { WizardTriadRail } from "./wizard-triad-rail"
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
  const [loveSearch, setLoveSearch] = useState("")
  const [charitySearch, setCharitySearch] = useState("")

  return (
    <main>
      <div className="md:grid md:min-h-[calc(100vh-4rem)] md:grid-cols-[320px_1fr] md:items-stretch">
        <WizardTriadRail currentStep={w.step} copy={w.copy} />

        <div className="px-6 pt-12 pb-10 md:px-12 md:pt-20">
          <div className="mx-auto w-full max-w-2xl">
            <WizardProgressStrip currentStep={w.step} />

            {/* Honour step */}
            {w.step === "honour" && (
              <WizardStepShell
                title="Honour"
                guidance="Who or what is this favpoll for?"
              >
                <HonourStep
                  value={{
                    category: w.category,
                    grouping: w.grouping,
                    subject: w.subject,
                    causeLabel: w.causeLabel,
                  }}
                  onChange={({ category, grouping, subject, causeLabel }) => {
                    w.setCategory(category)
                    w.setGrouping(grouping)
                    w.setSubject(subject)
                    w.setCauseLabel(causeLabel)
                  }}
                />
              </WizardStepShell>
            )}

            {/* Charity step */}
            {w.step === "charity" && (
              <WizardStepShell
                title="Charity"
                guidance={w.copy.charityGuidance}
              >
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

            {/* Love step */}
            {w.step === "love" && (
              <WizardStepShell title="Love" guidance={w.copy.loveGuidance}>
                {w.topics.length > 0 ? (
                  <WizardTopicCard
                    topic={w.topics[0]}
                    sortedExistingItems={w.sortedExistingItems}
                    customLabels={w.customLabels}
                    showItemsSection={w.showItemsSection}
                    onEdit={() => w.setLoveOpen(true)}
                    onRemove={() => w.setTopics([])}
                    onOpenItemsDialog={() => w.setItemsDialogOpen(true)}
                  />
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => w.setLoveOpen(true)}
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
        open={w.loveOpen}
        onOpenChange={(o) => {
          w.setLoveOpen(o)
          if (!o) setLoveSearch("")
        }}
        title="Choose a topic"
        hideCloseButton
        header={
          <input
            type="text"
            autoFocus
            placeholder="Search topics…"
            value={loveSearch}
            onChange={(e) => setLoveSearch(e.target.value)}
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
                w.setLoveOpen(false)
                setLoveSearch("")
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                w.setLoveOpen(false)
                setLoveSearch("")
              }}
            >
              Done
            </Button>
          </div>
        }
      >
        <LoveStep
          topics={data.topics}
          categories={data.categories}
          value={w.topics}
          onChange={(v) => {
            w.setTopics(v)
            w.setLoveOpen(false)
            setLoveSearch("")
          }}
          hideItemsPanel
          suggestedTopics={w.suggestedTopics}
          primaryCharityName={w.primaryCharity?.name}
          search={loveSearch}
          onSearchChange={setLoveSearch}
        />
      </ResponsiveOverlay>

      {/* Charity overlay */}
      <ResponsiveOverlay
        open={w.charityOpen}
        onOpenChange={(o) => {
          w.setCharityOpen(o)
          if (!o) setCharitySearch("")
        }}
        title="Choose a charity"
        hideCloseButton
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
          topicTitle="Select Items"
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
