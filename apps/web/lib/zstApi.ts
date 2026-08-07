/**
 * Server-side ZST LABS API client (BFF).
 *
 * SECURITY: This module is server-only. It reads the API key from the
 * environment (ZST_API_KEY or GZMOVIE_LEGACY_API_KEY) and attaches it to every
 * request via the x-api-key header. It is NEVER imported by client components —
 * all catalogue/playback access flows through Next.js route handlers so the key
 * and raw provider URLs never reach the browser.
 */

const BASE_URL = process.env.GZMOVIE_BASE_URL ?? 'https://zstlab.cyou';

export function getZstApiKey(): string | undefined {
  return process.env.ZST_API_KEY ?? process.env.GZMOVIE_LEGACY_API_KEY;
}

interface ZstEnvelope<T> {
  status: boolean;
  statusCode: number;
  creator?: string;
  endpoint?: string;
  error?: string;
  data: T;
}

/**
 * Fetch a documented ZST LABS endpoint. Throws a typed error on non-OK status
 * or when the envelope reports failure.
 */
export async function zstFetch<T>(
  endpoint: string,
  params?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const apiKey = getZstApiKey();
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && String(value).length > 0) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      'x-api-key': apiKey ?? '',
      'Content-Type': 'application/json',
    },
    // Matches the provider adapter timeout (10s).
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`ZST LABS ${endpoint} failed with status ${response.status}.`);
  }

  const body = (await response.json()) as ZstEnvelope<T>;
  if (!body.status) {
    throw new Error(`ZST LABS ${endpoint} failed: ${body.error ?? `status ${body.statusCode}`}`);
  }
  return body.data;
}
