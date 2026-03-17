// ============================================================
// MarketSim Pro - Middleware for Route Protection
// ============================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ------------------------------------------------------------
// Route Configuration
// ------------------------------------------------------------

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register'];

// Routes that require authentication but not specific role
const PROTECTED_ROUTES = ['/game', '/settings'];

// Routes that require TEACHER role
const TEACHER_ROUTES = ['/teacher'];

// Routes that are public but redirect to login if no token (API requires Bearer)
const JOIN_ROUTES = ['/join'];

// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

function getTokenFromCookie(request: NextRequest): string | null {
  const authToken = request.cookies.get('auth-token');
  return authToken?.value || null;
}

function getUserFromCookie(request: NextRequest): { role?: string } | null {
  const roleCookie = request.cookies.get('auth-role');
  if (roleCookie?.value) {
    return { role: roleCookie.value };
  }

  const authStore = request.cookies.get('marketsim-auth');
  if (!authStore?.value) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(authStore.value));
    return parsed?.state?.user || null;
  } catch {
    return null;
  }
}

function isPathMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

// ------------------------------------------------------------
// Middleware
// ------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromCookie(request);
  const user = getUserFromCookie(request);

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    // If user is already authenticated, redirect to appropriate dashboard
    if (token && user) {
      if (user.role === 'TEACHER') {
        return NextResponse.redirect(new URL('/teacher', request.url));
      }
      return NextResponse.redirect(new URL('/game', request.url));
    }
    return NextResponse.next();
  }

  // Handle join routes - redirect to login if no token
  if (isPathMatch(pathname, JOIN_ROUTES)) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Check teacher routes
  if (isPathMatch(pathname, TEACHER_ROUTES)) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user?.role !== 'TEACHER' && user?.role !== 'ADMIN') {
      // User is not a teacher, redirect to game
      return NextResponse.redirect(new URL('/game', request.url));
    }

    return NextResponse.next();
  }

  // Check protected routes (game, settings)
  if (isPathMatch(pathname, PROTECTED_ROUTES)) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith('/game') && user?.role && user.role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }

    return NextResponse.next();
  }

  // Root path - redirect based on role
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }

    return NextResponse.redirect(new URL('/game', request.url));
  }

  // API routes - let them pass through
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Static files - let them pass through
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// ------------------------------------------------------------
// Matcher Configuration
// ------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
