import { NextRequest, NextResponse } from 'next/server';
import { 
  isTokenValidForRequest, 
  getRolesFromRequest, 
  getTokenFromRequest
} from '@/utils/auth/token';

const PUBLIC_ROUTES = ['/', '/login', '/unauthorized'];
const PROTECTED_BASE = '/home';
const ROLE_ROUTES = [
  { path: '/home/admin', roles: ['Admin'] },
  { path: '/home/search', roles: ['Search'] },
  { path: '/home/add', roles: ['Add'] },
  { path: '/home/manage', roles: ['Manage'] },
  { path: '/home/print', roles: ['Print'] },
  { path: '/home/statistic', roles: ['Statistic'] }
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Debug logging
  const token = getTokenFromRequest(req);
  // 1. Handle public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (token && isTokenValidForRequest(req)) {
      return NextResponse.redirect(new URL('/home', req.url));
    }
    return NextResponse.next();
  }
  // 2. Handle protected routes
  if (pathname.startsWith(PROTECTED_BASE)) {
    // 2a. Check token validity
    const isValid = isTokenValidForRequest(req);
    if (!isValid) {  
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // 2b. Get user roles from token
    const userRoles = getRolesFromRequest(req);
    // 2c. Role-based access control
    const requiredRoute = ROLE_ROUTES.find(route => pathname.startsWith(route.path));   
    if (requiredRoute) {
      const hasRequiredRole = requiredRoute.roles.some(role => userRoles.includes(role));
      if (!hasRequiredRole) {
        return NextResponse.redirect(new URL('/home/unauthorized', req.url));
      }
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};