// Multi-payment provider configuration
export interface PaymentProvider {
  id: string
  name: string
  logo: string
  description: string
  currencies: string[]
  enabled: boolean
  apiKey?: string
}

export interface PaymentMethod {
  type: "card" | "bank_transfer" | "mobile_money" | "ussd" | "crypto"
  provider: string
  displayName: string
  description: string
  icon: string
  minAmount?: number
  maxAmount?: number
  fees: {
    percentage: number
    fixed: number
  }
}

export const PAYMENT_PROVIDERS: Record<string, PaymentProvider> = {
  paystack: {
    id: "paystack",
    name: "Paystack",
    logo: "/icons/paystack.svg",
    description: "Card payments, bank transfers, USSD",
    currencies: ["NGN", "GHS", "ZAR", "KES"],
    enabled: true,
  },
  flutterwave: {
    id: "flutterwave",
    name: "Flutterwave",
    logo: "/icons/flutterwave.svg",
    description: "Multi-currency, local methods",
    currencies: ["NGN", "GHS", "KES", "ZAR", "USD", "EUR"],
    enabled: true,
  },
  interswitch: {
    id: "interswitch",
    name: "Interswitch",
    logo: "/icons/interswitch.svg",
    description: "Nigerian bank cards and transfers",
    currencies: ["NGN"],
    enabled: true,
  },
}

export const PAYMENT_METHODS: Record<string, PaymentMethod> = {
  card: {
    type: "card",
    provider: "paystack",
    displayName: "Credit/Debit Card",
    description: "Visa, Mastercard, and local cards",
    icon: "💳",
    fees: {
      percentage: 1.5,
      fixed: 0,
    },
  },
  bank_transfer: {
    type: "bank_transfer",
    provider: "paystack",
    displayName: "Bank Transfer",
    description: "Direct bank deposit",
    icon: "🏦",
    fees: {
      percentage: 0,
      fixed: 50,
    },
  },
  ussd: {
    type: "ussd",
    provider: "paystack",
    displayName: "USSD",
    description: "*737# or *334# code",
    icon: "📱",
    minAmount: 1000,
    maxAmount: 500000,
    fees: {
      percentage: 0,
      fixed: 0,
    },
  },
  mobile_money: {
    type: "mobile_money",
    provider: "flutterwave",
    displayName: "Mobile Money",
    description: "MTN Mobile Money, Vodafone Cash, Airtel Money",
    icon: "📲",
    fees: {
      percentage: 1,
      fixed: 0,
    },
  },
  crypto: {
    type: "crypto",
    provider: "flutterwave",
    displayName: "Cryptocurrency",
    description: "Bitcoin, Ethereum, USDC",
    icon: "₿",
    fees: {
      percentage: 2,
      fixed: 0,
    },
  },
}

export function getAvailablePaymentMethods(currency: string): PaymentMethod[] {
  return Object.values(PAYMENT_METHODS).filter((method) => {
    const provider = PAYMENT_PROVIDERS[method.provider]
    return provider && provider.enabled && provider.currencies.includes(currency)
  })
}

export function calculateFees(amount: number, method: PaymentMethod): { feeAmount: number; totalAmount: number } {
  const feeAmount = (amount * method.fees.percentage) / 100 + method.fees.fixed
  return {
    feeAmount: Number.parseFloat(feeAmount.toFixed(2)),
    totalAmount: Number.parseFloat((amount + feeAmount).toFixed(2)),
  }
}
