import { chromium } from "@playwright/test"

const url = process.argv[2] ?? "https://favpoll.com/favpolls"

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 390, height: 664 }, // iPhone visible area with URL bar
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
})
await page.goto(url, { waitUntil: "networkidle" })
await page.waitForTimeout(1500)

const report = await page.evaluate(() => {
  const vh = window.innerHeight
  const doc = document.documentElement
  const body = document.body

  // Every element whose bottom edge exceeds the viewport height OR whose
  // offsetHeight pushes the document taller than the viewport.
  const overflowers = []
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect()
    const style = getComputedStyle(el)
    if (style.position === "fixed") continue
    if (r.bottom > vh + 1 && r.height > 0) {
      overflowers.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString() ?? "").slice(0, 110),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        height: Math.round(r.height),
      })
    }
  }

  return {
    innerHeight: vh,
    docScrollHeight: doc.scrollHeight,
    bodyScrollHeight: body.scrollHeight,
    docClientHeight: doc.clientHeight,
    htmlOverflow: getComputedStyle(doc).overflow,
    bodyOverflow: getComputedStyle(body).overflow,
    overflowPx: doc.scrollHeight - vh,
    overflowers: overflowers.slice(0, 25),
  }
})

console.log(JSON.stringify(report, null, 2))
await browser.close()
