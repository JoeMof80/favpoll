import { webkit, devices } from "@playwright/test"
const b = await webkit.launch()
const out={}
for (const [n,w,h] of [["mobile",390,844],["desktop",1280,900]]) {
  const c = await b.newContext({ ...devices["iPhone 14"], viewport:{width:w,height:h}, isMobile:false })
  const p = await c.newPage()
  await p.goto("http://localhost:3000/", { waitUntil:"networkidle", timeout:180000 })
  await p.waitForTimeout(2000)
  await p.locator("#how").scrollIntoViewIfNeeded(); await p.waitForTimeout(1500)
  out[n] = await p.evaluate(() => {
    const box=[...document.querySelectorAll("#how div")].find(d=>d.className.includes&&d.className.includes("w-[900px]"))
    const walk=(el,d=0,acc=[])=>{ if(d>3)return acc
      for(const ch of el.children){ acc.push({d, h:Math.round(ch.offsetHeight), c:(ch.className||"").toString().slice(0,44)}); walk(ch,d+1,acc) } return acc }
    return walk(box).filter(x=>x.h>60).slice(0,16)
  })
  await c.close()
}
const m=out.mobile, d=out.desktop
for(let i=0;i<Math.max(m.length,d.length);i++){
  const a=m[i]||{}, b2=d[i]||{}
  if((a.h||0)-(b2.h||0)>30) console.log("DIFF", (a.h||0)-(b2.h||0), "| m",a.h,"d",b2.h,"|",a.c)
}
