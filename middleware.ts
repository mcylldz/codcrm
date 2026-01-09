import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const authCookie = request.cookies.get('auth_session')
    const { pathname } = request.nextUrl

    // Protected routes
    if (pathname.startsWith('/dashboard')) {
        if (!authCookie || authCookie.value !== 'valid_session_epadem') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect root to dashboard or login
    if (pathname === '/') {
        if (authCookie && authCookie.value === 'valid_session_epadem') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect login to dashboard if already logged in
    if (pathname === '/login') {
        if (authCookie && authCookie.value === 'valid_session_epadem') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/login'],
}
