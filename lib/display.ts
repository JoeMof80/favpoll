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
