/**
 * scripts/build-exemplar-bank.ts
 * ---------------------------------------------------------------------------
 * Turns the founder's edited Stories into the exemplar bank the Story
 * engine retrieves from (apps/web/lib/exemplar-bank.json). Re-run after
 * every editing pass:
 *
 *   cd apps/web && pnpm tsx ../../scripts/build-exemplar-bank.ts
 *
 * Source: references/seeded-stories-<date>.md (the founder's words), with
 * each row's register, occasion, topic, charity family and voice taken
 * from the matching .original.json by id. Cause rows are left out until
 * the perfect-topic work gives them a proper basis (2026-09-25).
 * ---------------------------------------------------------------------------
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const REFS = join(ROOT, "references");
const OUT = join(ROOT, "apps", "web", "lib", "exemplar-bank.json");

type Original = {
  id: string;
  name: string;
  subject: string;
  register: string;
  occasion: string;
  topic: string;
  charity: string;
  family: string | null;
  pronoun: string | null;
  grouping: string;
};

type Exemplar = {
  id: string;
  triple: string;
  register: string;
  occasion: string;
  topic: string;
  family: string | null;
  voice: "first" | "third";
  grouping: string;
  about: string;
  note: string;
  edited: boolean;
};

const files = readdirSync(REFS).filter(
  (f) => /^seeded-stories-.*\.md$/.test(f) && !f.includes("alternatives"),
);
const bank: Exemplar[] = [];
for (const f of files) {
  const md = readFileSync(join(REFS, f), "utf8");
  const originalsPath = join(REFS, f.replace(/\.md$/, ".original.json"));
  const originals = new Map(
    (JSON.parse(readFileSync(originalsPath, "utf8")) as Original[]).map((o) => [
      o.id,
      o,
    ]),
  );
  // The heading is the truth for occasion · topic · charity: the founder
  // moves topics (Tess to Cat breed, Kieran to Dog breed) and the
  // original snapshot does not follow.
  const re =
    /### \d+\. ([^\n]*)\n`id ([0-9a-f-]+)`[^\n]*\n\n\*\*About\*\*\n\n([\s\S]*?)\n\n\*\*Note\*\*\n\n([\s\S]*?)(?=\n\n### |\n\n## |$)/g;
  const familyOf = new Map<string, string | null>();
  for (const o of originals.values()) familyOf.set(o.charity, o.family);
  for (const m of md.matchAll(re)) {
    const o = originals.get(m[2]);
    const [, occasion, topic, charity] = m[1].split(" · ");
    if (!o || o.subject === "cause") continue;
    // Only the founder's words: a row he has not edited is the model's,
    // and the bank exists to pull away from the model's habits.
    const originalRow = (
      JSON.parse(readFileSync(originalsPath, "utf8")) as (Original & {
        about: string;
        note: string;
      })[]
    ).find((x) => x.id === m[2])!;
    if (m[3].trim() === originalRow.about && m[4].trim() === originalRow.note)
      continue;
    const about = m[3].trim();
    const note = m[4].trim();
    const orig = (
      JSON.parse(readFileSync(originalsPath, "utf8")) as (Original & {
        about: string;
        note: string;
      })[]
    ).find((x) => x.id === m[2])!;
    bank.push({
      id: o.id,
      triple: `${occasion} · ${topic} · ${charity}`,
      register: o.register,
      occasion,
      topic,
      family: familyOf.get(charity) ?? o.family,
      voice: o.pronoun === "i" ? "first" : "third",
      grouping: o.grouping,
      about,
      note,
      edited: about !== orig.about || note !== orig.note,
    });
  }
}
writeFileSync(OUT, JSON.stringify(bank, null, 1) + "\n");
console.log(
  `${bank.length} exemplars (${bank.filter((e) => e.edited).length} edited by the founder) → ${OUT.replace(ROOT + "/", "")}`,
);
