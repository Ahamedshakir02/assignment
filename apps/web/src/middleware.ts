import { NextResponse, type NextRequest } from 'next/server';

const AUTH_COOKIE = 'pyramid_token';
const PUBLIC_PATHS = ['/login'];

/**
 * Presence check only — the cookie is httpOnly and signed, so the middleware
 * cannot and should not verify it. The API is the actual authority and will
 * reject an invalid token with a 401.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE));
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (hasSession && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/tasks';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // icon.svg is the app icon Next serves from app/. It has to stay public, or
  // the login page asks for an icon it is not allowed to fetch.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)'],
};
