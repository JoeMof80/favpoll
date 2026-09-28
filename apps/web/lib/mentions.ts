// MENTIONS (founder, 2026-09-28): the About and the personal note can
// point at the things this favpoll is about — its charity (or charities),
// its topic under the name on the card, and, in the note, the favourite
// itself. Typing @ offers them; the text stores the plain NAME (no
// markup, no ids in prose), and every surface that shows the text
// highlights the names it finds. The Story engine already writes these
// names into the About, so a generated example lights up unasked.
//
// Matching is by whole words: a charity or an item exactly as written
// (case matters — "Mind" the charity, not "mind" the verb); a topic case-
// insensitively, because prose lowercases it ("your favourite bird of
// prey"). Longer names win over shorter ones that they contain.

export type MentionKind = "charity" | "topic" | "item"

export type MentionTarget = {
  kind: MentionKind
  label: string
  /** For a link: the charity's or the topic's id. Items have none. */
  id?: string | null
}

export type MentionSegment =
  | { text: string; target: null }
  | { text: string; target: MentionTarget }

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** A word boundary that survives apostrophes and accents: the character
 *  before and after the match may not be a letter or digit. */
function boundaryOk(text: string, start: number, end: number): boolean {
  const before = start > 0 ? text[start - 1] : ""
  const after = end < text.length ? text[end] : ""
  const wordish = /[\p{L}\p{N}]/u
  return !wordish.test(before) && !wordish.test(after)
}

export function segmentMentions(
  text: string,
  targets: MentionTarget[]
): MentionSegment[] {
  const usable = targets
    .filter((t) => t.label.trim().length >= 2)
    .sort((a, b) => b.label.length - a.label.length)
  if (!text || usable.length === 0) return [{ text, target: null }]

  type Hit = { start: number; end: number; target: MentionTarget }
  const hits: Hit[] = []
  const taken: boolean[] = new Array(text.length).fill(false)
  for (const t of usable) {
    const flags = t.kind === "topic" ? "giu" : "gu"
    const re = new RegExp(escapeRe(t.label), flags)
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      const start = m.index
      const end = start + m[0].length
      if (m[0].length === 0) {
        re.lastIndex++
        continue
      }
      if (!boundaryOk(text, start, end)) continue
      let free = true
      for (let i = start; i < end; i++) if (taken[i]) free = false
      if (!free) continue
      for (let i = start; i < end; i++) taken[i] = true
      hits.push({ start, end, target: t })
    }
  }
  hits.sort((a, b) => a.start - b.start)

  const out: MentionSegment[] = []
  let cursor = 0
  for (const h of hits) {
    if (h.start > cursor)
      out.push({ text: text.slice(cursor, h.start), target: null })
    out.push({ text: text.slice(h.start, h.end), target: h.target })
    cursor = h.end
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), target: null })
  return out
}

export type MentionQuery = {
  start: number
  query: string
  /** True when no @ was typed: the word itself opened the menu (founder,
   *  2026-09-28: "detect the charity or topic after a character match"). */
  implicit: boolean
}

/** The minimum a bare word needs before it can open the menu: "the"
 *  and "a" must never pop it. */
export const IMPLICIT_MIN = 3

/** The query at the caret. With an @ that opens a word: everything after
 *  it, when short and on the caret's line. Without one: the word being
 *  typed, once it is IMPLICIT_MIN letters long. Null otherwise. */
export function mentionQueryAt(
  text: string,
  caret: number
): MentionQuery | null {
  const upto = text.slice(0, caret)
  const at = upto.lastIndexOf("@")
  if (at >= 0) {
    const before = at > 0 ? upto[at - 1] : ""
    const query = upto.slice(at + 1)
    if (
      !(before && /[\p{L}\p{N}]/u.test(before)) &&
      query.length <= 40 &&
      !/\n/.test(query)
    )
      return { start: at, query, implicit: false }
  }
  const m = /[\p{L}\p{N}'’-]+$/u.exec(upto)
  if (!m || m[0].length < IMPLICIT_MIN) return null
  return { start: caret - m[0].length, query: m[0], implicit: true }
}

/** Targets matching the query, label-first. An explicit (@) query
 *  matches anywhere in the label; a bare word matches only the START of
 *  a word in the label — "cra" finds "A crackling fire", "the" finds
 *  nothing it should not. */
export function mentionSuggestions(
  targets: MentionTarget[],
  query: string,
  implicit = false
): MentionTarget[] {
  const q = query.trim().toLowerCase()
  const seen = new Set<string>()
  return targets.filter((t) => {
    const key = `${t.kind}:${t.label.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    const label = t.label.toLowerCase()
    if (!q) return !implicit
    if (implicit) {
      if (label === q) return false // already written in full
      return label.split(/[\s-]+/).some((w) => w.startsWith(q))
    }
    return label.includes(q)
  })
}

/** Replace "@query" at `start` with the label; a space follows unless
 *  punctuation does. Returns the new text and the caret after it. */
export function insertMention(
  text: string,
  start: number,
  caret: number,
  label: string
): { text: string; caret: number } {
  const after = text.slice(caret)
  const needsSpace = after.length > 0 && !/^[\s.,;:!?)]/.test(after)
  const inserted = label + (needsSpace ? " " : "")
  const next = text.slice(0, start) + inserted + after
  return { text: next, caret: start + inserted.length }
}
