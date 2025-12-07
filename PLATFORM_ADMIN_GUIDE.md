# ImpactusAll Platform Administration Guide

**Last Updated:** December 7, 2025  
**Version:** 1.0  
**Platform:** ImpactusAll MVP

---

## 🎯 Overview

You are the **Platform Administrator** for ImpactusAll. Your role is to manage charity applications, approve legitimate charities, and oversee the platform's growth.

**Your Admin Dashboard:** https://impactusall.abacusai.app/platform-admin

---

## 🔑 Your Admin Credentials

```
Email:    platform@impactusall.com
Password: admin123
Role:     PLATFORM_ADMIN
```

⚠️ **Security Note:** Change these credentials in production!

---

## 📋 Your Responsibilities

### 1. **Review Charity Applications**
Charities sign up via the self-service form at:  
👉 https://impactusall.abacusai.app/charity-signup

You'll see their applications in your dashboard.

### 2. **Verify Legitimacy**
Check each application for:
- ✅ Valid charity registration number (UK format)
- ✅ Professional website
- ✅ Legitimate focus area
- ✅ Contact information

### 3. **Approve or Reject**
Based on your review, you can:
- **Approve** → Charity gets instant access
- **Reject** → Application is declined

---

## 🔄 The Workflow (Visual Guide)

See the attached flowchart: `platform-admin-workflow.png`

### Step-by-Step:

#### **Step 1: Charity Signs Up**
- A charity visits `/charity-signup`
- Fills out registration form with:
  - Charity name
  - Registration number
  - Website URL
  - Location
  - Focus area (e.g., Health, Education, Homelessness)
  - Description
  - Admin contact details (name, email, password)
- Clicks "Submit Application"

#### **Step 2: Application Goes to PENDING**
- System creates:
  - New `Charity` record (status: PENDING)
  - New `User` record (role: CHARITY_ADMIN, not yet verified)
- Charity admin CANNOT log in yet

#### **Step 3: You Review the Application**
- Log into `/platform-admin`
- See all pending applications in a list
- Each shows:
  - Charity name
  - Registration number
  - Website
  - Location
  - Focus area
  - Admin email
  - Current status

#### **Step 4: You Make a Decision**

**Option A: APPROVE** ✅
- Click the green "Approve" button
- System automatically:
  - Sets charity status to `APPROVED`
  - Enables email verification for charity admin
  - Charity admin can NOW log in
  - They get immediate access to `/charity-admin` portal

**Option B: REJECT** ❌
- Click the red "Reject" button
- System sets status to `REJECTED`
- Charity admin still cannot log in
- Application is archived

---

## 🎛️ Using Your Dashboard

### Dashboard Overview

When you log in, you'll see:

1. **Statistics Cards** (Top)
   - 🕒 Pending Applications
   - ✅ Approved Charities
   - ❌ Rejected Applications

2. **Charity Applications List** (Below)
   - Table with all charities
   - Color-coded status badges:
     - 🟡 Yellow = PENDING
     - 🟢 Green = APPROVED
     - 🔴 Red = REJECTED

### Taking Action

**To Approve a Charity:**
1. Find the charity in the PENDING section
2. Review their details carefully
3. Click the green "✓ Approve" button
4. Confirmation message appears
5. Status changes to APPROVED
6. Done! Charity can now log in

**To Reject an Application:**
1. Find the charity in the PENDING section
2. Click the red "✗ Reject" button
3. Confirmation message appears
4. Status changes to REJECTED
5. Done! Application is archived

---

## 📧 What Happens After Approval?

### For the Charity:

1. **Immediate Access**
   - Admin email is verified automatically
   - They can log in at `/login`
   - Credentials they set during signup work immediately

2. **What They Can Do:**
   - Access their Charity Admin Portal (`/charity-admin`)
   - Create impact stories (with AI assistance)
   - Tag corporate donors
   - View donor relationships
   - Track engagement analytics

3. **How to Share Access with Them:**
   Simply tell them:
   ```
   "Your charity has been approved!
   
   You can now log in at:
   https://impactusall.abacusai.app/login
   
   Use the email and password you provided during signup.
   
   Welcome to ImpactusAll!"
   ```

---

## 🔗 Key URLs for Charities

### For New Charities (Not Yet Approved):
- **Sign Up Form:** https://impactusall.abacusai.app/charity-signup

### For Approved Charities:
- **Login Page:** https://impactusall.abacusai.app/login
- **Their Dashboard:** https://impactusall.abacusai.app/charity-admin

---

## 👥 Test Accounts (Already Approved)

The platform comes with test charities already approved:

### Northern Children's Hospice
```
Email:    admin@northernhospice.org.uk
Password: admin123
```

### Manchester United (Corporate Donor)
```
Email:    corporate@manutd.com
Password: corporate123
```

---

## 📊 Platform Statistics

### Current Status:
- ✅ **3 Portals Live:**
  - Portal 1: Charity Admin
  - Portal 2: Corporate Donor
  - Portal 3: Public Impact Hub

- 🏢 **Test Data:**
  - 4 charities (approved)
  - 1 corporate donor (Man United)
  - 4 impact stories published
  - Anonymous engagement enabled

---

## 🛡️ Security & Best Practices

### Do's ✅
- Review each application thoroughly
- Verify registration numbers when possible
- Check charity websites for legitimacy
- Approve charities within 24-48 hours
- Communicate decisions clearly

### Don'ts ❌
- Don't approve without verification
- Don't share admin credentials
- Don't approve duplicate charities
- Don't rush the review process

---

## 🆘 Troubleshooting

### "I can't log in"
- ✅ Use: `platform@impactusall.com` / `admin123`
- ✅ Go to: `/platform-admin` (not `/charity-admin` or `/corporate-dashboard`)

### "Charity says they can't log in after approval"
- ✅ Check their status is APPROVED in your dashboard
- ✅ Confirm they're using correct email/password from signup
- ✅ Tell them to go to `/login` (not `/charity-signup`)

### "How do I give a charity the link?"
- Just share: `https://impactusall.abacusai.app/login`
- They use their signup credentials
- No additional setup needed

---

## 📞 Support

For technical issues or questions:
- **Platform URL:** https://impactusall.abacusai.app
- **Admin Dashboard:** https://impactusall.abacusai.app/platform-admin
- **Architecture Diagram:** See `platform-architecture-diagram.png`
- **Workflow Diagram:** See `platform-admin-workflow.png`

---

## 🎯 Quick Reference

### URLs to Share

| Purpose | URL | Who |
|---------|-----|-----|
| Charity Signup | `/charity-signup` | New charities |
| Login | `/login` | Approved charities |
| Platform Admin | `/platform-admin` | You |
| Charity Dashboard | `/charity-admin` | Approved charities |
| Corporate Dashboard | `/corporate-dashboard` | Corporate donors |
| Public Stories | `/manchester-united` | Everyone |

### Status Flow

```
PENDING → (Your Review) → APPROVED ✅
                        ↘ REJECTED ❌
```

### After Approval

```
Charity Status: APPROVED
↓
Admin Email: Verified
↓
Charity Can: Log In & Create Stories
```

---

**End of Guide**

*For additional help, refer to the MASTER_SPEC_v1.3_UPDATED.md*