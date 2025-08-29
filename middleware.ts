// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search, origin } = req.nextUrl;

  const token = req.cookies.get('sb-access-token')?.value;

  if (token) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
      const status = payload?.user_metadata?.status;
      if (status === 'pending_verification' && !pathname.startsWith('/signup')) {
        const url = req.nextUrl.clone();
        url.pathname = '/signup/phone';
        return NextResponse.redirect(url);
      }
    } catch {
      // ignore token parse issues
    }
  }

  if (!pathname.startsWith('/premium')) return NextResponse.next();

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
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

    const { active } = await resp.json();
    if (!active) {
      const url = req.nextUrl.clone();
      url.pathname = '/pricing';
      url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Failed to verify premium status', error);
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs',
};
