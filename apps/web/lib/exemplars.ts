import type {
  CauseFamily,
  FavpollGrouping,
  Pronoun,
  Register,
} from "@favpoll/types"
import bank from "./exemplar-bank.json"

/**
 * The exemplar bank and its retrieval (2026-09-25). The engine used to
 * show the same four examples on every call; now it shows the founder's
 * closest three or four — voice first, then register, then occasion,
 * then the charity's family, then the topic — so a first-person
 * engagement is written next to his first-person engagements and a
 * memorial with a flower next to his memorials with flowers.
 *
 * A lookup, never a model call. The bank is built from the edited
 * Stories by scripts/build-exemplar-bank.ts; the four hand-written
 * originals from scripts/seed-exemplars.ts stay as the floor so a
 * neighbourhood with nothing in it still gets something good.
 */

export type Exemplar = {
  id: string
  triple: string
  register: string
  occasion: string
  topic: string
  family: string | null
  voice: "first" | "third"
  grouping: string
  about: string
  note: string
}

const FOUNDER_ORIGINALS: Exemplar[] = [
  {
    id: "seed-belinda",
    triple: "Memorial · Colour · Marie Curie",
    register: "remembering",
    occasion: "Memorial",
    topic: "Colour",
    family: "end_of_life",
    voice: "third",
    grouping: "individual",
    about:
      "A beloved mother, teacher, and friend who spent her life bringing people together. Her home was full of deliberate colour — every room had a story, and the shade she always came back to said more about her than most words could. Marie Curie nurses were with her at the end, and she would have wanted them remembered here.",
    note: "Cornflower blue. She kept a pot of cornflowers on the windowsill every summer.",
  },
  {
    id: "seed-sarah",
    triple: "Birthday · Biscuit · RNLI",
    register: "celebrating_one",
    occasion: "Birthday",
    topic: "Biscuit",
    family: "sea_rescue",
    voice: "third",
    grouping: "individual",
    about:
      "Sarah is forty and has never met a biscuit she didn't take seriously. She has strong opinions and is not afraid to share them, which is part of why everyone is here. She supports the RNLI because she grew up near the coast and means it.",
    note: "The Bourbon. She once ate four packets in one sitting, and she has no regrets.",
  },
  {
    id: "seed-david",
    triple: "Retirement · Place · British Heart Foundation",
    register: "celebrating_one",
    occasion: "Retirement",
    topic: "Place",
    family: "health_condition",
    voice: "third",
    grouping: "individual",
    about:
      "After thirty-five years building the engineering team from four people to four hundred, David is finally putting down his laptop. He has a shortlist of places he's never had time to actually go to — and now he does. His charity of choice looks after the hearts of people who worked as hard as he did.",
    note: "The Dordogne. He kept a photo of it on his desk for thirty years.",
  },
  {
    id: "seed-emma-james",
    triple: "Wedding · Song · Shelter",
    register: "celebrating_many",
    occasion: "Wedding",
    topic: "Song",
    family: "homelessness",
    voice: "third",
    grouping: "couple",
    about:
      "Emma and James met at a rainy music festival in 2019 and haven't been apart since. Music runs through everything they do together. They asked for pledges to Shelter in lieu of gifts — because a roof over your head matters, and they wanted to share the good fortune.",
    note: "Fields of Gold. It played at their first dance and neither of them planned it.",
  },
]

export const EXEMPLAR_BANK: Exemplar[] = [
  ...(bank as Exemplar[]),
  ...FOUNDER_ORIGINALS,
]

export type ExemplarQuery = {
  register: Register
  occasionType: string | null
  topicTitle: string
  causeFamily: CauseFamily | null
  pronoun?: Pronoun
  grouping?: FavpollGrouping
}

const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase()

/** Score one exemplar against a request. Voice outweighs everything: a
 *  first-person Story written next to third-person examples drifts. */
export function scoreExemplar(e: Exemplar, q: ExemplarQuery): number {
  const voice = q.pronoun === "i" ? "first" : "third"
  let s = 0
  if (e.voice === voice) s += 8
  if (e.register === q.register) s += 4
  if (norm(e.occasion) === norm(q.occasionType)) s += 3
  if (e.family && q.causeFamily && e.family === q.causeFamily) s += 2
  if (norm(e.topic) === norm(q.topicTitle)) s += 2
  if (q.grouping && e.grouping === q.grouping) s += 1
  return s
}

/** The closest k exemplars, best first; ties broken at random so the
 *  same request does not always see the same examples. */
export function pickExemplars(q: ExemplarQuery, k = 4): Exemplar[] {
  return EXEMPLAR_BANK.map((e) => ({
    e,
    s: scoreExemplar(e, q),
    r: Math.random(),
  }))
    .sort((a, b) => b.s - a.s || a.r - b.r)
    .slice(0, k)
    .map((x) => x.e)
}
