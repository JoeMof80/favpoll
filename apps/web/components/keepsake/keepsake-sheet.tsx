import { cn } from "@/lib/utils"
import { KeepsakeDocument } from "@/components/keepsake/keepsake-document"
import type {
  KeepsakeData,
  KeepsakeVariant,
  KeepsakeOrientation,
} from "@/components/keepsake/keepsake-document"

// A keepsake mounted as a sheet of paper, ready to be scaled.
//
// Extracted 2026-08-27, when /memorials needed the same presentation the
// home page walkthrough already had ("why not use the keepsake template from
// the homepage?"). Both were about to hold the same three decisions
// independently, which is the drift this codebase keeps paying for.
//
// The three:
//
//   .paper — the sheet forces a light background, so without the light
//   tokens pinned a dark-mode visitor gets dark ink on dark paper (#535).
//   .paper-screen puts the app's border weight back: .paper darkens --border
//   for ink that survives a domestic printer, which on a screen outlines
//   every row.
//
//   shrink-0 IS LOAD-BEARING, and the subtlest of the three. Every well
//   these sit in is a row-direction flex box, and this is the only medium
//   with an explicit width — so flex-shrink squashed the 794 toward the
//   column's own width BEFORE the transform ran, and the sheet came out at
//   roughly 0.59:1 instead of A4's 0.707:1. The other media escape it by
//   having no width of their own, which is why the bug could live here
//   alone.
//
//   An EXPLICIT page box, because KeepsakeDocument is h-full w-full and
//   resolves against whatever it is given.
//
// The scale stays with the caller: each surface has its own column to fit.
export const A4_PORTRAIT = { w: 794, h: 1123 }
export const A4_LANDSCAPE = { w: 1123, h: 794 }

export function KeepsakeSheet({
  data,
  variant = "tribute",
  orientation = "portrait",
  className,
}: {
  data: KeepsakeData
  variant?: KeepsakeVariant
  orientation?: KeepsakeOrientation
  /** Where the scale goes — `origin-*` and `scale-*` from the caller. */
  className?: string
}) {
  const page = orientation === "portrait" ? A4_PORTRAIT : A4_LANDSCAPE
  return (
    <div
      className={cn("paper paper-screen shrink-0 drop-shadow-xl", className)}
      style={{ width: page.w, height: page.h }}
    >
      <KeepsakeDocument
        data={data}
        variant={variant}
        orientation={orientation}
      />
    </div>
  )
}
