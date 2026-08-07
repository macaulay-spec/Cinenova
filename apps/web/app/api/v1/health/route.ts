import { NextResponse } from 'next/server';
import { getCatalogProvider } from '../../../../lib/providers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const provider = await getCatalogProvider().healthCheck();
  return NextResponse.json({
    status: provider.status === 'unhealthy' ? 'degraded' : 'ok',
    time: new Date().toISOString(),
    dependencies: {
      provider,
    },
  });
}
