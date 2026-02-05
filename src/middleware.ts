import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Allow public paths (login, api/auth, static assets)
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.match(/\.(png|jpg|jpeg|gif|webp)$/)
    ) {
        return NextResponse.next();
    }

    // 2. Check for Guest Mode cookie
    const isGuest = request.cookies.get('guest-mode')?.value === 'true';

    // 3. Check for Auth Session
    // Note: auth() helper might not work directly in edge middleware in some versions,
    // simpler to check session cookie presence for basic protection or use auth() if supported.
    // For now, let's check standard NextAuth cookies.
    const sessionToken = request.cookies.get('authjs.session-token') ||
        request.cookies.get('__Secure-authjs.session-token') ||
        request.cookies.get('next-auth.session-token') ||
        request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionToken && !isGuest) {
        // Redirect to login if no session and no guest mode
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
