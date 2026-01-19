import { CURRENCY_RATES, CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/i18n/config"

export function convertCurrency(amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number {
  if (fromCurrency === toCurrency) return amount

  const rateKey = `${fromCurrency}_${toCurrency}`
  const rate = CURRENCY_RATES[rateKey]

  if (!rate) {
    console.warn(`No conversion rate found for ${rateKey}`)
    return amount
  }

  return amount * rate
}

export function formatCurrency(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY, locale = "en-US"): string {
  const currencyInfo = CURRENCIES[currency]

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getCurrencySymbol(currency: CurrencyCode = DEFAULT_CURRENCY): string {
  return CURRENCIES[currency]?.symbol || currency
}
