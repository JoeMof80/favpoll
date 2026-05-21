import React, { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { PollHeading } from "./poll-heading"
import { OCCASION_PLACEHOLDERS } from "@/lib/occasions"

const MEMORIAL_PLACEHOLDERS = OCCASION_PLACEHOLDERS["memorial"] ?? {
  framing: "",
  reveal: "",
  name: "",
  bio: "",
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
} satisfies Meta<typeof PollHeading>

export default meta
type Story = StoryObj<typeof meta>

// ─── View mode ────────────────────────────────────────────────────────────────

export const ViewWithFramingAndReveal: Story = {
  name: "View — framing + reveal (pledged)",
  args: {
    mode: "view",
    pollId: "poll-1",
    topicTitle: "Colour",
    framing: "Belinda had a colour she returned to all her life — what's yours?",
    reveal: "Belinda's was purple. She wore it to every important occasion.",
    protagonistFirstName: "Belinda",
    pledged: true,
  },
}

export const ViewFramingOnly: Story = {
  name: "View — framing only (not pledged)",
  args: {
    mode: "view",
    pollId: "poll-2",
    topicTitle: "Season",
    framing: "There was a season Margaret always loved most — which is yours?",
    reveal: null,
    protagonistFirstName: "Margaret",
    pledged: false,
  },
}

export const ViewTitleOnly: Story = {
  name: "View — title only",
  args: {
    mode: "view",
    pollId: "poll-3",
    topicTitle: "Film",
    framing: null,
    reveal: null,
  },
}

// ─── Edit mode ────────────────────────────────────────────────────────────────

export const EditNoTopic: Story = {
  name: "Edit — no topic selected",
  render: () => {
    const [framing, setFraming] = useState("")
    const [reveal, setReveal] = useState("")
    return (
      <PollHeading
        mode="edit"
        topicTitle=""
        hasTopicSelected={false}
        framing={framing}
        reveal={reveal}
        placeholders={MEMORIAL_PLACEHOLDERS}
        onFramingChange={setFraming}
        onRevealChange={setReveal}
        onChangeTopic={() => {}}
      />
    )
  },
}

export const EditCanonicalTopic: Story = {
  name: "Edit — canonical topic selected",
  render: () => {
    const [framing, setFraming] = useState("")
    const [reveal, setReveal] = useState("")
    return (
      <PollHeading
        mode="edit"
        topicTitle="Colour"
        hasTopicSelected={true}
        topicIsCustom={false}
        framing={framing}
        reveal={reveal}
        placeholders={MEMORIAL_PLACEHOLDERS}
        onFramingChange={setFraming}
        onRevealChange={setReveal}
        onChangeTopic={() => {}}
      />
    )
  },
}

export const EditCustomTopic: Story = {
  name: "Edit — custom topic (editable title)",
  render: () => {
    const [title, setTitle] = useState("")
    const [framing, setFraming] = useState("")
    const [reveal, setReveal] = useState("")
    return (
      <PollHeading
        mode="edit"
        topicTitle={title}
        hasTopicSelected={true}
        topicIsCustom={true}
        framing={framing}
        reveal={reveal}
        placeholders={MEMORIAL_PLACEHOLDERS}
        onFramingChange={setFraming}
        onRevealChange={setReveal}
        onTopicTitleChange={setTitle}
        onChangeTopic={() => {}}
      />
    )
  },
}

export const EditWithContent: Story = {
  name: "Edit — filled in",
  render: () => {
    const [framing, setFraming] = useState(
      "Belinda had a colour she returned to all her life — what's yours?"
    )
    const [reveal, setReveal] = useState(
      "Belinda's was purple. She wore it to every important occasion."
    )
    return (
      <PollHeading
        mode="edit"
        topicTitle="Colour"
        hasTopicSelected={true}
        topicIsCustom={false}
        framing={framing}
        reveal={reveal}
        placeholders={MEMORIAL_PLACEHOLDERS}
        onFramingChange={setFraming}
        onRevealChange={setReveal}
        onChangeTopic={() => {}}
      />
    )
  },
}
