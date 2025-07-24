// app/dashboard/layout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';
import Header from '../components/header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
