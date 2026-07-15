"use client"

import { useEffect, useRef, useState } from "react"

// Styled QR: rounded modules + rounded finder "eyes" + the favpoll heart at
// the centre — the polished look, matching the aesthetic seen elsewhere.
// Rounded (not fully-separated) modules plus error-correction level H keep
// it reliably scannable, which matters most on small printed table cards.
//
// Client-only: qr-code-styling renders via the DOM, so it's dynamically
// imported in an effect. Colours are read from the theme at runtime —
// modules from --foreground; the centre logo is a solid badge (--primary
// rounded square, heart in --primary-foreground) so the mark stays legible
// at table-card sizes instead of thin line-work lost in the hole. All built
// per render from resolved tokens — no baked-in hex.

const badgeSvg = (bg: string, fg: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140"><rect width="140" height="140" rx="30" fill="${bg}"/><g transform="translate(70 70) scale(0.75) translate(-358.3 -335.9)"><path d="M411.349 318.248C414.61 318.248 416.769 315.606 416.769 312.347C413.958 295.602 399.381 282.843 381.828 282.843C372.755 282.843 364.571 286.169 358.303 291.775L355.859 289.769C349.935 285.371 342.545 282.843 334.594 282.843C315.029 282.843 299.169 298.694 299.169 318.248C299.169 327.954 303.08 336.747 309.409 343.142L328.987 362.714C331.292 365.019 335.031 365.019 337.337 362.714C339.643 360.41 339.643 356.674 337.337 354.369L317.758 334.798C313.553 330.526 310.978 324.699 310.978 318.248C310.978 305.212 321.551 294.645 334.594 294.645C340.786 294.645 346.333 296.886 350.427 300.557L358.303 307.622L366.179 300.569C370.332 296.854 375.728 294.645 381.828 294.645C392.827 294.645 402.091 302.168 404.709 312.347C404.709 315.606 408.088 318.248 411.349 318.248Z" fill="${fg}"/><path d="M352.569 335.943C352.569 339.091 355.202 341.643 358.449 341.643H405.489C408.737 341.643 411.369 339.091 411.369 335.943C411.369 332.795 408.737 330.243 405.489 330.243H358.449C355.202 330.243 352.569 332.795 352.569 335.943Z" fill="${fg}" fill-opacity="0.6"/><path d="M352.569 359.643C352.569 362.956 355.211 365.643 358.469 365.643H382.07C385.328 365.643 387.969 362.956 387.969 359.643C387.969 356.329 385.328 353.643 382.07 353.643H358.469C355.211 353.643 352.569 356.329 352.569 359.643Z" fill="${fg}" fill-opacity="0.6"/><path d="M363.969 383.043C363.969 386.357 361.418 389.043 358.269 389.043C355.121 389.043 352.569 386.357 352.569 383.043C352.569 379.729 355.121 377.043 358.269 377.043C361.418 377.043 363.969 379.729 363.969 383.043Z" fill="${fg}" fill-opacity="0.6"/></g></svg>`

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
  const [colors, setColors] = useState<{
    foreground: string
    primary: string
    primaryForeground: string
  } | null>(null)

  useEffect(() => {
    const resolve = () => {
      const styles = getComputedStyle(document.documentElement)
      const foreground = styles.getPropertyValue("--foreground").trim()
      const primary = styles.getPropertyValue("--primary").trim()
      const primaryForeground = styles
        .getPropertyValue("--primary-foreground")
        .trim()
      setColors({
        foreground: foreground || "black",
        primary: primary || foreground || "black",
        primaryForeground: primaryForeground || "white",
      })
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
  }, [])

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
              image: `data:image/svg+xml,${encodeURIComponent(badgeSvg(colors.primary, colors.primaryForeground))}`,
              imageOptions: {
                imageSize: 0.24,
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
