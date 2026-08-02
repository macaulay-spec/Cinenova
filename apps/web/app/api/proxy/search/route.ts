import { NextResponse, type NextRequest } from 'next/server';
import { zstFetch } from '../../../../lib/zstApi';

export const dynamic = 'force-dynamic';

/**
 * BFF proxy for GET /api/search. Requires a non-empty `query` (the API rejects
 * an empty query with 400). Server-side only — never exposes the API key.
 */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('query') ?? '').trim();
  if (!query) {
    return NextResponse.json({ ok: false, error: 'query parameter is required' }, { status: 400 });
  }

  try {
    const data = await zstFetch('/api/search', {
      query,
      subjectType: request.nextUrl.searchParams.get('subjectType') ?? 'ALL',
      page: request.nextUrl.searchParams.get('page') ?? '1',
      perPage: request.nextUrl.searchParams.get('perPage') ?? '24',
    });
    return NextResponse.json(
      { ok: true, data },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'search failed';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
