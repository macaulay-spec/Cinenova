import { NextResponse, type NextRequest } from 'next/server';
import { zstFetch } from '../../../../lib/zstApi';

export const dynamic = 'force-dynamic';

/**
 * BFF proxy for GET /api/homepage. Server-side only — the API key and raw
 * provider payloads never reach the browser.
 */
export async function GET(_request: NextRequest) {
  try {
    const data = await zstFetch('/api/homepage');
    return NextResponse.json({ ok: true, data }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'homepage failed';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
