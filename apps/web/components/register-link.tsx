// The register-ink idiom for a LINK on a neutral surface (2026-08-31): the
// register as text, the register's pale tint on hover, the active one in a
// pill of its own colour. The header's kind links and the home journey's
// "See it for a memorial · a celebration · a fundraiser" share these so they
// cannot drift. Put `data-register={palette}` on the element so the classes
// resolve to that palette; in dark, where --primary is near-white, the
// register's --chart-2 tint carries the hue.
export const REGISTER_LINK_INK =
  "text-primary hover:text-primary dark:text-chart-2 dark:hover:text-chart-2"
export const REGISTER_LINK_HOVER = "hover:bg-accent dark:hover:bg-chart-2/15"
export const REGISTER_LINK_ACTIVE =
  "bg-primary/10 font-medium dark:bg-chart-2/15"
