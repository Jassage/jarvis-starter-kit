import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const isAuthenticated = Boolean(
    req.cookies.get('posta_access_token') || req.cookies.get('posta_refresh_token')
  );
  const pathname = req.nextUrl.pathname;
  const isAppArea = pathname.startsWith('/app');
  const isLoginPage = pathname.startsWith('/login');

  if (!isAuthenticated && isAppArea) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/app', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
