import { getRolesFromToken } from './getRole';

export const hasAccess = (allowedRoles: Role[]): boolean => {
  const userRoles = getRolesFromToken();
  if (!userRoles) return false;
  return allowedRoles.some(role => userRoles.includes(role));
};
