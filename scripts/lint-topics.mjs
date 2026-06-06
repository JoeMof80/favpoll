#!/usr/bin/env node
// lint-topics.mjs
// Build-time guard for favpoll topics: every occasion reveal should name an item
// that exists in that topic's item list.
//
//   node lint-topics.mjs [path]          # default scripts/seed.ts
//   node lint-topics.mjs --strict        # also fail on reveals that name no item
//
// A reveal is flagged as a MISS only when it asserts a favourite ("Hers is X",
// "His was X", "Theirs is X") yet none of the topic's items appear in it. Reveals
// that deliberately name nothing (open occasions, "we're saving them") are listed
// separately and only fail under --strict.
//
// Heuristic, not a parser: a flagged miss is always worth a look; a pass is high-
// confidence but not a proof. Multi-answer reveals pass if ANY named item is valid.

import fs from "node:fs";

const PATH = process.argv.find((a) => a.endsWith(".ts")) || "scripts/seed.ts";
const strict = process.argv.includes("--strict");
const src = fs.readFileSync(PATH, "utf8");
const OPEN = new Set(["celebration", "other", "default"]);

// --- item lists -------------------------------------------------------------
const itemsHeader = src.indexOf("const topicItems");
const itemsSection = src.slice(itemsHeader);
const items = {};
const blockRe = /(?:"([^"]+)"|([A-Za-z][A-Za-z ]*?)):\s*\[([\s\S]*?)\],?\n/g;
let bm;
while ((bm = blockRe.exec(itemsSection))) {
  const title = (bm[1] ?? bm[2] ?? "").trim();
  if (!title || /function|const |async |Record/.test(title)) continue;
  const list = [...bm[3].matchAll(/"([^"]+)"/g)].map((x) =>
    x[1].replace(/\\'/g, "'"),
  );
  if (list.length) items[title] = list;
}

// --- walk topics: find each `title: "X"` then scan occasions until next title -
const topicsSrc = src.slice(src.indexOf("const topics"), itemsHeader);
const titleRe = /title:\s*"([^"]+)"/g;
const titlePositions = [];
let tm;
while ((tm = titleRe.exec(topicsSrc))) titlePositions.push([tm.index, tm[1]]);

const occRe =
  /(\w+):\s*\{\s*about:[\s\S]*?reveal:\s*\n?\s*"([\s\S]*?)",?\n\s*\}/g;

let checked = 0;
const misses = [];
const noItem = [];

for (let i = 0; i < titlePositions.length; i++) {
  const [start, title] = titlePositions[i];
  const end =
    i + 1 < titlePositions.length ? titlePositions[i + 1][0] : topicsSrc.length;
  const block = topicsSrc.slice(start, end);
  const list = items[title];
  if (!list) continue;

  occRe.lastIndex = 0;
  let om;
  while ((om = occRe.exec(block))) {
    const occ = om[1];
    if (OPEN.has(occ)) continue;
    const reveal = om[2]
      .replace(/\\'/g, "'")
      .replace(/\s+/g, " ")
      .toLowerCase();

    const hit = list.some((label) => {
      const full = label.toLowerCase();
      if (reveal.includes(full)) return true;
      // Song-style "Title — Artist": match on the title portion before the dash
      const titlePart = full.split(/\s+—\s+/)[0].trim();
      if (titlePart.length >= 3 && reveal.includes(titlePart)) return true;
      // "By train" / "On motorbike" / "By river": match on the significant word(s)
      // after a leading short preposition
      const stripped = full.replace(/^(by|on|in|at|the)\s+/, "").trim();
      if (stripped.length >= 4 && reveal.includes(stripped)) return true;
      // fall back to first distinctive token
      const tok = full.split(/[ —-]/)[0];
      return tok.length >= 4 && reveal.includes(tok);
    });

    checked++;
    if (!hit) {
      const asserts = /\b(hers|his|theirs)\s+(is|was|are)\b/.test(reveal);
      const target = `${title} / ${occ}: "${om[2].trim()}"`;
      if (asserts) misses.push(target);
      else noItem.push(`${title} / ${occ}`);
    }
  }
}

console.log(
  `Linted ${titlePositions.length} topics, ${checked} reveals checked.\n`,
);
if (misses.length) {
  console.log(
    `\u2717 ${misses.length} reveal(s) name an answer not found in the item list:`,
  );
  misses.forEach((m) => console.log("   " + m));
  console.log("");
}
if (noItem.length) {
  console.log(
    `\u2022 ${noItem.length} reveal(s) name no specific item (review):`,
  );
  noItem.forEach((n) => console.log("   " + n));
  console.log("");
}
const fail = misses.length > 0 || (strict && noItem.length > 0);
if (!fail) console.log("\u2713 All checked reveals resolve to a listed item.");
process.exit(fail ? 1 : 0);
