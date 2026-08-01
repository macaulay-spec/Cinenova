import { NextResponse } from 'next/server';
import { getPrincipalDto } from '../../../../lib/local-principal';

export const dynamic = 'force-dynamic';

export async function GET() {
  const principal = await getPrincipalDto();
  return NextResponse.json(principal, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
