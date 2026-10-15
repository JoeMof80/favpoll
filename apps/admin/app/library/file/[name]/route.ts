import { NextResponse } from "next/server";
import { readPdf } from "@/lib/library-read";

// A registry-listed PDF, served inline so the browser's own viewer reads it.
// Anything the registry does not name is a 404 before the disk is touched.
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const found = await readPdf(name);
  if (!found) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(found.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${found.entry.source}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
