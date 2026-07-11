import { describe, it, expect } from "vitest"
import {
  isEstablishedRecord,
  topicPledgedTotal,
  RECORD_MIN_PLEDGED_GBP,
  RECORD_MIN_ITEMS_WITH_ACTIVITY,
} from "../record"

const item = (all_time_pledged: number) =>
  ({ all_time_pledged }) as { all_time_pledged: number }

describe("topicPledgedTotal", () => {
  it("sums all_time_pledged", () => {
    expect(topicPledgedTotal([item(100), item(250), item(0)])).toBe(350)
  })
})

describe("isEstablishedRecord", () => {
  it("qualifies with enough pledged AND enough active items", () => {
    expect(
      isEstablishedRecord([item(300), item(150), item(60)]) // £510, 3 active
    ).toBe(true)
  })

  it("fails below the pledged threshold even with enough items", () => {
    expect(isEstablishedRecord([item(10), item(10), item(10)])).toBe(false)
  })

  it("fails when one big pledge sits on too few items (a spike)", () => {
    // £600 total but only 1 item has activity → not a record
    expect(isEstablishedRecord([item(600), item(0), item(0)])).toBe(false)
  })

  it("is exactly at the boundary", () => {
    const boundary = [item(RECORD_MIN_PLEDGED_GBP - 300), item(200), item(100)]
    expect(topicPledgedTotal(boundary)).toBe(RECORD_MIN_PLEDGED_GBP)
    expect(boundary.filter((i) => i.all_time_pledged > 0).length).toBe(
      RECORD_MIN_ITEMS_WITH_ACTIVITY
    )
    expect(isEstablishedRecord(boundary)).toBe(true)
  })

  it("treats an empty topic as not established", () => {
    expect(isEstablishedRecord([])).toBe(false)
  })
})
