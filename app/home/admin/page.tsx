'use client';

import AuthLoader from '@/components/AuthLoader';

export default function AdminDashboardPage() {
    
  <AuthLoader requiredRoles={['Admin']} />

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Espace Admin</h1>
      <p>Contenu réservé aux administrateurs.</p>
    </div>
  );
}
