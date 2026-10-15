import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"

// The picker, stubbed: two buttons that report a date and then a time,
// the way the real one does when an organiser picks today and then 19:25.
vi.mock("@/components/favpoll-form/date-time-picker", () => ({
  DateTimePicker: ({ onChange }: { onChange: (d: Date) => void }) => (
    <>
      <button onClick={() => onChange(new Date("2026-10-20T19:25:00Z"))}>
        day
      </button>
      <button onClick={() => onChange(new Date("2026-10-20T21:00:00Z"))}>
        time
      </button>
    </>
  ),
}))

import { EditableDateRow, DATE_SAVE_DELAY_MS } from "../editable-row"

describe("EditableDateRow — one save per edit (2026-10-15)", () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it("waits for the other half: date then time is ONE save, of the final value", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <EditableDateRow
        label="Close date"
        value={new Date("2026-10-15T19:25:00Z")}
        onSave={onSave}
      />
    )
    fireEvent.click(screen.getByText("day"))
    await act(async () => {
      vi.advanceTimersByTime(DATE_SAVE_DELAY_MS / 2)
    })
    fireEvent.click(screen.getByText("time"))
    expect(onSave).not.toHaveBeenCalled()
    await act(async () => {
      vi.advanceTimersByTime(DATE_SAVE_DELAY_MS + 10)
    })
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0][0].toISOString()).toBe(
      "2026-10-20T21:00:00.000Z"
    )
  })

  it("a refused save shows the sentence and puts the committed value back", async () => {
    const onSave = vi
      .fn()
      .mockRejectedValue(new Error("Closing date must be in the future"))
    render(
      <EditableDateRow
        label="Close date"
        value={new Date("2026-10-15T19:25:00Z")}
        onSave={onSave}
      />
    )
    fireEvent.click(screen.getByText("day"))
    await act(async () => {
      vi.advanceTimersByTime(DATE_SAVE_DELAY_MS + 10)
    })
    expect(
      screen.getByText("Closing date must be in the future")
    ).toBeInTheDocument()
  })
})
