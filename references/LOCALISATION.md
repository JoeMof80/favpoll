# favpoll Localisation Plan

## Principle

Product logic, schema structure, and component architecture are universal.
What changes per market is bounded: copy and tone, currency, charity data,
some topic items, date and number formats, and legal/tax considerations.

Keep these in clearly defined seams. Localisation should always be a
configuration problem, not a rewrite.

## Current state (en-GB only)

- `favpolls.market` text column, default `'en-GB'`
- `favourites.markets` text array, default `['en-GB']`
- `formatCurrency()` in `lib/i18n.ts` — locale and currency-aware
- `formatFavpollDate()` and `ordinal()` in `lib/display.ts` — Intl-based, accept optional locale param
- `messages/en-GB.json` — UI strings, growing incrementally
- `t()` helper in `lib/i18n.ts` — interim until next-intl migration

## Markets

### en-GB (live)
- Currency: GBP, locale en-GB
- Charity identifier: registered_number (Charity Commission)
- Tax incentive: Gift Aid
- Topic items: UK defaults (Hobnob, Bourbon, etc.)

### en-US (planned)
- Currency: USD, locale en-US
- Charity identifier: EIN (IRS 501(c)(3))
- Tax incentive: deductibility copy (different mechanism from Gift Aid)
- Topic items: US equivalents needed for food/biscuit topics
- Tone: warmer and more celebratory than en-GB — needs a dedicated copy pass

## What is universal

- All product logic and database schema (except market-tagged columns)
- All component architecture
- The reveal mechanic
- The brand statement
- The Love / Honour / Charity identity

## What is market-variable

- Currency formatting and payment currency
- Charity data and tax incentive copy
- Some topic items (food, culture-specific topics)
- Copy register and tone
- Date format display (though Intl handles this)
- Legal disclaimers

## Adding a new market

1. Add the locale/currency pair to `MARKET_DEFAULTS` in `lib/i18n.ts`
2. Add a `messages/{locale}.json` file
3. Seed market-appropriate topic items with the new market tag
4. Seed charities appropriate to that market
5. Add tone guidance to the brand skill for that market's register
6. Update Stripe configuration for the new currency
