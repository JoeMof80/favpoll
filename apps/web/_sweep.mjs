import { chromium } from "playwright"
const W=[320,360,390,430,768,1024,1180,1280,1440]
const b=await chromium.launch(); const p=await b.newPage(); let bad=0
for(const path of ["/","/fundraisers","/features","/memorials","/celebrations"]){
  const f=[]
  for(const w of W){
    await p.setViewportSize({width:w,height:900})
    await p.goto("http://localhost:3000"+path,{waitUntil:"load",timeout:180000})
    await p.waitForTimeout(700)
    const r=await p.evaluate((w)=>{const s=document.documentElement.scrollWidth;return s<=w+0.5?null:s},w)
    if(r){f.push(`${w}px:+${r-w}`);bad++}
  }
  console.log(path, f.length?"FAIL "+f.join(", "):"ok")
}
await b.close(); console.log(bad?"FAILURES":"ALL CLEAN")
