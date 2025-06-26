import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/api/transactions',
  '/api/categories',
  '/api/assets',
  '/api/liabilities',
  '/api/receivables',
  '/api/payables',
  '/api/reports',
  '/api/settings',
  '/api/auth/me',
  '/api/auth/profile',
  '/api/auth/change-password',
  '/api/auth/delete-account'
]

// Define public routes that should redirect to dashboard if authenticated
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for static files, API routes that don't need auth, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/register') ||
    pathname.startsWith('/api/auth/forgot-password') ||
    pathname.startsWith('/api/auth/reset-password') ||
    pathname.startsWith('/api/auth/verify-otp') ||
    pathname.startsWith('/api/test-email') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!token) {
      // Redirect to login for web pages, return 401 for API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Verify token
    const user = verifyToken(token)
    if (!user) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Redirect authenticated users away from public auth pages
  if (isPublicRoute && token) {
    const user = verifyToken(token)
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}