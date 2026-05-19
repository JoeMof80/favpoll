export function occasionLabel(occasion: string): string {
  const labels: Record<string, string> = {
    memorial:           "In memory of",
    funeral:            "In memory of",
    birthday:           "Birthday",
    retirement:         "Retirement",
    wedding:            "Wedding",
    engagement:         "Engagement",
    anniversary:        "Anniversary",
    leaving_do:         "Leaving do",
    graduation:         "Graduation",
    christening:        "Christening",
    bar_bat_mitzvah:    "Bar / Bat Mitzvah",
    get_well_soon:      "Get well soon",
    sports_achievement: "Achievement",
    work_milestone:     "Work milestone",
    just_because:       "Just because",
    other:              "Event",
  }
  return labels[occasion] ?? "Event"
}

export function charityNames(
  charities: { charity: { name: string } }[]
): string {
  const names = charities.map((c) => c.charity.name)
  if (names.length === 0) return ""
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} & ${names[1]}`
  return `${names[0]}, ${names[1]} & ${names[2]}`
}

export function formatAmount(amount: number): string {
  if (!amount) return "£0"
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const days = Math.ceil((date.getTime() - now.getTime()) / 86400000)
  if (days < 0) return "soon"
  if (days === 0) return "today"
  if (days === 1) return "tomorrow"
  if (days < 7) return `in ${days} days`
  if (days < 14) return "next week"
  return `${ordinal(date.getDate())} ${date.toLocaleString("en-GB", { month: "long" })}`
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export function formatEventDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T12:00:00") : date
  return `${ordinal(d.getDate())} ${d.toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  })}`
}

export function getEventHeadline(params: {
  occasion: string
  name: string
  dateLabel?: string | null
  occasionLabel?: string | null
}): { prefix: string; name: string; suffix: string } {
  const { occasion, name: personName, dateLabel, occasionLabel } = params

  const PREFIXES: Record<string, string> = {
    memorial: "In memory of",
    tribute: "A tribute to",
    birthday: "Happy birthday",
    retirement: "Celebrating the retirement of",
    wedding: "Congratulations to",
    engagement: "Congratulations to",
    anniversary: "Happy anniversary",
    leaving: "Farewell",
    graduation: "Congratulations",
    christening: "Welcome",
    achievement: "Well done",
    recovery: "Cheering on",
    award: "Congratulations to",
    promotion: "Congratulations to",
    celebration: "Celebrating",
    other: "Honouring",
  }

  const prefix = occasionLabel || PREFIXES[occasion] || "Honouring"

  return { prefix, name: personName, suffix: dateLabel ?? "" }
}
