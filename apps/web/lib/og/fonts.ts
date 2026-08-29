import { readFile } from "node:fs/promises"
import { join } from "node:path"

// Satori rasterises with font bytes it is handed directly — it cannot see
// next/font or the page's CSS. These are the brand's two weights (400 and
// 500; never 600 or 700 — brand skill, typography), vendored from Google
// Fonts under the SIL OFL (assets/fonts/OFL.txt).
//
// `join(process.cwd(), "<literal>")` is the exact shape Next's file tracer
// recognises, so the TTFs are bundled into the serverless function rather
// than left behind on the build machine. Keep the literals inline.
type OgFont = {
  name: string
  data: Buffer
  weight: 400 | 500
  style: "normal"
}

let loading: Promise<OgFont[]> | undefined

export function ogFonts(): Promise<OgFont[]> {
  loading ??= Promise.all([
    readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-Medium.ttf")),
  ])
    .then(([regular, medium]): OgFont[] => [
      {
        name: "Plus Jakarta Sans",
        data: regular,
        weight: 400,
        style: "normal",
      },
      { name: "Plus Jakarta Sans", data: medium, weight: 500, style: "normal" },
    ])
    .catch((error: unknown) => {
      // Don't cache a failure: the next request retries the read.
      loading = undefined
      throw error
    })
  return loading
}
