# Admin Portal Setup & Configuration

## Admin Login

**Admin Portal URL:** `https://your-domain.com/admin-login`

### Default Admin Credentials (CHANGE IMMEDIATELY)

\`\`\`
Email: admin@preloved.com
Password: Admin@123456
\`\`\`

**IMPORTANT:** Change these credentials immediately after first login for security.

## Creating Admin Users

To create a new admin user:

1. Sign up a new account normally at `/auth/sign-up`
2. Access Supabase dashboard
3. Go to `profiles` table
4. Find the new user's profile
5. Set `admin_role` field to `"admin"`
6. The user can now access `/admin-login`

## Admin Features & Responsibilities

### Dashboard
- **Overview:** Platform metrics (users, listings, transactions, disputes)
- **Quick Actions:** Fast access to common admin tasks
- **Activity Log:** Real-time admin action tracking

### User Management (`/admin/users`)
- View all platform users
- Search and filter users
- Verify user accounts
- Flag suspicious users
- Monitor user status and ratings

### Listings Management (`/admin/listings`)
- Monitor all product listings
- Filter by status (active, sold, removed)
- Remove inappropriate listings
- Search listings by title or seller
- View seller information

### Transactions (`/admin/transactions`)
- Monitor all buyer-seller transactions
- View transaction details and status
- Track platform revenue
- Calculate platform fees (5% default)
- Identify transaction patterns

### Dispute Resolution (`/admin/disputes`)
- Handle buyer-seller disputes
- Review dispute details and descriptions
- Document resolution decisions
- Issue refunds when necessary
- Track dispute resolution metrics

### Moderation Queue (`/admin/moderation`)
- Review flagged items and reports
- Approve or reject moderation items
- Document moderation decisions
- Manage content quality

### Platform Promotions (`/admin/promotions`)
- Create and manage discount promotions
- Set promotion dates and discount percentages
- Track active vs inactive promotions
- Delete expired promotions
- Drive platform growth through campaigns

### Audit Logs (`/admin/audit-logs`)
- Complete record of all admin actions
- Search and filter audit logs
- Track who did what and when
- Compliance and security reporting
- System event tracking

## Security Best Practices

1. **Change Default Credentials:** Immediately after first login
2. **Use Strong Passwords:** 12+ characters, mix of upper/lowercase, numbers, special chars
3. **Enable 2FA:** If using Google OAuth, use authenticator app
4. **Audit Logs:** Regularly review audit logs for suspicious activity
5. **Role-Based Access:** Only grant admin access to trusted personnel
6. **Session Management:** Log out when finished, don't leave session open

## Admin Responsibilities

### Daily Tasks
- Review moderation queue
- Check for open disputes
- Monitor platform activity
- Check audit logs for anomalies

### Weekly Tasks
- Review user verification queue
- Analyze transaction trends
- Check for flagged users
- Review promotion performance

### Monthly Tasks
- Generate platform reports
- Analyze user growth
- Review revenue metrics
- Plan new promotions

## Common Admin Operations

### Verifying a User
1. Go to User Management
2. Search for user by name/email
3. Click "Verify" button
4. User becomes verified seller

### Handling a Dispute
1. Go to Dispute Resolution
2. Select open dispute from list
3. Review dispute details
4. Add resolution notes
5. Click "Resolve" or "Issue Refund"

### Removing Inappropriate Listing
1. Go to Listings Management
2. Search for listing
3. Click "Remove" button
4. Listing becomes unavailable

### Creating a Promotion
1. Go to Platform Promotions
2. Click "+ New Promotion"
3. Fill in promotion details (title, description, discount %, dates)
4. Click "Create Promotion"
5. Promotion becomes active on start date

## Troubleshooting

### Can't Access Admin Portal
- Verify your account has `admin_role = "admin"` in profiles table
- Try logging out and logging back in
- Check browser cookies/cache

### Moderation Queue Empty
- This is normal if no items flagged
- Items appear when users report inappropriate content

### Users Not Appearing
- Refresh the page
- Check search filters
- Verify users exist in database

## Support

For technical issues or questions:
1. Check audit logs for error details
2. Review browser console for errors
3. Contact platform support team
4. Check database for data consistency
