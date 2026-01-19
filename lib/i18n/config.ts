// Multi-language configuration
export const LANGUAGES = {
  en: { name: "English", code: "en", flag: "🇬🇧" },
  fr: { name: "Français", code: "fr", flag: "🇫🇷" },
  es: { name: "Español", code: "es", flag: "🇪🇸" },
  yo: { name: "Yorùbá", code: "yo", flag: "🇳🇬" },
  ig: { name: "Igbo", code: "ig", flag: "🇳🇬" },
  ha: { name: "Hausa", code: "ha", flag: "🇳🇬" },
  pt: { name: "Português", code: "pt", flag: "🇧🇷" },
  ar: { name: "العربية", code: "ar", flag: "🇸🇦" },
} as const

export const DEFAULT_LANGUAGE = "en"

// Multi-currency configuration with conversion rates (these would typically come from an API)
export const CURRENCIES = {
  NGN: { name: "Nigerian Naira", symbol: "₦", code: "NGN", country: "Nigeria" },
  USD: { name: "US Dollar", symbol: "$", code: "USD", country: "USA" },
  EUR: { name: "Euro", symbol: "€", code: "EUR", country: "Europe" },
  GBP: { name: "British Pound", symbol: "£", code: "GBP", country: "UK" },
  GHS: { name: "Ghanaian Cedi", symbol: "₵", code: "GHS", country: "Ghana" },
  ZAR: { name: "South African Rand", symbol: "R", code: "ZAR", country: "South Africa" },
  KES: { name: "Kenyan Shilling", symbol: "KSh", code: "KES", country: "Kenya" },
  XOF: { name: "West African CFA Franc", symbol: "CFA", code: "XOF", country: "West Africa" },
} as const

export const DEFAULT_CURRENCY = "NGN"

// Currency conversion rates (in production, fetch from external API)
export const CURRENCY_RATES: Record<string, number> = {
  NGN_USD: 0.0013,
  NGN_EUR: 0.0012,
  NGN_GBP: 0.0011,
  USD_NGN: 769,
  EUR_NGN: 833,
  GBP_NGN: 909,
  USD_EUR: 0.92,
  USD_GBP: 0.79,
}

export type LanguageCode = keyof typeof LANGUAGES
export type CurrencyCode = keyof typeof CURRENCIES
