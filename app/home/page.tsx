'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRolesFromToken } from '../utils/getRole';
import { decodeToken, getToken } from '@/utils/auth/token';
import { useTranslations } from 'next-intl';

type Role = 'Admin' | 'Search' | 'Manage' | 'Add' | 'Print' | 'Statistic';

const roleToPath: Record<Role, string> = {
  Admin: '/home/admin',
  Search: '/home/search',
  Manage: '/home/manage',
  Add: '/home/add',
  Print: '/home/stats',
  Statistic: '/home/stats',
};

// Priority (higher index = higher priority)
const rolePriority: Role[] = ['Print', 'Add', 'Search', 'Statistic', 'Manage', 'Admin'];

export default function DashboardHomePage() {
  const router = useRouter();
  const t = useTranslations('dashboard');
  const [userName, setUserName] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const redirectUser = async () => {
      try {
        const token = getToken();
        if (!token) return router.push('/login');

        const decoded = decodeToken(token);
        setUserName(decoded?.sub || 'User');

        const roles = getRolesFromToken();
        if (!roles || roles.length === 0) return router.push('/login');

        setIsVisible(true);

        let destination = '';
        const lastPage = localStorage.getItem('lastVisitedPage');

        if (
          lastPage &&
          Object.values(roleToPath).includes(lastPage) &&
          roles.includes(
            Object.entries(roleToPath).find(([, path]) => path === lastPage)?.[0] as Role
          )
        ) {
          destination = lastPage;
        } else {
          const fallbackRole = [...rolePriority].reverse().find(r => roles.includes(r));
          destination = fallbackRole ? roleToPath[fallbackRole] : roleToPath[roles[0]];
        }

        setTimeout(() => router.push(destination), 2500);
      } catch (err) {
        console.error('Redirect error:', err);
        router.push('/login');
      }
    };

    redirectUser();
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-400px)] flex items-center justify-center">
      <div className="text-center">
        <div
          className={`transition-all duration-1000 ease-out transform ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-6xl font-light text-black mb-4">{t('welcome')}</h1>
          <div className="text-4xl font-bold text-black mb-8">
            {userName && <span className="inline-block animate-pulse">{userName}</span>}
          </div>
        </div>

        <div
          className={`transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-200"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce delay-400"></div>
          </div>
          <p className="text-black/70 text-lg">{t('redirecting')}</p>
        </div>
      </div>

      <style jsx>{`
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
