import { NextResponse, type NextRequest } from 'next/server';
import { zstFetch } from '../../../../lib/zstApi';

export const dynamic = 'force-dynamic';

/**
 * BFF proxy for GET /api/media (playback sources).
 *
 * SECURITY: fetches the media sources server-side with the API key, then
 * sanitizes the response so only the approved, highest-resolution playback URL
 * is returned to the client. Raw provider URLs and the key are never exposed.
 */
export async function GET(request: NextRequest) {
  const subjectId = request.nextUrl.searchParams.get('subjectId');
  if (!subjectId) {
    return NextResponse.json({ ok: false, error: 'subjectId is required' }, { status: 400 });
  }

  try {
    const data = await zstFetch('/api/media', {
      subjectId,
      detailPath: request.nextUrl.searchParams.get('detailPath') ?? undefined,
      season: request.nextUrl.searchParams.get('season') ?? undefined,
      episode: request.nextUrl.searchParams.get('episode') ?? undefined,
    });

    const raw = data as {
      downloads?: { data?: { downloads?: { url: string; resolution?: number }[]; hasResource?: boolean } };
    };
    const downloads = raw.downloads?.data?.downloads ?? [];
    const hasResource = raw.downloads?.data?.hasResource ?? downloads.length > 0;
    const sorted = [...downloads].sort(
      (a, b) => (b.resolution ?? 0) - (a.resolution ?? 0),
    );
    const best = sorted[0]?.url ?? null;

    // Only return the approved highest-resolution URL; strip everything else.
    return NextResponse.json({ ok: true, hasResource, playbackUrl: best });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'media failed';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
