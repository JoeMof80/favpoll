/**
 * scripts/export-seeded-stories.ts
 * ---------------------------------------------------------------------------
 * Writes a seeded cohort out as the founder's editable file plus its
 * originals, the shape scripts/build-exemplar-bank.ts reads back:
 *
 *   references/seeded-stories-<label>.md
 *   references/seeded-stories-<label>.original.json
 *
 * Run from apps/web:
 *   pnpm tsx --env-file=.env.local ../../scripts/export-seeded-stories.ts \
 *     --label=2026-09-25-gaps --since=2026-09-25T12:00:00Z
 *
 * --since selects rows created after that instant (a cohort); omit it to
 * export everything owned by the story seed. Existing files are
 * overwritten, so export a cohort once, before the founder edits it.
 * ---------------------------------------------------------------------------
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { lookupEdges } from "../apps/web/lib/pairing-table";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
const args = process.argv.slice(2);
const opt = (name: string, dflt: string) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : dflt;
};
const LABEL = opt("label", new Date().toISOString().slice(0, 10));
const SINCE = opt("since", "");
const REFS = join(__dirname, "..", "references");
const one = <T>(v: T | T[] | null): T | null =>
  Array.isArray(v) ? (v[0] ?? null) : v;

async function main() {
  let q = sb
    .from("favpolls")
    .select(
      "id, subject, occasion_type, opening_line, cause_label, description, context, closed_at, grouping, category, created_at, protagonists(name, about, context, pronoun), favpoll_polls(personal_note, topics(title)), favpoll_charities(charities(name, cause_family))",
    )
    .eq("created_by", "user_seed_story")
    .order("created_at");
  if (SINCE) q = q.gte("created_at", SINCE);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const rows = (data ?? []).map((x: any) => {
    const p = one(x.protagonists) as any;
    const poll = one(x.favpoll_polls) as any;
    const ch = one(one(x.favpoll_charities)?.charities) as any;
    const register =
      x.subject === "cause"
        ? "cause"
        : x.category === "memorial"
          ? "remembering"
          : x.grouping === "individual"
            ? "celebrating_one"
            : "celebrating_many";
    const topic = one(poll?.topics)?.title as string;
    return {
      id: x.id as string,
      name: (p?.name ?? x.cause_label) as string,
      subject: x.subject as string,
      register,
      occasion: x.occasion_type as string,
      topic,
      charity: ch?.name as string,
      family: (ch?.cause_family ?? null) as string | null,
      pronoun: (p?.pronoun ?? null) as string | null,
      grouping: x.grouping as string,
      context: (p?.context ?? x.context ?? null) as string | null,
      about: (p?.about ?? x.description) as string,
      note: poll?.personal_note as string,
      edges: lookupEdges({
        register: register as any,
        occasionType: x.occasion_type,
        topicTitle: topic,
        charityName: ch?.name ?? null,
        causeFamily: ch?.cause_family ?? null,
      }),
    };
  });
  const order = ["celebrating_one", "celebrating_many", "remembering", "cause"];
  rows.sort(
    (a, b) =>
      order.indexOf(a.register) - order.indexOf(b.register) ||
      a.occasion.localeCompare(b.occasion) ||
      a.name.localeCompare(b.name),
  );
  const REG: Record<string, string> = {
    celebrating_one: "Celebrating one person",
    celebrating_many: "Celebrating a couple or group",
    remembering: "Remembering",
    cause: "A cause",
  };
  const out = [
    `# The seeded Stories, ${LABEL}`,
    "",
    "Edit the **About** and **Note** paragraphs in place. Leave the headings and the `id` lines alone: they pair the edits back to the originals and to the rows on staging. Voice is `first person` where the organiser is the protagonist.",
    "",
    "Stars are the edges the triple has: ★ occasion→topic, ★ charity→topic, ★ occasion↔charity. Cause favpolls have at most two.",
    "",
  ];
  let n = 0;
  let cur = "";
  for (const r of rows) {
    if (r.register !== cur) {
      cur = r.register;
      out.push(`## ${REG[cur]}`, "");
    }
    n++;
    const voice =
      r.pronoun === "i"
        ? "first person"
        : r.subject === "cause"
          ? "cause"
          : `third person, ${r.pronoun ?? r.grouping}`;
    const stars = "★".repeat(r.edges.count) + "☆".repeat(3 - r.edges.count);
    out.push(
      `### ${n}. ${r.name} · ${r.occasion} · ${r.topic} · ${r.charity}`,
      `\`id ${r.id}\` · ${stars} · ${voice}`,
      "",
      "**About**",
      "",
      r.about,
      "",
      "**Note**",
      "",
      r.note,
      "",
    );
  }
  writeFileSync(join(REFS, `seeded-stories-${LABEL}.md`), out.join("\n"));
  writeFileSync(
    join(REFS, `seeded-stories-${LABEL}.original.json`),
    JSON.stringify(rows, null, 1),
  );
  console.log(
    `${n} stories → references/seeded-stories-${LABEL}.md (+ .original.json)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
