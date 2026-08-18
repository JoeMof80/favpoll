import { webkit, devices } from "@playwright/test"
const b = await webkit.launch()
for (const [name,w,h] of [["mobile",390,844],["desktop",1280,900]]) {
  const c = await b.newContext({ ...devices["iPhone 14"], viewport:{width:w,height:h}, isMobile:false })
  const p = await c.newPage()
  await p.goto("http://localhost:3000/", { waitUntil:"networkidle", timeout:180000 })
  await p.waitForTimeout(2000)
  await p.locator("#how").scrollIntoViewIfNeeded(); await p.waitForTimeout(1500)
  const r = await p.evaluate(() => {
    const el = [...document.querySelectorAll("#how div")].find(d => d.className.includes && d.className.includes("w-[900px]"))
    if (!el) return null
    return { w: el.offsetWidth, h: el.offsetHeight, aspect:+(el.offsetWidth/el.offsetHeight).toFixed(2),
             orientation: el.offsetWidth>el.offsetHeight?"LANDSCAPE":"PORTRAIT" }
  })
  console.log(name.padEnd(8), JSON.stringify(r))
  await c.close()
}
await b.close()
