// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only protect /premium/*
  if (!pathname.startsWith('/premium')) return NextResponse.next();

  // Allow the PIN page and verification API to be reachable without the cookie
  if (pathname === '/premium/pin' || pathname.startsWith('/api/premium/verify-pin')) {
    return NextResponse.next();
  }

  const ok = req.cookies.get('pr_pin_ok')?.value === '1';
  if (ok) return NextResponse.next();

  // Not unlocked yet → bounce to PIN page with ?next=
  const url = req.nextUrl.clone();
  url.pathname = '/premium/pin';
  url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/premium/:path*'] };
