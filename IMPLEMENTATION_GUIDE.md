# Preloved Market - Enterprise Implementation Guide

## Project Overview
This is a production-ready, enterprise-level peer-to-peer marketplace platform supporting multiple categories, languages, currencies, and payment methods. Built with Next.js 16, Supabase, and modern security standards.

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Server Components
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth with Google OAuth
- **Hosting**: Vercel
- **Security**: Encryption, Rate Limiting, AML/KYC Compliance

### Database Schema

#### Core Tables
1. **profiles** - User profiles with verification and admin roles
2. **listings** - Product listings with multi-category support
3. **listing_images** - Secure image management with ordering
4. **transactions** - Transaction history with escrow support
5. **messages** - In-app messaging between buyers/sellers
6. **reviews** - Rating and review system
7. **categories** - Flexible category management
8. **payment_methods** - User payment methods
9. **user_preferences** - Language, currency, notification settings
10. **oauth_accounts** - Social login management
11. **admin_logs** - Audit trail for all admin actions
12. **moderation_queue** - Content moderation system
13. **security_audit_logs** - Security event logging
14. **favorites** - User wishlist/favorites

All tables include Row Level Security (RLS) policies for data protection.

## Features Implemented

### 1. Authentication & Authorization
- Email/password registration and login
- Google OAuth integration (requires Google Client ID)
- Role-based access control (User, Moderator, Admin)
- Session management with middleware
- Rate limiting on auth endpoints

### 2. Multi-Category Support
- 10 pre-configured categories (Fashion, Electronics, Home & Living, Sports, Books, Toys, Beauty, Automotive, Jewelry, Other)
- Expandable category system via admin panel
- Category-specific filtering and search

### 3. Image Upload System
- Secure image upload to Supabase Storage
- Multiple images per listing (up to 10)
- Primary image designation
- Image optimization and CDN delivery
- Delete and reorder functionality

### 4. Multi-Language Support
- 8 languages: English, French, Spanish, Yoruba, Igbo, Hausa, Portuguese, Arabic
- Language selection in user preferences
- Complete translation framework ready for expansion
- Localized UI/UX

### 5. Multi-Currency System
- Support for 8+ currencies: NGN, USD, EUR, GBP, GHS, ZAR, KES, XOF
- Currency conversion utilities
- Formatted currency display
- Dynamic fee calculation per currency

### 6. Multi-Payment Methods
- **Card Payments** - Via Paystack (1.5% fee)
- **Bank Transfer** - Direct transfer (₦50 flat fee)
- **USSD** - Mobile banking (*737#, *334#)
- **Mobile Money** - MTN, Vodafone, Airtel Money (1% fee)
- **Cryptocurrency** - Bitcoin, Ethereum, USDC (2% fee)

Payment gateway integration points:
- Paystack: Cards, bank transfers, USSD
- Flutterwave: Mobile money, crypto, multi-currency

### 7. Admin Dashboard
Features:
- User management and verification
- Listing moderation and approval
- Transaction monitoring
- Moderation queue for flagged content
- Audit logs for all admin actions
- Security event tracking
- Real-time statistics and analytics

Routes:
- `/admin` - Dashboard overview
- `/admin/users` - User management
- `/admin/listings` - Content moderation
- `/admin/moderation` - Moderation queue
- `/admin/transactions` - Transaction history
- `/admin/reports` - Analytics and reports
- `/admin/audit-logs` - Audit trail

### 8. Security Features
- **AML/KYC Compliance**: User verification levels and transaction limits
- **Encryption**: Data encryption for sensitive information
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Content-Security-Policy, X-Frame-Options, etc.
- **Audit Logging**: Complete audit trail of all admin actions
- **Fraud Detection**: User flagging system and suspicious activity detection
- **Session Management**: Secure session handling with token refresh

### 9. Compliance Features
- Terms of Service acceptance
- Privacy Policy
- AML/KYC Policy
- Compliance policy versioning
- User acceptance tracking

### 10. User Dashboard
Features:
- Profile management with verification status
- Sales history and analytics
- Purchase history
- Message inbox
- Review management
- Settings and preferences (language, currency, notifications)
- Wishlist/favorites

## Setup Instructions

### Prerequisites
1. Node.js 18+ and npm/pnpm
2. Supabase account and project
3. Google OAuth credentials
4. Paystack and Flutterwave API keys (for payments)

### Environment Variables
Create a `.env.local` file with:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key

ENCRYPTION_KEY=your-32-character-encryption-key
\`\`\`

### Database Setup
1. Create Supabase project
2. Run migration scripts in order (scripts/001_*.sql through 011_*.sql)
3. Enable RLS on all tables
4. Set up storage bucket: `listing-images`

### Google OAuth Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials (Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### Payment Provider Setup
1. **Paystack**: Create business account, generate API keys
2. **Flutterwave**: Create business account, generate API keys
3. Update environment variables

### Deployment to Vercel
1. Connect GitHub repository to Vercel
2. Add environment variables to Vercel project settings
3. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile

### Listings
- `GET /api/listings` - Get all listings
- `POST /api/listings` - Create new listing
- `GET /api/listings/[id]` - Get listing details
- `PUT /api/listings/[id]` - Update listing
- `DELETE /api/listings/[id]` - Delete listing

### Payments
- `POST /api/payments/initiate` - Initialize payment
- `POST /api/payments/webhook` - Payment webhook handler

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/[id]` - Update user
- `GET /api/admin/moderation` - Get moderation queue
- `PUT /api/admin/moderation/[id]` - Resolve moderation item

### Security
- `POST /api/security/audit-log` - Log security event

## Security Best Practices

### For Developers
1. Never commit `.env.local` files
2. Always use HTTPS in production
3. Validate and sanitize all user inputs
4. Use parameterized queries (handled by Supabase)
5. Keep dependencies updated
6. Run security audits regularly

### For Users
1. Enable 2FA when available
2. Use strong passwords
3. Don't share recovery codes
4. Report suspicious activity
5. Verify seller information

### For Admins
1. Use admin accounts only when necessary
2. Log all admin actions
3. Review audit logs regularly
4. Monitor flagged accounts
5. Update RLS policies as needed

## Performance Optimization

### Frontend
- Next.js Image optimization
- Code splitting and lazy loading
- Static generation where possible
- Client-side caching with SWR

### Backend
- Database indexes on frequently queried columns
- Connection pooling via Supabase
- API response caching
- Compression of large responses

### Database
- Indexed searches
- Proper use of RLS policies
- Connection pooling

## Monitoring & Analytics

### Key Metrics
- User registration and growth
- Listing creation rate
- Transaction volume and value
- Payment success rate
- Fraud detection rate
- Admin action logs

### Tools to Integrate
- Vercel Analytics
- Supabase Dashboard
- Sentry for error tracking
- PostHog for product analytics

## Scaling Considerations

### When to Scale
1. Database reads exceed 100 RPS
2. Storage needs exceed 50GB
3. Concurrent users exceed 1000
4. Admin panel response times degrade

### Scaling Strategies
1. Database: Upgrade Supabase plan or migrate to self-managed PostgreSQL
2. Storage: Implement CDN caching (CloudFlare)
3. API: Add load balancer and multiple instances
4. Search: Implement Elasticsearch for advanced search

## Compliance Checklist

- [ ] GDPR compliance for EU users
- [ ] Nigerian NDPR compliance
- [ ] AML/KYC requirements
- [ ] Payment industry standards (PCI DSS)
- [ ] Data retention policies
- [ ] Cookie consent implementation
- [ ] Accessibility (WCAG 2.1)

## Maintenance & Updates

### Regular Tasks
- Review admin logs (weekly)
- Update dependencies (monthly)
- Security patches (as released)
- Database backups (daily)
- Performance monitoring (daily)

### Troubleshooting

#### Common Issues
1. **Payment failures**: Check provider API keys and webhook configuration
2. **Image upload failures**: Verify bucket permissions and storage limits
3. **Auth issues**: Check Supabase session and RLS policies
4. **Slow searches**: Add indexes and optimize queries

## Support & Resources

### Documentation
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs
- Paystack: https://paystack.com/docs
- Flutterwave: https://developer.flutterwave.com

### Contact
For support or issues, contact: support@prelovedmarket.com

---
Last Updated: November 2025
