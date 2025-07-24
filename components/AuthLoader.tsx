'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken, isTokenValid, getTokenRoles } from '@/utils/auth/token';

interface AuthLoaderProps {
  requiredRoles?: string[];
}

export default function AuthLoader({ requiredRoles = [] }: AuthLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();
    
    // Debug logging
    console.log('\n[AuthLoader] Checking authentication');
    console.log(`[AuthLoader] Path: ${pathname}`);
    console.log(`[AuthLoader] Token exists: ${!!token}`);
    
    // Immediate redirect if no token
    if (!token) {
      console.log('[AuthLoader] No token, redirecting to login');
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    
    // Check token validity
    const isValid = isTokenValid(token);
    console.log(`[AuthLoader] Token valid: ${isValid}`);
    
    if (!isValid) {
      console.log('[AuthLoader] Invalid token, redirecting to login');
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    
    // Get roles from token
    const userRoles = getTokenRoles(token);
    console.log('[AuthLoader] User roles:', userRoles);
    
    // Check if user has required roles
    if (requiredRoles.length > 0) {
      console.log('[AuthLoader] Required roles:', requiredRoles);
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      console.log(`[AuthLoader] Has required role: ${hasRequiredRole}`);
      
      if (!hasRequiredRole) {
        console.log('[AuthLoader] Lacks required role, redirecting to unauthorized');
        router.replace('/unauthorized');
        return;
      }
    }
    
    console.log('[AuthLoader] All checks passed');
    setIsLoading(false);
  }, [requiredRoles, router, pathname]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
}