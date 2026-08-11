import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Enforce strict noindex, nofollow header on all administrative endpoints
  const response = NextResponse.next();
  if (pathname.startsWith('/admin') || pathname.startsWith('/admin-login')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  // Protect /admin routes (excluding /admin-login and /api)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin-login') && !pathname.startsWith('/api')) {
    const adminToken = request.cookies.get('donatelife_admin_token')?.value || request.cookies.get('token')?.value;

    if (!adminToken) {
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      redirectResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login'],
};
