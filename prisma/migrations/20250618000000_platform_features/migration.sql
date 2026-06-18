-- Platform features: streaks, follows, tags, chains, teams, push devices, mobile tokens

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'FRIEND_ACTIVITY';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'FOLLOW';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ATTEMPT_COMMENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ATTEMPT_REACTION';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ATTEMPT_UPVOTE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'STREAK_MILESTONE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TEAM_INVITE';

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable Challenge
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "prerequisiteChallengeId" TEXT;
ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "aiReviewNote" TEXT;

-- CreateTable UserStreak
CREATE TABLE IF NOT EXISTS "UserStreak" (
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserStreak_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE IF NOT EXISTS "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AttemptTag" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "taggedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttemptTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "description" VARCHAR(300),
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DeviceToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DeviceToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "MobileRefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MobileRefreshToken_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Follow_followerId_followingId_key" ON "Follow"("followerId", "followingId");
CREATE INDEX IF NOT EXISTS "Follow_followerId_idx" ON "Follow"("followerId");
CREATE INDEX IF NOT EXISTS "Follow_followingId_idx" ON "Follow"("followingId");

CREATE UNIQUE INDEX IF NOT EXISTS "AttemptTag_attemptId_taggedUserId_key" ON "AttemptTag"("attemptId", "taggedUserId");
CREATE INDEX IF NOT EXISTS "AttemptTag_attemptId_idx" ON "AttemptTag"("attemptId");
CREATE INDEX IF NOT EXISTS "AttemptTag_taggedUserId_idx" ON "AttemptTag"("taggedUserId");

CREATE UNIQUE INDEX IF NOT EXISTS "Team_slug_key" ON "Team"("slug");
CREATE INDEX IF NOT EXISTS "Team_creatorId_idx" ON "Team"("creatorId");

CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "DeviceToken_token_key" ON "DeviceToken"("token");
CREATE INDEX IF NOT EXISTS "DeviceToken_userId_idx" ON "DeviceToken"("userId");

CREATE UNIQUE INDEX IF NOT EXISTS "MobileRefreshToken_tokenHash_key" ON "MobileRefreshToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "MobileRefreshToken_userId_idx" ON "MobileRefreshToken"("userId");
CREATE INDEX IF NOT EXISTS "MobileRefreshToken_expiresAt_idx" ON "MobileRefreshToken"("expiresAt");

CREATE INDEX IF NOT EXISTS "Challenge_prerequisiteChallengeId_idx" ON "Challenge"("prerequisiteChallengeId");

-- ForeignKeys
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_prerequisiteChallengeId_fkey" FOREIGN KEY ("prerequisiteChallengeId") REFERENCES "Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttemptTag" ADD CONSTRAINT "AttemptTag_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttemptTag" ADD CONSTRAINT "AttemptTag_taggedUserId_fkey" FOREIGN KEY ("taggedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MobileRefreshToken" ADD CONSTRAINT "MobileRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
