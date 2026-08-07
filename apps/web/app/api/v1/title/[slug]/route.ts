import { NextResponse, type NextRequest } from 'next/server';
import { getCatalogProvider } from '../../../../../lib/providers';
import { notFoundProblem } from '../../../../../lib/problem';

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const region = request.nextUrl.searchParams.get('region') ?? 'NG';
  const title = await getCatalogProvider().titleBySlug(slug, region);

  if (!title) {
    return notFoundProblem('Title not found.');
  }

  return NextResponse.json(title, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
