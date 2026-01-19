// Compliance and legal requirements management
export interface CompliancePolicy {
  id: string
  name: string
  version: string
  content: string
  effectiveDate: Date
  requiredAcceptance: boolean
}

export const COMPLIANCE_POLICIES: Record<string, CompliancePolicy> = {
  terms_of_service: {
    id: "tos",
    name: "Terms of Service",
    version: "1.0",
    content: `
# Terms of Service

Last Updated: ${new Date().toLocaleDateString()}

## 1. User Responsibilities
- Users must be at least 18 years old
- Users are responsible for maintaining account security
- Users must not engage in fraudulent activities
- Users agree to comply with all applicable laws

## 2. Platform Rules
- No counterfeited or stolen goods
- No weapons, dangerous items, or illegal goods
- No harassment or abuse of other users
- Items must be accurately described

## 3. Dispute Resolution
- Disputes will be handled through our moderation system
- Appeals can be made within 14 days
- Final decisions made by admin team are binding

## 4. Limitation of Liability
Preloved Market is provided "as is" without warranties.
We are not liable for indirect damages or lost profits.
    `,
    effectiveDate: new Date(),
    requiredAcceptance: true,
  },
  privacy_policy: {
    id: "privacy",
    name: "Privacy Policy",
    version: "1.0",
    content: `
# Privacy Policy

Last Updated: ${new Date().toLocaleDateString()}

## 1. Data Collection
We collect information necessary to provide our service, including:
- Account information (name, email, phone)
- Transaction history
- Payment information (encrypted)
- IP addresses for security

## 2. Data Usage
Your data is used for:
- Service provision and improvement
- Fraud prevention
- Legal compliance
- Marketing (with consent)

## 3. Data Protection
- All sensitive data is encrypted
- Access is restricted to authorized personnel
- We comply with Nigerian Data Protection Regulation (NDPR)
- Data breaches are reported within 72 hours

## 4. Your Rights
- Right to access your data
- Right to correct inaccurate data
- Right to delete your data
- Right to data portability
    `,
    effectiveDate: new Date(),
    requiredAcceptance: true,
  },
  aml_kyc: {
    id: "aml_kyc",
    name: "AML/KYC Policy",
    version: "1.0",
    content: `
# Anti-Money Laundering & Know Your Customer Policy

## 1. KYC Requirements
- Identity verification required
- Address verification required
- Source of funds disclosure for large transactions
- Enhanced due diligence for high-risk users

## 2. AML Compliance
- Transaction monitoring for suspicious patterns
- Reporting to authorities as required by law
- Customer risk profiling
- Ongoing monitoring of high-risk customers

## 3. Sanctions Screening
- Users are screened against international sanctions lists
- Transactions are monitored for compliance
- Blocked jurisdictions are not supported
    `,
    effectiveDate: new Date(),
    requiredAcceptance: true,
  },
}

export function getPoliciesNeedingAcceptance(): CompliancePolicy[] {
  return Object.values(COMPLIANCE_POLICIES).filter((p) => p.requiredAcceptance)
}
