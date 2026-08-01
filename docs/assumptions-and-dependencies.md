# Assumptions, Blocked Integrations, and Dependencies

## Assumptions

- The first milestone uses mock licensed content and controlled public sample media only for local development.
- Real user identity, billing, DRM, licensed media CDN, and provider credentials are not configured yet.
- Nigeria (`NG`) is the default demo territory because the current user context is in Nigeria.
- PostgreSQL and Redis are expected for local integration via Docker Compose.

## Blocked integrations

- **DRM:** abstracted conceptually only. No Widevine/FairPlay/PlayReady integration is active.
- **Payments:** provider abstraction is planned, but Stripe/Paystack/Flutterwave credentials and webhook verification are not active.
- **GZMovie:** adapter boundary exists but is disabled by default and not wired to public responses.
- **Email/SMS/push:** notification preferences exist in schema, providers are not configured.
- **Native/TV apps:** UI accounts for TV-friendly focus direction, but native clients are future work.

## Legal/provider dependencies

- Written content rights by title/territory/window/plan.
- Rights-holder approval for offline downloads and permitted delivery mechanism.
- Provider API documentation and support contacts.
- CDN/object storage contract and regional compliance review.
- Privacy/data processing agreements for analytics, observability, billing, and support tools.
