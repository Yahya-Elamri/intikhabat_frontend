import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { AuthToken } from '@/app/types/auth';
import { NextRequest } from 'next/server';

// Client-side token handling
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get('authToken') || null;
};

export const removeToken = (): void => {
  Cookies.remove('authToken');
};

export const decodeToken = (token: string): AuthToken | null => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
};

// Fixed role extraction - handles 'role' property
export const getTokenRoles = (token: string): string[] => {
  const decoded = decodeToken(token);
  
  if (!decoded) return [];
  
  // Check both 'role' and 'roles' properties
  const roleValue = (decoded as any).role || (decoded as any).roles;
  
  if (roleValue) {
    // Handle string format
    if (typeof roleValue === 'string') {
      return roleValue.split(',').map(role => role.trim());
    }
    // Handle array format
    if (Array.isArray(roleValue)) {
      return roleValue;
    }
  }
  
  return [];
};

// Server-side token handling for middleware
export const getTokenFromRequest = (req: NextRequest): string | null => {
  return req.cookies.get('authToken')?.value || null;
};

export const isTokenValidForRequest = (req: NextRequest): boolean => {
  const token = getTokenFromRequest(req);
  if (!token) return false;
  
  try {
    const decoded = decodeToken(token);
    if (!decoded) return false;
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Fixed server-side role extraction
export const getRolesFromRequest = (req: NextRequest): string[] => {
  const token = getTokenFromRequest(req);
  if (!token) return [];
  return getTokenRoles(token);
};