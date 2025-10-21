import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (url.pathname.startsWith('/(public)') || url.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith('/(protected)')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(protected)(.*)'],
};
