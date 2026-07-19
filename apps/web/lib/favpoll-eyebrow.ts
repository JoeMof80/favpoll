// The card eyebrow, derived the same way on every surface that shows a
// favpoll card (summary card, list card). Subject first: a cause favpoll
// has no type (new rows carry category=null; pre-2026-07-13 rows carry a
// legacy 'fundraiser' that must not surface as a badge); otherwise the
// capitalised category; otherwise the organiser's opening line.
type EyebrowSource = {
  subject?: string | null
  category?: string | null
  opening_line?: string | null
}

export function favpollEyebrow(favpoll: EyebrowSource): string {
  if (favpoll.subject === "cause") return "For a cause"
  if (favpoll.category)
    return favpoll.category.charAt(0).toUpperCase() + favpoll.category.slice(1)
  return favpoll.opening_line ?? ""
}
