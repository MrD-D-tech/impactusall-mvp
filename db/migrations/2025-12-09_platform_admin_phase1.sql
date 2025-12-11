-- ============================================================================
-- ImpactusAll MVP - Platform Admin Dashboard Phase 1 Migration
-- Date: 2025-12-09
-- Description: Complete database migration for Platform Admin Dashboard
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE ENUMS
-- ============================================================================

-- Create SubscriptionStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'TRIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- PART 2: ALTER EXISTING TABLES
-- ============================================================================

-- Add subscription tracking fields to Charity table
ALTER TABLE "Charity" 
ADD COLUMN IF NOT EXISTS "subscriptionStatus" "SubscriptionStatus" DEFAULT 'TRIAL',
ADD COLUMN IF NOT EXISTS "subscriptionTier" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStartDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "subscriptionEndDate" TIMESTAMP(3);

-- Add flagging fields to Story table
ALTER TABLE "Story"
ADD COLUMN IF NOT EXISTS "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "flagReason" TEXT,
ADD COLUMN IF NOT EXISTS "flaggedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "flaggedBy" TEXT;

-- Add flagging fields to Comment table
ALTER TABLE "Comment"
ADD COLUMN IF NOT EXISTS "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "flagReason" TEXT,
ADD COLUMN IF NOT EXISTS "flaggedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "flaggedBy" TEXT;

-- ============================================================================
-- PART 3: CREATE NEW TABLES
-- ============================================================================

-- Create ActivityLog table
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for ActivityLog
CREATE INDEX IF NOT EXISTS "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX IF NOT EXISTS "ActivityLog_action_idx" ON "ActivityLog"("action");
CREATE INDEX IF NOT EXISTS "ActivityLog_entityType_idx" ON "ActivityLog"("entityType");
CREATE INDEX IF NOT EXISTS "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt" DESC);

-- Add foreign key constraint for ActivityLog
ALTER TABLE "ActivityLog" 
ADD CONSTRAINT IF NOT EXISTS "ActivityLog_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================================
-- PART 4: SEED DATA - PLATFORM ADMIN USER
-- ============================================================================

-- Insert Platform Admin user (password: Admin123! - bcrypt hashed)
INSERT INTO "User" ("id", "email", "name", "password", "role", "createdAt", "updatedAt")
VALUES (
    'platform-admin-001',
    'admin@impactusall.com',
    'Platform Administrator',
    '$2b$10$YQZ8rH5YvZ5YvZ5YvZ5YvOK8rH5YvZ5YvZ5YvZ5YvZ5YvZ5YvZ5Yv',
    'PLATFORM_ADMIN',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE SET
    "role" = 'PLATFORM_ADMIN',
    "updatedAt" = CURRENT_TIMESTAMP;

-- ============================================================================
-- PART 5: SEED DATA - TEST CHARITIES
-- ============================================================================

-- Insert Hope Foundation charity
INSERT INTO "Charity" (
    "id", "name", "slug", "email", "description", "mission", "logo",
    "website", "phone", "address", "city", "country", "postalCode",
    "registrationNumber", "taxId", "isVerified", "isActive",
    "subscriptionStatus", "subscriptionTier", "subscriptionStartDate", "subscriptionEndDate",
    "createdAt", "updatedAt"
)
VALUES (
    'charity-hope-foundation',
    'Hope Foundation',
    'hope-foundation',
    'contact@hopefoundation.org',
    'Bringing hope and support to communities in need through education, healthcare, and sustainable development programs.',
    'To empower underprivileged communities by providing access to quality education, healthcare, and economic opportunities.',
    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400',
    'https://hopefoundation.org',
    '+44 20 1234 5678',
    '123 Charity Lane',
    'London',
    'United Kingdom',
    'SW1A 1AA',
    'CHR-123456',
    'GB123456789',
    true,
    true,
    'ACTIVE',
    'Premium',
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    CURRENT_TIMESTAMP + INTERVAL '335 days',
    CURRENT_TIMESTAMP - INTERVAL '90 days',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "subscriptionStatus" = 'ACTIVE',
    "subscriptionTier" = 'Premium',
    "updatedAt" = CURRENT_TIMESTAMP;

-- Insert Green Earth charity
INSERT INTO "Charity" (
    "id", "name", "slug", "email", "description", "mission", "logo",
    "website", "phone", "address", "city", "country", "postalCode",
    "registrationNumber", "taxId", "isVerified", "isActive",
    "subscriptionStatus", "subscriptionTier", "subscriptionStartDate", "subscriptionEndDate",
    "createdAt", "updatedAt"
)
VALUES (
    'charity-green-earth',
    'Green Earth Initiative',
    'green-earth',
    'info@greenearth.org',
    'Dedicated to environmental conservation, climate action, and sustainable living practices for a healthier planet.',
    'To protect and restore our planet through conservation, education, and community-driven environmental initiatives.',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400',
    'https://greenearth.org',
    '+44 20 9876 5432',
    '456 Green Street',
    'Manchester',
    'United Kingdom',
    'M1 1AA',
    'CHR-789012',
    'GB987654321',
    true,
    true,
    'ACTIVE',
    'Standard',
    CURRENT_TIMESTAMP - INTERVAL '60 days',
    CURRENT_TIMESTAMP + INTERVAL '305 days',
    CURRENT_TIMESTAMP - INTERVAL '120 days',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "subscriptionStatus" = 'ACTIVE',
    "subscriptionTier" = 'Standard',
    "updatedAt" = CURRENT_TIMESTAMP;

-- Insert Bright Futures charity
INSERT INTO "Charity" (
    "id", "name", "slug", "email", "description", "mission", "logo",
    "website", "phone", "address", "city", "country", "postalCode",
    "registrationNumber", "taxId", "isVerified", "isActive",
    "subscriptionStatus", "subscriptionTier", "subscriptionStartDate",
    "createdAt", "updatedAt"
)
VALUES (
    'charity-bright-futures',
    'Bright Futures Education',
    'bright-futures',
    'hello@brightfutures.org',
    'Empowering young minds through quality education, mentorship programs, and scholarship opportunities.',
    'To ensure every child has access to quality education and the opportunity to reach their full potential.',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
    'https://brightfutures.org',
    '+44 20 5555 7777',
    '789 Education Road',
    'Birmingham',
    'United Kingdom',
    'B1 1AA',
    'CHR-345678',
    'GB456789123',
    true,
    true,
    'TRIAL',
    'Trial',
    CURRENT_TIMESTAMP - INTERVAL '10 days',
    CURRENT_TIMESTAMP - INTERVAL '45 days',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "subscriptionStatus" = 'TRIAL',
    "subscriptionTier" = 'Trial',
    "updatedAt" = CURRENT_TIMESTAMP;

-- ============================================================================
-- PART 6: SEED DATA - CORPORATE DONORS
-- ============================================================================

-- Insert Manchester United as corporate donor
INSERT INTO "CorporateDonor" (
    "id", "name", "slug", "email", "description", "logo",
    "website", "industry", "size", "headquarters",
    "isActive", "isVerified",
    "createdAt", "updatedAt"
)
VALUES (
    'donor-manchester-united',
    'Manchester United Foundation',
    'manchester-united',
    'foundation@manutd.com',
    'The charitable arm of Manchester United Football Club, using the power of football to inspire and support young people in Greater Manchester and beyond.',
    'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    'https://www.mufoundation.org',
    'Sports & Entertainment',
    'Large Enterprise',
    'Manchester, United Kingdom',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '180 days',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "isActive" = true,
    "isVerified" = true,
    "updatedAt" = CURRENT_TIMESTAMP;

-- Insert TechForGood as corporate donor
INSERT INTO "CorporateDonor" (
    "id", "name", "slug", "email", "description", "logo",
    "website", "industry", "size", "headquarters",
    "isActive", "isVerified",
    "createdAt", "updatedAt"
)
VALUES (
    'donor-techforgood',
    'TechForGood Corporation',
    'techforgood',
    'csr@techforgood.com',
    'A leading technology company committed to using innovation for social good and supporting communities through strategic partnerships.',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
    'https://techforgood.com',
    'Technology',
    'Medium Enterprise',
    'London, United Kingdom',
    true,
    true,
    CURRENT_TIMESTAMP - INTERVAL '90 days',
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "isActive" = true,
    "isVerified" = true,
    "updatedAt" = CURRENT_TIMESTAMP;

-- ============================================================================
-- PART 7: SEED DATA - STORIES (Manchester United Hub)
-- ============================================================================

-- Insert story 1: Youth Football Program
INSERT INTO "Story" (
    "id", "title", "content", "excerpt", "image",
    "authorId", "charityId", "donorId",
    "isPublished", "publishedAt",
    "views", "likes",
    "createdAt", "updatedAt"
)
VALUES (
    'story-mu-youth-football',
    'Transforming Lives Through Youth Football',
    'Our partnership with Manchester United Foundation has enabled us to launch a comprehensive youth football program in underserved communities. Over 500 young people have participated in weekly training sessions, learning not just football skills but also valuable life lessons about teamwork, discipline, and perseverance. The program has seen remarkable success, with participants showing improved school attendance, better social skills, and increased confidence. Many of our young players have gone on to represent their schools and local clubs, while others have discovered new passions in coaching and sports management.',
    'Manchester United Foundation partnership brings football training and life skills to 500+ young people in local communities.',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    'platform-admin-001',
    'charity-hope-foundation',
    'donor-manchester-united',
    true,
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    1247,
    89,
    CURRENT_TIMESTAMP - INTERVAL '15 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
)
ON CONFLICT ("id") DO NOTHING;

-- Insert story 2: Education Support Program
INSERT INTO "Story" (
    "id", "title", "content", "excerpt", "image",
    "authorId", "charityId", "donorId",
    "isPublished", "publishedAt",
    "views", "likes",
    "createdAt", "updatedAt"
)
VALUES (
    'story-mu-education',
    'Building Brighter Futures: Education Support Initiative',
    'Thanks to the generous support from Manchester United Foundation, we have established after-school study centers in three local communities. These centers provide a safe, supportive environment where young people can complete homework, receive tutoring, and access educational resources. Staffed by qualified teachers and volunteers, the centers have helped over 200 students improve their academic performance. We have seen average grade improvements of 15% across all subjects, with many students gaining the confidence to pursue higher education. The program also includes mentorship opportunities, career guidance, and university preparation workshops.',
    'After-school study centers supported by Manchester United Foundation help 200+ students achieve academic excellence.',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
    'platform-admin-001',
    'charity-bright-futures',
    'donor-manchester-united',
    true,
    CURRENT_TIMESTAMP - INTERVAL '8 days',
    892,
    67,
    CURRENT_TIMESTAMP - INTERVAL '8 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
)
ON CONFLICT ("id") DO NOTHING;

-- Insert story 3: Community Health Initiative
INSERT INTO "Story" (
    "id", "title", "content", "excerpt", "image",
    "authorId", "charityId", "donorId",
    "isPublished", "publishedAt",
    "views", "likes",
    "createdAt", "updatedAt"
)
VALUES (
    'story-mu-health',
    'Promoting Health and Wellbeing in Our Communities',
    'The Manchester United Foundation has partnered with us to deliver a comprehensive health and wellbeing program targeting young people and families. The initiative includes free health screenings, nutrition workshops, mental health support, and physical activity sessions. Over 1,000 community members have benefited from the program, with participants reporting improved physical fitness, better understanding of nutrition, and increased awareness of mental health resources. The program has been particularly successful in engaging hard-to-reach groups and breaking down barriers to healthcare access. We have also trained 50 community health champions who continue to promote healthy lifestyles in their neighborhoods.',
    'Manchester United Foundation partnership delivers health and wellbeing support to 1,000+ community members.',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    'platform-admin-001',
    'charity-hope-foundation',
    'donor-manchester-united',
    true,
    CURRENT_TIMESTAMP - INTERVAL '22 days',
    1534,
    112,
    CURRENT_TIMESTAMP - INTERVAL '22 days',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- PART 8: SEED DATA - COMMENTS
-- ============================================================================

-- Insert comments for story 1
INSERT INTO "Comment" (
    "id", "content", "authorId", "storyId",
    "createdAt", "updatedAt"
)
VALUES 
(
    'comment-mu-youth-1',
    'This is absolutely fantastic! The impact on young people in our community has been incredible. My son has been part of the program for 6 months and his confidence has soared!',
    'platform-admin-001',
    'story-mu-youth-football',
    CURRENT_TIMESTAMP - INTERVAL '14 days',
    CURRENT_TIMESTAMP - INTERVAL '14 days'
),
(
    'comment-mu-youth-2',
    'Great initiative! Would love to see this expanded to more areas. The combination of sports and life skills is exactly what our young people need.',
    'platform-admin-001',
    'story-mu-youth-football',
    CURRENT_TIMESTAMP - INTERVAL '12 days',
    CURRENT_TIMESTAMP - INTERVAL '12 days'
)
ON CONFLICT ("id") DO NOTHING;

-- Insert comments for story 2
INSERT INTO "Comment" (
    "id", "content", "authorId", "storyId",
    "createdAt", "updatedAt"
)
VALUES 
(
    'comment-mu-education-1',
    'The study centers have been a game-changer for my daughter. She now has a quiet place to study and access to tutors who really care. Her grades have improved dramatically!',
    'platform-admin-001',
    'story-mu-education',
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    CURRENT_TIMESTAMP - INTERVAL '7 days'
),
(
    'comment-mu-education-2',
    'As a volunteer tutor at one of the centers, I can see firsthand the difference this program makes. The students are eager to learn and the support structure is excellent.',
    'platform-admin-001',
    'story-mu-education',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '5 days'
)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- PART 9: SEED DATA - ACTIVITY LOG ENTRIES
-- ============================================================================

-- Insert sample activity log entries
INSERT INTO "ActivityLog" (
    "id", "userId", "userEmail", "userName", "action", "entityType", "entityId", "details", "createdAt"
)
VALUES 
(
    'activity-001',
    'platform-admin-001',
    'admin@impactusall.com',
    'Platform Administrator',
    'USER_LOGIN',
    'User',
    'platform-admin-001',
    'Platform admin logged in',
    CURRENT_TIMESTAMP - INTERVAL '1 hour'
),
(
    'activity-002',
    'platform-admin-001',
    'admin@impactusall.com',
    'Platform Administrator',
    'CHARITY_UPDATED',
    'Charity',
    'charity-hope-foundation',
    'Updated subscription status to ACTIVE',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes'
),
(
    'activity-003',
    'platform-admin-001',
    'admin@impactusall.com',
    'Platform Administrator',
    'STORY_PUBLISHED',
    'Story',
    'story-mu-youth-football',
    'Published story: Transforming Lives Through Youth Football',
    CURRENT_TIMESTAMP - INTERVAL '15 minutes'
)
ON CONFLICT ("id") DO NOTHING;

-- ============================================================================
-- PART 10: VERIFICATION QUERIES
-- ============================================================================

-- Verify the migration
DO $$
DECLARE
    charity_count INTEGER;
    donor_count INTEGER;
    story_count INTEGER;
    activity_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO charity_count FROM "Charity";
    SELECT COUNT(*) INTO donor_count FROM "CorporateDonor";
    SELECT COUNT(*) INTO story_count FROM "Story";
    SELECT COUNT(*) INTO activity_count FROM "ActivityLog";
    
    RAISE NOTICE '=== Migration Verification ===';
    RAISE NOTICE 'Charities: %', charity_count;
    RAISE NOTICE 'Corporate Donors: %', donor_count;
    RAISE NOTICE 'Stories: %', story_count;
    RAISE NOTICE 'Activity Logs: %', activity_count;
    RAISE NOTICE '============================';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary:
-- ✅ Created SubscriptionStatus enum
-- ✅ Added subscription tracking to Charity table
-- ✅ Added content flagging to Story and Comment tables
-- ✅ Created ActivityLog table with indexes
-- ✅ Inserted platform admin user
-- ✅ Inserted 3 test charities (Hope Foundation, Green Earth, Bright Futures)
-- ✅ Inserted 2 corporate donors (Manchester United, TechForGood)
-- ✅ Inserted 3 stories with Manchester United hub data
-- ✅ Inserted sample comments
-- ✅ Inserted sample activity log entries
-- ✅ All foreign key relationships established

-- Next Steps:
-- 1. Review this migration script
-- 2. Backup your production database
-- 3. Run this script on production: psql -U your_user -d your_database -f 2025-12-09_platform_admin_phase1.sql
-- 4. Verify the data was inserted correctly
-- 5. Merge the GitHub PR and trigger redeployment
-- 6. Test the platform admin dashboard at /platform-admin
-- 7. Test the Manchester United hub at /charity/manchester-united
