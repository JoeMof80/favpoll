import Anthropic from "@anthropic-ai/sdk"
import { CAUSE_FAMILIES, type CauseFamily } from "@favpoll/types"

// Suggests a charity's cause family from what the register says it does
// (references/favpoll-pairing-table §2, 2026-09-24).
//
// Why a model call and not a code lookup: measured on 34 charities, the
// Commission's `What` codes are noise — "General Charitable Purposes" and
// "Education/training" sit on NSPCC, Hospice UK and the Children's Society
// alike. The signal is `activities`, the charity's own text. So: one cheap
// call at insert or backfill, stored as a SUGGESTION the admin confirms.
// The generator never reads the suggestion.
//
// The `What` codes still earn one job: a guard. A charity classified only
// under generic purposes and describing itself as a grant-maker has no
// cause of its own, and the honest family is none — the model is told so.

const DEFINITIONS: Record<CauseFamily, string> = {
  animals: "animal welfare, rescue, or wildlife conservation",
  children: "children and young people",
  older_people: "older people",
  end_of_life: "hospices, palliative or end-of-life care, dementia",
  health_condition:
    "a specific condition or disability — cancer research, heart, stroke, diabetes, sight loss, disability equality",
  mental_health: "mental health, crisis lines, emotional support",
  homelessness: "homelessness and housing",
  food_poverty: "food banks and food poverty",
  environment_heritage:
    "the natural environment, heritage places, nature conservation",
  sea_rescue: "lifeboats, sea and water rescue",
  international: "overseas aid, humanitarian relief, global poverty",
  entertainment: "fundraising through comedy, sport or entertainment events",
}

export type CauseFamilyInput = {
  name: string
  activities: string | null
  classification: { what: string[]; who: string[]; how: string[] } | null
  /** The charitable objects — a second source when activities is thin. */
  objects?: string | null
  /** The register's own grant-making flag: true means no family. */
  grantMaking?: boolean | null
}

function buildPrompt(input: CauseFamilyInput): string {
  const families = CAUSE_FAMILIES.map((f) => `- ${f}: ${DEFINITIONS[f]}`).join(
    "\n"
  )
  const what = input.classification?.what.join("; ") || "(none)"
  const who = input.classification?.who.join("; ") || "(none)"
  return `Classify a UK registered charity into exactly one cause family, or "none".

Charity: ${input.name}
Its own description of its activities: ${input.activities ?? "(none on the register)"}
Its charitable objects: ${input.objects ? input.objects.slice(0, 700) : "(none on the register)"}
Register flag — grant-making is its main activity: ${input.grantMaking === true ? "yes (it funds others; if the grants serve ONE cause, such as cancer research, that cause is its family; if they range across many causes, answer none)" : input.grantMaking === false ? "no" : "unknown"}
Register classification — What: ${what}
Register classification — Who: ${who}

Families:
${families}

Rules:
- Answer with the family id alone, or the word none. No other text.
- A community foundation or trust whose grants range across several causes has no cause family of its own: answer none. A funder of one cause (a cancer research charity) has that cause as its family.
- If the activities text is missing and the classification is only generic ("General Charitable Purposes", "Education/training", "Other Charitable Purposes"), answer none — do not guess from the name.
- Prefer the family a guest at a fundraiser would name. A hospice is end_of_life even if it also does research; a dementia charity is end_of_life; a cancer research charity is health_condition.`
}

/** The model's suggestion, or null when the charity has no cause of its
 *  own or nothing can honestly be said. Never throws. */
export async function suggestCauseFamily(
  input: CauseFamilyInput
): Promise<CauseFamily | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null
  // Nothing to classify from — never guess from a name alone. (The
  // register's grant-making flag is NOT a guard: Cancer Research UK,
  // BHF and Save the Children all carry it, because they fund others.
  // It goes to the model as a fact, 2026-09-25.)
  if (!input.activities && !input.classification && !input.objects) return null

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      // A one-word classification: Haiku, per the pairing table's cost
      // note. LLM_MODEL_ID is the Story generator's model — kept separate.
      model: process.env.LLM_CLASSIFIER_MODEL_ID ?? "claude-haiku-4-5",
      max_tokens: 64,
      messages: [{ role: "user", content: buildPrompt(input) }],
    })
    const text = message.content
      .find(
        (c): c is Extract<(typeof message.content)[number], { type: "text" }> =>
          c.type === "text"
      )
      ?.text.trim()
      .toLowerCase()
      .replace(/[^a-z_]/g, "")
    return (CAUSE_FAMILIES as readonly string[]).includes(text ?? "")
      ? (text as CauseFamily)
      : null
  } catch (err) {
    console.error(
      "suggestCauseFamily failed:",
      err instanceof Error ? err.message : String(err)
    )
    return null
  }
}
