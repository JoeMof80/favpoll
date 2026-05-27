import type { Meta, StoryObj } from "@storybook/react"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldTitle,
} from "./field"
import { Input } from "./input"

const meta = {
  title: "UI/Field",
  component: Field,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Vertical: Story = {
  render: () => (
    <Field>
      <FieldTitle>Pledge amount</FieldTitle>
      <Input id="amount" placeholder="£0.00" />
    </Field>
  ),
}

export const WithDescription: Story = {
  render: () => (
    <Field>
      <FieldTitle>Email address</FieldTitle>
      <FieldDescription>
        We'll send your pledge confirmation here.
      </FieldDescription>
      <Input id="email" type="email" placeholder="you@example.com" />
    </Field>
  ),
}

export const WithError: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldTitle>Pledge amount</FieldTitle>
      <Input id="amount" placeholder="£0.00" value="0" readOnly />
      <FieldError>Please enter an amount of at least £1.</FieldError>
    </Field>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="name">Your name</FieldLabel>
      <Input id="name" placeholder="Jane Smith" />
    </Field>
  ),
}

export const FieldGroupExample: Story = {
  render: () => (
    <FieldGroup>
      <Field>
        <FieldTitle>Your name</FieldTitle>
        <Input id="name" placeholder="Jane Smith" />
      </Field>
      <Field>
        <FieldTitle>Email address</FieldTitle>
        <FieldDescription>
          We'll send your pledge confirmation here.
        </FieldDescription>
        <Input id="email" type="email" placeholder="you@example.com" />
      </Field>
      <Field data-invalid="true">
        <FieldTitle>Pledge amount</FieldTitle>
        <Input id="amount" placeholder="£0.00" value="0" readOnly />
        <FieldError>Please enter an amount of at least £1.</FieldError>
      </Field>
    </FieldGroup>
  ),
}
