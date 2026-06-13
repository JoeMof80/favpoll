import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TopicItemsDialog } from "@/components/event-flow/topic-items-dialog"

const BASE_PROPS = {
  open: true,
  onOpenChange: vi.fn(),
  topicTitle: "Colour",
  existingItems: [
    { id: "i1", label: "Red" },
    { id: "i2", label: "Blue" },
    { id: "i3", label: "Green" },
  ],
  addedItems: [],
  onAdd: vi.fn(),
  onRemove: vi.fn(),
}

describe("TopicItemsDialog — canonical topic", () => {
  it("renders existing items as read-only chips", () => {
    render(<TopicItemsDialog {...BASE_PROPS} />)
    expect(screen.getByText("Red")).toBeInTheDocument()
    expect(screen.getByText("Blue")).toBeInTheDocument()
    expect(screen.getByText("Green")).toBeInTheDocument()
    expect(screen.queryByLabelText("Remove Red")).not.toBeInTheDocument()
  })

  it("shows Added by you section when additions exist", () => {
    render(<TopicItemsDialog {...BASE_PROPS} addedItems={["Purple"]} />)
    expect(screen.getByText("Added by you")).toBeInTheDocument()
    expect(screen.getByText("Purple")).toBeInTheDocument()
    expect(screen.getByLabelText("Remove Purple")).toBeInTheDocument()
  })

  it("calls onRemove when removal button clicked", () => {
    const onRemove = vi.fn()
    render(
      <TopicItemsDialog
        {...BASE_PROPS}
        addedItems={["Purple"]}
        onRemove={onRemove}
      />
    )
    fireEvent.click(screen.getByLabelText("Remove Purple"))
    expect(onRemove).toHaveBeenCalledWith("Purple")
  })

  it("search filters existing items", () => {
    render(<TopicItemsDialog {...BASE_PROPS} />)
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "bl" } })
    expect(screen.getByText("Blue")).toBeInTheDocument()
    expect(screen.queryByText("Red")).not.toBeInTheDocument()
  })

  it("shows Add row when search matches nothing", () => {
    render(<TopicItemsDialog {...BASE_PROPS} />)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Purple" },
    })
    expect(screen.getByText("Purple")).toBeInTheDocument() // in the Add button
    expect(screen.getByRole("button", { name: /Add/ })).toBeInTheDocument()
  })

  it("does not show Add row when search matches an existing item", () => {
    render(<TopicItemsDialog {...BASE_PROPS} />)
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Red" } })
    // "Add" button row should not appear since "Red" matches an existing item
    expect(screen.queryByText(/^Add$/)).not.toBeInTheDocument()
  })

  it("calls onAdd when Add button is clicked", () => {
    const onAdd = vi.fn()
    render(<TopicItemsDialog {...BASE_PROPS} onAdd={onAdd} />)
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Purple" },
    })
    fireEvent.click(screen.getByRole("button", { name: /Purple/ }))
    expect(onAdd).toHaveBeenCalledWith("Purple")
  })

  it("calls onAdd on Enter when Add row is shown", () => {
    const onAdd = vi.fn()
    render(<TopicItemsDialog {...BASE_PROPS} onAdd={onAdd} />)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "Purple" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onAdd).toHaveBeenCalledWith("Purple")
  })

  it("clears search after adding", () => {
    const onAdd = vi.fn()
    render(<TopicItemsDialog {...BASE_PROPS} onAdd={onAdd} />)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "Purple" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect((input as HTMLInputElement).value).toBe("")
  })
})

describe("TopicItemsDialog — new topic", () => {
  it("does not render an existing items section", () => {
    render(<TopicItemsDialog {...BASE_PROPS} existingItems={[]} isNewTopic />)
    expect(screen.queryByText("Existing options")).not.toBeInTheDocument()
  })

  it("shows added item with remove button when 1 item added", () => {
    render(
      <TopicItemsDialog
        {...BASE_PROPS}
        existingItems={[]}
        addedItems={["Cat"]}
        isNewTopic
      />
    )
    expect(screen.getByText("Added by you")).toBeInTheDocument()
    expect(screen.getByLabelText("Remove Cat")).toBeInTheDocument()
  })

  it("hides validation once 2 items are added", () => {
    render(
      <TopicItemsDialog
        {...BASE_PROPS}
        existingItems={[]}
        addedItems={["Cat", "Dog"]}
        isNewTopic
      />
    )
    expect(screen.queryByText(/Add at least/)).not.toBeInTheDocument()
  })

  it("does not add duplicate label (case-insensitive match to added item)", () => {
    render(
      <TopicItemsDialog
        {...BASE_PROPS}
        existingItems={[]}
        addedItems={["Cat"]}
        isNewTopic
      />
    )
    // Typing "cat" matches the existing "Cat" in addedItems, so the Add row must not appear
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "cat" } })
    // The Add row button has accessible name starting with "Add " — assert it's absent
    expect(
      screen.queryByRole("button", { name: /^Add\b/i })
    ).not.toBeInTheDocument()
  })
})
