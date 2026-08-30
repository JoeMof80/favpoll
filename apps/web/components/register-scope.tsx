import type { RegisterPalette } from "@/lib/register-palette"

type Props = {
  palette: RegisterPalette | null
  children: React.ReactNode
}

// Gives a whole page its register's palette. The attribute is lifted to the
// document by `:root:has([data-register-page])` in app/register-tokens.css,
// so the header, the footer and the logo recolour with the page —
// server-rendered, no flash. Null (the blue default) renders nothing extra.
//
// A PLAIN BLOCK, NOT display:contents (2026-08-31). It shipped as `contents`
// and every client-side navigation to a register page landed at the foot:
// Next scrolls a new segment to its first DOM node, skips nodes with no box,
// and fell through to the footer (measured: scrollY 4577 of 5377 on
// /memorials). A block wrapper around a page has no layout effect and gives
// the router something to scroll to.
//
// For ONE element on a mixed surface — a card on the home page — put
// `data-register={palette}` on the element itself instead; that scopes the
// palette to its subtree without touching the page.
export function RegisterScope({ palette, children }: Props) {
  if (!palette) return <>{children}</>
  return <div data-register-page={palette}>{children}</div>
}
