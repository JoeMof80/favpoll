// CSV export of a closed favpoll's results — for organiser records and
// charity reporting (borrowed from the StrawPoll evaluation, 2026-07-22).
// The privacy model holds: final standings and the NAMED guest list only;
// per-guest amounts never leave the database.

export type KeepsakeCsvInput = {
  name: string
  topicTitle: string
  closedDate: string
  totalRaised: number
  charityNames: string[]
  standings: { label: string; amount: number }[]
  guestNames: string[]
}

function cell(value: string | number): string {
  const s = String(value)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function buildKeepsakeCsv(data: KeepsakeCsvInput): string {
  const rows: (string | number)[][] = [
    ["favpoll", data.name],
    ["Topic", `Favourite ${data.topicTitle}`],
    ["Closed", data.closedDate],
    ["Total raised (£)", data.totalRaised.toFixed(2)],
    ["Charities", data.charityNames.join("; ")],
    [],
    ["Rank", "Favourite", "Amount (£)"],
    ...data.standings.map((s, i) => [i + 1, s.label, s.amount.toFixed(2)]),
  ]
  if (data.guestNames.length > 0) {
    rows.push([], ["Guests"], ...data.guestNames.map((g) => [g]))
  }
  // BOM so Excel opens UTF-8 correctly
  return "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n")
}

function keepsakeSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "favpoll"
  )
}

export function keepsakeCsvFilename(name: string): string {
  return `favpoll-${keepsakeSlug(name)}-results.csv`
}

/** The image export shares the CSV's slug so a folder of both sorts together. */
export function keepsakeImageFilename(name: string): string {
  return `favpoll-${keepsakeSlug(name)}-keepsake.png`
}
