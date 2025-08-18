import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth', '/api/auth'];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Get session from the request
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  // If no session and trying to access protected route, redirect to auth
  if (!session) {
    const authUrl = new URL('/auth', request.url);
    return NextResponse.redirect(authUrl);
  }
  
  // If user has session but email is not verified, redirect to verification
  if (session.user && !session.user.emailVerified && pathname !== '/verify-email') {
    const verifyUrl = new URL('/verify-email', request.url);
    return NextResponse.redirect(verifyUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
