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
// For ONE element on a mixed surface — a card on the home page — put
// `data-register={palette}` on the element itself instead; that scopes the
// palette to its subtree without touching the page.
export function RegisterScope({ palette, children }: Props) {
  if (!palette) return <>{children}</>
  return (
    <div data-register-page={palette} className="contents">
      {children}
    </div>
  )
}
