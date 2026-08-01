import { NextResponse } from 'next/server';
import { providerHealthSchema } from '@cinenova/contracts';
import { getCatalogProvider } from '../../../../../lib/providers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = await getCatalogProvider().healthCheck();
  return NextResponse.json(
    providerHealthSchema.parse({
      provider: health.provider,
      status: health.status,
      latencyMs: health.latencyMs,
      lastCheckedAt: health.checkedAt.toISOString(),
      message: health.message,
    }),
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
