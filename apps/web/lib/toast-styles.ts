// Sonner toasts must be styled via inline `style` on each toast call —
// `classNames` and CSS variables on <Toaster> are overridden by sonner's own
// inline styles. CSS custom properties resolve fine inside inline styles, so
// these read the design tokens from globals.css.
export const TOAST_ERROR_STYLE = {
  background: "var(--destructive-muted)",
  color: "var(--destructive-strong)",
  border: "1px solid var(--destructive)",
} as const

export const TOAST_WARNING_STYLE = {
  background: "var(--warning-muted)",
  color: "var(--warning)",
  border: "1px solid var(--warning)",
} as const
