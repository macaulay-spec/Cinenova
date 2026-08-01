/** Shared session/CSRF timing constants for the CineNova web boundary. */

export const SESSION_COOKIE = 'cinenova_session';
export const CSRF_HEADER = 'x-csrf-token';

/** Absolute session lifetime (30 days). */
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;
export const SESSION_TTL_SECONDS = SESSION_TTL_MS / 1000;

/** Idle threshold before a session token must be rotated (12 hours). */
export const SESSION_IDLE_TTL_MS = 1000 * 60 * 60 * 12;

/** CSRF token lifetime (10 minutes). */
export const CSRF_TTL_MS = 1000 * 60 * 10;
export const CSRF_TTL_SECONDS = CSRF_TTL_MS / 1000;
