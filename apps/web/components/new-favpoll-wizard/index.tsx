"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InputGroupButton } from "@/components/ui/input-group"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { EventStep } from "@/components/favpoll-flow/event-step"
import { RegisterScope } from "@/components/register-scope"
import { paletteForRegister } from "@/lib/register-palette"
import { deriveRegister } from "@/lib/registers"
import { TopicStep } from "@/components/favpoll-flow/topic-step"
import { CharityStep } from "@/components/favpoll-flow/charity-step"
import { TopicItemsDialog } from "@/components/favpoll-flow/topic-items-dialog"
import { SeedFundModal } from "@/components/favpoll-form/seed-fund-modal"
import { useWizardState } from "./use-wizard-state"
import { WizardStepRail } from "./wizard-step-rail"
import { WizardProgressStrip } from "./wizard-progress-strip"
import { WizardNav } from "./wizard-nav"
import { WizardCharityCard } from "./wizard-charity-card"
import { WizardTopicCard } from "./wizard-topic-card"
import { WizardStepShell } from "./wizard-step-shell"
import { WizardInfoStep } from "./wizard-info-step"
import { WizardStoryStep } from "./wizard-story-step"
import { WizardDetailsStep } from "./wizard-details-step"
import type { WizardData, WizardEditConfig } from "./use-wizard-state"

type Props = {
  data: WizardData
  /** Present at /favpolls/[id]/edit — prefilled, clickable rail, Save. */
  edit?: WizardEditConfig
}

export function NewFavpollWizard({ data, edit }: Props) {
  const w = useWizardState(data, edit)
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

  // THE WIZARD WEARS THE REGISTER AS IT IS CHOSEN (founder, 2026-08-31).
  // Derived the way the product derives it, so a cause picked on the
  // Name field's who control goes green the same way.
  const palette = paletteForRegister(
    deriveRegister(w.category, w.grouping, w.subject)
  )

  // Publish succeeded — offer the shared-fund head start (a payment
  // needs the created favpoll), then land on the real page.
  if (w.seedFavpollId) {
    return (
      <RegisterScope palette={palette}>
        <SeedFundModal
          favpollId={w.seedFavpollId}
          isListed={w.visibility === "listed"}
          onComplete={w.completeSeed}
        />
      </RegisterScope>
    )
  }

  // Money has moved: the step keeps its summary but takes no changes.
  const lockedBody = (value: string) => (
    <div className="space-y-2 text-sm">
      <p className="text-base font-medium">{value || "—"}</p>
      <p className="text-muted-foreground">
        Locked — guests have already pledged.
      </p>
    </div>
  )

  return (
    <RegisterScope palette={palette}>
      <main>
        <div className="md:grid md:min-h-[calc(100vh-4rem)] md:grid-cols-[320px_1fr] md:items-stretch">
          <WizardStepRail
            currentStep={w.step}
            summary={w.railSummary}
            done={w.railDone}
            onStepClick={w.goToStep}
            canJump={w.canJumpTo}
          />

          <div className="px-6 pt-12 pb-10 md:px-12 md:pt-20">
            <div className="mx-auto w-full max-w-2xl">
              <WizardProgressStrip
                currentStep={w.step}
                done={w.railDone}
                onStepClick={w.goToStep}
                canJump={w.canJumpTo}
              />

              {w.step === "event" && (
                <WizardStepShell title="Event">
                  {w.stepLocked.event ? (
                    lockedBody(w.railSummary.event)
                  ) : (
                    <EventStep value={w.category} onChange={w.handleCategory} />
                  )}
                </WizardStepShell>
              )}

              {w.step === "charity" && (
                <WizardStepShell title="Charity">
                  {w.stepLocked.charity ? (
                    lockedBody(w.railSummary.charity)
                  ) : w.selectedCharities.length > 0 ? (
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
                      size="lg"
                      className="h-11 w-full md:text-base"
                      onClick={() => w.setCharityOpen(true)}
                    >
                      Pick a charity
                    </Button>
                  )}
                </WizardStepShell>
              )}

              {w.step === "topic" && (
                <WizardStepShell title="Topic">
                  {w.stepLocked.topic ? (
                    lockedBody(w.railSummary.topic)
                  ) : w.topics.length > 0 ? (
                    <WizardTopicCard
                      topic={w.topics[0]!}
                      sortedExistingItems={w.sortedExistingItems}
                      customLabels={w.customLabels}
                      showItemsSection={w.showItemsSection}
                      onEdit={() => w.setTopicOpen(true)}
                      onOpenItemsDialog={() => w.setItemsDialogOpen(true)}
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      size="lg"
                      className="h-11 w-full md:text-base"
                      onClick={() => w.setTopicOpen(true)}
                    >
                      Pick a topic
                    </Button>
                  )}
                </WizardStepShell>
              )}

              {w.step === "info" && (
                <WizardStepShell title="Header">
                  <WizardInfoStep w={w} />
                </WizardStepShell>
              )}

              {w.step === "story" && (
                <WizardStepShell
                  title="Story"
                  action={
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={w.generating || w.topics.length === 0}
                      onClick={w.generateExample}
                    >
                      {w.generating ? "Generating…" : "✦ Generate an example"}
                    </Button>
                  }
                >
                  <WizardStoryStep w={w} />
                </WizardStepShell>
              )}

              {w.step === "details" && (
                <WizardStepShell title="Settings">
                  <WizardDetailsStep w={w} />
                </WizardStepShell>
              )}

              {w.error && (
                <p className="mt-6 text-sm text-destructive" role="alert">
                  {w.error}
                </p>
              )}

              <WizardNav
                isFirst={w.isFirst}
                isLast={w.isLast}
                nextDisabled={w.nextDisabled}
                submitting={w.submitting}
                finishLabel={w.isEdit ? "Save" : "Publish"}
                submittingLabel={w.isEdit ? "Saving…" : "Publishing…"}
                onBack={w.handleBack}
                onNext={w.handleNext}
                onFinish={w.handleFinish}
              />
            </div>
          </div>
        </div>

        {/* Topic overlay */}
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
                <InputGroupButton
                  variant="secondary"
                  onClick={handleCreateTopic}
                >
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
            topicTitle={w.topics[0]!.title}
            existingItems={w.dialogExistingItems}
            addedItems={w.customLabels}
            onAdd={w.handleAddItem}
            onRemove={w.handleRemoveItem}
            isNewTopic={w.topics[0]!.isCustom ?? false}
          />
        )}
      </main>
    </RegisterScope>
  )
}
