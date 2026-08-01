import { NextResponse } from 'next/server';
import { hasPermission } from '@cinenova/domain';
import { getLocalPrincipal } from '../../../../../lib/local-principal';
import { MOCK_AUDIT_LOGS } from '../../../../../lib/audit';
import { problemResponse } from '../../../../../lib/problem';

export const dynamic = 'force-dynamic';

export async function GET() {
  const principal = await getLocalPrincipal();

  if (!hasPermission(principal.roles, 'audit:read')) {
    return problemResponse({
      type: 'https://docs.cinenova.local/errors/auth-forbidden',
      title: 'Forbidden',
      status: 403,
      code: 'AUTH_FORBIDDEN',
      detail: 'The active principal does not have audit log permission.',
    });
  }

  return NextResponse.json(
    { items: MOCK_AUDIT_LOGS, nextCursor: null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
