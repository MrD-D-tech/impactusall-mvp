# 🔐 ImpactusAll MVP - Login Credentials

**Last Updated:** December 19, 2025  
**Deployment URL:** https://impactusall.abacusai.app  
**Login Page:** https://impactusall.abacusai.app/login

---

## 🎯 Platform Admin (God Mode - YOU)

### Primary Admin Account
- **Email:** `platform@impactusall.com`
- **Password:** `admin123`
- **Role:** `PLATFORM_ADMIN`
- **Access:** `/platform-admin`
- **Permissions:**
  - Full access to all platform functions
  - Add/edit/delete charities
  - Add/edit/delete corporate donors
  - Manage all users
  - View financial dashboard
  - Moderate all content
  - System settings and controls

### What You Can Do:
- ✅ Add new charities
- ✅ Add new corporate donors
- ✅ Approve/suspend charities
- ✅ Approve/suspend corporates
- ✅ View all stories, comments, engagement
- ✅ Manage all user accounts
- ✅ View revenue and financial data
- ✅ Configure system settings

---

## 🏥 Charity Admin Accounts

### Northern Hospice (Primary Test Charity)
- **Email:** `admin@northernhospice.org.uk`
- **Password:** `admin123`
- **Role:** `CHARITY_ADMIN`
- **Access:** `/charity-dashboard`
- **Charity ID:** (Seeded in database)
- **What They Can Do:**
  - ✅ Create and publish impact stories
  - ✅ Upload images and media
  - ✅ Manage their charity profile
  - ✅ View engagement analytics
  - ✅ Manage relationships with corporate donors

### Man Utd Foundation (Secondary Test Charity)
- **Email:** `admin@mufoundation.org`
- **Password:** `admin123`
- **Role:** `CHARITY_ADMIN`
- **Access:** `/charity-dashboard`
- **What They Can Do:**
  - ✅ Same as above
  - ✅ View Man Utd corporate donor relationship

### Ocean Conservation Trust (Third Test Charity)
- **Email:** `admin@oceanconservation.org`
- **Password:** `admin123`
- **Role:** `CHARITY_ADMIN`
- **Access:** `/charity-dashboard`

---

## 🏢 Corporate Donor Accounts

### Manchester United (Primary Test Corporate)
- **Email:** `corporate@manutd.com`
- **Password:** `admin123`
- **Role:** `CORPORATE_DONOR`
- **Access:** `/corporate-dashboard` (Phase 2)
- **Linked Charity:** Man Utd Foundation
- **What They Can Do (Phase 2):**
  - View Personal Impact Journey
  - Download reports
  - Share content with employees/fans
  - View engagement metrics

### TechCorp Global (Secondary Test Corporate)
- **Email:** `admin@techcorp.com`
- **Password:** `admin123`
- **Role:** `CORPORATE_DONOR`
- **Access:** `/corporate-dashboard` (Phase 2)
- **Linked Charity:** Code for Good

---

## 👤 General Test Accounts

### John Doe (General User)
- **Email:** `john@doe.com`
- **Password:** `johndoe123`
- **Role:** `PUBLIC_USER`
- **Access:** Public Impact Hubs (Phase 2)
- **What They Can Do:**
  - View public impact stories
  - Like and comment on stories
  - Share stories on social media

### Test User 2
- **Email:** `test@example.com`
- **Password:** `test123`
- **Role:** `PUBLIC_USER`
- **Access:** Public Impact Hubs (Phase 2)

---

## 🧪 Testing Scenarios

### Scenario 1: Platform Admin Testing
1. Login as `platform@impactusall.com`
2. Navigate to `/platform-admin`
3. Test "Add New Charity" button:
   - Click "Add New Charity"
   - Fill in charity details
   - Create charity admin account
   - Submit and verify creation
4. Test "Add New Corporate" button:
   - Navigate to "Corporate Donors"
   - Click "Add New Corporate"
   - Fill in corporate details
   - Create corporate admin account
   - Submit and verify creation
5. View financial dashboard
6. Check engagement analytics

### Scenario 2: Charity Admin Testing
1. Login as `admin@northernhospice.org.uk`
2. Navigate to `/charity-dashboard`
3. Test story creation:
   - Click "Create New Story"
   - Fill in story details
   - Upload multiple images
   - Check consent checkbox
   - Click "Publish" (NOT "Save as Draft")
   - Verify story appears in list with PUBLISHED status
4. View charity analytics
5. Test story editing
6. View engagement metrics

### Scenario 3: Multi-Role Testing
1. Login as Platform Admin
2. Add a new charity
3. Logout
4. Login with the new charity admin credentials
5. Create a story for that charity
6. Logout
7. Login as Platform Admin
8. Verify the story appears in content moderation
9. Approve/moderate the story

---

## 🔒 Security Notes

### Password Policy:
- **Development/Testing:** All accounts use simple passwords (admin123, test123)
- **Production:** Implement strong password requirements
  - Minimum 12 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - Password reset flow required

### Account Verification:
- **Current:** Auto-verified for testing
- **Production:** Email verification required
  - Send verification email on signup
  - Token-based verification
  - Resend verification email option

### Role-Based Access Control (RBAC):
```typescript
// Roles hierarchy
PLATFORM_ADMIN > CHARITY_ADMIN > CORPORATE_DONOR > PUBLIC_USER

// Route protection implemented in:
// - /middleware.ts
// - /lib/auth-options.ts
```

---

## 🚨 Important: Database Seeding

### If Database is Empty:
Run this command to seed test data:
```bash
cd /home/ubuntu/impactusall_mvp/nextjs_space
yarn prisma db seed
```

### What Gets Seeded:
- ✅ Platform Admin account
- ✅ 3 Charity accounts (Northern Hospice, Man Utd Foundation, Ocean Conservation)
- ✅ 2 Corporate Donor accounts (Man Utd, TechCorp)
- ✅ 5 Sample impact stories
- ✅ Engagement data (likes, comments, shares)
- ✅ Activity logs

### Verify Seeding:
```bash
cd /home/ubuntu/impactusall_mvp/nextjs_space
node check_users.js
```

---

## 🔄 Password Reset (Future Feature)

### Not Yet Implemented:
- Password reset via email
- "Forgot Password" link
- Temporary password generation
- Account lockout after failed attempts

### To Implement in Future:
1. Add password reset API route
2. Integrate with Resend for emails
3. Add password reset UI
4. Implement secure token generation
5. Add expiry time for reset tokens

---

## 📋 Account Management

### Create New Test Account Manually:
```bash
cd /home/ubuntu/impactusall_mvp/nextjs_space
npx prisma studio
# Navigate to User table
# Click "Add record"
# Fill in: email, hashedPassword (bcrypt hash), role, emailVerified
```

### Hash a Password for Manual Creation:
```javascript
const bcrypt = require('bcryptjs');
const password = 'yourpassword123';
const hashedPassword = bcrypt.hashSync(password, 10);
console.log(hashedPassword);
```

---

## 🆘 Troubleshooting

### Login Not Working?
1. **Check email spelling** (case-sensitive)
2. **Verify database has users:** `cd nextjs_space && node check_users.js`
3. **Re-seed database if empty:** `yarn prisma db seed`
4. **Clear browser cookies** and try again
5. **Check console for errors** (F12 in browser)

### "Invalid credentials" Error?
- Verify user exists in database
- Confirm password hasn't been changed
- Check `NEXTAUTH_SECRET` is set in environment
- Ensure database connection is working

### Can't Access Certain Pages?
- Verify you're logged in with correct role
- Platform Admin pages require `PLATFORM_ADMIN` role
- Charity Dashboard requires `CHARITY_ADMIN` role
- Check middleware.ts for route protection rules

---

## 📝 Adding New Users

### Through Platform Admin UI:
1. Login as Platform Admin
2. Add charity → automatically creates charity admin user
3. Add corporate → automatically creates corporate admin user

### Through Signup Page (Future):
- Not yet implemented
- Will require email verification
- Role assignment based on signup type

### Through Prisma Studio:
```bash
cd /home/ubuntu/impactusall_mvp/nextjs_space
npx prisma studio
# Navigate to User table
# Add manually
```

---

**NOTE:** All passwords in this document are for **DEVELOPMENT/TESTING ONLY**.  
**NEVER use these credentials in production!**

---

**Last Updated:** December 19, 2025  
**Status:** Ready for Testing ✅
