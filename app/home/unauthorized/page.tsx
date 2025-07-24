'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasAccess } from '@/app/utils/role-guard';
import { getRolesFromToken } from '@/app/utils/getRole';
import { getToken } from '@/app/utils/auth';
import AuthLoader from '@/components/AuthLoader';

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">nooooo</h1>
      <p>unauthorized</p>
    </div>
  );
}