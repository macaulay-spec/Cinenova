import { NextResponse, type NextRequest } from 'next/server';
import { searchQuerySchema } from '@cinenova/contracts';
import { getCatalogProvider } from '../../../../lib/providers';
import { validationProblem } from '../../../../lib/problem';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const parsed = searchQuerySchema.safeParse({
    q: request.nextUrl.searchParams.get('q') ?? '',
    kind: request.nextUrl.searchParams.get('kind') ?? undefined,
    genre: request.nextUrl.searchParams.get('genre') ?? undefined,
    region: request.nextUrl.searchParams.get('region') ?? 'NG',
  });

  if (!parsed.success) {
    return validationProblem(parsed.error.message);
  }

  const result = await getCatalogProvider().search(parsed.data.q, parsed.data.region, parsed.data.kind);
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
    },
  });
}
