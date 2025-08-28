// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only protect /premium/*
  if (!pathname.startsWith('/premium')) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('status', 'active');

  if (error || !subs || subs.length === 0) {
    const url = req.nextUrl.clone();
    url.pathname = '/pricing';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = { matcher: ['/premium/:path*'] };
