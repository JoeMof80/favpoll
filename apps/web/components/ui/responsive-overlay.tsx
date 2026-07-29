"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** When provided, renders in place of the visible title. `title` becomes sr-only. */
  header?: React.ReactNode
  footer?: React.ReactNode
  children?: React.ReactNode
  /** Override the content wrapper class on the Dialog (desktop) variant only. */
  dialogContentClassName?: string
  /** Override classes on the DialogContent root (e.g. to narrow the max-width). */
  dialogClassName?: string
  /** Extra styles on the DialogContent root (e.g. to raise the max-height). Desktop only. */
  dialogStyle?: React.CSSProperties
  /** Hides the × close button on both Sheet and Dialog. Use a skip/dismiss link in the footer instead. */
  hideCloseButton?: boolean
  /** Override classes on the header section (e.g. "p-0" when the header slot owns its own padding). */
  headerClassName?: string
}

// iOS pins fixed bottom sheets to the LAYOUT viewport, and the keyboard
// simply covers them — a short sheet (About, Context, Name overlays)
// disappears entirely behind it (found on-device, 2026-07-29; the pledge
// picker's min-h floor was the special case of the same bug). Measure the
// keyboard via visualViewport and lift the sheet above it — the general
// fix, inherited by every dialog.
function useKeyboardInset() {
  const [inset, setInset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () =>
      setInset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
    update()
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])
  return inset
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return isMobile
}

export function ResponsiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  header,
  footer,
  children,
  dialogContentClassName,
  dialogClassName,
  dialogStyle,
  hideCloseButton = false,
  headerClassName,
}: Props) {
  const isMobile = useIsMobile()
  const keyboardInset = useKeyboardInset()

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="flex flex-col gap-0 p-0"
          style={{
            maxHeight: `calc(100dvh - 3.5rem - ${keyboardInset}px)`,
            bottom: keyboardInset,
          }}
          showCloseButton={!hideCloseButton}
          // Radix focuses the first focusable on open — on touch that's often
          // a text input, which summons the iOS keyboard over the sheet.
          // Writing-first overlays still opt in via their own autoFocus,
          // which fires on mount regardless of this.
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className={`shrink-0 ${headerClassName ?? "px-4 py-4"}`}>
            {header ? (
              <>
                <SheetTitle className="sr-only">{title}</SheetTitle>
                {header}
              </>
            ) : (
              <SheetTitle>{title}</SheetTitle>
            )}
            {!header && description && (
              <SheetDescription>{description}</SheetDescription>
            )}
          </SheetHeader>
          {children != null && (
            <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          )}
          {footer && (
            <div
              className="shrink-0 px-4 py-3"
              style={{
                paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
              }}
            >
              {footer}
            </div>
          )}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          dialogClassName ??
          "flex flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        }
        style={{ maxHeight: "min(600px, 80vh)", ...dialogStyle }}
        showCloseButton={!hideCloseButton}
      >
        <DialogHeader className={`shrink-0 ${headerClassName ?? "px-5 py-4"}`}>
          {header ? (
            <>
              <DialogTitle className="sr-only">{title}</DialogTitle>
              {header}
            </>
          ) : (
            <DialogTitle>{title}</DialogTitle>
          )}
          {!header && description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        {children != null && (
          <div className={dialogContentClassName ?? "flex-1 overflow-y-auto"}>
            {children}
          </div>
        )}
        {footer && <div className="shrink-0 px-5 py-4">{footer}</div>}
      </DialogContent>
    </Dialog>
  )
}
