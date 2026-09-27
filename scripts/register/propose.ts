// Stage 2: per KIND, the model groups the labelled "things" into causes
// and proposes one topic per group — an existing catalogue topic when it
// honestly fits, else a new one with items. One call per kind.
import Anthropic from "@anthropic-ai/sdk"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
const S = process.argv[2]
const rows = JSON.parse(readFileSync(`${S}/register/pilot-animals-environment.json`, "utf8")) as any[]
const byOn = new Map(rows.map((r) => [String(r.organisation_number), r]))
const labels = JSON.parse(readFileSync(`${S}/register/pilot-labels.json`, "utf8")) as Record<string, any>
const topics = JSON.parse(readFileSync(`${S}/topics.json`, "utf8")) as { title: string }[]
const catalogue = topics.map((t) => t.title).join(", ")
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const kinds = new Map<string, Map<string, string[]>>() // kind -> thing -> [on]
for (const [on, lab] of Object.entries(labels)) {
  if (!byOn.has(on) || lab.error || lab.none) continue
  const kind = lab.kind ?? "other"
  const thing = String(lab.thing ?? "").toLowerCase().trim()
  if (!thing) continue
  if (!kinds.has(kind)) kinds.set(kind, new Map())
  const m = kinds.get(kind)!
  m.set(thing, [...(m.get(thing) ?? []), on])
}

async function propose(kind: string, things: Map<string, string[]>) {
  const entries = [...things.entries()].sort((a, b) => b[1].length - a[1].length)
  const list = entries.map(([t, ons], i) => `P${i + 1}: ${t} (${ons.length})`).join("\n")
  const prompt = `favpoll is a fundraising page: guests pledge to a charity by picking their favourite of something (their favourite bird, song, beach). We are extending the catalogue of topics using the Charity Commission register as inspiration: each charity should have a PERFECT TOPIC, the favourite a guest sees the point of before pledging ("of course the lifeboats ask my favourite beach", "of course a canal trust asks my favourite canal"). It must resonate with what the charity protects, works with or is known for, never with illness, hardship or grief.

Below are the concrete things at the centre of ${things.size} charities' work, all of the kind "${kind}", with how many charities share each phrase. Group them into causes (a group is charities whose supporters would share one favourite), and for EACH group name the perfect topic: an existing catalogue topic when one honestly fits, otherwise a NEW topic. Phrases that belong to no group, or whose cause inspires no favourite, go in a final group called "none".

The catalogue's existing topics: ${catalogue}.

Rules for a NEW topic: ordinary people must have a favourite of it and be able to name several without expertise; different guests would pick different ones; items sit at the basic level (Falcon, not Peregrine falcon; not "bird of prey"), no item a kind of another; a title of one to three words in the catalogue's style (Bird, Garden to visit, Part of a roast dinner); a closed list has at most ~25 items, an open one ships a starter list. Never a topic that merely renames an existing one.

The phrases:
${list}

Answer with JSON only: {"groups": [{"name": "<the cause in a few words>", "phrases": ["<the P-numbers of every phrase in this group, e.g. \"P3\">"], "topic": "<topic title>", "existing": true|false, "closed": true|false, "items": ["<10 to 16 basic-level items if new, else []>"], "why": "<one plain sentence to a charity in this group: why this favourite is theirs>", "doubt": "<the rule this topic most risks failing, or null>"}]}`
  // Streamed: a long non-streamed request sits on the SDK's timeout.
  const m = await client.messages.stream({ model: "claude-sonnet-5", max_tokens: 16000, messages: [{ role: "user", content: prompt }] }).finalMessage()
  const text = m.content.find((x): x is Extract<(typeof m.content)[number], { type: "text" }> => x.type === "text")?.text ?? ""
  const raw = (text.match(/\{[\s\S]*\}/) ?? [])[0]
  if (!raw) return { error: text.slice(0, 300) }
  // trailing commas and fenced code are the usual sins
  const cleaned = raw.replace(/,\s*([}\]])/g, "$1")
  try {
    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed.groups)) return { error: `no groups (${text.length} chars, stop ${m.stop_reason})` }
    // P-numbers back to phrases
    for (const g of parsed.groups)
      g.phrases = (g.phrases ?? []).map((p: string) => {
        const i = Number(String(p).replace(/^P/i, "")) - 1
        return entries[i]?.[0] ?? String(p).toLowerCase()
      })
    return parsed
  } catch (e: any) {
    writeFileSync(`${S}/register/raw-${kind.replace(/\W+/g, "_")}-${Date.now()}.txt`, text)
    return { error: `unparseable (${text.length} chars, ${m.usage.output_tokens} tokens, stop ${m.stop_reason}): ${e.message}` }
  }
}

async function main() {
  // Resumable: a chunk that produced groups is not asked again.
  const path = `${S}/register/pilot-proposals.json`
  const out: any[] = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : []
  const done = new Set(out.map((g) => g.job))
  // A kind with hundreds of phrases is proposed in chunks of 25.
  const jobs: [string, Map<string, string[]>][] = []
  for (const [kind, things] of [...kinds.entries()].sort((a, b) => b[1].size - a[1].size)) {
    const entries = [...things.entries()].sort((a, b) => b[1].length - a[1].length)
    for (let i = 0; i < entries.length; i += 25) jobs.push([`${kind}#${i / 25}`, new Map(entries.slice(i, i + 25))])
  }
  console.log(`${jobs.length} jobs`)
  async function run(job: string, things: Map<string, string[]>) {
    const kind = job.split("#")[0]
    // The animals kind finished before the credit ran out, under the old
    // unnumbered job ids: skip it whole.
    if (done.has(job) || (kind === "animals" && done.has("animals#done"))) return
    try {
      const r = await propose(kind, things)
      for (const g of r.groups ?? []) {
        const ons = (g.phrases ?? []).flatMap((p: string) => things.get(String(p).toLowerCase().trim()) ?? [])
        const members = ons.map((on: string) => byOn.get(on)).filter(Boolean).sort((a: any, b: any) => (b.income ?? 0) - (a.income ?? 0))
        out.push({ job, kind, ...g, n: members.length, members: members.map((c: any) => ({ name: c.name, income: c.income, email: !!c.email, on: c.organisation_number })) })
        console.log(`${kind} · ${g.name}: ${g.topic}${g.existing ? "" : " (NEW)"} · ${members.length} charities${g.doubt ? ` · doubt: ${g.doubt}` : ""}`)
      }
      if (r.error) console.log(`${kind}: failed ${r.error}`)
    } catch (e: any) {
      console.log(`${kind}: failed ${e.message}`)
    }
    writeFileSync(path, JSON.stringify(out, null, 1))
  }
  let next = 0
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (next < jobs.length) {
      const [kind, things] = jobs[next++]
      await run(kind, things)
    }
  }))
  console.log("done")
}
main()
