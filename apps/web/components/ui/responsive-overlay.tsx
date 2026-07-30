"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
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
  /**
   * Override classes on the MOBILE body wrapper (sheet + fullscreen),
   * default "px-4 py-4". Pass "p-0" when the children own their padding —
   * otherwise mobile double-pads what desktop (dialogContentClassName)
   * renders once (found on-device, 2026-07-30).
   */
  bodyClassName?: string
  /**
   * Mobile: take over the whole screen instead of a bottom sheet, with a
   * top action bar (Cancel · title · save). For keyboard-summoning dialogs:
   * content anchors at the TOP, so the keyboard can never cover the input
   * or the actions — no visualViewport lifting needed. The `footer` prop is
   * not rendered in this mode (the bar carries the actions). Desktop is
   * unaffected.
   */
  fullscreenOnMobile?: boolean
  /** Primary action for the fullscreen top bar (mobile only). */
  mobileSave?: { label?: string; onClick: () => void; disabled?: boolean }
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
  bodyClassName,
  fullscreenOnMobile = false,
  mobileSave,
}: Props) {
  const isMobile = useIsMobile()
  const keyboardInset = useKeyboardInset()

  if (isMobile && fullscreenOnMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="flex flex-col gap-0 p-0"
          // Inline style beats the side-variant's h-auto. Full height with
          // the content at the top: on iOS the keyboard COVERS the layout
          // viewport's bottom rather than resizing it, so only bottom-
          // anchored UI ever needs dodging — this mode has none.
          style={{
            height: "100dvh",
            maxHeight: "100dvh",
            paddingTop: "env(safe-area-inset-top)",
          }}
        >
          {/* Top action bar — the platform pattern for full-screen editors
              (Cancel · title · Save), kept clear of the keyboard by being
              at the top. */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-2 py-1.5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <SheetTitle className="min-w-0 truncate text-base font-medium">
              {title}
            </SheetTitle>
            {mobileSave ? (
              <Button
                type="button"
                onClick={mobileSave.onClick}
                disabled={mobileSave.disabled}
              >
                {mobileSave.label ?? "Save"}
              </Button>
            ) : (
              // Balance the bar so the title stays centred
              <span aria-hidden className="w-16" />
            )}
          </div>
          {description && (
            <SheetDescription className="sr-only">
              {description}
            </SheetDescription>
          )}
          {header && (
            <div className={`shrink-0 ${headerClassName ?? "px-4 py-4"}`}>
              {header}
            </div>
          )}
          {children != null && (
            <div
              className={`flex-1 overflow-y-auto ${bodyClassName ?? "px-4 py-4"}`}
            >
              {children}
            </div>
          )}
        </SheetContent>
      </Sheet>
    )
  }

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
            <div
              className={`flex-1 overflow-y-auto ${bodyClassName ?? "px-4 py-4"}`}
            >
              {children}
            </div>
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
