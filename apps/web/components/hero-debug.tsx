"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

// ON-DEVICE READOUT for the pinned band (founder's iPhone, 2026-10-16:
// the band and photo vanish after a hard scroll; three fixes from a
// desktop could not reproduce it). Mounts only with `?debug=hero` in the
// URL; prints what sticky positioning sees, twice a second, in a fixed
// panel — screenshot it when the band has gone. Remove once settled.
export function HeroDebug({
  band,
}: {
  band: React.RefObject<HTMLDivElement | null>
}) {
  const [on, setOn] = useState(false)
  const [text, setText] = useState("")
  useEffect(() => {
    // `?debug=hero` or `#debug=hero` — Safari's address bar can drop a
    // query string when a URL is edited by hand; a hash survives.
    setOn(
      new URLSearchParams(window.location.search).get("debug") === "hero" ||
        window.location.hash === "#debug=hero"
    )
  }, [])
  useEffect(() => {
    if (!on) return
    const r = (el: Element | null | undefined) => {
      if (!el) return "none"
      const b = el.getBoundingClientRect()
      return `${Math.round(b.top)}..${Math.round(b.bottom)}`
    }
    const tick = () => {
      const el = band.current
      const cs = el && getComputedStyle(el)
      const p = el?.parentElement
      const pcs = p && getComputedStyle(p)
      const gp = p?.parentElement
      const vv = window.visualViewport
      setText(
        [
          `scrollY ${Math.round(window.scrollY)} innerH ${window.innerHeight} vv ${vv ? `${Math.round(vv.height)}@${Math.round(vv.offsetTop)}` : "-"}`,
          `band ${r(el)} pos ${cs?.position} top ${cs?.top} z ${cs?.zIndex} h ${el?.offsetHeight}`,
          `parent ${p?.tagName} ${pcs?.display} ${r(p)} ${p?.className.slice(0, 24)}`,
          `gp ${gp?.tagName} ${gp && getComputedStyle(gp).display} ${r(gp)} ovf ${gp && getComputedStyle(gp).overflowY}`,
          `stuck ${getComputedStyle(document.documentElement).getPropertyValue("--hero-stuck-bottom")} rootBg ${getComputedStyle(document.documentElement).backgroundColor}`,
          `heading ${r(document.querySelector('[class*="top-(--hero-stuck-bottom"]'))}`,
          `ua ${navigator.userAgent.slice(-40)}`,
        ].join("\n")
      )
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [on, band])
  if (!on) return null
  return createPortal(
    <pre
      style={{
        position: "fixed",
        left: 4,
        bottom: 90,
        zIndex: 9999,
        margin: 0,
        padding: 6,
        fontSize: 10,
        lineHeight: 1.3,
        background: "rgba(0,0,0,.8)",
        color: "#0f0",
        whiteSpace: "pre-wrap",
        maxWidth: "95vw",
        pointerEvents: "none",
      }}
    >
      {text}
    </pre>,
    document.body
  )
}
