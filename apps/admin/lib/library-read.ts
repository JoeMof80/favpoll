import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findBySlug, type LibraryEntry } from "./library";

// Only a file the registry names is ever read, and only from references/.
// The slug comes from the URL; the registry turns it back into a filename,
// so a path the registry does not know cannot reach the disk at all.
//
// references/ sits at the monorepo root, two levels above this app. In
// development that is the working directory's parent; on Vercel the files
// are carried into the function by next.config's outputFileTracingIncludes
// and keep the same relative position.
const REFERENCES_DIR = path.resolve(process.cwd(), "../../references");

export async function readReference(
  slug: string,
): Promise<{ entry: LibraryEntry; markdown: string } | null> {
  const entry = findBySlug(slug);
  if (!entry || entry.kind !== "reference") return null;
  const markdown = await readFile(
    path.join(REFERENCES_DIR, entry.source),
    "utf8",
  );
  return { entry, markdown };
}

export async function readPdf(
  name: string,
): Promise<{ entry: LibraryEntry; bytes: Buffer } | null> {
  const entry = findBySlug(name.replace(/\.pdf$/i, ""));
  if (!entry || entry.kind !== "pdf") return null;
  const bytes = await readFile(path.join(REFERENCES_DIR, entry.source));
  return { entry, bytes };
}
