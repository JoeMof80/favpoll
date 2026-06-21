"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { EditableHero } from "./editable-hero"
import { eventFormSchema, type FavpollFormValues } from "./schema"

function FormWrapper({
  defaultValues,
  children,
}: {
  defaultValues: Partial<FavpollFormValues>
  children: React.ReactNode
}) {
  const form = useForm<FavpollFormValues, unknown, FavpollFormValues>({
    resolver: zodResolver(eventFormSchema as never),
    defaultValues: {
      register: "celebrating_one",
      grouping: "individual",
      subject: "someone",
      category: "celebration",
      name: "",
      causeLabel: "",
      context: "",
      openingLine: "",
      about: "",
      reveal: "",
      charities: [],
      topics: [],
      isListed: true,
      ...defaultValues,
    },
  })
  return <Form {...form}>{children}</Form>
}

const meta: Meta<typeof EditableHero> = {
  title: "FavpollForm/EditableHero",
  component: EditableHero,
  parameters: { layout: "padded" },
  args: { isGenerating: false },
}
export default meta

type Story = StoryObj<typeof EditableHero>

/** Person event with all fields filled */
export const PersonFilled: Story = {
  render: (args) => (
    <FormWrapper
      defaultValues={{
        category: "celebration",
        subject: "someone",
        register: "celebrating_one",
        name: "Gretchen Hobbs",
        context: "turning 80",
        openingLine: "Join us for",
        about:
          "Gretchen has spent forty years as a librarian and secret crime-fiction addict.",
      }}
    >
      <EditableHero {...args} />
    </FormWrapper>
  ),
}

/** Person event with nothing filled — shows placeholders */
export const PersonEmpty: Story = {
  render: (args) => (
    <FormWrapper
      defaultValues={{ category: "celebration", subject: "someone" }}
    >
      <EditableHero {...args} />
    </FormWrapper>
  ),
}

/** Cause event */
export const CauseEvent: Story = {
  render: (args) => (
    <FormWrapper
      defaultValues={{
        category: "fundraiser",
        subject: "cause",
        register: "cause",
        causeLabel: "Alzheimer's Research UK",
        about:
          "Every £5 funds a day of vital research into dementia treatments.",
      }}
    >
      <EditableHero {...args} />
    </FormWrapper>
  ),
}

/** Memorial */
export const Memorial: Story = {
  render: (args) => (
    <FormWrapper
      defaultValues={{
        category: "memorial",
        subject: "someone",
        register: "remembering",
        name: "David Howell",
        context: "1948 – 2025",
      }}
    >
      <EditableHero {...args} />
    </FormWrapper>
  ),
}

/** About field in generating state */
export const GeneratingAbout: Story = {
  args: { isGenerating: true },
  render: (args) => (
    <FormWrapper
      defaultValues={{
        category: "celebration",
        subject: "someone",
        name: "Priya",
      }}
    >
      <EditableHero {...args} />
    </FormWrapper>
  ),
}
