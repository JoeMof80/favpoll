import type { Meta, StoryObj } from "@storybook/react"
import { HeroPitchColumn } from "./hero-pitch-column"
import { SCENE_EYEBROWS } from "./scenes"

const meta = {
  title: "Landing/HeroPitchColumn",
  component: HeroPitchColumn,
  parameters: { layout: "fullscreen" },
  argTypes: {
    sceneIndex: {
      control: { type: "number", min: 0, max: SCENE_EYEBROWS.length - 1 },
      description: "Index into SCENE_EYEBROWS — drives the animated eyebrow",
    },
  },
} satisfies Meta<typeof HeroPitchColumn>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { sceneIndex: 0 },
}
