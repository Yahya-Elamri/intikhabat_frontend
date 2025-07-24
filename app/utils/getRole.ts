import { jwtDecode } from 'jwt-decode';
import { getToken } from './auth';

export interface JwtPayload {
  role: string; // comma-separated string like "Admin,Search"
  id: number;
  sub: string;
  iat: number;
  exp: number;
}

// Get roles array from token
export const getRolesFromToken = (): Role[] | null => {
  const token = getToken();
  
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const rawRoles = decoded.role;

    if (!rawRoles) return null;

    // Convert comma-separated roles to array and validate
    const rolesArray = rawRoles
      .split(',')
      .map(r => r.trim())
      .filter((r): r is Role =>
        ["Admin", "Search", "Add", "Manage", "Print", "Statistic"].includes(r)
      );

    return rolesArray.length > 0 ? rolesArray : null;
  } catch (error) {
    console.error("Error parsing roles from token:", error);
    return null;
  }
};

// Get user ID from token
export const getIdFromToken = (): number | null => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.id ?? null;
  } catch (error) {
    console.error("Error parsing ID from token:", error);
    return null;
  }
};
