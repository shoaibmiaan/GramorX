// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only guard premium here; everything else is handled by SSR
  if (pathname.startsWith('/premium') && pathname !== '/premium/pin') {
    const token = req.cookies.get('sb-access-token')?.value ?? null;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
