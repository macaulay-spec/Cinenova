import { NextResponse } from 'next/server';
import { switchProfileRequestSchema } from '@cinenova/contracts';
import { ACTIVE_PROFILE_COOKIE, getProfileById } from '../../../../../lib/local-principal';
import { recordAuditPlaceholder } from '../../../../../lib/audit';
import { validationProblem } from '../../../../../lib/problem';

export const dynamic = 'force-dynamic';

async function parseBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return request.json().catch(() => null);
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return {
      profileId: formData.get('profileId'),
      returnTo: formData.get('returnTo') ?? '/',
    };
  }

  return null;
}

export async function POST(request: Request) {
  const parsed = switchProfileRequestSchema.safeParse(await parseBody(request));

  if (!parsed.success) {
    return validationProblem(parsed.error.message);
  }

  const profile = getProfileById(parsed.data.profileId);
  if (!profile) {
    return validationProblem('Unknown profile.');
  }

  const acceptsHtml = request.headers.get('accept')?.includes('text/html') ?? false;
  const response = acceptsHtml
    ? NextResponse.redirect(new URL(parsed.data.returnTo, request.url), 303)
    : NextResponse.json(
        {
          activeProfile: { ...profile, active: true },
          audit: recordAuditPlaceholder('profile.activate', 'profile', profile.id),
        },
        { headers: { 'Cache-Control': 'no-store' } },
      );

  response.cookies.set(ACTIVE_PROFILE_COOKIE, profile.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 180,
  });

  return response;
}
