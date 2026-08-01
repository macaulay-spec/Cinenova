import { NextResponse } from 'next/server';
import { getCatalogProvider } from '../../../../lib/providers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const home = await getCatalogProvider().homepage('NG');
  return NextResponse.json(home, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
