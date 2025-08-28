// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search, origin } = req.nextUrl;

  // Only protect /premium/*
  if (!pathname.startsWith('/premium')) return NextResponse.next();

  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  const resp = await fetch(`${origin}/api/premium/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  const { active } = await resp.json();
  if (!active) {
    const url = req.nextUrl.clone();
    url.pathname = '/pricing';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/premium/:path*'] };
