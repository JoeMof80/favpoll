import { t } from "@/lib/i18n"

// The first focusable element on every page (app/layout.tsx): visually
// hidden until it takes keyboard focus, then a small pill at the top left.
// Targets the page's <main id="main" tabIndex={-1}> so the jump lands
// focus, not just the scroll position (a11y audit, 2026-10-19).
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:border focus:border-ring focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:ring-3 focus:ring-ring/50 focus:outline-none"
    >
      {t("a11y.skipToMain")}
    </a>
  )
}
