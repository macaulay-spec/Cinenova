import { NextResponse } from 'next/server';
import { getPrincipalDto } from '../../../../lib/local-principal';
import { resolveSession } from '../../../../lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [principal, session] = await Promise.all([getPrincipalDto(), resolveSession()]);

  return NextResponse.json(
    {
      ...principal,
      session: session.session
        ? {
            sessionId: session.session.id,
            profileId: session.profileId,
            authenticated: session.authenticated,
            csrfRequired: true,
            expiresAt: session.session.expiresAt.toISOString(),
          }
        : {
            sessionId: null,
            profileId: null,
            authenticated: false,
            csrfRequired: true,
            expiresAt: null,
          },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
