'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRolesFromToken } from '../utils/getRole';
import { decodeToken, getToken } from '@/utils/auth/token';

const roleToPath: Record<Role, string> = {
  Admin: '/home/admin',
  Search: '/home/search',
  Manage: '/home/manage',
  Add: '/home/add',     // same page as Manage
  Print: '/home/stats',
  Statistic: '/home/stats',
};

export default function DashboardHomePage() {
}
