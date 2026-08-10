import { chromium } from "@playwright/test"
const id = "20066fda-0512-41e1-8c1e-273c3caa72ad"
const dir = process.env.SP
const b = await chromium.launch()
const p = await b.newPage()
p.setDefaultTimeout(30000)
await p.goto(`http://localhost:3000/favpolls/${id}/pack`, { waitUntil: "domcontentloaded", timeout: 60000 })
await p.waitForTimeout(6000)
await p.addStyleTag({ content: `@media print { .paper > div:not(:nth-child(3)) { display:none !important } }` })
await p.emulateMedia({ media: "print" })
await p.waitForTimeout(500)
await p.pdf({ path: `${dir}/a6only.pdf`, format: "A4", printBackground: true,
              margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" } })
console.log("pdf written")
await b.close()
