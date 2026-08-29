// Satori fetches <img src="https://…"> itself, and a fetch that fails takes
// the whole card with it — a 500 where a link preview should be. So the
// photo is fetched here first, with a deadline, and handed over as a data
// URL; anything doubtful degrades to the initials fallback instead.
const SATORI_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif"])

export async function fetchPhotoDataUrl(
  url: string | null | undefined,
  { timeoutMs = 4000, maxBytes = 6_000_000 } = {}
): Promise<string | null> {
  if (!url || !/^https:\/\//.test(url)) return null
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    })
    if (!res.ok) return null
    const type = (res.headers.get("content-type") ?? "")
      .split(";")[0]!
      .trim()
      .toLowerCase()
    if (!SATORI_IMAGE_TYPES.has(type)) return null
    const bytes = Buffer.from(await res.arrayBuffer())
    if (bytes.byteLength === 0 || bytes.byteLength > maxBytes) return null
    return `data:${type};base64,${bytes.toString("base64")}`
  } catch {
    return null
  }
}
