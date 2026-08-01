import { NextResponse } from 'next/server';
import { createPlaybackSessionRequestSchema } from '@cinenova/contracts';
import { createPlaybackSession } from '../../../../../lib/playback';
import { problemResponse, validationProblem } from '../../../../../lib/problem';

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = createPlaybackSessionRequestSchema.safeParse(json);

  if (!parsed.success) {
    return validationProblem(parsed.error.message);
  }

  const result = await createPlaybackSession(parsed.data);

  if (!result.title) {
    return problemResponse({
      type: 'https://docs.cinenova.local/errors/not-found',
      title: 'Title not found',
      status: 404,
      code: 'NOT_FOUND',
      detail: 'Title was not found.',
    });
  }

  if (!result.source) {
    return problemResponse({
      type: 'https://docs.cinenova.local/errors/rights-denied',
      title: 'Playback not allowed',
      status: 403,
      code: result.decision?.denials.some((denial) => denial.code === 'PROFILE_RESTRICTED')
        ? 'PROFILE_RESTRICTED'
        : 'RIGHTS_DENIED',
      detail: result.error ?? 'Playback is not allowed for this request.',
    });
  }

  return NextResponse.json(result.source, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
