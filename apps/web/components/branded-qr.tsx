"use client"

import { useEffect, useRef, useState } from "react"

// Styled QR: rounded modules + rounded finder "eyes" + the favpoll heart at
// the centre — the polished look, matching the aesthetic seen elsewhere.
// Rounded (not fully-separated) modules plus error-correction level H keep
// it reliably scannable, which matters most on small printed table cards.
//
// Client-only: qr-code-styling renders via the DOM, so it's dynamically
// imported in an effect. Colours are read from the theme at runtime — the
// modules and the centre logo both take --foreground, so the QR reads as
// one object and dark mode inverts for free. The logo is the canonical
// favpoll mark (paths from favpoll-logo.tsx, but solid — the wordmark's
// 60%-opacity accents wash out at QR sizes), bare on the cleared hole and
// as large as convention allows — every step of the size ladder up to
// 0.4 machine-decodes under error-correction level H. No baked-in hex.

const logoSvg = (fg: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 22" fill="none"><path d="M13 21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21C11 20.4477 11.4477 20 12 20C12.5523 20 13 20.4477 13 21Z" fill="${fg}"/><path d="M22.8939 7.37611C23.5594 7.37611 24 6.82571 24 6.14676C23.4264 2.65821 20.4515 0 16.8692 0C15.0175 0 13.3473 0.692853 12.0682 1.86083L11.5693 1.44305C10.3604 0.526775 8.85215 0 7.22965 0C3.23683 0 0 3.3024 0 7.37611C0 9.39831 0.798074 11.23 2.08982 12.5624L6.08526 16.6399C6.55582 17.12 7.31874 17.12 7.7893 16.6399C8.25986 16.1598 8.25986 15.3815 7.7893 14.9014L3.79368 10.8241C2.9355 9.93401 2.40988 8.72017 2.40988 7.37611C2.40988 4.6603 4.56777 2.4587 7.22965 2.4587C8.4932 2.4587 9.62539 2.92576 10.4609 3.69046L12.0682 5.16232L13.6756 3.69286C14.5231 2.91899 15.6243 2.4587 16.8692 2.4587C19.1138 2.4587 21.0045 4.0261 21.5387 6.14676C21.5387 6.82571 22.2284 7.37611 22.8939 7.37611Z" fill="${fg}"/><path d="M11 11C11 11.5523 11.5373 12 12.2 12H21.8C22.4627 12 23 11.5523 23 11C23 10.4477 22.4627 10 21.8 10H12.2C11.5373 10 11 10.4477 11 11Z" fill="${fg}"/><path d="M11 16C11 16.5523 11.5223 17 12.1667 17H16.8333C17.4777 17 18 16.5523 18 16C18 15.4477 17.4777 15 16.8333 15H12.1667C11.5223 15 11 15.4477 11 16Z" fill="${fg}"/></svg>`

type Props = {
  value: string
  /** Rendered size in px */
  size?: number
  /** Show the favpoll heart at the centre */
  logo?: boolean
  /**
   * CSS variable the module colour is read from. Defaults to --foreground
   * (maximum contrast — organiser card, print pack). The display screen
   * passes --qr for the softened brand-tinted ink.
   */
  colorVar?: string
  className?: string
  "aria-label"?: string
}

export function BrandedQR({
  value,
  size = 160,
  logo = true,
  colorVar = "--foreground",
  className,
  "aria-label": ariaLabel = "QR code",
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [colors, setColors] = useState<{ foreground: string } | null>(null)

  useEffect(() => {
    const resolve = () => {
      const styles = getComputedStyle(document.documentElement)
      const foreground = styles.getPropertyValue(colorVar).trim()
      setColors({ foreground: foreground || "black" })
    }
    resolve()
    // Re-resolve when the theme class flips (next-themes toggles a class on
    // <html>) — otherwise a light-rendered QR turns invisible in dark mode.
    const observer = new MutationObserver(resolve)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [colorVar])

  useEffect(() => {
    const node = ref.current
    if (!node || !colors) return
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
        dotsOptions: { type: "rounded", color: colors.foreground },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: colors.foreground,
        },
        cornersDotOptions: { type: "dot", color: colors.foreground },
        ...(logo
          ? {
              image: `data:image/svg+xml,${encodeURIComponent(logoSvg(colors.foreground))}`,
              imageOptions: {
                imageSize: 0.4,
                margin: 2,
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
  }, [value, size, colors, logo])

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
