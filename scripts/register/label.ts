// Stage 2: label each charity in the slice with the concrete thing at the
// centre of its work, on the cheap model. Eight at a time; resumable.
import Anthropic from "@anthropic-ai/sdk"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
const S = process.argv[2] // the scratch dir holding register/pilot-*.json
const rows = JSON.parse(readFileSync(`${S}/register/pilot-animals-environment.json`, "utf8")) as any[]
const outPath = `${S}/register/pilot-labels.json`
const out: Record<string, any> = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {}
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
async function label(r: any) {
  const prompt = `A UK registered charity. In a few words, what does it protect, care for, run or work with? Answer with JSON only: {"thing": "<two to four plain words: the concrete thing at the centre of its work, e.g. 'rescued dogs and cats', 'a canal network', 'a cathedral', 'woodland', 'a steam railway', 'donkeys', 'gardens', 'a museum of aviation'>", "kind": "<one of: animals | wildlife | landscape | water | gardens | heritage building | museum | transport heritage | faith building | arts | education | housing | grant-making | sport | community | other>", "local": true|false, "none": true|false}
"none" is true when the charity is a funder, a university, a housing association, a school, a general trust, or anything whose work has no concrete thing a supporter would have a favourite of.

Name: ${r.name}
Activities: ${(r.activities ?? "").slice(0, 500)}
Objects: ${(r.objects ?? "").slice(0, 500)}
Classification: ${r.what.join("; ")} | ${r.how.join("; ")}
Areas: ${r.areas.map((a: any[]) => a[1]).slice(0, 4).join(", ")}`
  const m = await client.messages.create({ model: "claude-haiku-4-5", max_tokens: 120, messages: [{ role: "user", content: prompt }] })
  const text = m.content.find((x): x is Extract<(typeof m.content)[number], { type: "text" }> => x.type === "text")?.text ?? ""
  const raw = (text.match(/\{[\s\S]*\}/) ?? [])[0]
  return raw ? JSON.parse(raw) : { error: text.slice(0, 100) }
}
async function main() {
  let n = 0
  const todo = rows.filter((r) => !out[r.organisation_number])
  for (let i = 0; i < todo.length; i += 8) {
    const batch = todo.slice(i, i + 8)
    const results = await Promise.all(batch.map((r) => label(r).catch((e) => ({ error: e.message }))))
    batch.forEach((r, k) => { out[r.organisation_number] = results[k]; n++ })
    writeFileSync(outPath, JSON.stringify(out, null, 1))
    if (n % 200 < 8) console.log(`${n}/${todo.length}`)
  }
  console.log("done", n)
}
main()
