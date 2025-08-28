// middleware.ts
import { env } from '@/lib/env';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only protect /premium/*
  if (!pathname.startsWith('/premium')) return NextResponse.next();

  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  const userResp = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  });

  if (!userResp.ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  const user = await userResp.json();

  const subResp = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subscriptions?select=id&user_id=eq.${user.id}&status=eq.active`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
    },
  );

  if (!subResp.ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/pricing';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  const subs = await subResp.json();
  if (!Array.isArray(subs) || subs.length === 0) {
    const url = req.nextUrl.clone();
    url.pathname = '/pricing';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/premium/:path*'] };
