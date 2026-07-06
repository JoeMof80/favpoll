"use client"

import { useEffect, useRef, useState } from "react"

// Styled QR: rounded modules + rounded finder "eyes" + the favpoll heart at
// the centre — the polished look, matching the aesthetic seen elsewhere.
// Rounded (not fully-separated) modules plus error-correction level H keep
// it reliably scannable, which matters most on small printed table cards.
//
// Client-only: qr-code-styling renders via the DOM, so it's dynamically
// imported in an effect. The module colour is read from the --foreground
// token at runtime, so it stays theme-appropriate and carries no hardcoded
// hex (respecting the colour-token rule).

const HEART_LOGO =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjI5OCAyODIgMTIwIDEwOSI+PHBhdGggZD0iTTQxMS4zNDkgMzE4LjI0OEM0MTQuNjEgMzE4LjI0OCA0MTYuNzY5IDMxNS42MDYgNDE2Ljc2OSAzMTIuMzQ3QzQxMy45NTggMjk1LjYwMiAzOTkuMzgxIDI4Mi44NDMgMzgxLjgyOCAyODIuODQzQzM3Mi43NTUgMjgyLjg0MyAzNjQuNTcxIDI4Ni4xNjkgMzU4LjMwMyAyOTEuNzc1TDM1NS44NTkgMjg5Ljc2OUMzNDkuOTM1IDI4NS4zNzEgMzQyLjU0NSAyODIuODQzIDMzNC41OTQgMjgyLjg0M0MzMTUuMDI5IDI4Mi44NDMgMjk5LjE2OSAyOTguNjk0IDI5OS4xNjkgMzE4LjI0OEMyOTkuMTY5IDMyNy45NTQgMzAzLjA4IDMzNi43NDcgMzA5LjQwOSAzNDMuMTQyTDMyOC45ODcgMzYyLjcxNEMzMzEuMjkyIDM2NS4wMTkgMzM1LjAzMSAzNjUuMDE5IDMzNy4zMzcgMzYyLjcxNEMzMzkuNjQzIDM2MC40MSAzMzkuNjQzIDM1Ni42NzQgMzM3LjMzNyAzNTQuMzY5TDMxNy43NTggMzM0Ljc5OEMzMTMuNTUzIDMzMC41MjYgMzEwLjk3OCAzMjQuNjk5IDMxMC45NzggMzE4LjI0OEMzMTAuOTc4IDMwNS4yMTIgMzIxLjU1MSAyOTQuNjQ1IDMzNC41OTQgMjk0LjY0NUMzNDAuNzg2IDI5NC42NDUgMzQ2LjMzMyAyOTYuODg2IDM1MC40MjcgMzAwLjU1N0wzNTguMzAzIDMwNy42MjJMMzY2LjE3OSAzMDAuNTY5QzM3MC4zMzIgMjk2Ljg1NCAzNzUuNzI4IDI5NC42NDUgMzgxLjgyOCAyOTQuNjQ1QzM5Mi44MjcgMjk0LjY0NSA0MDIuMDkxIDMwMi4xNjggNDA0LjcwOSAzMTIuMzQ3QzQwNC43MDkgMzE1LjYwNiA0MDguMDg4IDMxOC4yNDggNDExLjM0OSAzMTguMjQ4WiIgZmlsbD0iIzUzNEFCNyIvPjxwYXRoIGQ9Ik0zNTIuNTY5IDMzNS45NDNDMzUyLjU2OSAzMzkuMDkxIDM1NS4yMDIgMzQxLjY0MyAzNTguNDQ5IDM0MS42NDNINDA1LjQ4OUM0MDguNzM3IDM0MS42NDMgNDExLjM2OSAzMzkuMDkxIDQxMS4zNjkgMzM1Ljk0M0M0MTEuMzY5IDMzMi43OTUgNDA4LjczNyAzMzAuMjQzIDQwNS40ODkgMzMwLjI0M0gzNTguNDQ5QzM1NS4yMDIgMzMwLjI0MyAzNTIuNTY5IDMzMi43OTUgMzUyLjU2OSAzMzUuOTQzWiIgZmlsbD0iIzUzNEFCNyIgZmlsbC1vcGFjaXR5PSIwLjYiLz48cGF0aCBkPSJNMzUyLjU2OSAzNTkuNjQzQzM1Mi41NjkgMzYyLjk1NiAzNTUuMjExIDM2NS42NDMgMzU4LjQ2OSAzNjUuNjQzSDM4Mi4wN0MzODUuMzI4IDM2NS42NDMgMzg3Ljk2OSAzNjIuOTU2IDM4Ny45NjkgMzU5LjY0M0MzODcuOTY5IDM1Ni4zMjkgMzg1LjMyOCAzNTMuNjQzIDM4Mi4wNyAzNTMuNjQzSDM1OC40NjlDMzU1LjIxMSAzNTMuNjQzIDM1Mi41NjkgMzU2LjMyOSAzNTIuNTY5IDM1OS42NDNaIiBmaWxsPSIjNTM0QUI3IiBmaWxsLW9wYWNpdHk9IjAuNiIvPjxwYXRoIGQ9Ik0zNjMuOTY5IDM4My4wNDNDMzYzLjk2OSAzODYuMzU3IDM2MS40MTggMzg5LjA0MyAzNTguMjY5IDM4OS4wNDNDMzU1LjEyMSAzODkuMDQzIDM1Mi41NjkgMzg2LjM1NyAzNTIuNTY5IDM4My4wNDNDMzUyLjU2OSAzNzkuNzI5IDM1NS4xMjEgMzc3LjA0MyAzNTguMjY5IDM3Ny4wNDNDMzYxLjQxOCAzNzcuMDQzIDM2My45NjkgMzc5LjcyOSAzNjMuOTY5IDM4My4wNDNaIiBmaWxsPSIjNTM0QUI3IiBmaWxsLW9wYWNpdHk9IjAuNiIvPjwvc3ZnPg=="

type Props = {
  value: string
  /** Rendered size in px */
  size?: number
  /** Show the favpoll heart at the centre */
  logo?: boolean
  className?: string
  "aria-label"?: string
}

export function BrandedQR({
  value,
  size = 160,
  logo = true,
  className,
  "aria-label": ariaLabel = "QR code",
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState("")

  useEffect(() => {
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue("--foreground")
      .trim()
    setColor(resolved || "black")
  }, [])

  useEffect(() => {
    const node = ref.current
    if (!node || !color) return
    let cancelled = false

    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled || !ref.current) return
      const qr = new QRCodeStyling({
        width: size,
        height: size,
        data: value,
        type: "svg",
        margin: 0,
        qrOptions: { errorCorrectionLevel: "H" },
        backgroundOptions: { color: "transparent" },
        dotsOptions: { type: "rounded", color },
        cornersSquareOptions: { type: "extra-rounded", color },
        cornersDotOptions: { type: "dot", color },
        ...(logo
          ? {
              image: HEART_LOGO,
              imageOptions: {
                imageSize: 0.22,
                margin: 3,
                hideBackgroundDots: true,
              },
            }
          : {}),
      })
      ref.current.innerHTML = ""
      qr.append(ref.current)
    })

    return () => {
      cancelled = true
    }
  }, [value, size, color, logo])

  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      style={{ width: size, height: size }}
      className={className}
    />
  )
}
