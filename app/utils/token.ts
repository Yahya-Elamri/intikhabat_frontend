import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { AuthToken } from '@/app/types/auth';

export const getToken = (): string | null => {
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

export const getTokenRoles = (): string[] => {
  const token = getToken();
  if (!token) return [];
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.role) return [];
  
  // Handle both string and array formats
  return typeof decoded.role === 'string'
    ? decoded.role.split(',').map(role => role.trim())
    : decoded.role;
};

export const hasRequiredRole = (requiredRoles: string[]): boolean => {
  if (requiredRoles.length === 0) return true;
  const userRoles = getTokenRoles();
  return requiredRoles.some(role => userRoles.includes(role));
};