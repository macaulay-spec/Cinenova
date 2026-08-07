-- CineNova initial PostgreSQL schema. Generated as the first milestone migration.
-- The Prisma schema is the source of truth; run `prisma migrate diff` before production use.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('USER', 'SUPPORT', 'EDITOR', 'RIGHTS_MANAGER', 'ADMIN', 'OWNER');
CREATE TYPE "ProfileType" AS ENUM ('ADULT', 'TEEN', 'CHILD');
CREATE TYPE "PlanCode" AS ENUM ('guest', 'free', 'standard', 'premium', 'admin');
CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'paused');
CREATE TYPE "TitleKind" AS ENUM ('movie', 'series', 'episode', 'trailer');
CREATE TYPE "MaturityRating" AS ENUM ('G', 'PG', 'PG_13', 'R', 'NC_17');
CREATE TYPE "ArtworkKind" AS ENUM ('poster', 'landscape', 'hero', 'logo');
CREATE TYPE "DownloadStatus" AS ENUM ('requested', 'authorized', 'unavailable', 'expired', 'revoked');
CREATE TYPE "ModerationState" AS ENUM ('pending', 'approved', 'rejected', 'hidden');

CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "displayName" TEXT,
  "roles" "Role"[] NOT NULL DEFAULT ARRAY['USER']::"Role"[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Plan" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" "PlanCode" NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "priceCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "concurrentStreams" INTEGER NOT NULL DEFAULT 1,
  "offlineDeviceLimit" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Title" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "kind" "TitleKind" NOT NULL,
  "title" TEXT NOT NULL,
  "synopsis" TEXT NOT NULL,
  "releaseDate" TIMESTAMP(3),
  "releaseYear" INTEGER NOT NULL,
  "runtimeSeconds" INTEGER,
  "maturityRating" "MaturityRating" NOT NULL,
  "originalCountry" TEXT NOT NULL,
  "visible" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Genre" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL UNIQUE
);

CREATE TABLE "TitleGenre" (
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "genreId" UUID NOT NULL REFERENCES "Genre"("id") ON DELETE CASCADE,
  PRIMARY KEY ("titleId", "genreId")
);

CREATE TABLE "Artwork" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "kind" "ArtworkKind" NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT NOT NULL,
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "dominantColor" TEXT NOT NULL,
  "provenance" TEXT NOT NULL DEFAULT 'mock'
);

CREATE TABLE "ContentRight" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "territories" TEXT[] NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "minimumPlan" "PlanCode" NOT NULL,
  "streamAllowed" BOOLEAN NOT NULL DEFAULT FALSE,
  "offlineDownloadAllowed" BOOLEAN NOT NULL DEFAULT FALSE,
  "permittedAssetIds" TEXT[] NOT NULL,
  "rightsHolder" TEXT NOT NULL,
  "contractReferenceHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "AuthIdentity" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "provider" TEXT NOT NULL,
  "providerSubject" TEXT NOT NULL,
  "passwordHash" TEXT,
  "emailVerifiedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("provider", "providerSubject")
);

CREATE TABLE "Profile" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "type" "ProfileType" NOT NULL DEFAULT 'ADULT',
  "maturityCeiling" "MaturityRating" NOT NULL DEFAULT 'R',
  "pinHash" TEXT,
  "language" TEXT NOT NULL DEFAULT 'en',
  "autoplay" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Device" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "deviceHash" TEXT NOT NULL UNIQUE,
  "trusted" BOOLEAN NOT NULL DEFAULT FALSE,
  "offlineRegistered" BOOLEAN NOT NULL DEFAULT FALSE,
  "lastSeenAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Session" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "deviceId" UUID REFERENCES "Device"("id") ON DELETE SET NULL,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "ipHash" TEXT,
  "userAgentHash" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Subscription" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "planId" UUID NOT NULL REFERENCES "Plan"("id"),
  "status" "SubscriptionStatus" NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'mock',
  "providerCustomerId" TEXT,
  "providerSubscriptionId" TEXT,
  "currentPeriodStart" TIMESTAMP(3) NOT NULL,
  "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
  "trialEndsAt" TIMESTAMP(3),
  "graceUntil" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Entitlement" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "planId" UUID NOT NULL REFERENCES "Plan"("id"),
  "subscriptionId" UUID REFERENCES "Subscription"("id") ON DELETE SET NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3)
);

CREATE TABLE "PaymentEvent" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "provider" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL UNIQUE,
  "providerEventId" TEXT UNIQUE,
  "safePayloadSummary" JSONB NOT NULL,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ProviderTitleMapping" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "provider" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "detailPath" TEXT,
  "lastSyncedAt" TIMESTAMP(3),
  "rawFingerprint" TEXT,
  UNIQUE ("provider", "providerId")
);

CREATE TABLE "Season" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "seasonNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "synopsis" TEXT,
  UNIQUE ("titleId", "seasonNumber")
);

CREATE TABLE "Episode" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "seriesId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "seasonId" UUID NOT NULL REFERENCES "Season"("id") ON DELETE CASCADE,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "synopsis" TEXT NOT NULL,
  "seasonNumber" INTEGER NOT NULL,
  "episodeNumber" INTEGER NOT NULL,
  "runtimeSeconds" INTEGER NOT NULL,
  "assetId" TEXT NOT NULL,
  UNIQUE ("seriesId", "seasonNumber", "episodeNumber")
);

CREATE TABLE "Trailer" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "assetId" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'en'
);

CREATE TABLE "WatchlistItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("profileId", "titleId")
);

CREATE TABLE "PlaybackProgress" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "episodeId" TEXT,
  "positionSeconds" INTEGER NOT NULL,
  "durationSeconds" INTEGER NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT FALSE,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("profileId", "titleId", "episodeId")
);

CREATE TABLE "WatchHistory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "episodeId" TEXT,
  "watchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "progressSeconds" INTEGER NOT NULL
);

CREATE TABLE "Rating" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "value" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("profileId", "titleId")
);

CREATE TABLE "Review" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "body" TEXT NOT NULL,
  "moderationState" "ModerationState" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DownloadRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileId" UUID NOT NULL REFERENCES "Profile"("id") ON DELETE CASCADE,
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "deviceId" UUID NOT NULL REFERENCES "Device"("id") ON DELETE CASCADE,
  "assetId" TEXT NOT NULL,
  "status" "DownloadStatus" NOT NULL DEFAULT 'requested',
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DownloadAuthorization" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "downloadRecordId" UUID NOT NULL REFERENCES "DownloadRecord"("id") ON DELETE CASCADE,
  "authorizationHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "NotificationPreference" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "channel" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "quietHours" JSONB,
  UNIQUE ("userId", "channel", "topic")
);

CREATE TABLE "FeatureFlagAssignment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "flagKey" TEXT NOT NULL,
  "variant" TEXT NOT NULL,
  "reason" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ProviderHealthLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "latencyMs" INTEGER,
  "safeMessage" TEXT NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EditorialRail" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "region" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EditorialRailItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "railId" UUID NOT NULL REFERENCES "EditorialRail"("id") ON DELETE CASCADE,
  "titleId" UUID NOT NULL REFERENCES "Title"("id") ON DELETE CASCADE,
  "position" INTEGER NOT NULL,
  UNIQUE ("railId", "position"),
  UNIQUE ("railId", "titleId")
);

CREATE TABLE "AnalyticsEvent" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL DEFAULT 'default',
  "profileId" TEXT,
  "eventName" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "consentBasis" TEXT NOT NULL,
  "properties" JSONB NOT NULL
);

CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "resourceType" TEXT NOT NULL,
  "resourceId" TEXT,
  "safeSummary" JSONB NOT NULL,
  "ipHash" TEXT,
  "deviceHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ConsentRecord" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "purpose" TEXT NOT NULL,
  "granted" BOOLEAN NOT NULL,
  "region" TEXT NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DataDeletionRequest" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "auditSummary" JSONB
);

CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE INDEX "Title_kind_visible_idx" ON "Title"("kind", "visible");
CREATE INDEX "ContentRight_title_window_idx" ON "ContentRight"("titleId", "startsAt", "endsAt");
CREATE INDEX "WatchHistory_profile_time_idx" ON "WatchHistory"("profileId", "watchedAt");
CREATE INDEX "PlaybackProgress_profile_time_idx" ON "PlaybackProgress"("profileId", "updatedAt");
CREATE INDEX "AnalyticsEvent_tenant_time_idx" ON "AnalyticsEvent"("tenantId", "occurredAt");
CREATE INDEX "AuditLog_actor_time_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "ProviderHealthLog_provider_time_idx" ON "ProviderHealthLog"("provider", "checkedAt");
