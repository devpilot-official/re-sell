import { createServerClient } from "@/lib/supabase/server"

export enum VerificationLevel {
  UNVERIFIED = "unverified",
  BASIC = "basic",
  VERIFIED = "verified",
  ENHANCED = "enhanced",
}

export interface VerificationRequirement {
  level: VerificationLevel
  requirements: string[]
  maxTransactionAmount?: number
  maxMonthlyTransactions?: number
}

export const VERIFICATION_REQUIREMENTS: Record<VerificationLevel, VerificationRequirement> = {
  [VerificationLevel.UNVERIFIED]: {
    level: VerificationLevel.UNVERIFIED,
    requirements: ["Email verification"],
    maxTransactionAmount: 50000,
    maxMonthlyTransactions: 3,
  },
  [VerificationLevel.BASIC]: {
    level: VerificationLevel.BASIC,
    requirements: ["Email verification", "Phone verification"],
    maxTransactionAmount: 500000,
    maxMonthlyTransactions: 50,
  },
  [VerificationLevel.VERIFIED]: {
    level: VerificationLevel.VERIFIED,
    requirements: ["Email verification", "Phone verification", "ID verification", "Address verification"],
    maxTransactionAmount: 5000000,
    maxMonthlyTransactions: undefined,
  },
  [VerificationLevel.ENHANCED]: {
    level: VerificationLevel.ENHANCED,
    requirements: [
      "Email verification",
      "Phone verification",
      "ID verification",
      "Address verification",
      "Bank verification",
      "Biometric verification",
    ],
  },
}

export async function canUserTransaction(
  userId: string,
  transactionAmount: number,
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = await createServerClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status, suspicious_activity_flag")
    .eq("id", userId)
    .single()

  if (!profile) {
    return { allowed: false, reason: "User not found" }
  }

  if (profile.suspicious_activity_flag) {
    return { allowed: false, reason: "Account flagged for review" }
  }

  const verificationLevel = (profile.verification_status || VerificationLevel.UNVERIFIED) as VerificationLevel
  const requirements = VERIFICATION_REQUIREMENTS[verificationLevel]

  if (requirements.maxTransactionAmount && transactionAmount > requirements.maxTransactionAmount) {
    return {
      allowed: false,
      reason: `Your verification level allows max ₦${requirements.maxTransactionAmount.toLocaleString()} per transaction`,
    }
  }

  return { allowed: true }
}
