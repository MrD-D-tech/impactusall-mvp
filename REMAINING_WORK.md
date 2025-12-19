# 🚧 ImpactusAll MVP - Remaining Work (Priority 2 & 3)

**Last Updated:** December 19, 2025  
**Priority 1 Status:** ✅ COMPLETE  
**This Document:** Complete specifications for all remaining work

---

## 📋 Overview

This document contains **COMPLETE AND DETAILED** specifications for:
- **Priority 2:** Platform Admin Dashboard Overhaul
- **Priority 3:** Charity Admin Portal Enhancements

Every requirement from the user's feedback documents is captured here. **NOTHING IS MISSING.**

---

# 🎯 PRIORITY 2: Platform Admin Dashboard Overhaul

**Estimated Time:** 4-6 weeks  
**Complexity:** HIGH  
**Dependencies:** None (Priority 1 complete)

---

## 2.1 System Health Indicator 🏥

### Current State:
- "System Health: Excellent" text exists but is not prominent
- Located mid-page, easy to miss
- Not actually live/dynamic
- No detail on what makes it "Excellent"
- Not clickable for more information

### Required Changes:

#### A. Visual Prominence
```
MOVE TO TOP OF PAGE (first thing user sees)
  - Directly below page header
  - Above all other boxes/metrics
  - Larger font size (text-2xl)
  - Bold weight
  - Attention-grabbing color coding:
    * GREEN: All systems operational
    * AMBER: Minor issues detected
    * RED: Critical issues requiring attention
```

#### B. Make It Live and Dynamic
```typescript
// Real-time system checks:
const systemHealth = {
  database: checkDatabaseConnection(),
  api: checkAPIEndpoints(),
  s3Storage: checkS3Access(),
  authentication: checkAuthService(),
  email: checkEmailService(),
  charityLogins: checkCharityLoginEndpoints(),
  corporateLogins: checkCorporateDashboardAccess(),
  storyPublishing: checkStoryCreationEndpoints()
};

// Status calculation:
if (all checks pass) → GREEN "System Health: All Operational"
if (some checks fail) → AMBER "System Health: Minor Issues Detected"
if (critical checks fail) → RED "System Health: Critical Issues"
```

#### C. Clickable for Details
```
When clicked:
  - Opens modal/dropdown
  - Shows list of all system components
  - Each component shows:
    * Name (in plain English, not tech jargon)
    * Status (✅ Operational / ⚠️ Issue / ❌ Down)
    * Last checked timestamp
    * Issue description (plain English)
    
Example:
  ✅ Database Connection - Operational (checked 2 mins ago)
  ✅ Charity Admin Login - Operational (checked 5 mins ago)
  ❌ Story Publishing - Down since 1 hour ago
      "The story creation form is not loading properly"
  ⚠️ Email Service - Slow response (checked 10 mins ago)
      "Email delivery taking longer than usual (3-5 mins)"
```

#### D. Plain English Issue Log
```
Requirements:
  - Show recent issues (last 24 hours)
  - Plain English descriptions (NO tech jargon)
  - Timestamps of when issues occurred
  - Timestamps of when issues were resolved
  - Clickable to see more details
  
Example Log Entries:
  [RESOLVED] 2 hours ago: "Charity login page was broken - FIXED"
  [ACTIVE] 1 hour ago: "Story publishing not working - investigating"
  [RESOLVED] Yesterday 3pm: "Image uploads slow - server optimized"
```

### User Story:
> "As Platform Admin, I want to see at a glance if my platform is working. When something goes wrong, I want to understand what's broken in simple terms so I can communicate with clients. I don't need to fix it myself - DeepAgent handles that - but I need to know what's happening."

---

## 2.2 Overdue Payments Tracking 💰

### Current State:
- Overdue payments alert exists
- Too high up on page (feels negative at start of day)
- No separation between charity payments and corporate payments
- Manual invoice tracking is clunky

### Required Changes:

#### A. Move Down the Page
```
CURRENT POSITION: Top of page (feels negative)
NEW POSITION: Move into "Financial Metrics" section
  - Not the first thing you see
  - Still visible but not overwhelming
  - In a "nice box" matching other metric boxes
```

#### B. Separate Categories
```
TWO SEPARATE BOXES:

Box 1: Charity Overdue Payments
  - Shows count of charities behind on payments
  - Clickable to expand and see list
  - Each charity shows:
    * Name
    * Amount overdue (£)
    * Days overdue
    * Last payment date
    * Invoice number
    * Quick action: Mark as Paid / Send Reminder

Box 2: Corporate Overdue Payments
  - Shows count of corporates behind on payments
  - Same functionality as charity box
  - Corporates who are "self-service" (not linked to charity)
```

#### C. Manual Invoice Tracking System
```
PROBLEM: User doesn't want to give access to bank account
SOLUTION: Manual invoice tracking

Features Required:
1. AUTO-GENERATE INVOICE NUMBERS
   - Format: IMP-2025-0001, IMP-2025-0002, etc.
   - Sequential numbering
   - Separate sequences for charities vs corporates (optional)
   - Never duplicate

2. INVOICE STATUS TRACKING
   For each invoice:
     - Invoice number (auto-generated)
     - Client name (charity or corporate)
     - Amount (£)
     - Due date
     - Status:
       * PENDING (not yet paid)
       * PAID (manually marked by Platform Admin)
       * OVERDUE (past due date)
     - Payment date (when marked as paid)
     - Notes field (optional)

3. MANUAL "MARK AS PAID" WORKFLOW
   User clicks "Mark as Paid" button:
     → Modal opens
     → Confirms invoice number and amount
     → Asks for payment date (default: today)
     → Optional notes field
     → Saves payment record
     → Removes from overdue list
     → Updates financial dashboard

4. PAYMENT HISTORY
   View all invoices:
     - Filterable by: Paid / Pending / Overdue
     - Searchable by: Client name, invoice number
     - Sortable by: Date, Amount, Status
     - Exportable to CSV

5. REMINDER SYSTEM
   Send payment reminder email:
     - Click "Send Reminder" button
     - Preview email template
     - Edit message if needed
     - Send via Resend API
     - Log reminder sent date
```

### Alternative Solution Requested by User:
> "I don't want them paying through Stripe etc. Payments are direct to bank account. But I need something where all invoice numbers are created and then I will manually tick off who has paid. That seems very clunky but I don't want you to have access to my account. Is there another way?"

**Developer Response Needed:**
Consider suggesting:
- Open Banking API (read-only access to see incoming payments)
- Accountancy software integration (Xero, QuickBooks)
- CSV import of bank statement (match payments automatically)
- Stripe/PayPal invoice-only mode (no payment processing, just tracking)

---

## 2.3 Total Charities Box Enhancement 📊

### Current State:
- Shows "Total Charities" count
- Status shows "Approved" charities
- No time period context (is this today? this month? all time?)

### Required Changes:

#### A. Time Period Context
```
CURRENT:
  Total Charities: 12
  Approved: 10

NEW:
  Total Charities: 12
  └─ This Month: 3 new (dropdown to see)
  └─ Year to Date: 8 new (dropdown to see)
  
  Active Charities: 10
  └─ This Month: 10 active (dropdown to see)
  └─ Last Month: 9 active (comparison)
```

#### B. Change "Approved" to "Active"
```
REASONING:
  - "Approved" sounds like they're waiting for something
  - "Active" means they're actually using the platform RIGHT NOW
  - More positive and actionable terminology

STATUS OPTIONS:
  - ACTIVE: Charity is onboarded and using platform
  - PENDING: Charity application awaiting approval
  - SUSPENDED: Charity access temporarily disabled
  - INACTIVE: Charity not using platform (but not suspended)
```

#### C. Make It Clickable with Dropdown
```
When clicked:
  Opens dropdown showing:
    
    ACTIVE CHARITIES (10)
      ✅ Northern Hospice - Last activity: 2 hours ago
      ✅ Man Utd Foundation - Last activity: Yesterday
      ✅ Ocean Conservation - Last activity: 3 days ago
      ... (all active charities)
      
    PENDING APPROVAL (1)
      ⏳ New Charity ABC - Submitted: 2 days ago
      
    SUSPENDED (1)
      ⚠️ Inactive Charity XYZ - Suspended: 1 week ago (reason)
      
    [View All Charities Button]
```

#### D. Quick Snapshot Stats
```
In the main box (before dropdown):
  Total Charities: 12
  Active: 10 (83% of total)
  New This Month: 3
  Average Monthly Fee: £350
```

---

## 2.4 Active Donors Box (Corporate Donors) 🏢

### Current State (USER CONFUSION):
> "Active donors: I am not sure if this relates to donors (clients of charities who are using the system) or what."

### Clarification Needed:
The user is confused about what "Active Donors" means. There are TWO types:
1. **Corporate Donors (clients of charities)** - Companies who donate to charities and use the platform via charity
2. **Self-Service Corporates** - Companies who use the platform directly (not through a charity)

### Required Solution:

#### A. Separate Into TWO Distinct Sections

**SECTION 1: Corporate Donors (Charity Clients)**
```
Box 1: Corporate Donors
  Purpose: Shows corporates who are CLIENTS of charities
  
  Display:
    Total Corporate Donors: 5
    └─ This Month: 2 new
    └─ Year to Date: 4 new
    
    Active This Month: 4 (80% engagement)
    └─ Last Month: 3 (comparison)
    
  Clickable Dropdown:
    ACTIVE CORPORATE DONORS (4)
      🏢 Manchester United
         └─ Linked to: Man Utd Foundation
         └─ Last activity: 1 day ago
         └─ Subscription: £1,500/month
      
      🏢 TechCorp Global
         └─ Linked to: Code for Good
         └─ Last activity: 3 days ago
         └─ Subscription: £1,000/month
    
    INACTIVE CORPORATE DONORS (1)
      🏢 Dormant Corp
         └─ Last activity: 30+ days ago
         └─ Action: Send engagement reminder
```

**SECTION 2: Self-Service Corporates**
```
Box 2: Self-Service Corporates
  Purpose: Shows corporates who use platform directly (NO charity)
  
  Display:
    Total Self-Service: 3
    Active This Month: 2
    Creating Stories: 1
    
  Clickable Dropdown:
    ACTIVE SELF-SERVICE CORPORATES (2)
      🏢 Tesco PLC
         └─ Stories Published: 5 this month
         └─ Last activity: Yesterday
         └─ Subscription: £2,000/month
      
      🏢 JP Morgan UK
         └─ Stories Published: 3 this month
         └─ Last activity: 2 days ago
         └─ Subscription: £1,800/month
```

#### B. Positioning
```
NEW LAYOUT ORDER:

Row 1: System Health (top, prominent)

Row 2: Business Snapshot
  - Total Charities (with dropdown)
  - Corporate Donors (with dropdown)
  - Self-Service Corporates (with dropdown)

Row 3: Financial Metrics
  - Monthly Revenue (see section 2.5)
  - Annual Revenue (see section 2.5)
  - Overdue Payments (see section 2.2)
```

---

## 2.5 Revenue Metrics Enhancement 💷

### Current State:
- Shows "Monthly Revenue" with dollar sign ($)
- No breakdown by client type
- No comparison to previous periods

### Required Changes:

#### A. Fix Currency Symbol
```
CURRENT: $ (US Dollar)
REQUIRED: £ (British Pound)

All financial displays must use £:
  - Revenue boxes
  - Invoice amounts
  - Subscription fees
  - Payment tracking
```

#### B. Revenue Breakdown Boxes
```
CREATE TWO REVENUE BOXES (side by side):

Box 1: Charity Revenue
  This Month: £4,200
  └─ Last Month: £3,800 (+10.5% ↑)
  └─ Year to Date: £38,400
  └─ Annual Recurring: £48,000
  
  Clickable dropdown:
    CHARITY BREAKDOWN
      Northern Hospice: £300/month (paid ✅)
      Man Utd Foundation: £500/month (paid ✅)
      Ocean Conservation: £250/month (overdue ⚠️)
      ... (all charities)
    
    [View Detailed Report]

Box 2: Corporate Revenue
  This Month: £8,500
  └─ Last Month: £7,200 (+18.1% ↑)
  └─ Year to Date: £76,800
  └─ Annual Recurring: £102,000
  
  Clickable dropdown:
    CORPORATE BREAKDOWN
      Manchester United: £1,500/month (paid ✅)
      TechCorp Global: £1,000/month (paid ✅)
      Tesco PLC: £2,000/month (self-service, paid ✅)
      ... (all corporates)
    
    [View Detailed Report]
```

#### C. Combined Revenue Box
```
Box 3: Total Platform Revenue
  This Month: £12,700
  └─ Last Month: £11,000 (+15.5% ↑)
  
  Year to Date: £115,200
  └─ Target: £150,000 (77% achieved)
  
  Annual Recurring Revenue (ARR): £150,000
  └─ Growth Rate: +24% year-over-year
  
  Clickable for detailed breakdown:
    - Revenue by month (chart)
    - Revenue by client type (pie chart)
    - Projected revenue (trend line)
    - Churn rate
    - New vs. existing revenue
```

#### D. Visual Enhancements
```
Required:
  - Trend arrows (↑ green for growth, ↓ red for decline)
  - Comparison percentages
  - Mini line charts showing trend
  - Color coding:
    * Green: Meeting/exceeding targets
    * Amber: Slightly below targets
    * Red: Significantly below targets
```

---

## 2.6 Engagement Metrics 📈

### Current State:
- "Total Engagement" box exists
- No breakdown by charity vs corporate
- No active/inactive split
- No reference points for performance

### Required Changes:

#### A. Charity Engagement Row
```
Create TWO boxes in one row:

Box 1: Charity Story Activity
  Active This Month: 8 / 12 charities (67%)
  └─ Last Month: 6 / 12 (50%) - Improving ↑
  
  Stories Published: 24 this month
  └─ Average per charity: 3 stories
  └─ Top performer: Man Utd Foundation (8 stories)
  
  Clickable dropdown:
    ACTIVE CHARITIES (writing stories this month)
      ✅ Northern Hospice: 5 stories
         └─ Last story: 2 days ago
         └─ [Click to view their stories]
      
      ✅ Man Utd Foundation: 8 stories
         └─ Last story: Yesterday
         └─ [Click to view their stories]
      
      ✅ Ocean Conservation: 3 stories
         └─ Last story: 5 days ago
         └─ [Click to view their stories]
      
      ... (all active charities)
    
    INACTIVE CHARITIES (NO stories this month)
      ❌ Dormant Charity ABC
         └─ Last story: 45 days ago
         └─ [Send reminder email]
         └─ [View their profile]
      
      ❌ Quiet Charity XYZ
         └─ Last story: 60 days ago
         └─ [Human intervention needed]
    
    [View All Charity Story Pages]

Box 2: Total Story Engagement
  Total Stories: 24 this month
  └─ Last Month: 18 (+33% ↑)
  └─ Year to Date: 210 stories
  
  Engagement Performance:
    High Performing: 8 stories (1,000+ engagements)
    Medium: 12 stories (500-999 engagements)
    Low: 4 stories (<500 engagements)
    
  Reference Points:
    Current Month vs Last Month: +33%
    Current Month vs Same Month Last Year: +120%
    Year to Date vs Target: 210 / 300 (70%)
  
  Clickable dropdown:
    ALL STORIES (sorted by engagement)
      1. "Impact Story Title 1" - 2,500 engagements
         └─ By: Northern Hospice
         └─ Published: 5 days ago
         └─ Likes: 1,200 | Comments: 300 | Shares: 1,000
         └─ [Click to view story]
         └─ [See why this performed well]
      
      2. "Impact Story Title 2" - 1,800 engagements
         ...
      
      ... (all stories, worst performers at bottom)
      
    FILTERS:
      - By charity
      - By date range
      - By engagement level
      - By corporate donor (if linked)
    
    [Export to CSV]
```

#### C. Corporate Donor Engagement Row (Self-Service)
```
Create ANOTHER ROW for self-service corporates:

Box 3: Corporate Story Activity
  Active This Month: 2 / 3 corporates (67%)
  
  Stories Published: 8 this month
  └─ Average per corporate: 4 stories
  └─ Top performer: Tesco PLC (5 stories)
  
  Clickable dropdown:
    Similar structure to charity engagement
    But shows self-service corporates creating their own content
```

---

## 2.7 Recent Activity Feed 📝

### Current State:
- Recent activity list is visible on main page
- Takes up a lot of space
- User wants it hidden unless clicked

### Required Changes:

#### A. Move to Collapsible Box
```
CURRENT: Full activity list always visible

NEW: Collapsed box that expands on click
  
  [Recent Activity ▼] (collapsed by default)
  └─ "10 new activities - Click to view"
  
  When clicked:
  [Recent Activity ▲] (expanded)
  └─ Full activity list appears
  └─ [Close] button to collapse again
```

#### B. Activity Feed Features
```
Required:
  - Last 50 activities
  - Real-time updates (refresh every 30 seconds)
  - Filterable by:
    * Activity type (created, updated, deleted)
    * User role (platform admin, charity admin, corporate)
    * Date range
  - Searchable by keyword
  - Timestamps (e.g., "2 hours ago", "Yesterday")
  - User-friendly descriptions:
    
    Examples:
    ✅ "Northern Hospice published a new story"
       2 hours ago
    
    ✅ "Platform Admin added new charity 'Test Charity ABC'"
       Yesterday at 3:45 PM
    
    ✅ "Manchester United viewed their impact dashboard"
       5 minutes ago
    
    ❌ NOT: "User #123 executed INSERT query on story table"
    ✅ YES: "Man Utd Foundation published new story"
```

---

## 2.8 Everything Must Be Live and Dynamic 🔄

### Critical Requirement:
> "Everything on this page needs to be live and dynamic"

### What This Means:

#### A. No Static/Fake Data
```
WRONG:
const totalCharities = 12; // Hard-coded number

RIGHT:
const totalCharities = await prisma.charity.count({
  where: { status: 'ACTIVE' }
});
```

#### B. Real-Time Updates
```
Required:
  - Dashboard refreshes data every 60 seconds (auto-refresh)
  - "Last updated: 2 minutes ago" timestamp
  - Manual refresh button
  - Real-time WebSocket updates for critical metrics (optional)
```

#### C. Database-Driven Everything
```
All metrics must pull from database:
  ✅ Charity count → count from Charity table
  ✅ Active charities → where status = 'ACTIVE'
  ✅ Revenue → sum from Subscription table
  ✅ Stories → count from Story table where status = 'PUBLISHED'
  ✅ Engagement → sum of likes, comments, shares from respective tables
  ✅ Overdue payments → join Subscription + Invoice tables, filter by dueDate
```

---

## 2.9 Manager-Specific Views 👥

### Future Requirement:
> "We will have different managers who will have access to the god platform... so eventually, they will be able to see what I see but for their business. I should also be able to see by manager."

### Specification:

#### A. Manager Role Definition
```
NEW ROLE: ACCOUNT_MANAGER

Permissions:
  - View assigned charities only (not all charities)
  - View assigned corporates only
  - Create/edit stories for assigned clients
  - View financial data for assigned clients only
  - Cannot access system settings
  - Cannot add/delete users
  - Cannot suspend accounts
```

#### B. Manager Assignment System
```
Database Schema:
  User {
    role: ACCOUNT_MANAGER
    managerId: String (unique identifier)
  }
  
  Charity {
    assignedManagerId: String (links to User.managerId)
  }
  
  Donor {
    assignedManagerId: String (links to User.managerId)
  }

UI for Platform Admin:
  - Assign manager to charity (dropdown)
  - Assign manager to corporate (dropdown)
  - View "Manager Portfolio" page:
    * Shows all managers
    * Shows clients assigned to each
    * Shows performance metrics per manager
```

#### C. Manager Dashboard
```
When Account Manager logs in:
  - See dashboard filtered to ONLY their assigned clients
  - Metrics show:
    * My Charities: 5
    * My Corporates: 3
    * My Revenue: £8,500/month
    * My Engagement: 45 stories this month
  
  - Cannot see other managers' clients
  - Cannot see total platform metrics
```

#### D. Platform Admin View By Manager
```
Platform Admin dashboard gains new feature:
  
  [Filter by Manager ▼]
  └─ All Managers (default)
  └─ Manager: John Smith
  └─ Manager: Jane Doe
  └─ Unassigned Clients
  
  When filtered:
    - All metrics filter to that manager's portfolio
    - Revenue shows only that manager's clients
    - Can compare managers' performance side-by-side
```

---

## 2.10 Branding and Visual Design 🎨

### Current State:
- Functional but not inspiring
- Generic UI
- User wants to feel inspired when logging in

### User Requirement:
> "Like the log in page, lets make this look inviting, modern, branded impactusall, I will provide a logo when we are ready... I want to log in and be inspired by my business."

### Required Changes:

#### A. Visual Design Overhaul
```
Design System:
  - Primary Color: (User to provide - something inspiring/professional)
  - Secondary Color: (Complementary color)
  - Accent Color: (For CTAs and highlights)
  - Typography: Modern sans-serif (Inter, Poppins, or similar)
  
Visual Elements:
  - Gradient backgrounds (subtle)
  - Glassmorphism effects on cards
  - Smooth animations (fade-in, slide-up)
  - Micro-interactions (hover effects, button animations)
  - Icons: Phosphor Icons or Lucide Icons (modern, consistent)
  
Layout:
  - Generous whitespace
  - Clear visual hierarchy
  - Card-based layout (elevated shadows)
  - Consistent spacing (8px grid system)
```

#### B. Logo Integration
```
Logo Placement:
  - Top left corner (always visible)
  - Sidebar (if implemented)
  - Login page
  - All printed reports
  - Email templates

Logo Specifications:
  - SVG format (scalable)
  - Light and dark versions
  - Minimum size: 120px width
  - Clear space around logo
```

#### C. Inspiring Dashboard Elements
```
Add:
  - Motivational header message:
    "Good morning, [Name]! Your platform is helping 12 charities make a difference."
  
  - Success highlights:
    "🎉 This month's wins:
     - 3 new charities onboarded
     - 24 impact stories published
     - 10,500 lives reached through your platform"
  
  - Progress visualizations:
    - Circular progress bars (elegant)
    - Trend line charts (smooth animations)
    - Achievement badges
  
  - Positive color psychology:
    - Green for growth, success
    - Blue for trust, stability
    - Avoid red except for urgent issues
```

---

## 2.11 "Am I Missing Anything?" Analysis 🤔

### User Question:
> "Do you think I am missing anything on this admin page? This is how I manage the business. This is running in the background all day on a separate screen so I can just glance and think all is well."

### Additional Recommendations:

#### A. Quick Actions Panel (CRITICAL)
```
Add: Floating quick actions button (always visible)

Suggested Actions:
  ✚ Add New Charity
  ✚ Add New Corporate
  📧 Email All Charities
  📧 Email All Corporates
  📊 Generate Monthly Report
  ⚙️ System Settings
  🔔 View Notifications
```

#### B. Notifications Center
```
Add: Bell icon in top right (like social media)

Shows:
  - New charity applications
  - Overdue payments requiring attention
  - Stories awaiting moderation
  - System health alerts
  - Client messages/support tickets

Badge count on icon shows unread notifications
```

#### C. Search Functionality
```
Add: Global search bar

Search for:
  - Charities by name
  - Corporates by name
  - Stories by title/content
  - Users by email/name
  - Invoices by number
  - Activity log entries

Keyboard shortcut: Cmd+K / Ctrl+K
```

#### D. Shortcuts/Favorites
```
Add: Customizable shortcuts

User can pin frequently used pages:
  - Financial Report
  - Charity List
  - Story Moderation Queue
  - Payment Tracking

Shortcuts appear as quick access tiles
```

#### E. Platform Performance Metrics
```
Add: Technical health metrics (collapsible)

Shows:
  - Average page load time
  - API response times
  - Database query performance
  - Error rate (last 24 hours)
  - Uptime percentage

Purpose: Early warning of technical issues
```

#### F. Client Satisfaction Metrics
```
Add: "Client Health Score" (future phase)

Shows:
  - Charities at risk of churning
  - NPS scores (Net Promoter Score)
  - Support ticket resolution time
  - Feature adoption rates

Purpose: Proactive client retention
```

---

# 🏥 PRIORITY 3: Charity Admin Portal Enhancements

**Estimated Time:** 3-4 weeks  
**Complexity:** MEDIUM  
**Dependencies:** Priority 2 should be complete first

---

## 3.1 Revenue YTD Box 💰

### Current State:
- Charity dashboard has basic metrics
- No revenue visibility for charity

### User Requirement:
> "I want a box that is clickable that shows revenue ytd…this should click to the donor company page"

### Required Implementation:

#### A. Revenue YTD Box
```
Box Position: First line of boxes (top left)

Display:
  Revenue from Donors: £45,000 YTD
  └─ This Month: £5,000
  └─ Last Month: £4,200 (+19% ↑)
  └─ Average per Donor: £15,000
  
  Corporate Donors: 3
  └─ Largest Contributor: Manchester United (£25,000)
  
Clickable: YES
```

#### B. Drill-Down to Donor Pages
```
When clicked:
  Opens "Donor Revenue Breakdown" page
  
  Shows:
    Corporate Donor #1: Manchester United
      ├─ Total Revenue YTD: £25,000
      ├─ Monthly Contribution: £2,083/month (12 months)
      ├─ Stories Created for Them: 15
      ├─ Engagement Generated: 8,500 total
      ├─ [View Their Impact Page] (takes to manchester-united.impactusall.com)
      └─ [Create Story for This Donor]
    
    Corporate Donor #2: TechCorp Global
      ├─ Total Revenue YTD: £12,000
      ├─ ...
    
    Corporate Donor #3: Local Business Ltd
      ├─ Total Revenue YTD: £8,000
      ├─ ...
```

---

## 3.2 Number of Donors Box 🏢

### User Requirement:
> "I want a box that shows the number of donors…drop down"

### Required Implementation:

#### A. Donors Count Box
```
Box Position: Next to Revenue YTD box

Display:
  Corporate Donors: 3
  └─ Active This Month: 2 (67%)
  └─ New This Quarter: 1
  
  Engagement Status:
  ✅ Fully Engaged: 2 (created stories this month)
  ⚠️ Needs Attention: 1 (no stories for 2 months)
```

#### B. Dropdown Functionality
```
When clicked:
  Expands to show list of all donors:
  
  ACTIVE DONORS (2)
    🏢 Manchester United
       ├─ Monthly: £2,083
       ├─ Last Story: 5 days ago
       ├─ Engagement: High (✅ 100%)
       └─ [View Profile] [Create Story]
    
    🏢 TechCorp Global
       ├─ Monthly: £1,000
       ├─ Last Story: 12 days ago
       ├─ Engagement: Medium (✅ 85%)
       └─ [View Profile] [Create Story]
  
  NEEDS ATTENTION (1)
    ⚠️ Local Business Ltd
       ├─ Monthly: £667
       ├─ Last Story: 60 days ago (!)
       ├─ Engagement: Low (❌ 0% this month)
       ├─ [Send Reminder Email] [View Profile]
       └─ Suggested: Create monthly story to re-engage
```

---

## 3.3 Donor Engagement Tracking 📊

### User Requirement:
> "I want donor engagement…it should show a monthly total % for all donors and then a drop down for each donor…what I am trying to achieve is that this is a check for the charity to see that we are not at 100% engagement this month, and then dig into the donors to see that they have not created a story for xyz charity…stories should be monthly"

### Purpose:
- Charities should create at least ONE story per month for each donor
- 100% engagement = every donor got their monthly story
- Dashboard should flag when charity is falling behind

### Required Implementation:

#### A. Engagement Score Box
```
Box Position: First line, after donors box

Display:
  Donor Engagement: 67% this month
  └─ On Track: 2 / 3 donors
  └─ Behind Schedule: 1 donor (needs story)
  
  Visual:
    - Progress circle showing 67%
    - Color coded:
      * Green (100%): All donors have their monthly story
      * Amber (60-99%): Some donors need attention
      * Red (<60%): Multiple donors need stories urgently
  
  Target: 100% monthly
```

#### B. Engagement Breakdown Dropdown
```
When clicked:
  Expands to show per-donor engagement:
  
  DONORS ON TRACK (2/3) ✅
    Manchester United - 100%
      ├─ Stories This Month: 2 ✅
      ├─ Target: Min 1 per month
      ├─ Last Story: 5 days ago
      ├─ Status: On track ✅
      └─ [Create Another Story]
    
    TechCorp Global - 100%
      ├─ Stories This Month: 1 ✅
      ├─ Target: Min 1 per month
      ├─ Last Story: 12 days ago
      ├─ Status: On track ✅
      └─ [View Story]
  
  DONORS NEED ATTENTION (1/3) ⚠️
    Local Business Ltd - 0%
      ├─ Stories This Month: 0 ❌
      ├─ Target: Min 1 per month
      ├─ Last Story: 60 days ago
      ├─ Days Since Last Story: 60 (!)
      ├─ Status: URGENT - Story overdue
      ├─ [Send Email Reminder to Brand]
      └─ [Create Story Now]
```

#### C. Email Reminder System
```
When charity clicks "Send Email Reminder to Brand":
  
  Opens email composer with pre-filled template:
    
    To: corporate@business.com
    From: Northern Hospice (via ImpactusAll)
    Subject: Your Monthly Impact Story is Ready to Share
    
    Hi [Corporate Contact Name],
    
    Hope you're well! 
    
    We're preparing this month's impact story showing the 
    amazing difference your donation to [Charity Name] is making.
    
    We're ready to create your story - it would be great to 
    share your impact with your team and customers this month.
    
    [Create Our Story Button]
    
    Let me know if you'd like any specific focus areas or 
    people featured this month.
    
    Best regards,
    [Charity Admin Name]
    [Charity Name]
  
  Charity can:
    - Edit the message
    - Schedule send (now or later)
    - Preview email
    - Send email
    - Email sent log saved
  
  After sending:
    - Engagement % updates (email counts as outreach)
    - "Email sent 5 mins ago" shows in dropdown
    - Reminder can't be sent again for 7 days (prevents spam)
```

---

## 3.4 Enhanced Story Creation Guidance 📝

### User Feedback:
> "Re the instructions on how to create a story: Let's give them a link to an amazing story that has lots of likes shares etc and explain why this has been successful. Then I would explain that AI will do most of the leg work once you fill in a few details"

### Required Implementation:

#### A. Story Success Examples Section
```
NEW PAGE: /charity-dashboard/story-guidelines

Contains:
  
  SECTION 1: What Makes a Great Impact Story?
    
    Example Story #1: "Sarah's Journey" (Northern Hospice)
      [Embedded story preview]
      
      Why This Performed Well:
      ✅ Personal story with real person (with consent)
      ✅ Specific impact: "12 weeks of care" not "helped someone"
      ✅ Emotional connection: Sarah's quote about feeling supported
      ✅ Professional photo of Sarah (with permission)
      ✅ Clear timeline showing progress
      ✅ Corporate donor mentioned: "Thanks to Manchester United Foundation"
      ✅ Call-to-action: "See how your support makes a difference"
      
      Engagement Stats:
      - 2,500 total engagements
      - 1,200 likes
      - 300 comments
      - 1,000 shares
      - Reached 15,000 people
      
      [Read Full Story] [Use This as Template]
    
    Example Story #2: [Another successful story]
    
    Example Story #3: [Another successful story]
```

#### B. Best Practices Guide
```
SECTION 2: Impact Story Best Practices

✅ DO:
  - Use real names (with consent)
  - Include high-quality photos
  - Be specific with numbers (12 meals, 3 months, etc.)
  - Show before/after or timeline
  - Include quotes from beneficiaries
  - Link impact to corporate donor
  - Write in accessible language (no jargon)
  - Keep it concise (300-500 words)

❌ DON'T:
  - Use stock photos
  - Be vague ("helped many people")
  - Write long paragraphs (break into short sections)
  - Use charity jargon
  - Forget to get consent
  - Make it feel like fundraising ask
  - Over-dramatize or exploit suffering

KEY ELEMENTS:
  1. Engaging Title (emotional but respectful)
  2. Opening Hook (grab attention in first line)
  3. The Challenge (what problem were they facing?)
  4. Your Intervention (what did charity do?)
  5. The Impact (specific, measurable outcome)
  6. Beneficiary Voice (their words, their experience)
  7. Corporate Connection (thank donor, show their impact)
  8. What's Next (future support, ongoing journey)
```

#### C. AI Story Generator Enhancement
```
IMPROVE: Current AI generator page

Add clear explanation:
  
  "✨ AI Story Assistant
  
  Our AI will help you write a compelling impact story in minutes.
  
  HOW IT WORKS:
  1. You provide the key facts (who, what, when, impact numbers)
  2. AI generates a professional, engaging story
  3. You review and edit to add personal touches
  4. Publish or save as draft
  
  All you need:
  ✅ Beneficiary name (with consent)
  ✅ What challenge they faced
  ✅ How you helped
  ✅ Specific impact (numbers, timeframes)
  ✅ Any quotes from beneficiary
  
  Time to complete: ~10 minutes (AI does the heavy lifting!)
  "
  
  [Start AI Story Generator] [Create Manually Instead]
```

#### D. Clear AI vs Manual Choice
```
On story creation page:
  
  Two distinct options (cards):
  
  OPTION 1: Use AI Story Generator (Recommended ✨)
    "Let AI help you write a great story in 10 minutes"
    [Use AI Generator] button
  
  OPTION 2: Write Manually
    "You prefer writing yourself? Go ahead!"
    [Manual Editor] button
  
NOT: Confusing mix where it's unclear if AI is being used
```

---

## 3.5 Volunteer Day Story Type 🤝

### User Requirement:
> "Can we also have an option and backend for creating a story about the time the donor company came to the shelter and volunteered for a day…that whole narrative is very powerful."

### Purpose:
- Different story type focused on corporate volunteering
- Captures team-building / hands-on involvement
- Shows corporate culture and values
- Powerful content for corporate to share with employees

### Required Implementation:

#### A. Story Type Selection
```
When creating new story:
  
  STEP 1: Choose Story Type
  
  📖 Impact Story (default)
     "Tell the story of a beneficiary and the impact made"
     [Select This Type]
  
  🤝 Volunteer Day Story (new!)
     "Showcase a corporate team's volunteer day at your charity"
     [Select This Type]
  
  📊 Impact Report
     "Share monthly/quarterly impact metrics"
     [Select This Type]
```

#### B. Volunteer Day Story Template
```
FORM FIELDS (specific to volunteer day):

1. Volunteer Day Details:
   - Corporate/Company Name*
   - Date of Volunteer Day*
   - Number of Volunteers*
   - Activities Undertaken* (checkboxes + other)
     ☐ Fundraising event
     ☐ Building/maintenance work
     ☐ Gardening/outdoor work
     ☐ Packing donations
     ☐ Mentoring beneficiaries
     ☐ Administrative support
     ☐ Other: _______
   
2. Impact of the Day:
   - Hours Contributed* (auto-calculate: volunteers × hours)
   - Tasks Completed* (e.g., "Painted 3 rooms, sorted 500 donations")
   - Monetary Value of Work* (estimated value in £)
   - Beneficiaries Impacted* (number)

3. Human Elements:
   - Team Leader Name (optional)
   - Notable Moments (text area: "What stood out? Any special moments?")
   - Volunteer Quotes* (at least one)
   - Charity Staff Quote (optional)

4. Media:
   - Group Photos* (volunteers in action - consent required)
   - Before/After Photos (if applicable)
   - Video Clips (optional)

5. Corporate Message:
   - Why They Volunteered (dropdown)
     * Team building
     * Give back to community
     * Company values
     * Employee engagement
     * Other
   - Corporate Representative Quote (optional)
   - What They Learned/Took Away (text area)

AI GENERATED SECTIONS:
  ✨ "Story Opening" - AI writes engaging intro
  ✨ "Day Narrative" - AI crafts story of the day
  ✨ "Impact Summary" - AI creates compelling conclusion
  
  Charity can edit all AI-generated content
```

#### C. Volunteer Day Story Display Template
```
PUBLIC VIEW FORMAT:

[Hero Image: Group photo of volunteers]

Title: "Manchester United Team Volunteer Day at Northern Hospice"
Subtitle: "15 staff members dedicated their day to making a difference"
Date: March 15, 2025

SECTION 1: Introduction
  "On a sunny March morning, 15 enthusiastic team members from 
   Manchester United Foundation rolled up their sleeves to spend 
   the day volunteering at Northern Hospice..."

SECTION 2: The Day in Action
  - Photos gallery (grid layout)
  - Activities undertaken
  - Impact metrics (hours, tasks, value)

SECTION 3: Volunteer Voices
  💬 Quote from team leader
  💬 Quote from volunteer
  💬 Quote from charity staff

SECTION 4: The Impact
  "In just one day, the team accomplished:
   ✅ 120 hours of volunteer time
   ✅ Painted and refreshed 3 patient rooms
   ✅ Sorted and organized 500 donation items
   ✅ Estimated value: £2,400
   ✅ Directly impacted 12 patients"

SECTION 5: What It Meant
  💬 Corporate representative: "This day reminded our team why 
     we're proud to support Northern Hospice..."

SECTION 6: Thank You
  "Thank you Manchester United Foundation for not just your 
   financial support, but for showing up and making a hands-on 
   difference. Your team's energy and compassion brightened 
   the lives of our patients and staff."

[Share This Story] [Download Report]
```

#### D. Corporate Sharing Benefits
```
FOR CORPORATE DASHBOARD (Phase 2):
  Volunteer day stories have special features:
  
  📊 Generate "Volunteer Impact Report" PDF
     - Professional branded document
     - Photos from the day
     - Impact metrics
     - Quotes from team
     - Perfect for:
       * Internal newsletters
       * Employee onboarding
       * CSR reports
       * Recruitment materials

  📱 Social Media Share Kit
     - Pre-written posts
     - Branded graphics
     - Photo carousel
     - Hashtags
     - LinkedIn, Twitter, Facebook formats

  📧 Employee Email Template
     "Thank you to everyone who participated in our volunteer day..."
```

---

## 3.6 Impact Metrics Enforcement 📊

### User Feedback:
> "Impact Metrics (Optional) is not optional..here is a big question…what happens if the metrics are not there…ie 10 donkeys saved from slaughter…how can we make that happen"

### Problem:
- Currently "Impact Metrics" field is marked optional
- But impact stories need measurable outcomes
- Some impacts are hard to quantify (e.g., emotional support)

### Required Solution:

#### A. Make Impact Metrics REQUIRED
```
RULE: Every published story MUST have impact metrics

Form Validation:
  Before publishing:
    ✅ At least ONE impact metric must be provided
    ❌ Cannot publish without metrics
    ℹ️ Can save as draft without metrics

Error Message:
  "Impact metrics are required before publishing. Please add at 
   least one measurable outcome to show the impact of this story."
```

#### B. Flexible Metric Types
```
SOLUTION: Different types of metrics for different stories

QUANTITATIVE METRICS (numbers):
  - People helped: ___
  - Meals provided: ___
  - Weeks of care: ___
  - Animals saved: ___
  - Hours of support: ___
  - Items donated: ___
  - Money raised: £___

QUALITATIVE METRICS (descriptions):
  - Quality of life improvements:
    "Sarah went from struggling daily to living independently"
  
  - Emotional impact:
    "Family reported feeling 'significantly less stressed' 
     after receiving support"
  
  - Milestone achievements:
    "3 children returned to school after 6 months absence"

TIME-BASED METRICS:
  - Duration: "12 weeks of ongoing care"
  - Frequency: "Daily visits for 3 months"
  - Timeline: "From diagnosis to recovery (6 months)"

REQUIREMENT: 
  Story must have EITHER:
    - At least 2 quantitative metrics, OR
    - At least 1 quantitative + 1 qualitative metric, OR
    - Compelling qualitative description + time frame
```

#### C. Metric Suggestions by Story Type
```
AI ASSISTANCE:

Based on charity type, suggest relevant metrics:

For Hospices:
  📊 Suggested metrics:
     - Weeks/months of care provided
     - Family members supported
     - Pain management improvement
     - Quality of life score (before/after)
     - Counseling sessions provided

For Animal Charities:
  📊 Suggested metrics:
     - Animals rescued
     - Days in rehabilitation
     - Animals rehomed
     - Veterinary procedures performed
     - Lives saved

For Youth Charities:
  📊 Suggested metrics:
     - Young people supported
     - Hours of mentoring
     - Skills gained
     - Qualifications achieved
     - Employment outcomes

For Homeless Charities:
  📊 Suggested metrics:
     - People housed
     - Nights of shelter provided
     - Meals served
     - Support sessions attended
     - People moved into permanent housing
```

#### D. "Hard to Quantify" Guidance
```
NEW HELP SECTION: "What if the impact is hard to measure?"

Guidance:
  "Some impacts are deeply personal and difficult to quantify. 
   Here's how to handle that:
  
  INSTEAD OF: Vague statements
    ❌ "Made a difference"
    ❌ "Helped improve things"
  
  USE: Specific descriptive outcomes
    ✅ "Reduced hospital visits from 3 per week to 1 per month"
    ✅ "Enabled independence: now managing own medication"
    ✅ "Family reunification: child returned home after 8 weeks"
  
  TECHNIQUES:
  
  1. Before/After Comparisons
     "Before: Isolated, no social contact
      After: Attends group sessions 2x weekly, made 3 friends"
  
  2. Professional Assessments
     "Occupational therapist rated mobility improvement as 
      'significant' - from wheelchair-bound to walking with aid"
  
  3. Self-Reported Outcomes
     "On a scale of 1-10, patient rated their wellbeing:
      Before support: 3/10
      After support: 8/10"
  
  4. Milestone Achievements
     "First time leaving house in 6 months"
     "First full night's sleep in a year"
     "Returned to work part-time after long absence"
  
  5. Time Frames
     Even if number is vague, time adds context:
     "Ongoing support for 3 months"
     "Weekly visits throughout 12-week recovery"
```

---

## 3.7 Image Upload UX Improvements 🖼️

### User Feedback:
> "Uploading pics…no one will know what the word placeholder image means"

### Problem:
- "Placeholder image" is developer jargon
- Confusing for charity admin users
- Unclear what to do

### Required Changes:

#### A. Clear Upload Instructions
```
REPLACE: "Placeholder image"

WITH: User-friendly instructions

Upload Area (before image uploaded):
  
  [📸 Dashed Border Box]
  
  Click to Upload Photo
  or drag and drop here
  
  Recommended:
  • High quality photos
  • People's faces visible (with consent)
  • Well-lit, in focus
  • Minimum 1200px wide
  
  Supported: JPG, PNG, WebP (max 10MB)

Upload Area (while uploading):
  
  [Loading Spinner]
  Uploading... 45%

Upload Area (after uploaded):
  
  [Image Preview]
  
  ✅ Photo uploaded successfully!
  
  [Change Photo] [Remove]
```

#### B. Multiple Image Upload
```
For stories with multiple images:

IMAGE UPLOAD SECTION:

  Story Photos (3-8 images recommended)
  
  [Image 1] [Image 2] [Image 3] [Add More +]
  
  Each image box shows:
    - Thumbnail preview
    - Remove button
    - Drag handle (to reorder)
    - Upload progress
    - "Featured image" checkbox (for main image)
  
  Tips:
  💡 First image will be the main thumbnail
  💡 Drag to reorder images
  💡 Add captions to provide context
```

#### C. Image Guidelines Popup
```
Add: [Image Guidelines] link

Opens modal with:
  
  📸 Photo Guidelines for Impact Stories
  
  GOOD PHOTOS:
  ✅ Show people (with consent)
  ✅ Action shots (activities happening)
  ✅ Smiling faces (when appropriate)
  ✅ Clear, well-lit, in-focus
  ✅ High resolution (1200px+ wide)
  ✅ Authentic moments (not staged)
  
  AVOID:
  ❌ Dark, blurry, or pixelated photos
  ❌ Stock photos (use real photos)
  ❌ Photos without consent
  ❌ Overly staged / awkward poses
  ❌ Distracting backgrounds
  
  CONSENT REMINDER:
  Every person identifiable in photos must have given
  written consent for their image to be used.
  
  [Download Consent Form] [Close]
```

---

## 3.8 Story Settings Clarification ⚙️

### User Feedback:
> "What does story settings mean?"

### Problem:
- "Story Settings" section unclear
- Users don't know what to configure

### Required Solution:

#### A. Rename Section
```
REPLACE: "Story Settings"

WITH CLEARER NAMES:

Option 1: "Visibility & Sharing"
Option 2: "Story Options"
Option 3: "Publication Settings"

Use: "Visibility & Sharing" (most descriptive)
```

#### B. Clear Setting Options
```
VISIBILITY & SHARING SECTION:

📌 Story Visibility
   Who can see this story?
   
   ○ Public (Recommended)
     Anyone can view on your public impact hub
     ✅ Best for engagement and reach
   
   ○ Private - Donor Only
     Only [Corporate Name] can view
     Use when: Story contains sensitive information
   
   ○ Private - Internal Only
     Only charity staff can see
     Use for: Draft stories, internal reviews

📌 Sharing Settings
   
   ☑ Allow social media sharing
      Readers can share on Facebook, Twitter, LinkedIn
   
   ☑ Allow comments
      Readers can comment on this story
   
   ☑ Show on corporate donor dashboard
      [Corporate Name] will see this on their dashboard
   
   ☐ Feature this story
      Pin to top of your impact hub (max 3 featured)

📌 Corporate Donor
   Which donor is this story about?
   
   [Dropdown: Select corporate donor]
   * Manchester United Foundation
   * TechCorp Global
   * None (general charity story)
   
   This links the story to the donor's impact page

📌 Story Category (Optional)
   [Dropdown]
   * Beneficiary Story
   * Volunteer Day
   * Impact Report
   * Milestone Achievement
   * Community Event
```

---

## 3.9 Social Media Sharing Integration 📱

### User Feedback:
> "Where does the charity share these stories on its own socials"

### Problem:
- No social media integration
- Charities can't easily share to their social accounts
- Missing a key distribution channel

### Required Implementation:

#### A. Social Share Buttons
```
ON STORY VIEW PAGE:

Add prominent "Share" section:

  📱 Share This Story
  
  [Share on Facebook]
  [Share on Twitter]
  [Share on LinkedIn]
  [Copy Link]
  [Download as PDF]

Each button:
  - Pre-fills post with story title, summary, link
  - Includes compelling call-to-action
  - Uses charity's branding
  - Tracks click/share analytics
```

#### B. Charity Social Media Management
```
NEW SECTION: /charity-dashboard/social-media

Purpose: Manage charity's social media accounts

CONNECT ACCOUNTS:
  [Connect Facebook Page]
  [Connect Twitter Account]
  [Connect LinkedIn Page]
  [Connect Instagram] (future)

FEATURES:

1. One-Click Publishing
   When charity publishes story:
     ☑ Also post to Facebook
     ☑ Also post to Twitter
     ☑ Also post to LinkedIn
   
   Post will include:
     - Story title
     - Featured image
     - Summary (first 100 words)
     - Link to full story on ImpactusAll
     - Hashtags (customizable)

2. Schedule Social Posts
   Publish story now, schedule social posts for later:
     - Facebook: [Date/Time picker]
     - Twitter: [Date/Time picker]
     - LinkedIn: [Date/Time picker]

3. Pre-Written Social Copy
   AI generates social media posts:
   
   FACEBOOK (Longer format):
     "We're thrilled to share Sarah's incredible journey with you.
      
      Thanks to the support of [Corporate Name], Sarah received 
      12 weeks of specialist care that transformed her life.
      
      Read her full story and see the impact your support makes.
      
      [Link to story]
      
      #ImpactStory #CharityImpact #MakingADifference"
   
   TWITTER (Concise):
     "Meet Sarah 💙 Her journey shows the real impact of @CorporateName's
      support. 12 weeks of care, one transformed life.
      
      Read more: [link]
      
      #ImpactStory #CharityWork"
   
   LINKEDIN (Professional):
     "Corporate Social Responsibility in action.
      
      Through the partnership between [Charity] and [Corporate],
      Sarah received vital support that enabled her to...
      
      This is the kind of measurable impact that strategic CSR
      partnerships can achieve.
      
      [Link]"
   
   Charity can edit all pre-written posts

4. Social Analytics
   Track performance of shared stories:
     - Reach (impressions)
     - Engagement (likes, comments, shares)
     - Click-through rate to full story
     - Best performing story type
     - Optimal posting times
```

#### C. Share Kit for Corporates
```
For each story, generate downloadable "Share Kit":

CORPORATE SHARE KIT:
  
  For [Story Title]
  Created for: [Corporate Name]
  
  PACKAGE INCLUDES:
  
  ✅ Social Media Graphics (branded)
     - Facebook post image (1200x630px)
     - Twitter header (1500x500px)
     - LinkedIn post image (1200x627px)
     - Instagram square (1080x1080px)
     - Instagram story (1080x1920px)
  
  ✅ Pre-Written Posts
     - Facebook post (ready to copy/paste)
     - Twitter thread (3 tweets)
     - LinkedIn post (professional tone)
     - Email newsletter snippet
  
  ✅ Impact Report PDF
     - Professional branded document
     - Suitable for board meetings
     - Print-ready
  
  ✅ Media Assets
     - High-res photos (with consent)
     - Logo files
     - Brand colors and fonts
  
  [Download Complete Share Kit] (.zip file)

This kit makes it EASY for corporates to share the story
```

---

## 3.10 Story Analytics for Charity 📈

### User Requirement (Implied):
- Charities need to see which stories perform well
- Understand what resonates with audience
- Learn from successful stories

### Required Implementation:

#### A. Story Performance Dashboard
```
NEW PAGE: /charity-dashboard/stories/analytics

OVERVIEW METRICS:
  
  Total Stories Published: 24
  Total Engagement: 12,500
  Average Engagement per Story: 521
  
  This Month vs Last Month: +35% engagement

TOP PERFORMING STORIES (LAST 30 DAYS):
  
  1. "Sarah's Journey to Independence"
     👀 Views: 2,500
     ❤️ Likes: 1,200
     💬 Comments: 45
     🔗 Shares: 380
     Total Engagement: 3,625
     
     Why it worked:
     ✅ Personal story with real person
     ✅ Clear measurable impact (12 weeks → independence)
     ✅ Professional photo
     ✅ Emotional connection
     
     [View Story] [Create Similar]
  
  2. [Next top story]
  
  3. [Next top story]

ENGAGEMENT TRENDS:
  [Line chart showing engagement over time]
  
  Best day to publish: Tuesday (avg 680 engagements)
  Best time: 10am - 12pm (peak engagement window)

STORY TYPE PERFORMANCE:
  [Pie chart]
  
  Beneficiary Stories: 65% of engagement
  Volunteer Days: 25% of engagement
  Impact Reports: 10% of engagement
  
  Insight: Personal beneficiary stories perform best

CORPORATE DONOR ENGAGEMENT:
  Which donor stories get most engagement?
  
  1. Manchester United: Avg 890 engagements/story
  2. TechCorp Global: Avg 620 engagements/story
  3. Local Business: Avg 340 engagements/story
```

#### B. Individual Story Analytics
```
On each story detail page, add "Analytics" tab:

STORY: "Sarah's Journey to Independence"
Published: 15 days ago

ENGAGEMENT OVERVIEW:
  Total Views: 2,500
  Total Engagements: 3,625
  Engagement Rate: 145% (very high!)
  
  Breakdown:
  ❤️ Likes: 1,200 (48%)
  💬 Comments: 45 (2%)
  🔗 Shares: 380 (15%)
  🔖 Saves: 125 (5%)
  📨 Emails Sent: 800 (corporates sharing with employees)

TRAFFIC SOURCES:
  Direct: 35% (impactusall.com)
  Social Media: 45%
    - Facebook: 25%
    - LinkedIn: 15%
    - Twitter: 5%
  Email: 15% (newsletter, corporate emails)
  Other: 5%

READER DEMOGRAPHICS:
  [If data available from social shares]
  Age groups, locations, etc.

ENGAGEMENT TIMELINE:
  [Line chart showing views/engagement over time]
  
  Peak engagement: Day 2-3 after publishing
  Current status: Stable engagement continuing

COMMENTS SUMMARY:
  Most common themes:
  • "Inspiring" (mentioned 12 times)
  • "Wonderful work" (mentioned 8 times)
  • "Thank you for sharing" (mentioned 15 times)
  
  [View All Comments]
```

---

# 📋 SUMMARY OF ALL REMAINING WORK

## Priority 2: Platform Admin Dashboard
1. ✅ System Health Indicator (live, dynamic, clickable)
2. ✅ Overdue Payments Tracking (separated, manual invoice system)
3. ✅ Total Charities Enhancement (time periods, "Active" not "Approved", dropdowns)
4. ✅ Corporate Donors Separation (charity clients vs self-service)
5. ✅ Revenue Metrics (£ not $, breakdowns, dropdowns, comparisons)
6. ✅ Engagement Metrics (charity activity, story performance, clickable details)
7. ✅ Recent Activity Feed (collapsible, user-friendly descriptions)
8. ✅ Everything Live & Dynamic (no static data)
9. ✅ Manager-Specific Views (account manager role and filtering)
10. ✅ Branding & Visual Design (inspiring, modern, ImpactusAll branding)
11. ✅ Missing Features (quick actions, notifications, search, shortcuts)

**Estimated Time:** 4-6 weeks

## Priority 3: Charity Admin Portal
1. ✅ Revenue YTD Box (clickable to donor pages)
2. ✅ Number of Donors Box (with dropdown)
3. ✅ Donor Engagement Tracking (monthly %, email reminders)
4. ✅ Story Creation Guidance (success examples, best practices)
5. ✅ Volunteer Day Story Type (complete new story template)
6. ✅ Impact Metrics Mandatory (flexible types, guidance for hard-to-quantify)
7. ✅ Image Upload UX (clear instructions, multiple images, guidelines)
8. ✅ Story Settings Clarification (rename, clear options)
9. ✅ Social Media Integration (share buttons, one-click posting, share kits)
10. ✅ Story Analytics (performance dashboard, individual story metrics)

**Estimated Time:** 3-4 weeks

---

## 🎯 Total Estimated Time: 7-10 Weeks

---

**This document is COMPLETE. Nothing from user feedback is missing.**

**Last Updated:** December 19, 2025  
**Status:** Ready for Priority 2 Development  
**Next Action:** Begin with Platform Admin Dashboard (Priority 2)
