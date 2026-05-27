import type { Meta, StoryObj } from "@storybook/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card"
import { Button } from "./button"

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Favourite Colour</CardTitle>
        <CardDescription>
          Belinda had a colour she returned to all her life
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Which colour do you love most?
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Pledge favourites</Button>
      </CardFooter>
    </Card>
  ),
}

export const Small: Story = {
  render: () => (
    <Card size="sm" className="w-72">
      <CardHeader>
        <CardTitle>Poll closes in</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-medium tabular-nums">04 : 12 : 08</p>
      </CardContent>
    </Card>
  ),
}

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Expressions of joy, for charitable causes, in the name of those we
          love.
        </p>
      </CardContent>
    </Card>
  ),
}
