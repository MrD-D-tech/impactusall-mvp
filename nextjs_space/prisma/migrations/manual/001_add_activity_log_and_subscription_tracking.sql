-- Migration: Add ActivityLog model and subscription tracking
-- Date: 2025-12-07
-- Phase: Mini-Build 1 - Platform Admin Foundation

-- ============================================
-- 1. CREATE SUBSCRIPTION STATUS ENUM
-- ============================================

CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'CANCELLED');

-- ============================================
-- 2. ADD SUBSCRIPTION FIELDS TO CHARITY TABLE
-- ============================================

ALTER TABLE "Charity" 
ADD COLUMN "monthlyFee" DECIMAL(10,2),
ADD COLUMN "subscriptionStatus" "SubscriptionStatus",
ADD COLUMN "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN "nextPaymentDue" TIMESTAMP(3);

-- Add indexes for subscription tracking
CREATE INDEX "Charity_subscriptionStatus_idx" ON "Charity"("subscriptionStatus");
CREATE INDEX "Charity_nextPaymentDue_idx" ON "Charity"("nextPaymentDue");

-- ============================================
-- 3. ADD CONTENT FLAGGING FIELDS TO STORY TABLE
-- ============================================

ALTER TABLE "Story"
ADD COLUMN "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "flagReason" TEXT,
ADD COLUMN "flaggedAt" TIMESTAMP(3),
ADD COLUMN "flaggedBy" TEXT;

-- Add index for flagged content
CREATE INDEX "Story_isFlagged_idx" ON "Story"("isFlagged");

-- ============================================
-- 4. ADD CONTENT FLAGGING FIELDS TO COMMENT TABLE
-- ============================================

ALTER TABLE "Comment"
ADD COLUMN "isFlagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "flagReason" TEXT,
ADD COLUMN "flaggedAt" TIMESTAMP(3),
ADD COLUMN "flaggedBy" TEXT;

-- Add index for flagged content
CREATE INDEX "Comment_isFlagged_idx" ON "Comment"("isFlagged");

-- ============================================
-- 5. CREATE ACTIVITY LOG TABLE
-- ============================================

CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- Add indexes for activity log
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");
CREATE INDEX "ActivityLog_entityType_idx" ON "ActivityLog"("entityType");
CREATE INDEX "ActivityLog_timestamp_idx" ON "ActivityLog"("timestamp");
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- ============================================
-- NOTES
-- ============================================

-- This migration adds:
-- 1. SubscriptionStatus enum for tracking charity subscriptions
-- 2. Subscription tracking fields to Charity model (monthlyFee, subscriptionStatus, etc.)
-- 3. Content flagging fields to Story and Comment models (isFlagged, flagReason, etc.)
-- 4. ActivityLog table for tracking all platform admin actions

-- To apply this migration, run:
-- psql -U your_user -d your_database -f 001_add_activity_log_and_subscription_tracking.sql

-- Or use Prisma:
-- npx prisma migrate dev --name add_activity_log_and_subscription_tracking
