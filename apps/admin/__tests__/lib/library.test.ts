import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { LIBRARY, SECTIONS, findBySlug, slugFor } from "@/lib/library";

const REFERENCES = path.resolve(__dirname, "../../../../references");

describe("the library registry", () => {
  it("names only files that exist, and URLs that are claude.ai's", () => {
    for (const e of LIBRARY) {
      if (e.kind === "reference" || e.kind === "pdf") {
        expect(existsSync(path.join(REFERENCES, e.source)), e.source).toBe(
          true,
        );
        expect(e.source, e.source).toMatch(
          e.kind === "pdf" ? /\.pdf$/ : /\.md$/,
        );
      } else {
        expect(e.source, e.title).toMatch(/^https:\/\/claude\.ai\//);
      }
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(SECTIONS).toContain(e.section);
      expect(e.summary.length, e.title).toBeGreaterThan(20);
    }
  });

  it("has one entry per source and one slug per file", () => {
    const sources = LIBRARY.map((e) => e.source);
    expect(new Set(sources).size).toBe(sources.length);
    const slugs = LIBRARY.filter(
      (e) => e.kind !== "artifact" && e.kind !== "doc",
    ).map(slugFor);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves a slug back to its file and nothing else", () => {
    expect(findBySlug("ppgf-enquiry-draft-2026-07")?.source).toBe(
      "ppgf-enquiry-draft-2026-07.md",
    );
    expect(findBySlug("../../package.json")).toBeUndefined();
    expect(findBySlug("PROJECT.md")).toBeUndefined();
  });
});
