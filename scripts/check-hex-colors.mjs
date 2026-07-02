// Guards against new hardcoded hex colours in app source. All colours must go
// through the design tokens in each app's globals.css (see references/PROJECT.md
// → Design System). Run: node scripts/check-hex-colors.mjs
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const SCAN_DIRS = [
  "apps/web/app",
  "apps/web/components",
  "apps/web/lib",
  "apps/web/hooks",
  "apps/admin/app",
  "apps/admin/components",
  "apps/admin/lib",
];

// Dead code scheduled for deletion in the landing polish PR — remove these
// entries when those files are deleted.
const ALLOWLIST = [
  "apps/web/components/landing-v2/example.ts",
  "apps/web/components/landing-v2/how-it-works.tsx",
  "apps/web/components/landing-v2/how-it-works-preview-card.tsx",
  "apps/web/components/landing-v2/how-it-works-step1-preview.tsx",
  "apps/web/components/landing-v2/how-it-works-step2-preview.tsx",
  "apps/web/components/landing-v2/how-it-works-step3-preview.tsx",
  "apps/web/components/landing-v2/how-it-works-step4-preview.tsx",
  "apps/web/components/landing-v2/how-it-works-step5-preview.tsx",
  "apps/web/components/landing-v2/how-it-works-step6-preview.tsx",
  "apps/web/components/landing-v2/occasion-eyebrow.tsx",
  "apps/web/components/landing-v2/favpoll-mark.tsx",
  "apps/web/components/honour-charity-love-venn.tsx",
  "apps/web/components/favpoll-mark.tsx",
];

// Bracketed Tailwind hex utilities: bg-[#...], text-[#...], border-[#...], …
const UTILITY_HEX =
  /(?:text|bg|border|ring|fill|stroke|from|via|to|outline|decoration|shadow|accent|caret)-\[#[0-9A-Fa-f]{3,8}\b/;
// Hex literals assigned to colour-ish keys in style objects / constants.
const STYLE_HEX =
  /(?:background|backgroundColor|color|borderColor|fill|stroke|stopColor)\s*[:=]\s*["'][^"']*#[0-9A-Fa-f]{3,8}\b/;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      yield* walk(path);
    } else if (/\.(tsx?|css)$/.test(entry)) {
      yield path;
    }
  }
}

const violations = [];
for (const dir of SCAN_DIRS) {
  let paths;
  try {
    paths = [...walk(join(ROOT, dir))];
  } catch {
    continue;
  }
  for (const path of paths) {
    const rel = relative(ROOT, path);
    if (ALLOWLIST.includes(rel)) continue;
    const lines = readFileSync(path, "utf8").split("\n");
    lines.forEach((line, i) => {
      if (UTILITY_HEX.test(line) || STYLE_HEX.test(line)) {
        violations.push(`${rel}:${i + 1}: ${line.trim()}`);
      }
    });
  }
}

if (violations.length > 0) {
  console.error(
    `Found ${violations.length} hardcoded hex colour(s) — use design tokens instead (references/PROJECT.md → Design System):\n`
  );
  for (const v of violations) console.error("  " + v);
  process.exit(1);
}
console.log("check-hex-colors: no hardcoded hex colours found.");
