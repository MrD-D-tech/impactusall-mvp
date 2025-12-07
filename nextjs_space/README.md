# ImpactusAll MVP - Corporate Social Responsibility Platform

## 🌟 Overview

ImpactusAll is a comprehensive platform connecting charities with corporate donors to showcase real-world impact stories. The platform features three distinct portals:

1. **Public Impact Hub** - Public-facing donor hubs showcasing impact stories
2. **Charity Admin Portal** - Tools for charities to create and manage impact stories
3. **Corporate Donor Portal** - Analytics, reports, and team management for corporate sponsors
4. **Platform Admin Portal** - System administration and charity approval workflow

## 🚀 Live Deployment

**Production URL:** https://impactusall.abacusai.app

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Storage:** AWS S3
- **Email:** Resend API
- **AI:** Abacus AI LLM for story generation
- **UI:** Tailwind CSS + shadcn/ui components
- **Deployment:** Abacus.AI platform

## 📋 Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL database
- AWS account with S3 bucket
- Resend API account
- Abacus AI API key

## ⚙️ Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `AWS_*` - Your AWS S3 credentials
   - `RESEND_API_KEY` - Your Resend API key
   - `ABACUSAI_API_KEY` - Your Abacus AI API key

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Generate Prisma client:**
   ```bash
   yarn prisma generate
   ```

3. **Run database migrations:**
   ```bash
   yarn prisma db push
   ```

4. **Seed the database with test data:**
   ```bash
   yarn prisma db seed
   ```

5. **Start development server:**
   ```bash
   yarn dev
   ```

   The app will be available at `http://localhost:3000`

## 🧪 Test Credentials

After seeding, you can log in with:

### Platform Admin
- **Email:** platform@impactusall.com
- **Password:** admin123
- **Access:** /platform-admin

### Charity Admin (Northern Hospice)
- **Email:** admin@northernhospice.org.uk
- **Password:** admin123
- **Access:** /charity-admin

### Corporate Donor (Manchester United)
- **Email:** corporate@manutd.com
- **Password:** admin123
- **Access:** /corporate-dashboard

## 📁 Project Structure

```
app/
├── (auth)/                    # Login and registration pages
├── platform-admin/            # Platform admin dashboard
├── charity-admin/             # Charity portal
├── corporate-dashboard/       # Corporate donor portal
├── [donor-slug]/              # Public donor hubs
├── stories/                   # Public story pages
├── charity-signup/            # Self-service charity registration
└── api/                       # API routes
    ├── auth/                  # NextAuth.js endpoints
    ├── charity-admin/         # Charity API routes
    ├── corporate-dashboard/   # Corporate API routes
    └── platform-admin/        # Platform admin API routes

components/
├── ui/                        # shadcn/ui components
├── emails/                    # Email templates
└── ...                        # Feature-specific components

lib/
├── db.ts                      # Prisma client singleton
├── auth-options.ts            # NextAuth.js configuration
├── email.ts                   # Email sending functions
├── s3.ts                      # AWS S3 operations
└── utils.ts                   # Utility functions

prisma/
└── schema.prisma              # Database schema

public/
├── images/                    # Static images
└── videos/                    # Static videos
```

## 🎯 Key Features

### Charity Admin Portal
- ✅ AI-powered story generation
- ✅ Rich text story editor with preview
- ✅ Image and video upload to S3
- ✅ Impact metrics tracking
- ✅ Story timeline milestones
- ✅ Donor relationship management

### Corporate Donor Portal
- ✅ Real-time engagement analytics
- ✅ PDF report generation (3 templates)
- ✅ Team management with role-based access
- ✅ Email notification preferences
- ✅ Story downloads for offline use

### Public Impact Hub
- ✅ Donor-branded story galleries
- ✅ Anonymous engagement (likes, comments, reactions)
- ✅ Social media sharing
- ✅ Responsive design

### Platform Admin Portal
- ✅ Charity application approval workflow
- ✅ User and role management
- ✅ System-wide analytics

## 🔒 Security

- All passwords are hashed with bcrypt
- Role-based access control (RBAC) via NextAuth.js
- Session-based authentication with JWT
- Environment variables for sensitive credentials
- S3 signed URLs for private media access

## 📧 Email Notifications

- **New Story Published** - Sent to corporate donors when tagged
- **New Comment** - Sent to charity admins and corporate donors
- Built with React Email and Resend API

## 🗄️ Database Models

Key models:
- `User` - All platform users with role-based permissions
- `Charity` - Charity organizations (PENDING/APPROVED/REJECTED)
- `Donor` - Corporate donors with branding
- `Story` - Impact stories with rich content
- `Comment`, `Like`, `Reaction` - User engagement
- `Analytics` - Daily engagement metrics
- `StoryMilestone` - Timeline events for stories

## 🎨 Design System

- **Primary Colors:** Orange (#f97316) and Teal (#14b8a6)
- **UI Components:** shadcn/ui (40+ components)
- **Icons:** lucide-react
- **Styling:** Tailwind CSS with custom utilities

## 📝 Recent Updates

### December 2024 - Bug Fixes
✅ Fixed impact metrics editor erratic behavior
✅ Removed comment form name field inconsistency
✅ Verified comment auto-approval functionality
✅ Auto-apply placeholder image to AI-generated stories

## 🚢 Deployment

The application is deployed on Abacus.AI platform:

```bash
# Build for production
yarn build

# Start production server
yarn start
```

## 🤝 Contributing

This is a private MVP project. For access or questions, contact the development team.

## 📄 License

Proprietary - All Rights Reserved

## 🆘 Support

For technical issues or questions:
- Review documentation in `/MASTER_SPEC_v1.2_UPDATED.md`
- Check `/BUILD_LOG.md` for implementation details
- Contact platform administrators

---

**Built with ❤️ for connecting compassion with impact**
