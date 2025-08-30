// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search, origin } = req.nextUrl;

  const token = req.cookies.get('sb-access-token')?.value;
  let role: string | null = null;
  let tier: string | null = null;
  let trial = false;

  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
      const status = payload?.user_metadata?.status;
      if (status === 'pending_verification' && !pathname.startsWith('/signup')) {
        const url = req.nextUrl.clone();
        url.pathname = '/signup/phone';
        return NextResponse.redirect(url);
      }
      const onboarded = payload?.user_metadata?.onboarding_complete;
      if (!onboarded && !pathname.startsWith('/onboarding') && !pathname.startsWith('/signup')) {
        const url = req.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
      role = payload?.app_metadata?.role || payload?.user_metadata?.role || null;
      tier = payload?.user_metadata?.tier || null;
      trial = Boolean(payload?.user_metadata?.trialing);
    } catch {
      // ignore token parse issues
    }
  }

  const requestHeaders = new Headers(req.headers);
  if (tier) requestHeaders.set('x-user-tier', String(tier));
  if (trial) requestHeaders.set('x-user-trial', '1');

  if (pathname.startsWith('/trial') && !trial) {
    const url = req.nextUrl.clone();
    url.pathname = '/pricing';
    return NextResponse.redirect(url);
  }

  if (!pathname.startsWith('/premium')) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  if (role === 'admin' || role === 'teacher') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  try {
    const resp = await fetch(`${origin}/api/premium/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resp.ok) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }

    const { active, tier: apiTier } = await resp.json();
    const effectiveTier = tier || apiTier;
    if (!active || !effectiveTier || effectiveTier === 'compass') {
      const url = req.nextUrl.clone();
      url.pathname = '/pricing';
      url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }
    requestHeaders.set('x-user-tier', String(effectiveTier));
  } catch (error) {
    console.error('Failed to verify premium status', error);
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};
