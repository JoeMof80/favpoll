// A topic title in PROSE: "your favourite bird of prey", but "your
// favourite ASMR sound", "TV theme tune", "F1 driver" (founder,
// 2026-09-28: "why has the topic case changed?"). Only a plainly
// capitalised word drops its capital; an acronym, a word with a digit,
// or one with capitals inside stays as written.
export function topicInProse(title: string): string {
  return title
    .split(" ")
    .map((w) => (/^[A-Z][a-z'’-]*$/.test(w) ? w.toLowerCase() : w))
    .join(" ")
}
