import messages from '@/messages/en-GB.json'

export type Market = 'en-GB' | 'en-US'

export type FormatCurrencyOptions = {
  locale: string
  currency: string
}

export function formatCurrency(
  amountInPence: number,
  options: FormatCurrencyOptions = { locale: 'en-GB', currency: 'GBP' }
): string {
  return new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency: options.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInPence / 100)
}

export const MARKET_DEFAULTS: Record<Market, FormatCurrencyOptions> = {
  'en-GB': { locale: 'en-GB', currency: 'GBP' },
  'en-US': { locale: 'en-US', currency: 'USD' },
}

export function t(key: keyof typeof messages): string {
  return messages[key] ?? key
}
