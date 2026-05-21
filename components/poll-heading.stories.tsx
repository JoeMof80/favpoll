import React, { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { PollHeading } from "./poll-heading"
import { OCCASION_PLACEHOLDERS } from "@/lib/occasions"

const MEMORIAL_PLACEHOLDERS = OCCASION_PLACEHOLDERS["memorial"] ?? {
  reveal: "",
  name: "",
  about: "",
}

const meta = {
  title: "PollHeading/PollHeading",
  component: PollHeading,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl py-8">
        <Story />
      </div>
    ),
  ],
// PollHeading uses a discriminated union prop — Meta<typeof PollHeading> produces
// 'never' for args in StoryObj. Use Meta without the generic to avoid that.
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ─── View mode ────────────────────────────────────────────────────────────────

export const ViewWithReveal: Story = {
  name: "View — hint + reveal (pledged)",
  args: {
    mode: "view",
    pollId: "poll-1",
    topicTitle: "Colour",
    reveal: "Belinda's was purple. She wore it to every important occasion.",
    protagonistFirstName: "Belinda",
    pledged: true,
  },
}

export const ViewHintOnly: Story = {
  name: "View — hint only (not pledged)",
  args: {
    mode: "view",
    pollId: "poll-2",
    topicTitle: "Season",
    reveal: null,
    protagonistFirstName: "Margaret",
    pledged: false,
  },
}

export const ViewTitleOnly: Story = {
  name: "View — title only (no protagonist)",
  args: {
    mode: "view",
    pollId: "poll-3",
    topicTitle: "Film",
    reveal: null,
  },
}

// ─── Edit mode ────────────────────────────────────────────────────────────────

export const EditNoTopic = {
  name: "Edit — no topic selected",
  render: () => {
    const [reveal, setReveal] = useState("")
    return (
      <PollHeading
        mode="edit"
        topicTitle=""
        hasTopicSelected={false}
        reveal={reveal}
        placeholders={MEMORIAL_PLACEHOLDERS}
        onRevealChange={setReveal}
        onChangeTopic={() => {}}
      />
    )
  },
}

export const EditCanonicalTopic = {
  name: "Edit — canonical topic selected",
  render: () => {
    const [reveal, setReveal] = useState("")
    return (
      <PollHeading
        mode="edit"
        topicTitle="Colour"
        hasTopicSelected={true}
        topicIsCustom={false}
        reveal={reveal}
        placeholders={MEMORIAL_PLACEHOLDERS}
        onRevealChange={setReveal}
        onChangeTopic={() => {}}
      />
    )
  },
}

export const EditCustomTopic = {
  name: "Edit — custom topic (editable title)",
  render: () => {
    const [title, setTitle] = useState("")
    const [reveal, setReveal] = useState("")
    return (
      <PollHeading
        mode="edit"
        topicTitle={title}
        hasTopicSelected={true}
        topicIsCustom={true}
        reveal={reveal}
        placeholders={MEMORIAL_PLACEHOLDERS}
        onRevealChange={setReveal}
        onTopicTitleChange={setTitle}
        onChangeTopic={() => {}}
      />
    )
  },
}

export const EditWithReveal = {
  name: "Edit — reveal filled in",
  render: () => {
    const [reveal, setReveal] = useState(
      "Belinda's was purple. She wore it to every important occasion."
    )
    return (
      <PollHeading
        mode="edit"
        topicTitle="Colour"
        hasTopicSelected={true}
        topicIsCustom={false}
        reveal={reveal}
        placeholders={MEMORIAL_PLACEHOLDERS}
        onRevealChange={setReveal}
        onChangeTopic={() => {}}
      />
    )
  },
}
