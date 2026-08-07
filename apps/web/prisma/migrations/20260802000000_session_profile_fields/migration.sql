-- CineNova migration: add session/profile fields required by the repository adapters.
-- Adds profileId and lastSeenAt to Session, and avatarInitial to Profile.

-- 1. Add avatarInitial to Profile (used for the avatar placeholder in the UI/domain).
ALTER TABLE "Profile" ADD COLUMN "avatarInitial" TEXT NOT NULL DEFAULT '';

-- 2. Extend Session with profile binding, plain-text (hashed or truncated) metadata,
--    and a sliding last-seen timestamp for idle-rotation enforcement.
ALTER TABLE "Session" ADD COLUMN "profileId" UUID;
ALTER TABLE "Session" ADD COLUMN "ip" TEXT;
ALTER TABLE "Session" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "Session" ADD COLUMN "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill profileId from the owning user's default profile if one exists.
UPDATE "Session" s
SET "profileId" = (
  SELECT p."id" FROM "Profile" p
  WHERE p."userId" = s."userId"
  ORDER BY p."createdAt" ASC
  LIMIT 1
)
WHERE s."profileId" IS NULL;

-- Make profileId required for new rows once backfilled.
ALTER TABLE "Session" ALTER COLUMN "profileId" SET NOT NULL;

-- Enforce referential integrity and useful indexes.
ALTER TABLE "Session"
  ADD CONSTRAINT "Session_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Session_profileId_idx" ON "Session" ("profileId");
CREATE INDEX "Session_lastSeenAt_idx" ON "Session" ("lastSeenAt");
CREATE INDEX "Session_userId_lastSeenAt_idx" ON "Session" ("userId", "lastSeenAt");
