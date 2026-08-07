import { NextResponse } from 'next/server';
import { getCatalogProvider } from '../../../lib/providers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const provider = await getCatalogProvider().healthCheck();
  const ready = provider.status === 'healthy' || provider.status === 'disabled';

  return NextResponse.json(
    {
      status: ready ? 'ready' : 'degraded',
      time: new Date().toISOString(),
      dependencies: { provider },
    },
    { status: ready ? 200 : 503 },
  );
}
