import messages from "@/messages/en-GB.json"

export type Market = "en-GB" | "en-US"

export type FormatCurrencyOptions = {
  locale: string
  currency: string
}

export function formatCurrency(
  amountInPence: number,
  options: FormatCurrencyOptions = { locale: "en-GB", currency: "GBP" }
): string {
  return new Intl.NumberFormat(options.locale, {
    style: "currency",
    currency: options.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInPence / 100)
}

export const MARKET_DEFAULTS: Record<Market, FormatCurrencyOptions> = {
  "en-GB": { locale: "en-GB", currency: "GBP" },
  "en-US": { locale: "en-US", currency: "USD" },
}

// ─── GBP display helpers ─────────────────────────────────────────────────────
// The app's money columns store POUNDS; these take pounds. (formatCurrency
// above takes pence — its callers multiply by 100 first.) Three families,
// matching the surfaces they serve — don't invent a fourth.

const GBP_WHOLE = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

const GBP_EXACT = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
})

const GBP_COMPACT = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  notation: "compact",
  maximumFractionDigits: 1,
})

/** "£1,300", or "£12.50" when there are pence — totals and summary surfaces. */
export function formatPounds(pounds: number): string {
  return GBP_WHOLE.format(pounds)
}

/** Always two decimals ("£12.00") — payment and breakdown surfaces where the exact charge matters. */
export function formatPoundsExact(pounds: number): string {
  return GBP_EXACT.format(pounds)
}

/** Ranking tables: "—" for zero, compact "£1.2K" from a thousand, whole pounds below. */
export function formatPoundsCompact(pounds: number): string {
  if (pounds === 0) return "—"
  if (pounds >= 1000) return GBP_COMPACT.format(pounds)
  return GBP_WHOLE.format(pounds)
}

/** Grouped tally ("1,234") for pledge and vote counts. */
export function formatCount(n: number): string {
  return n.toLocaleString("en-GB")
}

export function t(key: keyof typeof messages): string {
  return messages[key] ?? key
}
