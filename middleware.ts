import { auth } from '@/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const isWorldAppRequest = (request: NextRequest) => {
  const ua = request.headers.get('user-agent')?.toLowerCase() ?? '';
  const headerFlag = request.headers.get('x-world-app');
  const queryFlag = request.nextUrl.searchParams.get('world_app');
  const cookieFlag = request.cookies.get('isWorldApp');

  return (
    ua.includes('worldapp') ||
    headerFlag === '1' ||
    queryFlag === '1' ||
    cookieFlag?.value === '1'
  );
};

export default auth((request) => {
  const worldApp = isWorldAppRequest(request);

  if (worldApp) {
    if (request.nextUrl.pathname === '/') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/(protected)/home';
      redirectUrl.searchParams.set('world_app', '1');
      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.cookies.set('isWorldApp', '1', {
        path: '/',
        httpOnly: false,
      });
      return redirectResponse;
    }

    const response = NextResponse.next();

    if (request.cookies.get('isWorldApp')?.value !== '1') {
      response.cookies.set('isWorldApp', '1', {
        path: '/',
        httpOnly: false,
      });
    }

    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
