import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const publicPaths = ['/login', '/favicon.ico', '/logo.png'];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const isLogged = req.cookies.get('auth')?.value === '1';
  if (!isLogged) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
