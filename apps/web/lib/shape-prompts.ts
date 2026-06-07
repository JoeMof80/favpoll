/**
 * Register-keyed shape-prompts for the About and Reveal form fields.
 * These describe the *shape* of a good answer rather than providing
 * persona examples — so they fit every occasion without misfiring.
 *
 * `{t}` in reveal prompts is replaced by the lowercased topic title.
 */

const ABOUT_PROMPTS: Record<string, string> = {
  remembering:
    "Tell guests who they were — warm and specific. What were they like, what did they care about?",
  celebrating_one:
    "Tell guests who they are — warm and specific. What are they like, what do they care about?",
  celebrating_many:
    "Tell guests who they are — warm and specific. What are they like together?",
  cause:
    "Tell guests what this is for — the cause, why it matters, who it helps.",
  neutral: "Tell guests who or what this favpoll is for.",
}

const REVEAL_PROMPTS: Record<string, string> = {
  remembering:
    "Reveal what their favourite {t} was, and what made it theirs — the detail only they'd pick.",
  celebrating_one:
    "Reveal what their favourite {t} is, and what makes it theirs — the detail only they'd pick.",
  celebrating_many:
    "Reveal what their favourite {t} is, and what makes it theirs.",
  cause:
    "Reveal a favourite {t} to start guests off — yours, or one that fits the cause.",
  neutral: "Reveal the favourite {t} and what makes it special.",
}

/**
 * Returns a shape-prompt for the given register, topic title, and field.
 *
 * @param register - The event register (e.g. "celebrating_one")
 * @param topicTitleLower - The topic title already lowercased (e.g. "colour")
 * @param field - "about" or "reveal"
 */
export function getShapePrompt(
  register: string,
  topicTitleLower: string,
  field: "about" | "reveal"
): string {
  if (field === "about") {
    return ABOUT_PROMPTS[register] ?? ABOUT_PROMPTS.neutral
  }

  const template = REVEAL_PROMPTS[register] ?? REVEAL_PROMPTS.neutral
  return template.replace("{t}", topicTitleLower || "thing")
}
