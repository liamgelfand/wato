-- AlterEnum
ALTER TYPE "ChallengeStatus" ADD VALUE 'ARCHIVED';
ALTER TYPE "NotificationType" ADD VALUE 'CHALLENGE_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'CHALLENGE_REJECTED';

-- CreateTable
CREATE TABLE "FeedImpression" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedImpression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeedImpression_userId_attemptId_key" ON "FeedImpression"("userId", "attemptId");
CREATE INDEX "FeedImpression_userId_seenAt_idx" ON "FeedImpression"("userId", "seenAt");

-- AddForeignKey
ALTER TABLE "FeedImpression" ADD CONSTRAINT "FeedImpression_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedImpression" ADD CONSTRAINT "FeedImpression_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
