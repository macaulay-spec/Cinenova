import { NextResponse, type NextRequest } from 'next/server';

const securityHeaders: Record<string, string> = {
  'X-DNS-Prefetch-Control': 'off',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self), fullscreen=(self)',
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  Object.entries(securityHeaders).forEach(([key, value]) => response.headers.set(key, value));

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
