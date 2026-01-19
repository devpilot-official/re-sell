# Pre-Deployment Checklist

## Database
- [ ] Run all SQL migration scripts (001-011)
- [ ] Verify RLS policies are enabled on all tables
- [ ] Set up storage bucket `listing-images`
- [ ] Configure bucket CORS settings
- [ ] Backup production database

## Environment Variables
- [ ] Add all required env vars to Vercel
- [ ] Verify Supabase credentials
- [ ] Set up Google OAuth credentials
- [ ] Configure Paystack API keys
- [ ] Configure Flutterwave API keys
- [ ] Generate and set encryption key

## Security
- [ ] Enable HTTPS only
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable two-factor authentication for admin accounts
- [ ] Review RLS policies
- [ ] Set up security headers

## Payments
- [ ] Test Paystack integration (sandbox mode)
- [ ] Test Flutterwave integration (sandbox mode)
- [ ] Configure payment webhooks
- [ ] Set up payout accounts
- [ ] Test currency conversion

## Email & Notifications
- [ ] Configure email provider (SendGrid, etc.)
- [ ] Set up email templates
- [ ] Configure SMS provider (optional)
- [ ] Test notification system

## Testing
- [ ] User registration flow
- [ ] Login and OAuth
- [ ] Image uploads
- [ ] Listing creation
- [ ] Search and filters
- [ ] Payment processing
- [ ] Admin dashboard
- [ ] Moderation system

## Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Optimize images
- [ ] Enable caching headers
- [ ] Set up CDN

## Documentation
- [ ] Update README
- [ ] Create admin guide
- [ ] Create user guide
- [ ] Set up support system

## Final Checks
- [ ] Conduct security audit
- [ ] Get compliance approval
- [ ] Plan deployment window
- [ ] Set up monitoring
- [ ] Have rollback plan ready
